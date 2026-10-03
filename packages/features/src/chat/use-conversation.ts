import type { ApiClient } from "@nw/api";
import {
  getConversationById,
  getConversationMessages,
  markConversationRead,
  sendConversationMessage,
} from "@nw/api/endpoints/conversation-detail";
import type { ChatCrypto } from "@nw/chat";
import type { Conversation, Message } from "@nw/types";
import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";
import { useChatCrypto } from "./crypto-context";

/** Ten, matching the web conversation panel. */
export const MESSAGES_PAGE_SIZE = 10;

/**
 * How often an open conversation re-asks for messages when there is no socket.
 *
 * Both clients talk to `chat-server` over a WebSocket, which delivers messages
 * as they are sent; this is the fallback for the minutes when that socket is
 * down — no signal, a backgrounded app that has not reconnected yet, or a
 * client that has not wired one up. Callers say which case they are in via
 * `live`, and a live caller polls not at all rather than doing both.
 *
 * Slow enough not to be a second traffic source, fast enough that a reply lands
 * while you are still looking at the screen.
 */
const POLL_INTERVAL_MS = 8_000;

export interface ChatLiveOptions {
  /**
   * True when a socket is delivering messages into this cache already.
   *
   * Polling on top of a live socket is not harmless: it is a request every
   * eight seconds per open conversation per phone, to learn what the socket has
   * already told us.
   */
  live?: boolean;
}

/**
 * The conversation as the inbox already knows it, if it does.
 *
 * The row that was tapped carries the name, the members and the last message;
 * making the header wait for its own round trip drew a "Conversation" with a
 * question-mark face for the first second of every open, then swapped in the
 * real one. Seeding from the list makes the first frame the right frame.
 */
const conversationFromInbox = (
  queryClient: QueryClient,
  conversationId: string,
): Conversation | undefined =>
  queryClient
    .getQueryData<InfiniteData<Conversation[]>>(queryKeys.conversations())
    ?.pages.flat()
    .find((conversation) => conversation.id === conversationId);

/** One conversation's header: who is in it, what it is called. */
export const useConversation = (conversationId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    enabled: Boolean(conversationId),
    // Seeded from the inbox and marked stale at once (`initialDataUpdatedAt:
    // 0`), so the header is right immediately and still refreshed in the
    // background — the members list can have changed since the inbox loaded.
    initialData: () =>
      conversationId
        ? conversationFromInbox(queryClient, conversationId)
        : undefined,
    initialDataUpdatedAt: 0,
    queryFn: async (): Promise<Conversation | null> => {
      const result = await getConversationById(api, conversationId ?? "");
      if (!result || "message" in result) return null;
      return result;
    },
    queryKey: queryKeys.conversation(conversationId ?? ""),
  });

  return {
    conversation: query.data ?? null,
    error: query.error,
    isPending: query.isPending,
  };
};

/**
 * A conversation's messages, newest page first, flattened oldest-to-newest.
 *
 * The endpoint pages backwards from the newest message, which is what a chat
 * wants: page one is what you see, and scrolling up asks for more history. The
 * flattened array is reversed so a list can render it in reading order, and
 * that reversal is here rather than in each screen because getting it wrong
 * puts the conversation in backwards.
 */
/**
 * The pieces of the messages query that a prefetch has to share with the
 * screen: same key, same page function, same decryption — or the prefetched
 * page is a different query and the screen fetches again anyway.
 */
const messagesQuery = (
  api: ApiClient,
  crypto: ChatCrypto,
  conversationId: string,
) => ({
  getNextPageParam: (lastPage: Message[], allPages: Message[][]) =>
    lastPage.length >= MESSAGES_PAGE_SIZE ? allPages.length + 1 : undefined,
  initialPageParam: 1,
  queryFn: async ({ pageParam }: { pageParam: number }) => {
    const result = await getConversationMessages(
      api,
      conversationId,
      pageParam,
      MESSAGES_PAGE_SIZE,
    );
    if (!result || "message" in result) return [];
    return crypto.decryptMessages(result, conversationId);
  },
  queryKey: queryKeys.conversationMessages(conversationId),
});

/**
 * Warms a conversation's first page before it is opened.
 *
 * Called from the inbox on press-in: the finger is on the row for a hundred
 * milliseconds or more before the tap completes and the screen mounts, and
 * that is most of a round trip. Cheap when the page is already in the cache,
 * which after the first visit it is.
 */
export const usePrefetchConversationMessages = () => {
  const api = useApi();
  const crypto = useChatCrypto();
  const queryClient = useQueryClient();

  return useCallback(
    (conversationId: string) => {
      void queryClient.prefetchInfiniteQuery({
        ...messagesQuery(api, crypto, conversationId),
        // Not re-fetched under a screen that is about to mount and fetch.
        staleTime: 15_000,
      });
    },
    [api, crypto, queryClient],
  );
};

export const useConversationMessages = (
  conversationId: string | undefined,
  { live = false }: ChatLiveOptions = {},
) => {
  const api = useApi();
  const crypto = useChatCrypto();

  const query = useInfiniteQuery({
    ...messagesQuery(api, crypto, conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: live ? false : POLL_INTERVAL_MS,
  });

  const messages = useMemo(() => {
    const pages = query.data?.pages ?? [];
    // Page 1 is the newest batch and each page within it is newest-first, so
    // the whole thing reverses into reading order.
    return pages.flat().reverse();
  }, [query.data]);

  return {
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isPending: query.isPending,
    messages,
    refetch: () => {
      void query.refetch();
    },
  };
};

/**
 * Sends a message, encrypting it first.
 *
 * Encryption is the caller's business only in the sense that it must happen
 * before the text leaves — doing it here means no screen can forget, and no
 * screen has to know the wire format. A conversation with no resolvable key
 * sends plaintext rather than failing, which is what the prefix flag is for.
 */
export const useSendMessage = (conversationId: string | undefined) => {
  const api = useApi();
  const crypto = useChatCrypto();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      const trimmed = text.trim();
      if (!conversationId || !trimmed) return false;

      const wire = await crypto.encryptMessageText(conversationId, trimmed);
      const result = await sendConversationMessage(api, {
        conversationId,
        message: wire,
      });

      if (!result || (typeof result === "object" && "message" in result)) {
        throw new Error("Message could not be sent.");
      }
      return true;
    },
    onSuccess: () => {
      if (!conversationId) return;
      // The sent message comes back from the server rather than being appended
      // locally: it arrives with an id, a timestamp and a sender the client
      // would otherwise have to invent, and inventing them is how a message
      // appears twice.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversationMessages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(),
      });
    },
  });
};

/** Clears the unread mark once a conversation is actually on screen. */
export const useMarkConversationRead = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      markConversationRead(api, conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.unreadConversations(),
      });
    },
  });
};
