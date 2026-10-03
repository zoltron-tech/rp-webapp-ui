import { getAuthUser, login, logout } from "@nw/api/endpoints/account";
import { getUserNovelist } from "@nw/api/endpoints/novelists";
import type { LoginPayload, Novelist, User } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

/**
 * What the app knows about the person using it.
 *
 * `onboarding` is a real state, not a variant of signed-in: an account can
 * exist with no novelist profile finished, and both clients have to send that
 * person somewhere different from the home screen.
 */
export type SessionStatus =
  | "loading"
  | "signed-in"
  | "signed-out"
  | "onboarding";

export interface Session {
  status: SessionStatus;
  novelist: Novelist | null;
  /**
   * The **account**, which is not the novelist.
   *
   * The novelist is the public profile; the account holds the settings someone
   * picks for themselves, and `palette` is the one both clients read to colour
   * the app. They are separate objects and they can disagree — reading the
   * accent off the novelist is how a client renders jade for someone who chose
   * crimson.
   */
  user: User | null;
}

const NOT_FOUND = "NOT_FOUND";

/**
 * The session, as a query rather than a state machine.
 *
 * The web app's `AuthProvider` is a four-state machine wrapped around this same
 * question, plus push registration, a proactive refresh timer, and tab
 * visibility handling — all of which are web concerns and stay there. What is
 * shared is the question itself: ask the API who this is, and read the answer.
 *
 * A signed-out visitor is not an error. The endpoint answers 401, the client
 * turns that into `{ message }`, and that is a legitimate result to cache
 * briefly — retrying it produces the same 401 and, on the public screens that
 * ask, a burst of them.
 */
export const useSession = (): Session & {
  isLoading: boolean;
  refetch: () => void;
} => {
  const api = useApi();

  const query = useQuery({
    queryFn: async (): Promise<Novelist | typeof NOT_FOUND | null> => {
      const result = await getUserNovelist(api);
      if (!("message" in result)) return result;
      // 404 means "signed in, no profile yet" — the onboarding case. Anything
      // else means there is no usable session.
      return result.message === API_MESSAGE.NotFound ? NOT_FOUND : null;
    },
    queryKey: queryKeys.session(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const novelist = query.data && query.data !== NOT_FOUND ? query.data : null;

  const status: SessionStatus = query.isPending
    ? "loading"
    : query.data === NOT_FOUND || (novelist && !novelist.isOnboarded)
      ? "onboarding"
      : novelist
        ? "signed-in"
        : "signed-out";

  /**
   * The account, fetched separately.
   *
   * A second request rather than a field on the novelist, because they are two
   * endpoints and always have been — web calls this one to answer "is there a
   * live session" and reads the accent off the reply. It is enabled only once
   * the novelist query has settled into a signed-in state, so a signed-out
   * visitor does not fire a guaranteed 401 on every public screen.
   */
  const userQuery = useQuery({
    enabled: status === "signed-in" || status === "onboarding",
    queryFn: () => getAuthUser(api),
    queryKey: queryKeys.authUser(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isLoading: query.isPending,
    novelist,
    refetch: () => {
      void query.refetch();
      void userQuery.refetch();
    },
    status,
    user: userQuery.data ?? null,
  };
};

/**
 * Sign in, then re-ask who this is.
 *
 * Deliberately does not touch token storage. On web the session arrives as
 * httpOnly cookies the browser keeps; on native the API client persists what
 * the response gives it. Either way this hook's job ends at invalidating the
 * session query so every consumer re-reads it.
 */
export const useLogin = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const result = await login(api, payload);
      if (!result.user) {
        throw new Error(result.message || "Login failed");
      }
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
    },
  });
};

/**
 * Sign out, and forget everything cached about this person.
 *
 * `clear()` rather than invalidating the session key alone: every other cached
 * query — notifications, the leaderboard, a profile — was fetched as this user
 * and must not be shown to the next one.
 */
export interface LogoutOptions {
  /**
   * Extra headers for the logout request, read at the moment it is sent.
   *
   * Native passes its refresh token here. It has no cookie, so without the
   * header the server cannot tell which session to end.
   */
  headers?: () => Record<string, string>;
}

export const useLogout = (options: LogoutOptions = {}) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(api, options.headers?.()),
    onSettled: () => {
      queryClient.clear();
    },
  });
};
