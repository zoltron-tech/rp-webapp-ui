import { Ionicons } from "@expo/vector-icons";
import { deleteConversationMessage } from "@nw/api/endpoints/conversation-detail";
import {
  conversationUsernames,
  isSameReaction,
  resolveConversationTarget,
} from "@nw/chat";
import {
  queryKeys,
  useApi,
  useConversation,
  useConversationMembers,
  useConversationMessages,
  useMarkConversationRead,
  useSession,
} from "@nw/features";
import type { Message } from "@nw/types";
import { isSameChatDay, toChatDayLabel, toChatTime } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ChatBackground } from "@/components/chat/chat-background";
import { Composer, type ComposerSubmission } from "@/components/chat/composer";
import { ConversationHeader } from "@/components/chat/conversation-header";
import { HelloState } from "@/components/chat/hello-state";
import { MessageActions } from "@/components/chat/message-actions";
import {
  DaySeparator,
  MessageBubble,
  type RunPosition,
} from "@/components/chat/message-bubble";
import { mediaItemsOf, textImagesOf } from "@/components/chat/message-media";
import { MessageSkeleton } from "@/components/chat/message-skeleton";
import type { ReactionGroup } from "@/components/chat/reactions";
import { ReactorsSheet } from "@/components/chat/reactors-sheet";
import { RetentionNotice } from "@/components/chat/retention-notice";
import { MediaKindProvider } from "@/components/image";
import { ListStatus } from "@/components/list-status";
import { MediaViewer } from "@/components/muse/media-viewer";
import { Text } from "@/components/text";
import { useInboxReveal } from "@/context/inbox-reveal";
import { useChatSocket, useTrackOnline } from "@/context/socket";
import { useReconcileThread } from "@/hooks/use-reconcile";
import { useSendChatMessage } from "@/hooks/use-send-chat-message";
import { useSwipeBack } from "@/hooks/use-swipe-back";
import { useOffline } from "@/lib/connectivity";
import { OUTBOX_ID_PREFIX } from "@/lib/local-store";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One conversation.
 *
 * The list is **inverted**. Not a style choice: a chat has to sit at the newest
 * message and grow upward as history loads, and an inverted `FlatList` is the
 * only way to get that without measuring and scrolling by hand on every append.
 * It means the data is reversed once here and `onEndReached` fires when you
 * scroll *up* into older messages, which is exactly where the next page is.
 *
 * Messages arrive two ways and land in the same place. The socket writes them
 * into the react-query cache (`context/socket.tsx`), and this screen renders
 * that cache — so a live delivery and a refetch are indistinguishable here, and
 * there is no second list to keep in step. Polling is switched off while the
 * socket is up, because doing both is a request every eight seconds to learn
 * what we have already been told.
 *
 * ## What this screen owns
 *
 * Everything a message can *do* on a phone: swipe a bubble to reply, long-press
 * it for the actions sheet, double-tap to react. The gestures live in
 * `MessageBubble`; the state they act on — which message is being replied to,
 * which one has the sheet open — lives here, because both are cleared by the
 * same things (sending, leaving) and neither belongs to a single bubble.
 *
 * Reactions go straight out over the socket and come back through the same
 * cache as everything else, so there is no optimistic copy to reconcile. When
 * the socket is down the controls are hidden rather than disabled: there is no
 * REST route for a reaction, and a button that silently does nothing is worse
 * than no button.
 *
 * Deleting your own message lives here too, for the same reason: it has to
 * undo itself if the server says no. Editing a sent message is deliberately
 * not offered on this client — the shorthand composer cannot round-trip
 * everything web's rich input writes, and a correction that quietly loses a
 * link or a mention is worse than none; delete and resend is the honest
 * path. Ice breakers and group creation are their own screens.
 *
 * ## Where it is drawn
 *
 * Not in its route's screen. The Inbox layout draws this over its stack
 * (`context/conversation-overlay`), and the route is an empty placeholder
 * carrying the navigation state; see there for why. This component gets the
 * id and the route's tab-bar hold as props, tells the overlay when its slide
 * out starts (the route pops then) and ends (the page unmounts then).
 */

/** One row of the inverted list: a message plus whether a day rule precedes it. */
interface Row {
  dayLabel: string | null;
  failed: boolean;
  message: Message;
  mine: boolean;
  pending: boolean;
  pendingId: string | null;
  /** Written offline, waiting in the outbox. */
  queued: boolean;
  /** Where this bubble sits in its sender's run, which decides its corners. */
  position: RunPosition;
  showAvatar: boolean;
  showSender: boolean;
}

/** A run of messages from one person collapses if they are close in time. */
const RUN_GAP_MS = 10 * 60 * 1000;

/** How far up the thread you must be before the jump button appears. */
const JUMP_THRESHOLD = 320;

const keyExtractor = (item: Row) => item.message.id;

export const ConversationScreen = ({
  conversationId,
  onBeginLeave,
  onFinishLeave,
  onRegisterLeave,
  releaseTabBar,
}: {
  conversationId: string;
  /** The page has started to slide off: pop the route now. */
  onBeginLeave: () => void;
  /** The slide is over: unmount the page. */
  onFinishLeave: () => void;
  /** Hands the route this page's `leave()`, for the hardware back button. */
  onRegisterLeave: (leave: () => void) => void;
  /**
   * The route's hold on the tab bar (`useHideTabBar`), released as the page
   * starts to leave so the bar rises under it rather than popping onto the
   * list afterwards.
   */
  releaseTabBar: () => void;
}) => {
  const theme = useAppTheme();
  const router = useRouter();

  const { novelist } = useSession();
  const { applyDelete, isConnected, onActionError, sendDelete, sendReaction } =
    useChatSocket();
  const api = useApi();
  const queryClient = useQueryClient();
  const { conversation } = useConversation(conversationId);

  /*
   * How many are in a group. The service sends `memberCount`; a service
   * that predates it sends only `members`, a preview of the first three,
   * and counting that said "3 members" for a group of eight. Then the
   * members list itself is asked — the same query the details screen
   * fills, so it is one fetch between them — and its first page is exact
   * up to its size and a lower bound past it.
   */
  const wantsMemberCount = Boolean(
    conversation?.isGroup && conversation.memberCount == null,
  );
  const groupMembers = useConversationMembers(
    wantsMemberCount ? conversationId : undefined,
  );
  const memberCount =
    conversation?.memberCount ??
    (groupMembers.members.length > 0 ? groupMembers.members.length : undefined);
  const memberCountIsLowerBound =
    conversation?.memberCount == null && Boolean(groupMembers.hasNextPage);
  // What was deleted or arrived while this thread was not open (see
  // `sync-chat.ts`); the hook below paints the local copy meanwhile.
  useReconcileThread(conversationId);
  const {
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    messages,
    refetch,
  } = useConversationMessages(conversationId, { live: isConnected });

  const {
    discard,
    pending,
    reconcile,
    retry,
    selectSender,
    send,
    sender,
    senders,
    sending,
  } = useSendChatMessage(conversationId);
  const markRead = useMarkConversationRead();

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [actionsFor, setActionsFor] = useState<Message | null>(null);
  const [reactorsFor, setReactorsFor] = useState<{
    groups: ReactionGroup[];
    message: Message;
  } | null>(null);
  // One identity for the life of the page; see `reactToRow` for why.
  const showReactors = useCallback(
    (groups: ReactionGroup[], message: Message) =>
      setReactorsFor({ groups, message }),
    [],
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Row>>(null);
  const [jumpVisible, setJumpVisible] = useState(false);
  // What the composer, keyboard and tray cover at the foot of the screen.
  // The composer moves by a transform (see its "Lifting" note), so the list
  // is told the settled number once and pads for it, rather than being
  // re-laid out on every frame of the motion.
  const [bottomInset, setBottomInset] = useState(0);

  const target = useMemo(
    () => resolveConversationTarget(conversation, novelist?.username),
    [conversation, novelist?.username],
  );

  // Register everyone in the thread for presence, or the header and every
  // avatar in it report offline regardless of who is actually connected.
  useTrackOnline(
    useMemo(
      () => conversationUsernames(conversation, novelist?.username),
      [conversation, novelist?.username],
    ),
  );

  /**
   * Mark read once per visit, not once per render.
   *
   * The mutation invalidates the unread query, which re-renders this screen —
   * calling it unguarded is an infinite loop that also hammers the endpoint.
   * The newest message id is part of the guard so a message arriving while the
   * conversation is open clears the badge it would otherwise set.
   */
  const markedRef = useRef<string | null>(null);
  const newestId = messages[messages.length - 1]?.id ?? null;
  useEffect(() => {
    if (!conversationId) return;
    const stamp = `${conversationId}:${newestId ?? ""}`;
    if (markedRef.current === stamp) return;
    markedRef.current = stamp;
    markRead.mutate(conversationId);
  }, [conversationId, newestId, markRead]);

  /**
   * Retire the optimistic bubble once the real message lands.
   *
   * chat-server broadcasts our own message back to us, so the sender's copy
   * arrives through exactly the same path as everyone else's. Matching on text
   * is what removes the duplicate; without it a sent message shows twice, once
   * dimmed forever.
   */
  //
  // Matched during render, not only in the effect. The effect alone let one
  // frame through with both — the real sticker and its dimmed "Sending" copy
  // stacked in the thread — before the copy was dropped. Here the copy is left
  // out of the rows the moment its echo is in the cache, and the effect only
  // tidies the pending list afterwards.
  //
  // An echo is a message of ours with the same text that was not in the thread
  // when this one was sent (`seen`), each claimed by one pending entry.
  const settled = useMemo(() => {
    const matched: string[] = [];
    if (pending.length === 0) return matched;
    const claimed = new Set<string>();
    for (const entry of pending) {
      // A queued entry leaves the list when it is sent, not when echoed.
      if (entry.failed || entry.queued) continue;
      const echo = messages.find(
        (message) =>
          !claimed.has(message.id) &&
          !entry.seen.has(message.id) &&
          message.message === entry.text &&
          (message.senderId === novelist?.id ||
            message.sender?.username === novelist?.username),
      );
      if (!echo) continue;
      claimed.add(echo.id);
      matched.push(entry.id);
    }
    return matched;
  }, [messages, novelist?.id, novelist?.username, pending]);

  useEffect(() => {
    if (settled.length > 0) reconcile(settled);
  }, [reconcile, settled]);

  /** The ids in the thread right now, for a send to remember. */
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const seenNow = useCallback(
    () => new Set(messagesRef.current.map((message) => message.id)),
    [],
  );

  /**
   * Newest first, with the pending messages on top and the display rules
   * resolved once.
   *
   * All of it is memoised together because a `FlatList`'s `data` changing
   * identity re-renders every visible row, and this screen re-renders on every
   * keystroke in the composer.
   */
  const offline = useOffline();

  const rows = useMemo<Row[]>(() => {
    const myId = novelist?.id ?? "";
    const myUsername = novelist?.username ?? "";
    const isGroup = Boolean(conversation?.isGroup);

    // Optimistic messages, shaped like real ones so one renderer handles both.
    const optimistic: Message[] = pending
      .filter((entry) => !settled.includes(entry.id))
      .map((entry) => ({
        // The uploaded URLs, so the pictures are in the bubble the moment it
        // appears rather than when the server echoes the message back.
        attachments: entry.attachments.map((attachment, index) => ({
          id: `pending-attachment-${index}`,
          url: attachment.url,
        })),
        conversationId: conversationId ?? "",
        createdAt: entry.createdAt,
        id: entry.id,
        image: "",
        isRead: false,
        message: entry.text,
        reactions: [],
        repliedTo: entry.repliedTo
          ? { message: entry.repliedTo, type: "MESSAGE" }
          : undefined,
        sender: {
          // The chosen identity, not necessarily the novelist — otherwise picking
          // a muse appears to do nothing until the server echoes the message
          // back, which is exactly when it is too late to notice.
          id: entry.sender?.id ?? myId,
          image: entry.sender?.image ?? novelist?.image ?? "",
          messageSourceType: entry.sender?.type ?? "NOVELIST",
          name: entry.sender?.name ?? novelist?.firstName ?? "",
          username: novelist?.username ?? "",
        },
        senderId: myId,
        type: "TEXT",
      }));

    // `messages` is in reading order; the inverted list wants newest first.
    const ordered = [...messages, ...optimistic].reverse();

    return ordered.map((message, index) => {
      // index + 1 is the *older* neighbour: one row above on an inverted list.
      const older = ordered[index + 1];
      /*
       * Mine is decided by **username**, not by sender id.
       *
       * A message sent as a muse carries that muse's id in `sender.id`, so an
       * id comparison files your own in-character messages as incoming and
       * draws them on the left with your muse's avatar beside them. The
       * username is the one field chat-server overwrites from the
       * authenticated connection, which makes it the only trustworthy answer
       * to "did I send this".
       */
      const mine = Boolean(
        (myUsername && message.sender?.username === myUsername) ||
          (myId && message.senderId === myId),
      );
      const pendingEntry = pending.find((entry) => entry.id === message.id);

      const sameSenderAsOlder =
        older?.sender?.id != null && older.sender.id === message.sender?.id;
      const closeInTime =
        older?.createdAt && message.createdAt
          ? new Date(message.createdAt).getTime() -
              new Date(older.createdAt).getTime() <
            RUN_GAP_MS
          : false;
      const startsRun = !sameSenderAsOlder || !closeInTime;

      // A day rule belongs above the first message of that day — which, going
      // newest-first, is the row whose older neighbour is on a different day.
      const startsDay =
        !older || !isSameChatDay(message.createdAt, older.createdAt);

      /*
       * The *newer* neighbour, which on an inverted list is the row below.
       *
       * Needed as well as the older one because a bubble's shape depends on
       * both sides: a message in the middle of a run is square on the sender's
       * side at the top and the bottom, and only the ends round off.
       */
      const newer = ordered[index - 1];
      const sameSenderAsNewer =
        newer?.sender?.id != null && newer.sender.id === message.sender?.id;
      const closeToNewer =
        newer?.createdAt && message.createdAt
          ? new Date(newer.createdAt).getTime() -
              new Date(message.createdAt).getTime() <
            RUN_GAP_MS
          : false;
      // A day rule between two messages ends the run whatever the clock says.
      const newerStartsDay =
        !newer || !isSameChatDay(newer.createdAt, message.createdAt);
      const endsRun = !sameSenderAsNewer || !closeToNewer || newerStartsDay;

      const position: RunPosition =
        startsRun && endsRun
          ? "single"
          : startsRun
            ? "first"
            : endsRun
              ? "last"
              : "middle";

      return {
        dayLabel: startsDay ? toChatDayLabel(message.createdAt) : null,
        failed: Boolean(pendingEntry?.failed),
        message,
        mine,
        pending:
          Boolean(pendingEntry) &&
          !pendingEntry?.failed &&
          !pendingEntry?.queued,
        pendingId: pendingEntry?.id ?? null,
        position,
        queued: Boolean(pendingEntry?.queued),
        // The avatar sits at the bottom of a run, so it is beside the newest
        // bubble the way every messaging app places it.
        showAvatar: !mine && endsRun,
        showSender: !mine && isGroup && startsRun,
      };
    });
  }, [
    conversation?.isGroup,
    conversationId,
    messages,
    novelist,
    pending,
    settled,
  ]);

  /*
   * The rows, reachable from a stable callback.
   *
   * `jumpToQuoted` is handed to every bubble, so it must not change identity on
   * each render or the memo on `MessageBubble` is worthless and the whole
   * thread re-renders whenever a message arrives.
   */
  const rowsRef = useRef<Row[]>(rows);
  rowsRef.current = rows;

  const openDetails = useCallback(() => {
    router.push({
      params: { conversationId: conversationId ?? "" },
      pathname: "/(tabs)/(inbox)/[conversationId]/details",
    });
  }, [conversationId, router]);

  /**
   * Sends a reaction, as the identity currently selected in the composer.
   *
   * Optimistic nothing: chat-server broadcasts the reaction back and
   * `applyReaction` writes it into the same cache this screen renders, so the
   * chip appears through the ordinary path. A local copy would have to be
   * reconciled against that echo, which is the bug the optimistic *message*
   * path already exists to work around — no reason to buy it twice.
   *
   * `remove` takes this person's reaction back instead. It is asked for
   * explicitly — by the sheet's filled reaction and by their row in the
   * reactors sheet — never inferred here, so a double-tap heart on a message
   * already hearted stays a heart.
   */
  const react = useCallback(
    (message: Message, reaction: string, remove = false) => {
      if (!conversationId) return;
      sendReaction({
        conversationId,
        messageId: message.id,
        reaction,
        remove: remove || undefined,
        sender: {
          id: sender?.id ?? novelist?.id ?? "",
          image: sender?.image ?? novelist?.image ?? "",
          messageSourceType: sender?.type ?? "NOVELIST",
          name: sender?.name ?? novelist?.firstName ?? "",
          username: novelist?.username ?? "",
        },
      });
    },
    [conversationId, novelist, sender, sendReaction],
  );

  /*
   * What the rows are handed: the same two functions for the life of the page.
   *
   * `react` follows the selected sender, which resolves a moment after the
   * page opens, and `retry` follows the pending list. Handing either to the
   * rows directly gave `renderItem` a new identity each time — and a new
   * `renderItem` re-renders every bubble in the thread, pictures and all, a
   * quarter of a second into every open. The rows call through a ref instead.
   */
  const latest = useRef({ react, retry });
  latest.current = { react, retry };
  const reactToRow = useCallback(
    (message: Message, reaction: string) =>
      latest.current.react(message, reaction),
    [],
  );
  const retryRow = useCallback(
    (pendingId: string) => latest.current.retry(pendingId),
    [],
  );

  /**
   * What a delete looked like before it went out, by message id.
   *
   * A socket send is fire-and-forget: the answer, if the backend refuses, is
   * an `action-error` frame some time later. This is what that frame is
   * matched against to put the message back. Entries are let go when they
   * are used or after a minute — a refusal that takes longer than that is a
   * refetch's problem, not a revert's.
   */
  const inFlightRef = useRef(
    new Map<string, { at: number; message: Message }>(),
  );
  const holdOriginal = useCallback((message: Message) => {
    const now = Date.now();
    for (const [id, held] of inFlightRef.current) {
      if (now - held.at > 60_000) inFlightRef.current.delete(id);
    }
    inFlightRef.current.set(message.id, { at: now, message });
  }, []);

  const submit = useCallback(
    async ({ attachments, text }: ComposerSubmission) => {
      const accepted = await send(text, {
        attachments,
        repliedTo: replyingTo,
        seen: seenNow(),
      });
      if (accepted) setReplyingTo(null);
      return accepted;
    },
    [replyingTo, send, seenNow],
  );

  /**
   * Puts a message back after the server refused to delete it.
   *
   * Into the newest page, then that page in order: the pages are newest
   * first and so is each page, and a message that was on screen a moment ago
   * is almost always in the first one. Landing it one page early on a long
   * thread costs a row drawn out of order until the next refetch, which is a
   * smaller wrong than leaving it deleted when it was not.
   */
  const restoreMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData<{ pages: Message[][]; pageParams: unknown[] }>(
        queryKeys.conversationMessages(message.conversationId),
        (previous) => {
          if (!previous || previous.pages.length === 0) return previous;
          const [first = [], ...rest] = previous.pages;
          if (first.some((m) => m.id === message.id)) return previous;
          const page = [...first, message].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          return { ...previous, pages: [page, ...rest] };
        },
      );
      // The quotes on replies to it were cleared with it and are not kept
      // anywhere to put back; a refetch has them, and the true order.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversationMessages(message.conversationId),
      });
    },
    [queryClient],
  );

  // A refusal from the backend, for a delete sent over the socket: put the
  // message back and say so. REST refusals are handled where they are made.
  useEffect(
    () =>
      onActionError(({ action, messageId }) => {
        if (action !== "delete") return;
        const held = inFlightRef.current.get(messageId);
        if (!held) return;
        inFlightRef.current.delete(messageId);
        restoreMessage(held.message);
        Alert.alert(
          "Not deleted",
          "The message could not be deleted. Please try again.",
        );
      }),
    [onActionError, restoreMessage],
  );

  // Someone else — another of your devices, say — deleted the message this
  // field is answering: the field stands down, or the reply would quote
  // nothing.
  useEffect(() => {
    const present = new Set(messages.map((message) => message.id));
    setReplyingTo((current) =>
      current && !present.has(current.id) ? null : current,
    );
  }, [messages]);

  const performDelete = useCallback(
    async (message: Message) => {
      if (!conversationId) return;
      // A reply to it stands down: it would quote nothing.
      setReplyingTo((current) => (current?.id === message.id ? null : current));

      applyDelete({ conversationId, messageId: message.id });
      if (sendDelete({ conversationId, messageId: message.id })) {
        holdOriginal(message);
        return;
      }

      const result = await deleteConversationMessage(api, message.id).catch(
        () => false,
      );
      if (result === true) return;

      restoreMessage(message);
      Alert.alert(
        "Not deleted",
        "The message could not be deleted. Please try again.",
      );
    },
    [
      api,
      applyDelete,
      conversationId,
      holdOriginal,
      restoreMessage,
      sendDelete,
    ],
  );

  /** Asks first: a delete is for everyone and there is no undo. */
  const removeMessage = useCallback(
    (message: Message) => {
      Alert.alert(
        "Delete message?",
        "It will be removed for everyone in this conversation.",
        [
          { style: "cancel", text: "Cancel" },
          {
            onPress: () => void performDelete(message),
            style: "destructive",
            text: "Delete",
          },
        ],
      );
    },
    [performDelete],
  );

  /**
   * Scrolls to the message a quote refers to, and marks it.
   *
   * Only reaches what is loaded: history pages in as you scroll up, so a reply
   * to something from last week has nothing to scroll to yet. Saying so beats
   * a tap that silently does nothing — and beats fetching pages in a loop until
   * the id turns up, which on a long thread is a dozen requests to answer one
   * tap.
   */
  const jumpToQuoted = useCallback((messageId: string) => {
    const index = rowsRef.current.findIndex(
      (row) => row.message.id === messageId,
    );
    if (index < 0) {
      Alert.alert(
        "Not loaded yet",
        "Scroll up to load more of this conversation, then try again.",
      );
      return;
    }

    // `viewPosition: 0.5` puts it in the middle rather than hard against an
    // edge, which is where you can actually read what is around it.
    listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5,
    });

    setHighlightId(messageId);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 1600);
  }, []);

  /**
   * Opens the sender's profile.
   *
   * The unqualified path, which is what every other screen uses. The Inbox
   * stack has its own copy of the profile route (as every tab does), so this
   * stays in Inbox and back returns to the chat — the link cards in messages
   * rely on the same copies.
   */
  const openSender = useCallback(
    (username: string) => {
      router.push({ params: { username }, pathname: "/novelist/[username]" });
    },
    [router],
  );

  const startReply = useCallback((message: Message) => {
    // A message still in flight has no server id to reply *to*, so replying to
    // one would send a dangling reference the server drops silently.
    if (
      message.id.startsWith("pending-") ||
      message.id.startsWith(OUTBOX_ID_PREFIX)
    )
      return;
    // A fresh object each time, even for the message already being replied
    // to: the composer refocuses its field when this changes, and swiping the
    // same bubble again is how you ask for the keyboard back.
    setReplyingTo({ ...message });
  }, []);

  /**
   * The viewer, over the whole thread, on one message's pictures and clips.
   *
   * One for the screen rather than one per bubble — a modal per row is a modal
   * mounted for every message with a picture in it. It swipes through that
   * message's album and nothing else: the album is what the sender put
   * together, and the thread's other pictures are a scroll away.
   */
  const [viewer, setViewer] = useState<{
    index: number;
    media: string[];
    subtitle: string;
    title: string;
  } | null>(null);

  const openMedia = useCallback((message: Message, index: number) => {
    const attached = mediaItemsOf(message.attachments).map((item) => item.url);
    // No attachments: the pictures are the message itself — a GIF or sticker
    // from the picker is a bare URL in the text.
    const media =
      attached.length > 0 ? attached : textImagesOf(message.message);
    if (media.length === 0) return;
    // The keyboard would sit over the viewer's footer, and a picture being
    // looked at is not a reply being typed.
    Keyboard.dismiss();
    setViewer({
      index: Math.min(Math.max(index, 0), media.length - 1),
      media,
      subtitle: `${toChatDayLabel(message.createdAt)} · ${toChatTime(message.createdAt)}`,
      title: message.sender?.name || message.sender?.username || "",
    });
  }, []);

  const changeViewerIndex = useCallback((index: number) => {
    setViewer((current) => (current ? { ...current, index } : current));
  }, []);
  const closeViewer = useCallback(() => setViewer(null), []);
  const cancelReply = useCallback(() => setReplyingTo(null), []);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <View style={styles.rowWrapper}>
        {item.dayLabel ? <DaySeparator label={item.dayLabel} /> : null}
        <MessageBubble
          failed={item.failed}
          message={item.message}
          mine={item.mine}
          myUsername={novelist?.username}
          highlighted={highlightId === item.message.id}
          onJumpToQuoted={jumpToQuoted}
          onOpenMedia={openMedia}
          onOpenSender={openSender}
          onReact={isConnected ? reactToRow : undefined}
          onReply={startReply}
          onRetry={
            item.pendingId
              ? () => retryRow(item.pendingId as string)
              : undefined
          }
          onShowActions={setActionsFor}
          onShowReactors={showReactors}
          pending={item.pending}
          position={item.position}
          queued={item.queued}
          showAvatar={item.showAvatar}
          showSender={item.showSender}
        />
      </View>
    ),
    [
      highlightId,
      isConnected,
      jumpToQuoted,
      novelist?.username,
      openMedia,
      openSender,
      reactToRow,
      retryRow,
      startReply,
    ],
  );

  /** What this person already reacted with on the message under the sheet. */
  const myReaction = actionsFor?.reactions?.find(
    (reaction) => reaction.sender?.username === novelist?.username,
  )?.reaction;

  // Web's swipe-back: the page follows a rightward drag and leaves past 80pt,
  // uncovering the list, which is rendered beneath this overlay. The page's
  // position is shared with the list for its parallax. `use-swipe-back` has
  // the rest, including how it stays out of the bubbles' own swipes.
  const reveal = useInboxReveal();
  const swipeBack = useSwipeBack({
    onBack: onFinishLeave,
    onLeave: () => {
      releaseTabBar();
      onBeginLeave();
      // The route pops as the slide *starts*: the stack then removes an
      // empty screen, and the page finishes its slide here, on its own.
      router.back();
    },
    onMove: reveal?.follow,
    value: reveal?.pageX,
  });

  // The route's hardware back is this page's leave.
  const { leave } = swipeBack;
  useEffect(() => {
    onRegisterLeave(leave);
  }, [leave, onRegisterLeave]);

  /*
   * What the long-press sheet may offer on the message under it.
   *
   * Only a message that has reached the server can be deleted; one still in
   * flight has "Don't send" instead. Delete takes any message of yours.
   */
  const actionsRow = actionsFor
    ? rows.find((row) => row.message.id === actionsFor.id)
    : undefined;
  const canDeleteActions = Boolean(
    actionsRow && !actionsRow.pendingId && actionsRow.mine,
  );

  return (
    // Everything drawn in here is chat: its pictures expire with the messages.
    <MediaKindProvider value="chat">
      <View style={styles.screen}>
        {/* Dims the list under the page, lifting as the page slides off. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.scrim, swipeBack.scrimStyle]}
        />

        <Animated.View
          onLayout={swipeBack.onLayout}
          style={[
            styles.page,
            { backgroundColor: theme.background },
            swipeBack.style,
          ]}
        >
          {/* The page's leading edge casts onto the list it is sliding off. */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.28)"]}
            end={{ x: 1, y: 0 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={styles.edgeShadow}
          />

          <ChatBackground />

          {/*
        The navigator's own header is switched off (in the stack's layout)
        and the bar is drawn below. A stack header hands you a slot of
        unknown width between its back button and whatever is on the right,
        which is why the old title carried a hardcoded `maxWidth: 240` — a
        number that truncated names on a large phone and overlapped the
        buttons on a small one.

        The swipe listens on the header and the thread, not on the composer:
        a drag inside the text field is a selection, and the media tray's
        tabs scroll sideways.
      */}
          <View {...swipeBack.panHandlers} style={styles.swipeArea}>
            <ConversationHeader
              conversation={conversation}
              conversationId={conversationId}
              memberCount={memberCount}
              memberCountIsLowerBound={memberCountIsLowerBound}
              onBack={swipeBack.leave}
              onPress={openDetails}
              target={target}
            />

            {/* The list and the floating pill share a box, so "bottom" means the top
          of the composer rather than the bottom of the screen — and the
          composer's height changes with the draft, the media row and the
          attachment strip. */}
            <View style={styles.listArea}>
              <FlatList
                // Inverted, so `paddingTop` is the *visual* bottom: the room the
                // lifted composer takes from the list.
                contentContainerStyle={[
                  styles.content,
                  // `bottomInset` is only what the lifted composer takes (0 at
                  // rest). Set alone it replaced `content`'s own padding, so the
                  // newest message sat flush on the composer; the base gap is
                  // added back on top of the lift.
                  { paddingTop: space.md + bottomInset },
                ]}
                data={rows}
                inverted
                keyExtractor={keyExtractor}
                ListEmptyComponent={
                  /*
                   * No counter-transform here. `VirtualizedList` already composes its
                   * inversion style onto whatever element is passed as
                   * `ListEmptyComponent`, and a `transform` of our own *replaces* it
                   * rather than adding to it — which on Android is the bug it was
                   * meant to fix. There the inverted list uses `scale: -1`, flipping
                   * both axes; overriding that with `scaleY: -1` undid the vertical
                   * flip and left the horizontal one, so the empty state rendered
                   * mirrored left-to-right.
                   */
                  <View>
                    {/*
              Loading and failure keep the plain status; only a conversation
              that has genuinely never been used gets the invitation. Showing
              the sticker while the first page is still in flight would offer
              to start a conversation that may already have a hundred messages.
            */}
                    {isPending && !error ? (
                      <MessageSkeleton />
                    ) : error || !conversationId ? (
                      <ListStatus error={error} onRetry={refetch} />
                    ) : (
                      <HelloState
                        conversationId={conversationId}
                        disabled={sending}
                        onSend={(stickerUrl) =>
                          void send(stickerUrl, {
                            repliedTo: replyingTo,
                            seen: seenNow(),
                          })
                        }
                      />
                    )}
                  </View>
                }
                /*
                 * Inverted, so the list's "footer" is the *top* of the screen. Two
                 * things belong there: the spinner while older history loads, and —
                 * once there is no more history — the retention notice, which web puts
                 * above the oldest message for the same reason. No counter-transform:
                 * the list already applies one to the footer, unlike the empty state.
                 */
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <ListStatus loading />
                  ) : !hasNextPage && conversationId ? (
                    <RetentionNotice conversationId={conversationId} />
                  ) : null
                }
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
                }}
                onEndReachedThreshold={0.4}
                // Inverted, so `contentOffset.y` is the distance from the *newest*
                // message: zero is the bottom of the thread.
                onScroll={({ nativeEvent }) =>
                  setJumpVisible(nativeEvent.contentOffset.y > JUMP_THRESHOLD)
                }
                // Rows are variable height, so there is no `getItemLayout` to give the
                // list — which means `scrollToIndex` can miss on a row it has not
                // measured. Scrolling roughly there and retrying is the documented
                // recovery, and it is invisible at this speed.
                onScrollToIndexFailed={({ averageItemLength, index }) => {
                  listRef.current?.scrollToOffset({
                    animated: true,
                    offset: averageItemLength * index,
                  });
                  setTimeout(() => {
                    listRef.current?.scrollToIndex({
                      animated: true,
                      index,
                      viewPosition: 0.5,
                    });
                  }, 240);
                }}
                ref={listRef}
                renderItem={renderItem}
                // A thread's rows are pictures, clips and rich text. The default
                // window keeps ten screens of them built around a fling; five
                // either side is more than a finger outruns, and half the work.
                // The first pass stays at the default: building fewer rows on
                // open saved nothing measurable and moved the rest into the
                // first fling, which then stuttered.
                maxToRenderPerBatch={6}
                windowSize={11}
                scrollEventThrottle={64}
              />

              {jumpVisible ? (
                <View
                  pointerEvents="box-none"
                  style={[styles.jumpWrap, { bottom: space.sm + bottomInset }]}
                >
                  <Pressable
                    accessibilityLabel="Jump to the newest message"
                    accessibilityRole="button"
                    onPress={() =>
                      listRef.current?.scrollToOffset({
                        animated: true,
                        offset: 0,
                      })
                    }
                    style={({ pressed }) => [
                      styles.jump,
                      {
                        backgroundColor: pressed
                          ? theme.material.fillPressed
                          : theme.glass.opaque,
                        borderColor: theme.glass.edge,
                      },
                    ]}
                  >
                    <Ionicons color={theme.text} name="arrow-down" size={16} />
                    <Text style={[styles.jumpLabel, { color: theme.text }]}>
                      Latest
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>

          <Composer
            conversationId={conversationId}
            onCancelReply={cancelReply}
            onInsetChange={setBottomInset}
            onSelectSender={selectSender}
            onSend={submit}
            replyingTo={replyingTo}
            selectedSender={sender}
            senders={senders}
            sending={sending}
            statusNote={
              offline
                ? "Offline — messages will send when you're back online."
                : isConnected
                  ? null
                  : "Reconnecting — messages will still send."
            }
          />

          <MessageActions
            canReact={isConnected}
            message={actionsFor}
            myReaction={myReaction}
            onClose={() => setActionsFor(null)}
            onDelete={canDeleteActions ? removeMessage : undefined}
            onDiscard={
              actionsRow?.pendingId
                ? () => {
                    if (actionsRow.pendingId) discard(actionsRow.pendingId);
                  }
                : undefined
            }
            // Picking the reaction that is already yours takes it back.
            onReact={(message, reaction) =>
              react(message, reaction, isSameReaction(myReaction, reaction))
            }
            onReply={startReply}
            onRetry={
              actionsRow?.failed
                ? () => {
                    if (actionsRow.pendingId) retry(actionsRow.pendingId);
                  }
                : undefined
            }
          />

          <ReactorsSheet
            groups={reactorsFor?.groups ?? null}
            onClose={() => setReactorsFor(null)}
            // Hidden while the socket is down, like every other reaction
            // control: there is no REST route to take one back through.
            onRemove={
              isConnected && reactorsFor
                ? (group) => {
                    react(reactorsFor.message, group.key, true);
                    setReactorsFor(null);
                  }
                : undefined
            }
          />

          {/* A message's album, full screen: swipe through it, double-tap or
            pinch to zoom, pull down to close. Read-only — nothing to caption,
            heart or delete here; that is the message's own sheet. */}
          <MediaViewer
            index={viewer?.index ?? null}
            isOwner={false}
            media={viewer?.media ?? NO_MEDIA}
            metaByUrl={NO_META}
            onCaption={noCaption}
            onChange={changeViewerIndex}
            onClose={closeViewer}
            onDelete={noop}
            subtitle={viewer?.subtitle}
            title={viewer?.title}
          />
        </Animated.View>
      </View>
    </MediaKindProvider>
  );
};

/** The viewer's props while nothing is open — stable, so it is not re-rendered. */
const NO_MEDIA: string[] = [];
const NO_META = new Map();
const noCaption = async () => false;
const noop = () => {};

/** Width of the shadow the page casts to its left while sliding. */
const EDGE_SHADOW = 14;

const styles = StyleSheet.create({
  // Tighter than the old `space.sm`: the bubbles inside a run now share a
  // shape, and a gap wide enough to break that shape apart undoes the grouping.
  content: { gap: 3, padding: space.md },
  edgeShadow: {
    bottom: 0,
    left: -EDGE_SHADOW,
    position: "absolute",
    top: 0,
    width: EDGE_SHADOW,
  },
  jump: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  jumpLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  /*
   * Floated over the thread, not stacked above the composer.
   *
   * As a row in the column it reserved a strip the list could not use, and the
   * chat wallpaper showed through it — a band across the conversation with the
   * messages behind it pushed out of the way. Absolute and `box-none` means
   * only the pill itself is drawn and only the pill catches a tap.
   */
  jumpWrap: {
    alignItems: "center",
    bottom: space.sm,
    left: 0,
    position: "absolute",
    right: 0,
  },
  listArea: { flex: 1 },
  // `overflow: visible` so the shadow past the left edge is drawn.
  page: { flex: 1, overflow: "visible" },
  rowWrapper: { gap: 3 },
  screen: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  swipeArea: { flex: 1 },
});
