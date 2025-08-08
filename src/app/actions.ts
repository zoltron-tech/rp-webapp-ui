"use server";

import JWT from "jsonwebtoken";
import getConfig from "next/config";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import type { LoginPayload, User } from "@/types";
import { With, WithMessage, WithToken } from "@/types/common";
import { SignUpPayload } from "@/types/register";
import {
  AUTH_HEADER_NAME,
  JWT_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/utils/constants";
import { isNone, validateUser } from "@/utils/helpers/type";
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
  (await cookies()).set(JWT_COOKIE_NAME, jwt, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    domain: USE_LOCAL_DOMAIN ? "localhost" : "novelist.world",
    path: "/",
  });
};

export const removeAuthCookie = async (jwt: string) => {
  const pastDate = new Date(0);
  (await cookies()).set(JWT_COOKIE_NAME, jwt, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    domain: USE_LOCAL_DOMAIN ? "localhost" : "novelist.world",
    path: "/",
    expires: pastDate,
  });
};

export const forgotPasswordAction = async (email: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/forgotPassword?email=${email}`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      message: "Something went wrong, please try again or contact support.",
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const verifyAccountAction = async (jwt: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/verifyAccount`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      message: "Something went wrong, please try again or contact support.",
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const resetPasswordAction = async (
  payload: LoginPayload,
  jwt: string
) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/resetPassword`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      message: "Something went wrong, please try again or contact support.",
    };
  }

  const result: WithMessage = await response.json();
  return result;
};

export const loginAction = async (payload: LoginPayload) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/login`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (response.status === 404) {
    return { message: "User not found" };
  } else if (response.status === 401) {
    return {
      message: "Email, Username or password is incorrect",
    };
  } else if (response.status === 403) {
    return { message: "Account not verified" };
  } else if (!response.ok) {
    return {
      message: "Something went wrong, please contact support.",
    };
  }

  const result: WithToken<WithMessage<any>> = await response.json();
  const _user = validateUser(result?.user);
  if (isNone(_user)) {
    return {
      message: "Something went wrong, please contact support.",
    };
  }

  setAuthCookie(result.token);

  const clientResponse: With<"user", WithMessage, User> = {
    message: result.message,
    user: _user,
  };

  return clientResponse;
};

export const signupAction = async (payload: SignUpPayload) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account`;

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (response.status < 200 || response.status > 300) {
    const result: WithMessage = await response.json();
    return { message: result.message };
  }

  const result: WithToken<WithMessage<any>> = await response.json();
  if (!result.token) return { message: result.message };

  const _user = validateUser(result?.user);
  if (isNone(_user)) {
    return {
      message: "Something went wrong, please contact support.",
    };
  }

  setAuthCookie(result.token);

  const clientResponse: With<"user", WithMessage, User> = {
    message: result.message,
    user: _user,
  };

  return clientResponse;
};

export const logoutAction = async () => {
  removeAuthCookie(JWT_COOKIE_NAME);
  redirect("/rp/novelists", RedirectType.push);
};

export const authenticateJWT = async (jwt: string, useCookies?: boolean) => {
  const decoded = JWT.decode(jwt, { complete: true });
  if (!decoded || typeof decoded.payload === "string" || !decoded.payload.exp) {
    if (useCookies) (await cookies()).delete(JWT_COOKIE_NAME);
    return false;
  }
  const isValid = decoded.payload.exp * 1000 > Date.now();

  if (!isValid) {
    if (useCookies) (await cookies()).delete(JWT_COOKIE_NAME);
    return false;
  }
  return true;
};

export const authenticateAction = async () => {
  Logger.debug("authenticate");
  // ADD_AUTH_COOKIE
  await setAuthCookie(
    "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZDZiZDY3Ni01OWUzLTQxZDMtODIzMC02NDI1OTU2M2FjYzUiLCJleHAiOjE3NTQ3MjA4NjV9.cRr-ZRG0Ybo-BmrPr0L1aM2AFoCe0SF8CVSx13HtFmY"
  );
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
  } else if (response.status === 200) {
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
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: `${jwtCookie.value}`,
    },
    cache: "no-store",
  });

  if (!response.ok) logoutAction();

  const _user: WithMessage<any> = await response.json();

  const user = validateUser(_user.user);
  if (isNone(user)) {
    return logoutAction();
  }

  return user;
};
