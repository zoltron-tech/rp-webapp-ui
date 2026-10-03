import { sha256 } from "@noble/hashes/sha256";
import { exchangeNativeOAuthCode } from "@nw/api/endpoints/account";
import { toBase64, utf8Bytes } from "@nw/chat";
import * as AuthSession from "expo-auth-session";
import { getRandomBytes } from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { api, markSessionEstablished } from "@/lib/api";
import { env } from "@/lib/env";
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
      state,
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
