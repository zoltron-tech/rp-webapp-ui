import { getUnreadReplyCount } from "@nw/api/endpoints/feed";
import { queryKeys, useApi, useSession } from "@nw/features";
import { useQuery } from "@tanstack/react-query";

/**
 * How many of your threads have new replies — web's `unreadReplyCount`.
 *
 * The server's number rather than one counted from the Interactions list, which
 * only knows the pages it has loaded. Shared between the tab's badge and that
 * screen's head line through one cache entry. There is no push for this, so it
 * refreshes on a long interval while the app is open.
 */
export const useUnreadReplyCount = (): number => {
  const api = useApi();
  const { status } = useSession();

  const query = useQuery({
    enabled: status === "signed-in",
    queryFn: async (): Promise<number> => {
      const result = await getUnreadReplyCount(api);
      return typeof result === "number" ? result : 0;
    },
    queryKey: queryKeys.outgoingUnreadCount(),
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  return query.data ?? 0;
};
