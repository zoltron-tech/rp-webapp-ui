import {
  finishOnboarding,
  updateUsername,
  updateUserTheme,
} from "@nw/api/endpoints/account";
import { updateUserNovelist } from "@nw/api/endpoints/novelists";
import { queryKeys, useApi, useSession } from "@nw/features";
import type { UpdateNovelistPayload } from "@nw/types";
import { API_MESSAGE, type Novelist, type User } from "@nw/types";
import type { Accent } from "@nw/types/theme";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { AuthError, isNetworkError } from "@/lib/auth-errors";

/**
 * The writes the onboarding steps make — web's `/rp/onboarding`, as calls.
 *
 * ## What "onboarding" is
 *
 * A signed-in account with no finished novelist profile. The session reads
 * as `onboarding` in two cases: `GET /novelist` answers 404 (nothing created
 * yet — the usual case after signup) or answers a profile whose `isOnboarded`
 * is false (one started and abandoned). The first save has to be a `POST`
 * in the first case and a `PUT` in the second; `saveProfile` reads the
 * session to tell them apart, as web's `updateUserNovelist(payload, create)`
 * does with `!novelist?.id`.
 *
 * ## The session cache
 *
 * Every save writes the returned profile straight into `queryKeys.session`,
 * so the next step sees what the last one saved without a refetch — and so
 * the status stays `onboarding` until `finish` flips `isOnboarded`, at which
 * point the session is reset and comes back `signed-in`. The tabs are gated
 * on that, which is why the flow cannot be left half way and still reach
 * them.
 *
 * Every failure is an `AuthError` with a sentence, as the sign-in flow's
 * are; the screens show `cause.message` and nothing else.
 */

export type ProfileFields = Pick<
  UpdateNovelistPayload,
  "about" | "avatar" | "firstName" | "image" | "lastName"
>;

export const useOnboarding = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { novelist, user } = useSession();

  const writeSession = useCallback(
    (saved: Novelist) => {
      queryClient.setQueryData<Novelist | string | null>(
        queryKeys.session(),
        (current) =>
          current && typeof current === "object"
            ? { ...current, ...saved }
            : saved,
      );
    },
    [queryClient],
  );

  /**
   * The profile's editable fields, created or updated.
   *
   * Sends the whole editable profile each time, as `PUT /novelist` expects:
   * what the step did not touch comes from the session's copy.
   */
  const saveProfile = useCallback(
    async (changes: Partial<ProfileFields>): Promise<Novelist> => {
      const next = {
        about: novelist?.about ?? "",
        avatar: novelist?.avatar ?? undefined,
        firstName: novelist?.firstName ?? "",
        image: novelist?.image ?? undefined,
        lastName: novelist?.lastName ?? "",
        ...changes,
      };
      const payload: UpdateNovelistPayload = {
        ...next,
        firstName: next.firstName.trim(),
        image: next.avatar?.src ?? next.image,
        lastName: (next.lastName ?? "").trim(),
      };
      const result = await updateUserNovelist(api, payload, !novelist).catch(
        (cause: unknown) => {
          if (isNetworkError(cause)) throw new AuthError("offline");
          throw cause;
        },
      );
      if (!("firstName" in result)) {
        throw new AuthError(
          result.message === API_MESSAGE.BadPayload ? "invalid" : "server",
        );
      }
      const { message: _message, ...saved } = result as Novelist & {
        message?: string;
      };
      writeSession(saved);
      return saved;
    },
    [api, novelist, writeSession],
  );

  /** A different handle from the one signup (or a provider) gave. */
  const changeUsername = useCallback(
    async (username: string): Promise<void> => {
      if (username === user?.username) return;
      const result = await updateUsername(api, username).catch(
        (cause: unknown) => {
          if (isNetworkError(cause)) throw new AuthError("offline");
          throw cause;
        },
      );
      if (result.message === API_MESSAGE.Conflict) {
        throw new AuthError("conflict-username");
      }
      if (result.message !== API_MESSAGE.Success) {
        throw new AuthError("server");
      }
      queryClient.setQueryData<User | null>(queryKeys.authUser(), (current) =>
        current ? { ...current, username } : current,
      );
      queryClient.setQueryData<Novelist | string | null>(
        queryKeys.session(),
        (current) =>
          current && typeof current === "object"
            ? { ...current, username }
            : current,
      );
    },
    [api, queryClient, user?.username],
  );

  /** The accent, on the account — what colours the app for this person. */
  const savePalette = useCallback(
    async (palette: Accent): Promise<void> => {
      if (palette === user?.palette) return;
      const result = await updateUserTheme(api, { palette, theme: 0 }).catch(
        (cause: unknown) => {
          if (isNetworkError(cause)) throw new AuthError("offline");
          throw cause;
        },
      );
      if (!("user" in result)) throw new AuthError("server");
      queryClient.setQueryData(queryKeys.authUser(), result.user);
    },
    [api, queryClient, user?.palette],
  );

  /**
   * Marks the profile finished and re-asks who this is.
   *
   * The reset is what turns the session from `onboarding` to `signed-in`;
   * the screens after this one — character, Discord, welcome, novelists —
   * run signed in, and the tabs open once they are done.
   */
  const finish = useCallback(async (): Promise<void> => {
    const result = await finishOnboarding(api).catch((cause: unknown) => {
      if (isNetworkError(cause)) throw new AuthError("offline");
      throw cause;
    });
    if (result.message !== API_MESSAGE.Success) throw new AuthError("server");
    await queryClient.resetQueries({ queryKey: queryKeys.session() });
  }, [api, queryClient]);

  return { changeUsername, finish, novelist, savePalette, saveProfile, user };
};
