import {
  clearNotificationMute,
  getNotificationMutes,
  setNotificationMute,
} from "@nw/api/endpoints/novelists";
import type { Conversation, NotificationMute } from "@nw/types";
import {
  type InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

/**
 * What a novelist has asked not to be interrupted by.
 *
 * A mute stops the push and the buzz, nothing else: the row is still written,
 * listed and counted. One table on the server holds all three kinds — a kind
 * of notification, every conversation, one conversation — so one query here.
 */

/** The switches in settings, in the order they are shown. */
export const MUTE_KINDS: readonly {
  key: string;
  label: string;
  description: string;
}[] = [
  {
    description: "Hearts on your prompts, comments, media and stories.",
    key: "REACTIONS",
    label: "Likes",
  },
  {
    description: "Comments on your prompts and replies in your threads.",
    key: "COMMENTS",
    label: "Comments and replies",
  },
  {
    description: "When someone tags you in a post.",
    key: "MENTIONS",
    label: "Mentions",
  },
  {
    description: "Friend requests and the ones you sent being accepted.",
    key: "REQUESTS",
    label: "Friend requests",
  },
  {
    description: "Connections proposed between your characters and others'.",
    key: "MUSE_CONNECTION",
    label: "Character connections",
  },
  {
    description: "New chapters and passages in stories you are part of.",
    key: "STORY",
    label: "Stories",
  },
];

/** Every conversation at once; one conversation is `conversationMuteKey`. */
export const CHAT_MUTE_KEY = "CHAT";

export const conversationMuteKey = (conversationId: string) =>
  `C:${conversationId}`;

/** How long a conversation can be muted for. `null` is until unmuted. */
export const MUTE_DURATIONS: readonly {
  id: string;
  label: string;
  ms: number | null;
}[] = [
  { id: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { id: "8h", label: "8 hours", ms: 8 * 60 * 60 * 1000 },
  { id: "1w", label: "1 week", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "forever", label: "Until I turn it back on", ms: null },
];

/** The ISO `until` for a duration, or `null` for "until unmuted". */
export const muteUntil = (
  ms: number | null,
  now = Date.now(),
): string | null => (ms === null ? null : new Date(now + ms).toISOString());

/**
 * Whether a `mutedUntil` is in force. Null or absent is not muted; the server
 * sends `9999-12-31` for "until unmuted", which reads as muted like any other
 * future time. (A mute *row* uses null for "until unmuted" instead — see
 * `rowIsActive`.)
 */
export const isMuted = (
  until: string | null | undefined,
  now = Date.now(),
): boolean => {
  const at = muteTime(until);
  return at !== null && at > now;
};

/**
 * A mute's end as milliseconds. The server sends ISO-8601; a number is read
 * too (epoch seconds or milliseconds), in case an older server's default
 * serialisation reaches a newer client.
 */
const muteTime = (until: string | number | null | undefined): number | null => {
  if (until == null) return null;
  if (typeof until === "number") return until < 1e12 ? until * 1000 : until;
  const at = Date.parse(until);
  return Number.isNaN(at) ? null : at;
};

/** A mute row: `until` null is until unmuted; a past `until` has run out. */
const rowIsActive = (mute: NotificationMute, now = Date.now()): boolean =>
  mute.until === null || isMuted(mute.until, now);

/** "Muted for 7 hours", "Muted"; nothing when it is not. */
export const describeMute = (
  until: string | null | undefined,
  now = Date.now(),
): string | null => {
  const at = muteTime(until);
  if (at === null || at <= now) return null;
  const left = at - now;
  if (left > 365 * 24 * 60 * 60 * 1000) return "Muted";
  const hours = Math.round(left / (60 * 60 * 1000));
  if (hours < 1) return "Muted for a few minutes";
  if (hours < 48) return `Muted for ${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.round(hours / 24);
  return `Muted for ${days} days`;
};

export const useNotificationMutes = (options?: { enabled?: boolean }) => {
  const api = useApi();

  const query = useQuery({
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<NotificationMute[]> => {
      const result = await getNotificationMutes(api);
      return Array.isArray(result) ? result : [];
    },
    queryKey: queryKeys.notificationMutes(),
  });

  const mutes = query.data ?? [];
  const mutedKeys = new Set(
    mutes.filter((mute) => rowIsActive(mute)).map((mute) => mute.key),
  );

  return {
    ...query,
    /** Whether a key is muted right now. */
    has: (key: string) => mutedKeys.has(key),
    mutes,
  };
};

/**
 * Mute and unmute, optimistic on the mutes list, and — for a conversation —
 * on the inbox rows and the open conversation, which carry `mutedUntil`.
 */
export const useMuteActions = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const patchConversation = useCallback(
    (conversationId: string, mutedUntil: string | null | undefined) => {
      // Null from the server means "until unmuted"; undefined here means
      // "not muted". The row carries the far-future form for the first.
      const value =
        mutedUntil === undefined
          ? null
          : (mutedUntil ?? "9999-12-31T00:00:00Z");
      const apply = (conversation: Conversation) =>
        conversation.id === conversationId
          ? { ...conversation, mutedUntil: value }
          : conversation;

      queryClient.setQueryData<InfiniteData<Conversation[]>>(
        queryKeys.conversations(),
        (data) =>
          data
            ? { ...data, pages: data.pages.map((page) => page.map(apply)) }
            : data,
      );
      queryClient.setQueryData<Conversation | null>(
        queryKeys.conversation(conversationId),
        (conversation) => (conversation ? apply(conversation) : conversation),
      );
    },
    [queryClient],
  );

  const settle = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notificationMutes(),
    });
  }, [queryClient]);

  const mute = useMutation({
    mutationFn: async ({
      key,
      until,
    }: {
      key: string;
      until: string | null;
    }) => {
      const result = await setNotificationMute(api, key, until);
      if (!result) throw new Error("The mute could not be saved.");
      return result;
    },
    onMutate: ({ key, until }) => {
      queryClient.setQueryData<NotificationMute[]>(
        queryKeys.notificationMutes(),
        (mutes) => [
          ...(mutes ?? []).filter((mute) => mute.key !== key),
          { key, until },
        ],
      );
      if (key.startsWith("C:")) patchConversation(key.slice(2), until);
    },
    onSettled: settle,
  });

  const unmute = useMutation({
    mutationFn: async (key: string) => {
      const ok = await clearNotificationMute(api, key);
      if (!ok) throw new Error("The mute could not be removed.");
    },
    onMutate: (key) => {
      queryClient.setQueryData<NotificationMute[]>(
        queryKeys.notificationMutes(),
        (mutes) => (mutes ?? []).filter((mute) => mute.key !== key),
      );
      if (key.startsWith("C:")) patchConversation(key.slice(2), undefined);
    },
    onSettled: settle,
  });

  return {
    mute: (key: string, until: string | null) =>
      mute.mutateAsync({ key, until }),
    pending: mute.isPending || unmute.isPending,
    unmute: (key: string) => unmute.mutateAsync(key),
  };
};
