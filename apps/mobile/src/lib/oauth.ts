import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import {
  exchangeNativeOAuthCode,
  issueNativeLinkTicket,
  signInWithAppleNative,
} from "@nw/api/endpoints/account";
import { toBase64, utf8Bytes } from "@nw/chat";
import type { LinkProvider } from "@nw/types";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import { getRandomBytes } from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { api, markSessionEstablished } from "@/lib/api";
import { env } from "@/lib/env";
import { readReferral } from "@/lib/referral";
import { saveSession } from "@/lib/session-store";

/**
 * Google and Discord sign-in, native-style: PKCE and a one-time code.
 *
 * The web flow is a full-page navigation to
 * `${RP_SERVICE_URL}/rp/user/oauth2/authorization/{provider}`; Spring runs the
 * dance and redirects to a page on novelist.world with the session already set
 * as cookies. A phone has neither the page nor the cookie jar, so the same
 * endpoint is opened in an ASWebAuthenticationSession / Custom Tab and the
 * result comes back through the app's own scheme.
 *
 * ## Why a code, not tokens
 *
 * That redirect is not a private channel. On Android any app can register
 * `novelistworld://` and receive it, and the URL is kept in browser history. So
 * user-service puts a single-use code on the redirect, never the session, and
 * the app trades the code for tokens over an ordinary HTTPS request (RFC 8252,
 * with PKCE from RFC 7636):
 *
 * 1. A random `code_verifier` is made here and stays in this function until
 *    the exchange. Only its SHA-256 — the `code_challenge` — goes to the
 *    server, with a random `state`.
 * 2. The provider round trip ends at `novelistworld://oauth?code=…&state=…`.
 * 3. A redirect whose `state` is not the one sent is refused, so a link someone
 *    else crafted cannot sign this phone into their account.
 * 4. `code` + `code_verifier` go to `/account/oauth/native/token`. An app that
 *    intercepted step 2 has the code but not the verifier, and a wrong verifier
 *    burns the code.
 *
 * Server side: `NativeOAuthService` and `NativeOAuthStartFilter` in
 * user-service. The redirect URI below must be on its allowlist exactly
 * (`AUTH_NATIVE_OAUTH_REDIRECT_URIS`).
 *
 * ## Discord, in the Discord app
 *
 * On a phone people are signed in to the Discord *app*, not to discord.com in
 * a browser, and the web consent page asked them for a password to prove what
 * the app already knew. Android does not hand that page to the app — Discord's
 * app does not claim the address — so on Android the start request says
 * `provider_app=android` and user-service answers with an `intent:` redirect
 * that opens the app's own consent screen, falling back to the web page when
 * the app is not installed (`ProviderAppRedirectStrategy`). The round trip
 * still begins and ends in the browser tab opened here, which is what holds
 * the server's session; only the consent in the middle moves.
 *
 * ## Linking Discord or Spotify to a signed-in account
 *
 * The web's "Connect" is a top-level navigation to
 * `/rp/user/account/{provider}/link/start`, authenticated by the session
 * cookie and finishing on the settings page. The sheet opened here carries
 * no cookie and has no use for that page, so `linkAccount` first asks for a
 * **link ticket** over the ordinary bearer-authenticated API — naming the
 * redirect URI above and a random `state` — and opens the same start URL with
 * `?ticket=`. user-service redeems it (once, within a minute), runs the usual
 * `{provider}-link` round trip, and ends on
 * `novelistworld://oauth?link={provider}&status=linked|already_linked&state=…`
 * or `…&error=…`. Nothing secret is on that redirect: the app re-reads the
 * connection over the API. Server side: `NativeLinkService`.
 */

// Required so the auth session is dismissed when the browser redirects back.
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "discord";

/** Reasons user-service may put on a refused redirect, in words a person can act on. */
const FAILURE_MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was cancelled",
  no_email:
    "That account has no email address. Add one with the provider, or sign in with your password.",
  unverified_email:
    "Confirm your email address with the provider first, then try again.",
  username_unavailable:
    "We could not set up a username for that account. Try again in a moment.",
};

const GENERIC_FAILURE = "Sign-in failed. Try again.";

/** base64url without padding — the only alphabet PKCE allows. */
const base64Url = (bytes: Uint8Array): string =>
  toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** 32 bytes from the platform CSPRNG: 43 characters, the RFC 7636 minimum. */
const randomSecret = (): string => base64Url(getRandomBytes(32));

/** S256: base64url(SHA-256(ASCII(verifier))). */
export const pkceChallenge = (codeVerifier: string): string =>
  base64Url(sha256(utf8Bytes(codeVerifier)));

const query = (params: Record<string, string>): string =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

export const oauthRedirectUri = () =>
  AuthSession.makeRedirectUri({
    // A custom scheme rather than a proxy: nothing about the sign-in should
    // pass through a third-party host, and the app is a dev/standalone build
    // either way.
    native: `${env.OAUTH_REDIRECT_SCHEME}://oauth`,
    scheme: env.OAUTH_REDIRECT_SCHEME,
  });

export const startOAuth = async (provider: OAuthProvider): Promise<void> => {
  // Carried on the URL: user-service keeps it in the session across the
  // provider round trip (`ReferralCarryFilter`) and credits a new account.
  const referralUser = await readReferral();
  const redirectUri = oauthRedirectUri();
  const codeVerifier = randomSecret();
  const state = randomSecret();

  const authUrl =
    `${env.RP_SERVICE_URL}/rp/user/oauth2/authorization/${provider}?` +
    query({
      client: "native",
      code_challenge: pkceChallenge(codeVerifier),
      code_challenge_method: "S256",
      redirect_uri: redirectUri,
      ...(referralUser ? { referralUser } : {}),
      state,
      // See "Discord, in the Discord app". A server that does not know the
      // parameter ignores it and sends the web page, as before.
      ...(provider === "discord" && Platform.OS === "android"
        ? { provider_app: "android" }
        : {}),
    });

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success") {
    // "cancel" and "dismiss" are the user closing the sheet — not an error
    // worth shouting about, but the caller still needs to know nothing happened.
    throw new Error("Sign-in was cancelled");
  }

  // `Linking.parse` rather than a URL constructor: the redirect is a custom
  // scheme (`novelistworld://oauth?...`), which not every URL implementation
  // parses the way a browser would.
  const { queryParams } = Linking.parse(result.url);

  // Before anything else on the URL is believed — errors included. A redirect
  // this sign-in did not produce is not one to act on.
  if (!queryParams || queryParams.state !== state) {
    throw new Error(GENERIC_FAILURE);
  }

  const error = queryParams.error;
  if (typeof error === "string") {
    throw new Error(FAILURE_MESSAGES[error] ?? GENERIC_FAILURE);
  }

  const code = queryParams.code;
  if (typeof code !== "string" || !code) {
    throw new Error(GENERIC_FAILURE);
  }

  const session = await exchangeNativeOAuthCode(api, {
    code,
    codeVerifier,
  }).catch(() => null);

  if (!session?.accessToken || !session.refreshToken) {
    throw new Error(GENERIC_FAILURE);
  }

  await saveSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
  markSessionEstablished();
};

// ─── Sign in with Apple (iOS) ────────────────────────────────────────────────

/**
 * Whether this device can show the native Apple sheet. iOS only: App Review
 * requires Apple next to Google and Discord there (Guideline 4.8); Android has
 * no native sheet and is not offered it.
 */
export const appleSignInAvailable = async (): Promise<boolean> =>
  Platform.OS === "ios" && AppleAuthentication.isAvailableAsync();

const APPLE_FAILURE_MESSAGES: Record<string, string> = {
  ...FAILURE_MESSAGES,
  already_linked:
    "That email address belongs to an account already linked to a different Apple ID.",
  apple_unavailable:
    "Sign in with Apple is not available right now. Try another way to sign in.",
  unverified_email:
    "Apple has not confirmed that email address. Try another way to sign in.",
};

/**
 * The native sheet, then user-service. No browser, no redirect: Apple hands
 * the app an identity token and a one-time authorization code, and
 * user-service checks the first and redeems the second at Apple
 * (`AppleSignInService`).
 *
 * The nonce ties the token to this request: the sheet gets SHA-256(nonce) in
 * hex, the token echoes it, and only this function knows the raw value it
 * sends to the server.
 *
 * Apple shares the person's name once, on the very first authorization; it is
 * sent along so a new account's username can start from it.
 */
export const startAppleSignIn = async (): Promise<void> => {
  const nonce = randomSecret();

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      nonce: bytesToHex(sha256(utf8Bytes(nonce))),
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (cause) {
    if ((cause as { code?: string })?.code === "ERR_REQUEST_CANCELED") {
      throw new Error("Sign-in was cancelled");
    }
    throw new Error(GENERIC_FAILURE);
  }

  const { authorizationCode, identityToken, fullName } = credential;
  if (!identityToken || !authorizationCode) {
    throw new Error(GENERIC_FAILURE);
  }

  const referralUser = await readReferral();
  const session = await signInWithAppleNative(api, {
    authorizationCode,
    identityToken,
    nonce,
    ...(fullName?.givenName ? { givenName: fullName.givenName } : {}),
    ...(fullName?.familyName ? { familyName: fullName.familyName } : {}),
    ...(referralUser ? { referralUser } : {}),
  }).catch(() => null);

  if (!session?.accessToken || !session.refreshToken) {
    throw new Error(
      (session?.reason && APPLE_FAILURE_MESSAGES[session.reason]) ??
        GENERIC_FAILURE,
    );
  }

  await saveSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
  markSessionEstablished();
};

// ─── Account linking ─────────────────────────────────────────────────────────

/**
 * How a link round trip ended. `cancelled` covers both closing the sheet and
 * refusing the provider's consent — neither is news to the person who did it.
 */
export type LinkOutcome = "linked" | "already_linked" | "cancelled";

const LINK_LABELS: Record<LinkProvider, string> = {
  discord: "Discord",
  spotify: "Spotify",
};

/** Reasons user-service may put on a refused link redirect, in words a person can act on. */
const LINK_FAILURE_MESSAGES: Record<string, string> = {
  invalid_scope:
    "The provider refused the permissions we asked for. Try again in a moment.",
};

const linkFailure = (provider: LinkProvider): string =>
  `Could not link ${LINK_LABELS[provider]}. Try again.`;

export const linkAccount = async (
  provider: LinkProvider,
): Promise<LinkOutcome> => {
  const redirectUri = oauthRedirectUri();
  const state = randomSecret();

  const ticket = await issueNativeLinkTicket(api, provider, {
    redirectUri,
    state,
  });
  if (!ticket) {
    throw new Error(linkFailure(provider));
  }

  const startUrl =
    `${env.RP_SERVICE_URL}/rp/user/account/${provider}/link/start?` +
    query({
      ticket,
      // See "Discord, in the Discord app": the same consent hand-off applies.
      ...(provider === "discord" && Platform.OS === "android"
        ? { provider_app: "android" }
        : {}),
    });

  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);

  if (result.type !== "success") {
    return "cancelled";
  }

  const { queryParams } = Linking.parse(result.url);

  // Before anything else on the URL is believed — errors included. A redirect
  // this link did not produce is not one to act on.
  if (
    !queryParams ||
    queryParams.state !== state ||
    queryParams.link !== provider
  ) {
    throw new Error(linkFailure(provider));
  }

  const error = queryParams.error;
  if (typeof error === "string") {
    if (error === "access_denied") return "cancelled";
    throw new Error(LINK_FAILURE_MESSAGES[error] ?? linkFailure(provider));
  }

  const status = queryParams.status;
  if (status === "linked" || status === "already_linked") {
    return status;
  }
  throw new Error(linkFailure(provider));
};
