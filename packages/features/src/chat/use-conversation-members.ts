import { getConversationMembers } from "@nw/api/endpoints/conversation-detail";
import type { ConversationParticipant } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

/**
 * Twenty per page, the endpoint's own default.
 *
 * The web details page asks for one page and stops, which is a silent truncation
 * on any group with more than twenty people in it. Paging here rather than
 * copying that.
 */
export const MEMBERS_PAGE_SIZE = 20;

/**
 * Everyone in a conversation.
 *
 * `conversation.members` is embedded in the list response and is enough for a
 * header, but it is whatever the list endpoint chose to include — for a large
 * group that is a prefix, not the membership. A details screen showing "12
 * members" over a list of 20 out of 60 is worse than a slower list, so the
 * details screen asks properly.
 *
 * Like every other list in this API the response is a bare array with no total,
 * so the end is inferred from a short page.
 */
export const useConversationMembers = (conversationId: string | undefined) => {
  const api = useApi();

  const query = useInfiniteQuery({
    enabled: Boolean(conversationId),
    getNextPageParam: (lastPage: ConversationParticipant[], allPages) =>
      lastPage.length >= MEMBERS_PAGE_SIZE ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await getConversationMembers(
        api,
        conversationId ?? "",
        pageParam,
        MEMBERS_PAGE_SIZE,
      );
      if (!result || "message" in result) return [];
      return result;
    },
    queryKey: queryKeys.conversationMembers(conversationId ?? ""),
  });

  // Memoised: a fresh array identity every render feeds a list's `data` and any
  // effect watching it, which is a re-render loop.
  const members = useMemo(() => (query.data?.pages ?? []).flat(), [query.data]);

  return {
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isPending: query.isPending,
    members,
    refetch: () => {
      void query.refetch();
    },
  };
};
