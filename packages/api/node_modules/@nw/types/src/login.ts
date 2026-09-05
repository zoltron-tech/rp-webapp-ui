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

/**
 * The reply to login, signup and refresh.
 *
 * `token` is gone. Both tokens now arrive as httpOnly cookies set on the same
 * response, so no part of the browser ever holds one and script cannot read
 * them — which is the whole point of the change (SECURITY_AUTH_PLAN C5).
 * `sessionId` is an identifier, not a credential: it is what the Devices screen
 * uses to mark which row is this device.
 */
export type LoginResponsePayload = {
  message: string;
  user?: User;
  sessionId?: string;
};

export type SignupResponsePayload = {
  message: string;
  user?: User;
  sessionId?: string;
  serverMessage?: string;
};

/** One signed-in device, as `GET /account/sessions` returns it. */
export type AuthSession = {
  id: string;
  /** Derived from the User-Agent server-side. "Chrome on Windows". */
  deviceLabel: string;
  /** ISO timestamps. */
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  /** The device making the request. The UI must not offer to revoke it from the list. */
  isCurrent: boolean;
};

export type SessionsResponsePayload = {
  message: string;
  sessions?: AuthSession[];
};

/** A short-lived, single-use credential for the WebSocket handshake only. */
export type WsTicketPayload = {
  message: string;
  ticket?: string;
  expiresInSeconds?: number;
};
