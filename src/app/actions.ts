"use server";

import jwt from "jsonwebtoken";
import getConfig from "next/config";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { Logger } from "@/utils/services";

import type { LoginPayload, User } from "@/types";
import { WithMessage, WithToken } from "@/types/common";
import { SignUpPayload } from "@/types/register";
import {
  AUTH_HEADER_NAME,
  JWT_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/utils/constants";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getThemeCookie = () => {
  Logger.log("getThemeCookie");
  const cookie = cookies().get(THEME_COOKIE_NAME);
  if (!cookie) return "dark";
  return cookie.value;
};

export const getAuthCookie = () => {
  Logger.log("getAuthCookie");
  const cookie = cookies().get(JWT_COOKIE_NAME);
  if (!cookie) return "";
  return cookie.value;
};

export const login = async (payload: LoginPayload): Promise<WithMessage> => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/login`;

  Logger.log("login payload", payload);
  Logger.log("login URL", URL);

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
    return { message: "Email or password is incorrect" };
  } else if (response.status === 403) {
    return { message: "Account not verified" };
  } else if (response.status !== 200) {
    return { message: "Something went wrong, please contact support." };
  }

  const result: WithToken<WithMessage> = await response.json();

  Logger.log("login result", result);

  cookies().set(JWT_COOKIE_NAME, result.token, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    path: "/",
  });

  const clientResponse: WithMessage = {
    message: result.message,
  };

  return clientResponse;
};

export const register = async (payload: SignUpPayload) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account`;

  Logger.log("register payload", payload);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  Logger.log("register response", response);

  if (response.status < 200 || response.status > 300) {
    Logger.log("error", response.status, response.statusText);
    return { message: "Error registering" };
  }

  const result: WithToken<WithMessage> = await response.json();

  Logger.log("register result", result.message);

  if (!result.token) return { message: result.message };

  cookies().set(JWT_COOKIE_NAME, result.token, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    path: "/",
  });

  const clientResponse: WithMessage = {
    message: result.message,
  };

  return clientResponse;
};

export const logout = () => {
  cookies().delete(JWT_COOKIE_NAME);
  redirect("/rp/login", RedirectType.push);
};

export const authenticate = () => {
  Logger.log("authenticate");
  const jwtCookie = cookies().get(JWT_COOKIE_NAME);
  if (!jwtCookie?.value) return false;
  const decoded = jwt.decode(jwtCookie.value, { complete: true });
  if (!decoded || typeof decoded.payload === "string" || !decoded.payload.exp) {
    cookies().delete(JWT_COOKIE_NAME);
    return false;
  }
  const isValid = decoded.payload.exp * 1000 > Date.now();
  Logger.log("decoded cookie: ", decoded);
  Logger.log("is valid: ", isValid);
  Logger.log("Date.now(): ", Date.now());

  if (!isValid) {
    cookies().delete(JWT_COOKIE_NAME);
    return false;
  }
  return true;
};

export const authenticateAndGetJWT = () => {
  Logger.log("authenticateAndGetJWT");
  if (!authenticate()) return logout();
  const cookie = getAuthCookie();
  return cookie;
};

export const checkUsernameAvailability = async (username: string) => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/username?username=${username}`;

  const response = await fetch(URL, { cache: "no-store" });

  Logger.log("checkUsernameAvailability", username, response);

  if (response.status === 404) {
    return true;
  } else if (response.status === 200) {
    return false;
  }

  const result: WithMessage = await response.json();

  return result.message;
};

export const reroute = (path: string) => {
  redirect(path);
};

export const getUser = async () => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/auth`;
  const jwtCookie = cookies().get(JWT_COOKIE_NAME);

  if (!jwtCookie) redirect("/", RedirectType.push);

  Logger.log("cookie hai bhai -> :", jwtCookie);

  const response = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: `${jwtCookie.value}`,
    },
    cache: "no-store",
  });

  Logger.log("response", response.status);

  if (response.status !== 200) logout();

  const user: User = await response.json();
  return user;
};
