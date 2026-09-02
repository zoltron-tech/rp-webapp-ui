import {
  checkUsernameAvailability as apiCheckUsernameAvailability,
  updateUserTheme as apiUpdateUserTheme,
  finishOnboarding,
  forgotPassword,
  getDiscordConnection,
  getSpotifyConnection,
  login,
  resetPassword,
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
  LoginOAuthProvider,
  LoginPayload,
  LoginResponsePayload,
  SignupResponsePayload,
  UpdateThemePayload,
} from "@nw/types";
import type { SignUpPayload } from "@nw/types/register";
import { validateJWTSync } from "@nw/utils";
import { api, authedApi } from "@/lib/api";
import {
  readAuthCookie,
  readReferralCookie,
  removeAuthCookieSync,
  removeReferralCookieSync,
  setAuthCookieSync,
  setReferralCookieSync,
} from "@/lib/auth-cookie";
import { env } from "@/lib/env";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  THEME_COOKIE_NAME,
} from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

/**
 * The browser port of `app/actions.ts`.
 *
 * `vite.config.ts` aliases `@/app/actions` to this module. Every export keeps
 * its name, signature and return type — including staying `async` where the
 * body no longer needs to be — so none of the importing components changes.
 *
 * Three things genuinely differ, and each is marked below:
 *   • cookies are read and written through `@/lib/auth-cookie` rather than
 *     `next/headers`;
 *   • `redirect()` becomes a real browser navigation, which is what the server
 *     redirect produced anyway;
 *   • `getUser` calls the API directly instead of proxying through the server.
 *
 * See REACT_MIGRATION_STEPS.md B13.
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

export const getAuthCookie = async () => readAuthCookie() ?? "";

export const setAuthCookie = async (jwt: string) => {
  setAuthCookieSync(jwt);
};

export const removeAuthCookie = async () => {
  removeAuthCookieSync();
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

export const sendVerificationEmailAction = (jwt: string) =>
  sendVerificationEmail(api, jwt);

export const verifyPasswordAction = (password: string) =>
  verifyPassword(authedApi, password);

/** The JWT comes from the reset link, not from a session. */
export const resetPasswordAction = (jwt: string, password: string) =>
  resetPassword(api, jwt, password);

/** Signs in and stores the token. The cookie write is why this is not in @nw/api. */
export const loginAction = async (
  payload: LoginPayload,
): Promise<LoginResponsePayload> => {
  const result = await login(api, payload);
  if (!result.token) return result;

  await setAuthCookie(result.token);

  return { message: result.message, user: result.user };
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
    if (status === 400) {
      return {
        message: API_MESSAGE.BadPayload,
        serverMessage: result.message,
      };
    }
    if (!result.token) {
      Logger.debug(API_MESSAGE.Error, status, result.message);
      return { message: API_MESSAGE.UncategorizedError };
    }

    await setAuthCookie(result.token);
    if (referralUser) await removeReferralCookie();

    return {
      message: API_MESSAGE.Success,
      token: result.token,
      user: result.user,
    };
  } catch (error) {
    Logger.error("Error during signupAction:", error);
    return { message: API_MESSAGE.UncategorizedError };
  }
};

export const loginViaProviderAction = async (provider: LoginOAuthProvider) => {
  navigateHard(
    `${env.RP_SERVICE_URL}/rp/user/oauth2/authorization/${provider}`,
  );
};

/** The one place a redirect belongs: the user asked to leave. */
export const logoutAction = async () => {
  await removeAuthCookie();
  navigateHard(ROUTES.Novelists);
};

// ─── Session ─────────────────────────────────────────────────────────────────

export const authenticateJWT = async (jwt: string, useCookies?: boolean) => {
  const isValid = validateJWTSync(jwt);
  if (!isValid) {
    // Clearing a stale cookie was best-effort on the server, because a write
    // from a read path would throw. In the browser it simply works, so the dead
    // token stops being re-sent. The answer (false) is unchanged.
    if (useCookies) {
      try {
        await removeAuthCookie();
      } catch (error) {
        Logger.debug("authenticateJWT: could not clear the stale cookie", error);
      }
    }
    return false;
  }
  return true;
};

export const authenticateAction = async () => {
  Logger.debug("authenticate");
  const jwt = readAuthCookie();
  Logger.info("jwtCookie", jwt);
  if (!jwt) return false;

  return authenticateJWT(jwt, true);
};

/**
 * The token, or null when there is no valid session.
 *
 * Callers decide what that means — stop and return, or carry on without a
 * token. Nothing here redirects.
 */
export const authenticateAndGetJWT = async (): Promise<string | null> => {
  const authenticated = await authenticateAction();
  if (!authenticated) return null;
  return (await getAuthCookie()) ?? null;
};

export const getJWTIfExists = async () => {
  const authenticated = await authenticateAction();
  if (!authenticated) return;
  return getAuthCookie();
};

export const checkUsernameAvailability = (username: string) =>
  apiCheckUsernameAvailability(api, username);

/** Redirects when there is no cookie at all — this gates the authed shell. */
export const getUser = async () => {
  const jwt = readAuthCookie();
  if (!jwt) {
    navigateHard("/");
    return { message: API_MESSAGE.Unauthorized };
  }

  const response = await fetch(`${env.RP_SERVICE_URL}/rp/user/account/auth`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: `${jwt}`,
    },
    method: "GET",
  });

  const result: AuthenticateResponsePayload = await response.json();

  if (!response.ok) return { message: API_MESSAGE.Unauthorized };
  return result;
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
 */
export const linkDiscordAction = async () => {
  navigateHard(`${env.RP_SERVICE_URL}/rp/user/account/discord/link/start`);
};

/** Returns the caller's linked Spotify account, or null when none is linked. */
export const getSpotifyConnectionAction = () => getSpotifyConnection(authedApi);

/** Removes the caller's Spotify link. */
export const unlinkSpotifyAction = () => unlinkSpotify(authedApi);

/** Starts the Spotify link flow (navigates to the backend initiation endpoint). */
export const linkSpotifyAction = async () => {
  navigateHard(`${env.RP_SERVICE_URL}/rp/user/account/spotify/link/start`);
};

export const finishOnboardingAction = () => finishOnboarding(authedApi);
