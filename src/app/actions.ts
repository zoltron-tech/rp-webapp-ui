"use server";

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
import getConfig from "next/config";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { api, authedApi } from "@/lib/server-api";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  JWT_COOKIE_NAME,
  REFERRAL_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL, USE_LOCAL_DOMAIN } = serverRuntimeConfig;

// ─── Cookies ─────────────────────────────────────────────────────────────────
// Deliberately not in @nw/api: a cookie jar is a web concept, and the native
// client will put the same token in SecureStore instead.

export const getThemeCookie = async () => {
  const cookie = (await cookies()).get(THEME_COOKIE_NAME);
  return cookie ? cookie.value : "dark";
};

export const getAuthCookie = async () => {
  const cookie = (await cookies()).get(JWT_COOKIE_NAME);
  return cookie ? cookie.value : "";
};

export const setAuthCookie = async (jwt: string) => {
  // No return value: `set` hands back the cookie store (a class instance), and
  // this action is called from client components, which only accept
  // serializable results — returning it rejects the caller's promise.
  (await cookies()).set(JWT_COOKIE_NAME, jwt, {
    ...(USE_LOCAL_DOMAIN ? {} : { domain: "novelist.world" }),
    expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: !USE_LOCAL_DOMAIN,
  });
};

export const removeAuthCookie = async () => {
  const pastDate = new Date(0);
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  // Remove the cookie by setting an expired date
  (await cookies()).set(JWT_COOKIE_NAME, "", {
    ...(USE_LOCAL_DOMAIN ? {} : { domain: "novelist.world" }),
    expires: pastDate,
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: !USE_LOCAL_DOMAIN,
  });
};

export const setReferralCookie = async (username: string) => {
  // SameSite must be "lax" (not "strict") so the cookie is still sent on the
  // top-level redirect back from Google/Discord to the OAuth2 callback.
  // No return value: the cookie store is a class instance and this action is
  // called from client components, which only accept serializable results.
  (await cookies()).set(REFERRAL_COOKIE_NAME, username, {
    ...(USE_LOCAL_DOMAIN ? {} : { domain: "novelist.world" }),
    expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: !USE_LOCAL_DOMAIN,
  });
};

export const removeReferralCookie = async () => {
  (await cookies()).set(REFERRAL_COOKIE_NAME, "", {
    ...(USE_LOCAL_DOMAIN ? {} : { domain: "novelist.world" }),
    expires: new Date(0),
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: !USE_LOCAL_DOMAIN,
  });
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
    const referralUser = (await cookies()).get(REFERRAL_COOKIE_NAME)?.value;

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
  redirect(
    `${RP_SERVICE_URL}/rp/user/oauth2/authorization/${provider}`,
    RedirectType.push,
  );
};

/** The one place a redirect belongs: the user asked to leave. */
export const logoutAction = async () => {
  await removeAuthCookie();
  redirect(ROUTES.Novelists, RedirectType.push);
};

// ─── Session ─────────────────────────────────────────────────────────────────

export const authenticateJWT = async (jwt: string, useCookies?: boolean) => {
  const isValid = validateJWTSync(jwt);
  if (!isValid) {
    // Best-effort tidying of a stale cookie. Writing one is only legal inside a
    // Server Action or Route Handler, and this runs from read paths too — where
    // the throw would take down the page over a token that is already invalid.
    // The answer (false) is what the caller acts on either way.
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
  const jwtCookie = (await cookies()).get(JWT_COOKIE_NAME);
  Logger.info("jwtCookie", jwtCookie);
  if (!jwtCookie?.value) return false;

  return authenticateJWT(jwtCookie.value, true);
};

/**
 * The token, or null when there is no valid session.
 *
 * It used to call `logoutAction()` here, which clears the cookie and redirects
 * — meaning any action that merely wanted to read data could navigate the user
 * away as a side effect, and could never simply report "not signed in".
 * Callers now decide: stop and return, or carry on without a token.
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
  const jwtCookie = (await cookies()).get(JWT_COOKIE_NAME);
  if (!jwtCookie) redirect("/", RedirectType.push);

  const response = await fetch(`${RP_SERVICE_URL}/rp/user/account/auth`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: `${jwtCookie.value}`,
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
  redirect(
    `${RP_SERVICE_URL}/rp/user/account/discord/link/start`,
    RedirectType.push,
  );
};

/** Returns the caller's linked Spotify account, or null when none is linked. */
export const getSpotifyConnectionAction = () => getSpotifyConnection(authedApi);

/** Removes the caller's Spotify link. */
export const unlinkSpotifyAction = () => unlinkSpotify(authedApi);

/** Starts the Spotify link flow (navigates to the backend initiation endpoint). */
export const linkSpotifyAction = async () => {
  redirect(
    `${RP_SERVICE_URL}/rp/user/account/spotify/link/start`,
    RedirectType.push,
  );
};

export const finishOnboardingAction = () => finishOnboarding(authedApi);
