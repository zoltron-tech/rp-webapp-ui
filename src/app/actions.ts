"use server";

import { LoginPayload, LoginResponse } from "@/types";
import getConfig from "next/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RedirectType } from "next/navigation";
import jwt from "jsonwebtoken";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;
const COOKIE_NAME = "rp_jwt";

type LoginResponseServer = {
  message: string;
  token: string;
};
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const URL = `${RP_SERVICE_URL}/rp/user/account/login`;

  console.log("login payload", payload);
  console.log("login URL", URL);

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const result: LoginResponseServer = await response.json();

  console.log("login result", result);

  cookies().set(COOKIE_NAME, result.token, {
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

export const authenticate = async () => {
  console.log("authenticate");
  const jwtCookie = cookies().get(COOKIE_NAME);
  if (!jwtCookie?.value) return false;

  const decoded = jwt.decode(jwtCookie.value, { complete: true });

  if (!decoded || typeof decoded.payload === "string" || !decoded.payload.exp) {
    cookies().delete(COOKIE_NAME);
    return false;
  }

  const isValid = decoded.payload.exp * 1000 > Date.now();
  console.log("decoded cookie: ", decoded);
  console.log("is valid: ", isValid);
  console.log("Date.now(): ", Date.now());

  if (!isValid) {
    cookies().delete(COOKIE_NAME);
    return false;
  }

  return true;
};

export const logout = () => {
  cookies().delete(COOKIE_NAME);
  redirect("/rp/login", RedirectType.push);
};
