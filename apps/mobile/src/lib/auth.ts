import {
  login as loginRequest,
  signUp as signUpRequest,
} from "@nw/api/endpoints/account";
import { queryKeys } from "@nw/features";
import type { LoginPayload } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { SignUpPayload } from "@nw/types/register";
import type { QueryClient } from "@tanstack/react-query";
import { api, markSessionEstablished } from "@/lib/api";
import { AuthError, isNetworkError } from "@/lib/auth-errors";
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
 *
 * ## What it throws
 *
 * Always an `AuthError` (see `auth-errors.ts`), never the server's code. The
 * login endpoint answers a wrong password with `bad_payload`, and that string
 * is exactly what the sign-in screen used to show. The server says one thing
 * for a wrong password and an unknown account on purpose (it is an
 * enumeration oracle otherwise), so this says one thing too.
 */
export const signInWithPassword = async (payload: LoginPayload) => {
  const result = await loginRequest(api, payload).catch((cause: unknown) => {
    if (isNetworkError(cause)) throw new AuthError("offline");
    throw cause;
  });

  if (!result.user) {
    switch (result.message) {
      case API_MESSAGE.BadPayload:
        throw new AuthError("credentials");
      case API_MESSAGE.TooManyRequests:
        throw new AuthError("throttled");
      default:
        throw new AuthError("server");
    }
  }

  if (!result.accessToken || !result.refreshToken) {
    throw new AuthError(
      "server",
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
 * separates the failures worth telling apart. A 409 is a conflict, and the
 * server's message says whether it was the email or the username; that
 * matters because the two are fixed on different screens of the flow. A 429
 * is the signup throttle. Everything else is the server or the connection.
 */
export const signUpWithPassword = async (payload: SignUpPayload) => {
  const { result, status } = await signUpRequest(api, payload).catch(
    (cause: unknown) => {
      if (isNetworkError(cause)) throw new AuthError("offline");
      throw cause;
    },
  );

  if (status === 409) {
    throw new AuthError(
      /username/i.test(result.message ?? "")
        ? "conflict-username"
        : "conflict-email",
    );
  }

  if (status === 429) {
    // user-service says which limit was hit; nginx's page says nothing.
    throw new AuthError("throttled", result.message || undefined);
  }

  if (!result.user) {
    throw new AuthError(status === 400 ? "invalid" : "server");
  }

  if (!result.accessToken || !result.refreshToken) {
    throw new AuthError(
      "server",
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
 * Re-asks who this is, after a sign-in has stored its tokens.
 *
 * `resetQueries`, not `invalidateQueries`. Invalidating refetches only the
 * session entries somebody is observing, and after a sign-out the one in the
 * cache can be an orphan: the menu re-asks as it closes, is told "nobody", and
 * unmounts — leaving that answer cached with no observer. Invalidating marked
 * it stale and left it there, so the tabs mounted a moment later, read
 * "signed out" off it before their own refetch could land, and redirected a
 * freshly signed-in reader to the public screen.
 *
 * Resetting returns every session entry to "not asked yet", which the tabs
 * treat as loading (there is a token, so they open), and refetches the
 * observed ones before this resolves. The account query shares the prefix and
 * goes with it.
 */
export const refreshSessionQueries = (queryClient: QueryClient) =>
  queryClient.resetQueries({ queryKey: queryKeys.session() });

/** Ends the local session. The server call is `useLogout`'s job. */
export const forgetSession = () => clearSession();
