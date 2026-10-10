import { env } from "@/lib/env";

/**
 * What a sign-in, sign-up or password-reset failure is called.
 *
 * The server answers these flows with codes — `bad_payload` for a wrong
 * password, a 409 with "Email x is already registered.", a 429 with a
 * throttle message — and `fetch` answers a dead connection with a `TypeError`
 * that says "Network request failed". None of that is for a person. The login
 * screen used to show whichever of those it caught, so a wrong password read
 * as `bad_payload`.
 *
 * Every failure these flows can produce is one of the codes below, with one
 * sentence each, decided here and nowhere else. The screens ask
 * `describeAuthError` what to show and show it.
 */
export type AuthErrorCode =
  /** Wrong username, email or password. One message for all three (H5). */
  | "credentials"
  /** Signing up with an email that already has an account. */
  | "conflict-email"
  /** Signing up with a username somebody took first. */
  | "conflict-username"
  /** Rate-limited: too many attempts, or too many signups from this network. */
  | "throttled"
  /** The request never reached the server. */
  | "offline"
  /** The server refused the payload: a field it would not accept. */
  | "invalid"
  /** The server answered, with something other than yes or no. */
  | "server";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? AUTH_COPY[code]);
    this.name = "AuthError";
    this.code = code;
  }
}

const support = env.SUPPORT_EMAIL ? ` or contact ${env.SUPPORT_EMAIL}` : "";

export const AUTH_COPY: Record<AuthErrorCode, string> = {
  "conflict-email":
    "That email already has an account. Try signing in instead, or use a different email.",
  "conflict-username":
    "That username was taken a moment ago. Pick another one.",
  credentials: "Invalid username or password. Please try again.",
  invalid:
    "Something in the form was not accepted. Check the details and try again.",
  offline:
    "Novelist World could not be reached. Check your connection and try again.",
  server: `Something went wrong on our side. Please try again in a moment${support}.`,
  throttled:
    "Too many attempts from this network. Wait a few minutes and try again.",
};

/** `fetch` rejecting: no route to the server, DNS, a dropped connection. */
export const isNetworkError = (cause: unknown): boolean =>
  cause instanceof TypeError ||
  (cause instanceof Error && /network request failed/i.test(cause.message));

/**
 * The sentence to show for whatever was thrown.
 *
 * An `AuthError` carries its own; a network failure gets the offline line;
 * anything else — a bug, a shape the server has not answered with before —
 * gets the caller's fallback rather than its `message`, which is for a log.
 */
export const describeAuthError = (cause: unknown, fallback: string): string => {
  if (cause instanceof AuthError) return cause.message;
  if (isNetworkError(cause)) return AUTH_COPY.offline;
  return fallback;
};

export const authErrorCode = (cause: unknown): AuthErrorCode | null =>
  cause instanceof AuthError
    ? cause.code
    : isNetworkError(cause)
      ? "offline"
      : null;
