"use server";

import getConfig from "next/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RedirectType } from "next/navigation";
import jwt from "jsonwebtoken";

import { Logger } from "@/utils/services";

import type { LoginPayload, LoginResponse, User } from "@/types";
import {
  AUTH_HEADER_NAME,
  JWT_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from "@/utils/constants";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

type LoginResponseServer = {
  message: string;
  token: string;
};

export const getThemeCookie = () => {
  Logger.log("getThemeCookie");
  const cookie = cookies().get(THEME_COOKIE_NAME);
  if (!cookie) return "dark";
  return cookie.value;
};

export const getAuthCookie = () => {
  Logger.log("getAuthCookie");
  const cookie = cookies().get(THEME_COOKIE_NAME);
  if (!cookie) return "";
  return cookie.value;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
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
  const result: LoginResponseServer = await response.json();

  Logger.log("login result", result);

  cookies().set(JWT_COOKIE_NAME, result.token, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    path: "/",
  });

  const clientResponse: LoginResponse = {
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
