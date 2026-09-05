import type {
  AuthSession,
  DiscordConnection,
  LoginPayload,
  LoginResponsePayload,
  SessionsResponsePayload,
  SpotifyConnection,
  UpdateThemePayload,
  UpdateThemeResponse,
  WsTicketPayload,
} from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import type { SignUpPayload } from "@nw/types/register";
import type { ApiClient } from "../client";

/**
 * user-service account endpoints.
 *
 * Login and signup no longer hand back a token to store: user-service sets the
 * access and refresh cookies on the response itself, and the browser never sees
 * either value. What comes back is the user record and a session id for the
 * Devices screen.
 *
 * A native client, which has no cookie jar, will need its own token-bearing
 * variants of these three — that is the reason `getToken` and the auth header
 * survive in the client config at all.
 */

const ACCOUNT = "/rp/user/account";

export const forgotPassword = async (
  api: ApiClient,
  email: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/forgotPassword`, {
    anonymous: true,
    body: { email },
    label: "forgotPasswordAction",
    method: "POST",
  });

  if (response.status === 404) return { message: API_MESSAGE.NotFound };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

/** The JWT arrives from the verification link, not from a session. */
export const verifyAccount = async (
  api: ApiClient,
  jwt: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/verifyAccount`, {
    anonymous: true,
    headers: { [api.authHeaderName]: jwt },
    label: "verifyAccountAction",
    method: "POST",
  });

  if (!response.ok) {
    return {
      message: "Something went wrong, please try again or contact support.",
    };
  }
  return (await response.json()) as WithMessage;
};

/**
 * Re-sends the confirmation mail to the signed-in user's own address.
 *
 * Took an explicit JWT before, because the caller could read one. It cannot any
 * more, and it should not need to: this is a call about the caller, so the
 * session authenticates it like any other.
 */
export const sendVerificationEmail = async (
  api: ApiClient,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/verificationEmail`, {
    label: "sendVerificationEmailAction",
    method: "POST",
  });

  if (!response.ok) return { message: API_MESSAGE.Error };
  return (await response.json()) as WithMessage;
};

export const verifyPassword = async (
  api: ApiClient,
  password: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/verifyPassword`, {
    body: { password },
    label: "verifyPasswordAction",
    method: "POST",
  });

  if (response.status === 401) return { message: API_MESSAGE.Unauthorized };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

/** The JWT arrives from the reset link, not from a session. */
export const resetPassword = async (
  api: ApiClient,
  jwt: string,
  password: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/resetPassword`, {
    anonymous: true,
    body: { password },
    headers: { [api.authHeaderName]: jwt },
    label: "resetPasswordAction",
    method: "POST",
  });

  if (!response.ok) {
    return {
      message:
        response.status === 401
          ? API_MESSAGE.Unauthorized
          : API_MESSAGE.UncategorizedError,
    };
  }
  return (await response.json()) as WithMessage;
};

/** The session lands in cookies set on this response; the body carries the user. */
export const login = async (
  api: ApiClient,
  payload: LoginPayload,
): Promise<LoginResponsePayload> => {
  const response = await api.raw(`${ACCOUNT}/login`, {
    anonymous: true,
    body: payload,
    label: "loginAction",
    method: "POST",
  });

  if (response.status === 401) return { message: API_MESSAGE.BadPayload };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as LoginResponsePayload;
};

export const signUp = async (
  api: ApiClient,
  payload: SignUpPayload & { referralUser?: string },
): Promise<{ status: number; result: LoginResponsePayload }> => {
  const response = await api.raw(ACCOUNT, {
    anonymous: true,
    body: payload,
    label: "signupAction",
    method: "POST",
  });

  // The caller needs the status to tell a username conflict (409) from a bad
  // payload (400), and the body carries the server's own message in both cases.
  return {
    result: (await response.json()) as LoginResponsePayload,
    status: response.status,
  };
};

/** True when the username is free. */
export const checkUsernameAvailability = async (
  api: ApiClient,
  username: string,
): Promise<boolean | string> => {
  const response = await api.raw(
    `${ACCOUNT}/username?username=${encodeURIComponent(username)}`,
    { anonymous: true, contentType: false, label: "checkUsernameAvailability" },
  );

  if (response.status === 404) return true;
  if (response.ok) return false;

  const result = (await response.json()) as WithMessage;
  return result.message;
};

export const updateUsername = async (
  api: ApiClient,
  username: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/updateUsername`, {
    body: { username },
    label: "updateUsernameAction",
    method: "POST",
  });

  if (!response.ok) {
    return {
      message:
        response.status === 409
          ? API_MESSAGE.Conflict
          : API_MESSAGE.UncategorizedError,
    };
  }
  return (await response.json()) as WithMessage;
};

export const updateUserTheme = async (
  api: ApiClient,
  payload: UpdateThemePayload,
): Promise<UpdateThemeResponse | WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/updateUser`, {
    body: payload,
    label: "updateUserTheme",
    method: "POST",
  });

  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as UpdateThemeResponse;
};

// ─── Connected accounts ──────────────────────────────────────────────────────

/** Null when nothing is linked, or when the call fails — both mean "no link to show". */
const connection = async <T>(
  api: ApiClient,
  path: string,
  label: string,
): Promise<T | null> => {
  const response = await api.raw(path, { label });
  if (!response.ok) return null;
  return (await response.json()) as T;
};

export const getDiscordConnection = (api: ApiClient) =>
  connection<DiscordConnection>(
    api,
    `${ACCOUNT}/discord`,
    "getDiscordConnectionAction",
  );

export const getSpotifyConnection = (api: ApiClient) =>
  connection<SpotifyConnection>(
    api,
    `${ACCOUNT}/spotify`,
    "getSpotifyConnectionAction",
  );

const unlink = async (
  api: ApiClient,
  path: string,
  label: string,
): Promise<WithMessage> => {
  const response = await api.raw(path, { label, method: "DELETE" });
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

export const unlinkDiscord = (api: ApiClient) =>
  unlink(api, `${ACCOUNT}/discord`, "unlinkDiscordAction");

export const unlinkSpotify = (api: ApiClient) =>
  unlink(api, `${ACCOUNT}/spotify`, "unlinkSpotifyAction");

export const finishOnboarding = async (
  api: ApiClient,
): Promise<WithMessage> => {
  const response = await api.raw("/rp/portfolio/novelist/onboard", {
    label: "finishOnboardingAction",
    method: "POST",
  });

  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

// ─── Session lifecycle ───────────────────────────────────────────────────────

/**
 * Trades the refresh cookie for a fresh pair.
 *
 * Anonymous on purpose: the access token is expired by definition here, and
 * sending it would just be noise. What authenticates this call is the refresh
 * cookie, which the browser attaches on its own.
 *
 * Returns false on any failure, and a failure is final — user-service has
 * already cleared both cookies, so there is nothing left to retry with.
 */
export const refreshSession = async (api: ApiClient): Promise<boolean> => {
  const response = await api.raw(`${ACCOUNT}/refresh`, {
    anonymous: true,
    label: "refreshSession",
    method: "POST",
  });

  return response.ok;
};

/**
 * Ends this device's session server-side.
 *
 * Anonymous for the same reason as the refresh: the refresh cookie is what
 * identifies the session, and the access token may well have expired. Never
 * throws — a user who asked to log out is logged out of this browser whether or
 * not the API was reachable.
 */
export const logout = async (api: ApiClient): Promise<boolean> => {
  try {
    const response = await api.raw(`${ACCOUNT}/logout`, {
      anonymous: true,
      label: "logout",
      method: "POST",
    });
    return response.ok;
  } catch {
    return false;
  }
};

/** Ends every session on the account, this device included. */
export const logoutEverywhere = async (api: ApiClient): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/logout/all`, {
    label: "logoutEverywhere",
    method: "POST",
  });

  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

/** Ends every session except this one. "Log out my other devices." */
export const logoutOtherDevices = async (
  api: ApiClient,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/logout/others`, {
    label: "logoutOtherDevices",
    method: "POST",
  });

  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

/** Every device currently signed in to this account, most recently used first. */
export const getSessions = async (
  api: ApiClient,
): Promise<AuthSession[] | WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/sessions`, {
    label: "getSessions",
  });

  if (response.status === 401) return { message: API_MESSAGE.Unauthorized };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };

  const result = (await response.json()) as SessionsResponsePayload;
  return result.sessions ?? [];
};

/**
 * Signs one device out.
 *
 * A 404 means the session is not on this account — ownership is enforced by the
 * server, so a guessed id cannot log a stranger out.
 */
export const revokeSession = async (
  api: ApiClient,
  sessionId: string,
): Promise<WithMessage> => {
  const response = await api.raw(
    `${ACCOUNT}/sessions/${encodeURIComponent(sessionId)}`,
    { label: "revokeSession", method: "DELETE" },
  );

  if (response.status === 404) return { message: API_MESSAGE.NotFound };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as WithMessage;
};

/**
 * A single-use ticket for the WebSocket handshake, good for about 30 seconds.
 *
 * The browser cannot put a header on a `WebSocket` upgrade, so something has to
 * travel in the URL — and it used to be the session JWT, which then sat in
 * nginx and proxy logs for a day (SECURITY_AUTH_PLAN H1). Fetch a new one per
 * connection attempt; they are cheap and they do not survive a redemption.
 */
export const getWebSocketTicket = async (
  api: ApiClient,
): Promise<string | null> => {
  const response = await api.raw(`${ACCOUNT}/ws-ticket`, {
    label: "getWebSocketTicket",
    method: "POST",
  });

  if (!response.ok) return null;

  const result = (await response.json()) as WsTicketPayload;
  return result.ticket ?? null;
};
