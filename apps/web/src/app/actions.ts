import {
  checkUsernameAvailability as apiCheckUsernameAvailability,
  updateUserTheme as apiUpdateUserTheme,
  finishOnboarding,
  forgotPassword,
  getDiscordConnection,
  getSessions,
  getSpotifyConnection,
  getWebSocketTicket,
  login,
  logout,
  logoutEverywhere,
  logoutOtherDevices,
  resetPassword,
  revokeSession,
  sendVerificationEmail,
  signUp,
  unlinkDiscord,
  unlinkSpotify,
  updateUsername,
  verifyAccount,
  verifyPassword,
} from "@nw/api/endpoints/account";
import type {
  AuthenticateResponsePayload,
  AuthSession,
  LoginOAuthProvider,
  LoginPayload,
  LoginResponsePayload,
  SignupResponsePayload,
  UpdateThemePayload,
} from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import type { SignUpPayload } from "@nw/types/register";
import {
  api,
  authedApi,
  markSessionEstablished,
  refreshSessionNow,
} from "@/lib/api";
import {
  readReferralCookie,
  removeReferralCookieSync,
  setReferralCookieSync,
} from "@/lib/auth-cookie";
import { env } from "@/lib/env";
import { forgetSession, rememberSession } from "@/lib/session-hint";
import { API_MESSAGE, THEME_COOKIE_NAME } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

/**
 * The browser port of `app/actions.ts`.
 *
 * `vite.config.ts` aliases `@/app/actions` to this module. Every export keeps
 * its name, signature and return type — including staying `async` where the
 * body no longer needs to be — so none of the importing components changes.
 *
 * Two things differ from the server original: `redirect()` becomes a real
 * browser navigation, which is what the server redirect produced anyway, and
 * `getUser` calls the API directly instead of proxying through the server.
 *
 * **Nothing here handles a token any more.** Signing in used to mean receiving
 * a JWT in a response body and writing it to a cookie this code could read.
 * user-service now sets an `httpOnly` access cookie and an `httpOnly` refresh
 * cookie itself, the browser attaches them, and neither value is visible to
 * script — so an XSS on the site no longer yields a session
 * (SECURITY_AUTH_PLAN C5). Renewal happens inside the API client, which retries
 * a 401 once behind a single-flight refresh.
 *
 * See REACT_MIGRATION_STEPS.md B13 and SECURITY_AUTH_PLAN Phase 2.
 */

/**
 * `redirect()` under Next issued an HTTP redirect, so the browser performed a
 * full navigation. `assign` reproduces that exactly — and it is required, not
 * merely equivalent, for the three OAuth/link destinations, which are on the
 * API origin and cannot be reached by the client router at all.
 */
const navigateHard = (url: string) => {
  window.location.assign(url);
};

// ─── Cookies ─────────────────────────────────────────────────────────────────
// Deliberately not in @nw/api: a cookie jar is a web concept, and the native
// client will put the same token in SecureStore instead.

export const getThemeCookie = async () => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : "dark";
};

export const setReferralCookie = async (username: string) => {
  setReferralCookieSync(username);
};

export const removeReferralCookie = async () => {
  removeReferralCookieSync();
};

// ─── Account ─────────────────────────────────────────────────────────────────

export const forgotPasswordAction = (email: string) =>
  forgotPassword(api, email);

/** The JWT comes from the verification link, not from a session. */
export const verifyAccountAction = (jwt: string) => verifyAccount(api, jwt);

/**
 * Re-sends the confirmation mail to the caller's own address.
 *
 * Took a JWT before, because the caller had one to hand. It no longer can —
 * the session is a cookie — so the session cookie authenticates this like any
 * other call.
 */
export const sendVerificationEmailAction = () =>
  sendVerificationEmail(authedApi);

export const verifyPasswordAction = (password: string) =>
  verifyPassword(authedApi, password);

/** The JWT comes from the reset link, not from a session. */
export const resetPasswordAction = (jwt: string, password: string) =>
  resetPassword(api, jwt, password);

/**
 * Signs in.
 *
 * There is no token to store: user-service sets both cookies on this very
 * response. All that is left to do locally is note that a session exists, for
 * the sake of the first-render redirect at `/`.
 */
export const loginAction = async (
  payload: LoginPayload,
): Promise<LoginResponsePayload> => {
  const result = await login(api, payload);
  if (!result.user) return result;

  rememberSession();
  markSessionEstablished();
  return result;
};

export const signupAction = async (
  payload: SignUpPayload,
): Promise<SignupResponsePayload> => {
  try {
    const referralUser = readReferralCookie();

    const { status, result } = await signUp(api, {
      ...payload,
      ...(referralUser ? { referralUser } : {}),
    });

    if (status === 409) return { message: API_MESSAGE.Conflict };
    if (status === 429) {
      return {
        message: API_MESSAGE.TooManyRequests,
        serverMessage: result.message,
      };
    }
    if (status === 400) {
      return {
        message: API_MESSAGE.BadPayload,
        serverMessage: result.message,
      };
    }
    // Success is now "the server returned the new account", not "the server
    // returned a token" — the session left in the cookies it set on this
    // response, which this code cannot inspect.
    if (!result.user) {
      Logger.debug(API_MESSAGE.Error, status, result.message);
      return { message: API_MESSAGE.UncategorizedError };
    }

    rememberSession();
    markSessionEstablished();
    // user-service clears the referral cookie too, under its own domain. Doing
    // it here as well covers the copy an older build may have left host-only.
    if (referralUser) await removeReferralCookie();

    return {
      message: API_MESSAGE.Success,
      sessionId: result.sessionId,
      user: result.user,
    };
  } catch (error) {
    Logger.error("Error during signupAction:", error);
    return { message: API_MESSAGE.UncategorizedError };
  }
};

export const loginViaProviderAction = async (provider: LoginOAuthProvider) => {
  // An invite's referral goes on the URL as well as in its cookie. The OAuth
  // callback runs on the API host, and the cookie only reaches it when this
  // build writes it under the shared domain; user-service keeps the parameter
  // in the session across the provider round trip (ReferralCarryFilter), so a
  // Google or Discord sign-up is credited either way.
  const referralUser = readReferralCookie();
  const query = referralUser
    ? `?referralUser=${encodeURIComponent(referralUser)}`
    : "";
  navigateHard(
    `${env.RP_SERVICE_URL}/rp/user/oauth2/authorization/${provider}${query}`,
  );
};

/**
 * The one place a redirect belongs: the user asked to leave.
 *
 * The server call is the part that matters. Logging out used to be purely
 * local — delete the cookie, navigate — which left the token valid for a full
 * day afterwards, so anyone who had copied it stayed signed in
 * (SECURITY_AUTH_PLAN C3). `POST /account/logout` revokes the session row, ends
 * the Spring session behind the OAuth2 login, and expires both cookies; only
 * user-service can do any of those, because the cookies are `httpOnly` and
 * `JSESSIONID` belongs to a different host.
 *
 * Failure is swallowed. Someone who asked to log out leaves this browser
 * whether or not the API answered.
 */
export const logoutAction = async () => {
  await logout(api);
  forgetSession();
  navigateHard(ROUTES.Novelists);
};

// ─── Devices ─────────────────────────────────────────────────────────────────

/** Every device signed in to this account, most recently used first. */
export const getSessionsAction = (): Promise<AuthSession[] | WithMessage> =>
  getSessions(authedApi);

/** Signs one other device out. Ownership is checked server-side. */
export const revokeSessionAction = (sessionId: string): Promise<WithMessage> =>
  revokeSession(authedApi, sessionId);

/**
 * Signs every *other* device out and leaves this one alone.
 *
 * The answer to "I left myself logged in somewhere", which is the common case
 * and does not deserve to cost the user their current session.
 */
export const logoutOtherDevicesAction = (): Promise<WithMessage> =>
  logoutOtherDevices(authedApi);

/**
 * Signs every device out, including this one, and sends the user to the public
 * view.
 *
 * The answer to "I think someone else is in my account".
 */
export const logoutEverywhereAction = async (): Promise<WithMessage> => {
  const result = await logoutEverywhere(authedApi);
  if (result.message === API_MESSAGE.Success) {
    forgetSession();
    navigateHard(ROUTES.Novelists);
  }
  return result;
};

/**
 * A single-use ticket for the WebSocket handshake, good for about 30 seconds.
 *
 * Returns null when there is no live session, which the socket provider reads
 * as "do not connect".
 */
export const getSocketTicketAction = (): Promise<string | null> =>
  getWebSocketTicket(authedApi);

// ─── Session ─────────────────────────────────────────────────────────────────

/**
 * Is there a live session?
 *
 * A real question to the server now, not a local one. It used to be
 * `validateJWTSync`, which *decoded* the token and compared `exp` — it never
 * verified the signature, so a forged token with a future expiry got a visitor
 * past the app shell (SECURITY_AUTH_PLAN H2). Backend calls still failed, but
 * the app's idea of "signed in" was attacker-controllable and there was no
 * server-side route guard behind it.
 *
 * `/account/auth` verifies the signature, the purpose claim and the revocation
 * list. If the access token has merely expired, the API client refreshes and
 * retries underneath this call, so an ordinary returning user answers true
 * without noticing anything happened.
 */
export const authenticateAction = async (): Promise<boolean> => {
  const response = await api.raw("/rp/user/account/auth", {
    label: "authenticateAction",
  });

  if (response.ok) {
    rememberSession();
    markSessionEstablished();
    return true;
  }

  forgetSession();
  return false;
};

export const checkUsernameAvailability = (username: string) =>
  apiCheckUsernameAvailability(api, username);

/**
 * The signed-in user's own record — the one response that still carries their
 * email address.
 *
 * Goes through the shared client rather than a bare `fetch` so it gets the
 * credentialed request and the automatic refresh-and-retry; a bare fetch would
 * send no cookies at all now that the session is not readable from script.
 *
 * No longer redirects on a missing token, because there is no token to find
 * missing. An unauthenticated answer comes back as `Unauthorized` and the
 * caller decides — which is what the auth provider was already doing with it.
 */
export const getUser = async (): Promise<AuthenticateResponsePayload> => {
  const response = await api.raw("/rp/user/account/auth", { label: "getUser" });

  if (!response.ok) return { message: API_MESSAGE.Unauthorized };
  return (await response.json()) as AuthenticateResponsePayload;
};

export const updateUsernameAction = (username: string) =>
  updateUsername(authedApi, username);

export const updateUserTheme = (payload: UpdateThemePayload) =>
  apiUpdateUserTheme(authedApi, payload);

// ─── Connected accounts ──────────────────────────────────────────────────────

/** Returns the caller's linked Discord account, or null when none is linked. */
export const getDiscordConnectionAction = () => getDiscordConnection(authedApi);

/** Removes the caller's Discord link. */
export const unlinkDiscordAction = () => unlinkDiscord(authedApi);

/**
 * Starts the Discord link flow. Navigates to the backend initiation endpoint,
 * which authenticates the JWT cookie, stashes the account in the session, and
 * hands off to Discord's OAuth2 consent screen.
 *
 * The session is renewed first because this is a *navigation*, not a fetch:
 * the API client's refresh-and-retry cannot rescue it. The endpoint is
 * authenticated, so a browser whose access token lapsed while this screen sat
 * open would land on a bare 401 instead of Discord's consent page — the one
 * place where the fifteen-minute token is visible to the user.
 */
export const linkDiscordAction = async () => {
  await refreshSessionNow();
  navigateHard(`${env.RP_SERVICE_URL}/rp/user/account/discord/link/start`);
};

/** Returns the caller's linked Spotify account, or null when none is linked. */
export const getSpotifyConnectionAction = () => getSpotifyConnection(authedApi);

/** Removes the caller's Spotify link. */
export const unlinkSpotifyAction = () => unlinkSpotify(authedApi);

/** Starts the Spotify link flow. Renews the session first, for the reason in [linkDiscordAction]. */
export const linkSpotifyAction = async () => {
  await refreshSessionNow();
  navigateHard(`${env.RP_SERVICE_URL}/rp/user/account/spotify/link/start`);
};

export const finishOnboardingAction = () => finishOnboarding(authedApi);
