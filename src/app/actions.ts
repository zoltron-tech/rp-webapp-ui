"use server";

import { LoginPayload, LoginResponse } from "@/types";
import getConfig from "next/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL, RP_USER_PORT } = serverRuntimeConfig;
const COOKIE_NAME = "rp_jwt";

type LoginResponseServer = {
	message: string;
	token: string;
};
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
	const URL = `${RP_SERVICE_URL}:${RP_USER_PORT}/api/users/login`;

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

export const logout = async () => {
	cookies().delete(COOKIE_NAME);
	redirect("/rp/novelists");
};
