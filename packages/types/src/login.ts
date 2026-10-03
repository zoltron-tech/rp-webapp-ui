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
} & NativeTokens;

/**
 * The token pair, present only for a client that asked for it.
 *
 * A browser never sees these: its session is two httpOnly cookies set on the
 * same response, and that is the whole point of SECURITY_AUTH_PLAN C5. A native
 * client has no cookie jar it can trust, so it sends `X-NW-Client: native` and
 * user-service puts the pair in the body instead, for the app to keep in the
 * platform keychain. Optional on the type because on web they are always
 * absent — code that reads them must handle that.
 *
 * See MONOREPO_MIGRATION_PLAN §4.1.
 */
export type NativeTokens = {
  accessToken?: string;
  refreshToken?: string;
};

export type SignupResponsePayload = {
  message: string;
  user?: User;
  sessionId?: string;
  serverMessage?: string;
} & NativeTokens;

/** One signed-in device, as `GET /account/sessions` returns it. */
export type AuthSession = {
  id: string;
  /** Derived from the User-Agent server-side. "Chrome on Windows". */
  deviceLabel: string;
  /**
   * Timestamps. user-service serialises these as epoch *seconds* (a decimal
   * number); the string form is only what an ISO-serialising server would send.
   * Normalise before constructing a `Date` — seconds read as milliseconds land
   * in January 1970.
   */
  createdAt: string | number;
  lastUsedAt: string | number;
  expiresAt: string | number;
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
