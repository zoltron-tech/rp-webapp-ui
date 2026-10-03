import {
  login as loginRequest,
  signUp as signUpRequest,
} from "@nw/api/endpoints/account";
import type { LoginPayload } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { SignUpPayload } from "@nw/types/register";
import { api, markSessionEstablished } from "@/lib/api";
import { clearSession, saveSession } from "@/lib/session-store";

/**
 * Sign in, and keep what comes back.
 *
 * `@nw/features`' `useLogin` deliberately does not do this: where the session
 * is kept is the one genuinely platform-specific part of authentication, and a
 * shared hook that wrote to SecureStore could not run in a browser. So the
 * mutation stays shared and this three-line adapter is the native half.
 *
 * The token pair is present only because the client sends `X-NW-Client: native`
 * (see `api.ts`). If the backend has not learned that mode yet, `accessToken`
 * is undefined and this throws rather than reporting a success that leaves the
 * app signed out on the very next request.
 */
export const signInWithPassword = async (payload: LoginPayload) => {
  const result = await loginRequest(api, payload);

  if (!result.user) {
    throw new Error(result.message || "Login failed");
  }

  if (!result.accessToken || !result.refreshToken) {
    throw new Error(
      "The server did not return a session for this client. Native token mode is not enabled on the API yet.",
    );
  }

  await saveSession({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  markSessionEstablished();

  return result;
};

/**
 * Create an account, and keep the session it opens.
 *
 * Signup signs the new account in on this device and nowhere else, exactly as
 * login does — so the token handling is identical, and the status code is what
 * separates the two failures worth telling apart: 409 is "that email or
 * username is taken", anything else is not.
 */
export const signUpWithPassword = async (payload: SignUpPayload) => {
  const { result, status } = await signUpRequest(api, payload);

  if (status === 409) {
    throw new Error(
      result.message ||
        "That email or username is already registered. Try logging in instead.",
    );
  }

  if (!result.user) {
    throw new Error(
      result.message === API_MESSAGE.BadPayload
        ? "Check the details and try again."
        : result.message || "Could not create the account.",
    );
  }

  if (!result.accessToken || !result.refreshToken) {
    throw new Error(
      "The server did not return a session for this client. Native token mode is not enabled on the API yet.",
    );
  }

  await saveSession({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  markSessionEstablished();

  return result;
};

/** Ends the local session. The server call is `useLogout`'s job. */
export const forgetSession = () => clearSession();
