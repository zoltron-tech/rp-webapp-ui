import type {
  DiscordConnection,
  LoginPayload,
  LoginResponsePayload,
  SpotifyConnection,
  UpdateThemePayload,
  UpdateThemeResponse,
} from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import type { SignUpPayload } from "@nw/types/register";
import type { ApiClient } from "../client";

/**
 * user-service account endpoints.
 *
 * Login and signup return the raw payload *including the token*. Storing that
 * token is the caller's job — web writes an httpOnly-able cookie, native will
 * write SecureStore — which is why neither of them touches storage here.
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

export const sendVerificationEmail = async (
  api: ApiClient,
  jwt: string,
): Promise<WithMessage> => {
  const response = await api.raw(`${ACCOUNT}/verificationEmail`, {
    anonymous: true,
    headers: { [api.authHeaderName]: jwt },
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

/** Returns the payload *with* its token — the caller decides where to put it. */
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
