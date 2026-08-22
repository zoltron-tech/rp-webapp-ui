import type { User } from "./user";

export type LoginOAuthProvider = "google" | "discord";

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export type AuthenticateResponsePayload = {
  message: string;
  user?: User;
};

export type LoginResponsePayload = {
  message: string;
  token?: string;
  user?: User;
};

export type SignupResponsePayload = {
  message: string;
  user?: User;
  token?: string;
  serverMessage?: string;
};
