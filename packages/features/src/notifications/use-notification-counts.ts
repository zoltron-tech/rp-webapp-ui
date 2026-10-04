import {
  getNotificationCounts,
  markNotificationRead,
  markNotificationsSeen,
} from "@nw/api/endpoints/novelists";
import type { NotificationCounts } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

/**
 * The numbers behind the bell, from the server.
 *
 * Counting the unread rows a client happens to have loaded — which is what
 * both clients did — is wrong in both directions: it misses everything past
 * the first page, and it cannot tell "not seen yet" from "seen but not opened".
 * `unseen` is what a badge shows; `unread` is how many rows are still
 * highlighted.
 *
 * `data` is `undefined` while loading and `null` against a server that has no
 * such endpoint yet; a caller falls back to its own count for both.
 */
export const useNotificationCounts = (options?: { enabled?: boolean }) => {
  const api = useApi();

  return useQuery({
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<NotificationCounts | null> => {
      const result = await getNotificationCounts(api);
      if (!result || "message" in result) return null;
      return result;
    },
    queryKey: queryKeys.notificationCounts(),
  });
};

/**
 * The two ways a notification stops being new.
 *
 * `markSeen` is "the list was opened": it clears the badge and leaves the rows
 * highlighted. `markRead` is "this row was opened": it clears that row's
 * highlight. Both are best effort — nothing waits on them, and a failure
 * leaves the badge for the next open to clear.
 */
export const useNotificationReadState = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const refreshCounts = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.notificationCounts(),
      }),
    [queryClient],
  );

  const markSeen = useCallback(
    () =>
      markNotificationsSeen(api)
        .then(refreshCounts)
        .catch(() => undefined),
    [api, refreshCounts],
  );

  const markRead = useCallback(
    (notificationId: string) =>
      markNotificationRead(api, notificationId)
        .then(refreshCounts)
        .catch(() => undefined),
    [api, refreshCounts],
  );

  return { markRead, markSeen, refreshCounts };
};

/**
 * A pending request is cleared by answering it, not by opening it: its id is a
 * connection's, not a stored notification's.
 */
export const isStoredNotification = (type: string) =>
  type !== "FRIEND_REQUEST" && type !== "MUSE_CONNECTION_REQUEST";
