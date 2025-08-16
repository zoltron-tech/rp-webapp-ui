"use server";

import getConfig from "next/config";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import type {
  AuthenticateResponsePayload,
  LoginOAuthProvider,
  LoginPayload,
  LoginResponsePayload,
  SignupResponsePayload,
} from "@/types";
import type { WithMessage } from "@/types/common";
import type { SignUpPayload } from "@/types/register";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  JWT_COOKIE_NAME,
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
    domain: USE_LOCAL_DOMAIN ? "localhost" : "novelist.world",
    expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: false,
  });
};

export const removeAuthCookie = async () => {
  const pastDate = new Date(0);
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  // Remove the cookie by setting an expired date
  (await cookies()).set(JWT_COOKIE_NAME, "", {
    domain: USE_LOCAL_DOMAIN ? "localhost" : "novelist.world",
    expires: pastDate,
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: false,
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
    const response = await fetch(URL, {
      body: JSON.stringify(payload),
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
    if (useCookies) await removeAuthCookie();
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
