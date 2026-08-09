"use server";

import getConfig from "next/config";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import type {
  AuthenticateResponsePayload,
  DiscordConnection,
  LoginOAuthProvider,
  LoginPayload,
  LoginResponsePayload,
  SignupResponsePayload,
  SpotifyConnection,
  UpdateThemePayload,
  UpdateThemeResponse,
} from "@/types";
import type { WithMessage } from "@/types/common";
import type { SignUpPayload } from "@/types/register";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  JWT_COOKIE_NAME,
  REFERRAL_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { validateJWTSync } from "@/utils/helpers";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL, USE_LOCAL_DOMAIN } = serverRuntimeConfig;

export const getThemeCookie = async () => {
  const cookie = (await cookies()).get(THEME_COOKIE_NAME);
  return cookie ? cookie.value : "dark";
};

export const getAuthCookie = async () => {
  const cookie = (await cookies()).get(JWT_COOKIE_NAME);
  return cookie ? cookie.value : "";
};

export const setAuthCookie = async (jwt: string) => {
  return (await cookies()).set(JWT_COOKIE_NAME, jwt, {
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

export const forgotPasswordAction = async (email: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/forgotPassword`;

  const response = await fetch(URL, {
    body: JSON.stringify({ email }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.status === 404) {
    return { message: API_MESSAGE.NotFound };
  }

  if (!response.ok) {
    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const verifyAccountAction = async (jwt: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/verifyAccount`;
  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return {
      message: "Something went wrong, please try again or contact support.",
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const sendVerificationEmailAction = async (jwt: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/verificationEmail`;
  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    return {
      message: API_MESSAGE.Error,
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const verifyPasswordAction = async (password: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/verifyPassword`;

  const jwt = await authenticateAndGetJWT();

  const response = await fetch(URL, {
    body: JSON.stringify({ password }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (response.status === 401) {
    return { message: API_MESSAGE.Unauthorized };
  }

  if (!response.ok) {
    return { message: API_MESSAGE.UncategorizedError };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const resetPasswordAction = async (jwt: string, password: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/resetPassword`;

  const response = await fetch(URL, {
    body: JSON.stringify({ password }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  if (!response.ok) {
    if (response.status === 401) {
      return {
        message: API_MESSAGE.Unauthorized,
      };
    }

    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const loginAction = async (
  payload: LoginPayload,
): Promise<LoginResponsePayload> => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/login`;

  const response = await fetch(URL, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.status === 401) {
    return {
      message: API_MESSAGE.BadPayload,
    };
  } else if (!response.ok) {
    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const result = await response.json();

  setAuthCookie(result.token!);

  const clientResponse = {
    message: result.message,
    user: result.user!,
  };

  return clientResponse;
};

export const signupAction = async (
  payload: SignUpPayload,
): Promise<SignupResponsePayload> => {
  const URL = `${RP_SERVICE_URL}/rp/user/account`;

  try {
    const referralUser = (await cookies()).get(REFERRAL_COOKIE_NAME)?.value;

    const response = await fetch(URL, {
      body: JSON.stringify({
        ...payload,
        ...(referralUser ? { referralUser } : {}),
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const result: LoginResponsePayload = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        return {
          message: API_MESSAGE.Conflict,
        };
      } else if (response.status === 400) {
        return {
          message: API_MESSAGE.BadPayload,
          serverMessage: result.message,
        };
      } else {
        Logger.debug(API_MESSAGE.Error, response.status, result.message);
        return {
          message: API_MESSAGE.UncategorizedError,
        };
      }
    }

    await setAuthCookie(result.token!);
    if (referralUser) await removeReferralCookie();
    const clientResponse: LoginResponsePayload = {
      message: API_MESSAGE.Success,
      token: result.token!,
      user: result.user!,
    };

    return clientResponse;
  } catch (error) {
    Logger.error("Error during signupAction:", error);
    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }
};

export const loginViaProviderAction = async (provider: LoginOAuthProvider) => {
  redirect(
    `${RP_SERVICE_URL}/rp/user/oauth2/authorization/${provider}`,
    RedirectType.push,
  );
};

export const logoutAction = async () => {
  await removeAuthCookie();
  redirect(ROUTES.Novelists, RedirectType.push);
};

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
        Logger.debug(
          "authenticateJWT: could not clear the stale cookie",
          error,
        );
      }
    }
    return false;
  }
  return true;
};

export const authenticateAction = async () => {
  Logger.debug("authenticate");
  // ADD_AUTH_COOKIE
  // await setAuthCookie();
  const jwtCookie = (await cookies()).get(JWT_COOKIE_NAME);
  Logger.info("jwtCookie", jwtCookie);
  if (!jwtCookie?.value) return false;

  const isValid = await authenticateJWT(jwtCookie.value, true);
  return isValid;
};

export const authenticateAndGetJWT = async () => {
  const authenticated = await authenticateAction();
  if (!authenticated) return logoutAction();
  const cookie = await getAuthCookie();
  return cookie;
};

export const getJWTIfExists = async () => {
  const authenticated = await authenticateAction();
  if (!authenticated) return;
  const cookie = await getAuthCookie();
  return cookie;
};

export const checkUsernameAvailability = async (username: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/username?username=${username}`;

  const response = await fetch(URL, { cache: "no-store" });

  if (response.status === 404) {
    return true;
  } else if (response.ok) {
    return false;
  }

  const result: WithMessage = await response.json();

  return result.message;
};

export const getUser = async () => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/auth`;
  const jwtCookie = (await cookies()).get(JWT_COOKIE_NAME);

  if (!jwtCookie) redirect("/", RedirectType.push);
  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: `${jwtCookie.value}`,
    },
    method: "GET",
  });

  const result: AuthenticateResponsePayload = await response.json();

  if (!response.ok) {
    return {
      message: API_MESSAGE.Unauthorized,
    };
  }
  return result;
};

export const updateUsernameAction = async (username: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/updateUsername`;

  const jwtCookie = await authenticateAndGetJWT();

  const response = await fetch(URL, {
    body: JSON.stringify({ username }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwtCookie,
    },
    method: "POST",
  });

  if (!response.ok) {
    if (response.status === 409) {
      return {
        message: API_MESSAGE.Conflict,
      };
    }

    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const updateUserTheme = async (payload: UpdateThemePayload) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/updateUser`;

  const jwtCookie = await authenticateAndGetJWT();

  const response = await fetch(URL, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwtCookie,
    },
    method: "POST",
  });

  if (!response.ok) {
    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const result: UpdateThemeResponse = await response.json();
  return result;
};

// ─── Connected accounts: Discord ───────────────────────────────────────────

/** Returns the caller's linked Discord account, or null when none is linked. */
export const getDiscordConnectionAction =
  async (): Promise<DiscordConnection | null> => {
    const jwt = await getJWTIfExists();
    if (!jwt) return null;

    const response = await fetch(`${RP_SERVICE_URL}/rp/user/account/discord`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "GET",
    });

    if (!response.ok) return null;
    return (await response.json()) as DiscordConnection;
  };

/** Removes the caller's Discord link. */
export const unlinkDiscordAction = async (): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();

  const response = await fetch(`${RP_SERVICE_URL}/rp/user/account/discord`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.UncategorizedError };
  }

  const result: WithMessage = await response.json();
  return result;
};

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

// ─── Connected accounts: Spotify ───────────────────────────────────────────

/** Returns the caller's linked Spotify account, or null when none is linked. */
export const getSpotifyConnectionAction =
  async (): Promise<SpotifyConnection | null> => {
    const jwt = await getJWTIfExists();
    if (!jwt) return null;

    const response = await fetch(`${RP_SERVICE_URL}/rp/user/account/spotify`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "GET",
    });

    if (!response.ok) return null;
    return (await response.json()) as SpotifyConnection;
  };

/** Removes the caller's Spotify link. */
export const unlinkSpotifyAction = async (): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();

  const response = await fetch(`${RP_SERVICE_URL}/rp/user/account/spotify`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  if (!response.ok) {
    return { message: API_MESSAGE.UncategorizedError };
  }

  const result: WithMessage = await response.json();
  return result;
};

/** Starts the Spotify link flow (navigates to the backend initiation endpoint). */
export const linkSpotifyAction = async () => {
  redirect(
    `${RP_SERVICE_URL}/rp/user/account/spotify/link/start`,
    RedirectType.push,
  );
};

export const finishOnboardingAction = async () => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/onboard`;

  const jwtCookie = await authenticateAndGetJWT();

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwtCookie,
    },
    method: "POST",
  });

  if (!response.ok) {
    return {
      message: API_MESSAGE.UncategorizedError,
    };
  }

  const result: WithMessage = await response.json();
  return result;
};
