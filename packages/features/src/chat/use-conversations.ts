import {
  getConversations,
  getUnreadConversationIds,
  setConversationBucket,
} from "@nw/api/endpoints/conversations";
import type { Conversation, InboxBucket } from "@nw/types";
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";
import { useChatCrypto } from "./crypto-context";

/** Fifteen, which is what the web inbox has always asked for. */
export const CONVERSATIONS_PAGE_SIZE = 15;

/**
 * The archive's list (BLOCK_BLACKLIST_PLAN.md B6), beside the inbox's under
 * "conversations" the way the unread ids are: invalidating the inbox
 * refreshes it too. Fetched when the Archived tab is open, never stored on
 * the phone.
 */
export const archivedConversationsKey = () =>
  ["conversations", "archived"] as const;

const listKey = (bucket: InboxBucket) =>
  bucket === "ARCHIVED"
    ? archivedConversationsKey()
    : queryKeys.conversations();

/**
 * The inbox.
 *
 * Decryption happens here rather than in a screen, because every consumer needs
 * it and a list that forgets is a list of "🔒 could not be decrypted" previews.
 * It is done per page as the page arrives, so the conversation key is fetched
 * once and the later pages reuse the cached one.
 *
 * The endpoint returns a bare array with no total, so the end of the list can
 * only be inferred from a short page — the same rule as friends, and the reason
 * it is decided once here.
 *
 * `bucket` picks the list: the inbox, or the archive (fetched only while
 * `enabled`, which a screen ties to its Archived tab).
 */
export const useConversations = (
  bucket: InboxBucket = "INBOX",
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const api = useApi();
  const crypto = useChatCrypto();

  const query = useInfiniteQuery({
    enabled,
    getNextPageParam: (lastPage: Conversation[], allPages) =>
      lastPage.length >= CONVERSATIONS_PAGE_SIZE
        ? allPages.length + 1
        : undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await getConversations(
        api,
        pageParam,
        CONVERSATIONS_PAGE_SIZE,
        bucket,
      );
      if (!result || "message" in result) return [];
      return crypto.decryptConversations(result);
    },
    queryKey: listKey(bucket),
  });

  // Memoised: a fresh array identity on every render feeds a list's `data` and
  // any effect watching it, which is a re-render loop.
  const conversations = useMemo(
    () => (query.data?.pages ?? []).flat(),
    [query.data],
  );

  return {
    conversations,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isPending: query.isPending,
    /**
     * True while a refetch of an already-loaded list is in flight.
     *
     * What a pull-to-refresh control has to be bound to. Timing the spinner
     * against `refetch()` instead does not work — it returns nothing to wait
     * on, so the spinner vanishes the instant the finger lifts and the list
     * updates a second later with no sign that anything happened.
     */
    isRefetching: query.isRefetching,
    refetch: () => {
      void query.refetch();
    },
  };
};

type Pages = InfiniteData<Conversation[], unknown>;

/**
 * Moves a conversation between the caller's inbox and archive.
 *
 * The row leaves the list it was in at once and the one it goes to is
 * refetched — its place there is the server's to decide. The conversation's
 * own cache entry learns its new bucket, so an open panel and the phone's
 * stored copy agree. The unread ids are refetched: the archive does not count.
 */
export const useSetConversationBucket = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bucket,
      conversationId,
    }: {
      conversationId: string;
      bucket: InboxBucket;
    }) => {
      const result = await setConversationBucket(api, conversationId, bucket);
      if (result !== true) throw new Error("bucket");
      return { bucket, conversationId };
    },
    onSuccess: ({ bucket, conversationId }) => {
      const from = listKey(bucket === "ARCHIVED" ? "INBOX" : "ARCHIVED");
      queryClient.setQueryData<Pages>(from, (previous) =>
        previous
          ? {
              ...previous,
              pages: previous.pages.map((page) =>
                page.filter(
                  (conversation) => conversation.id !== conversationId,
                ),
              ),
            }
          : previous,
      );
      queryClient.setQueryData<Conversation | null>(
        queryKeys.conversation(conversationId),
        (previous) => (previous ? { ...previous, bucket } : previous),
      );
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: listKey(bucket),
      });
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: queryKeys.unreadConversations(),
      });
    },
  });
};

/**
 * Which conversations have something unread, for the tab badge.
 *
 * A separate, cheap endpoint rather than a count derived from the list: the
 * badge has to be right before the inbox has ever been opened, and deriving it
 * from page one would undercount everyone with more than fifteen threads.
 */
export const useUnreadConversations = () => {
  const api = useApi();

  const query = useQuery({
    queryFn: async (): Promise<string[]> => {
      const result = await getUnreadConversationIds(api);
      if (!result || "message" in result) return [];
      return result;
    },
    queryKey: queryKeys.unreadConversations(),
    // The inbox badge is the one number a person notices being stale.
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return {
    ids: query.data ?? [],
    unreadCount: query.data?.length ?? 0,
  };
};
