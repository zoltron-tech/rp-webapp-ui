import { type MessageSenderChoice, senderOptions } from "@nw/chat";
import { useChatCrypto, useSendMessage, useSession } from "@nw/features";
import { API_MESSAGE, type Message } from "@nw/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChatSocket } from "@/context/socket";
import { isOffline } from "@/lib/connectivity";
import {
  discardOutbox,
  enqueueOutbox,
  getStore,
  OUTBOX_ID_PREFIX,
  type OutboxMessage,
  useOutboxMessages,
} from "@/lib/local-store";

/**
 * Sends a message, over the socket when there is one.
 *
 * The two paths are not equivalent and the difference is the reason this hook
 * exists rather than the screen just calling `useSendMessage`:
 *
 *  - **Socket** — `chat-server` persists the message *and broadcasts it* to
 *    everyone in the conversation, including us. That broadcast is what makes
 *    the other person's screen update without them doing anything.
 *  - **REST** — `POST .../sendMessage` only persists. Nobody is told. The
 *    recipient sees it whenever they next poll or reconnect.
 *
 * So the socket is preferred and REST is the fallback for a dropped connection,
 * not an equal alternative. Falling back is still much better than refusing to
 * send, which is what the web app does ("Not connected. Please wait and try
 * again.") — the message is written, and it is delivered late rather than lost.
 *
 * ## A third path: no network at all
 *
 * With the phone offline neither path can be tried, and marking the message
 * failed would be a lie — nothing failed, there was nothing to fail against.
 * The message goes to the **outbox** (`local-store/outbox.ts`) instead: a row
 * in the encrypted store, drawn in the thread as "Waiting for connection", and
 * sent — over the socket, as written — the moment there is a connection,
 * whether the app is open or the background refresh finds the network first.
 * `discard` takes one out of the queue; a discarded message is never sent.
 */
export interface SentMessage {
  id: string;
  text: string;
  createdAt: string;
  failed: boolean;
  /** In the outbox, waiting for a connection. Not in flight, not failed. */
  queued: boolean;
  attachments: { url: string }[];
  repliedTo: Message | null;
  /**
   * Who it was sent as. Kept on the entry rather than read from the current
   * choice: switching muse while a message is in flight must not re-sign the
   * "Sending" bubble, and a retry goes out as whoever it was written as.
   */
  sender: MessageSenderChoice | null;
  /**
   * The message ids already in the thread when it was sent. Only a message
   * that arrives after the send can be its echo — the same sticker or the
   * same "lol" sent twice otherwise matched the earlier copy, and the second
   * send's bubble vanished until the server answered.
   */
  seen: ReadonlySet<string>;
}

/**
 * Everything a message can carry besides its words.
 *
 * Attachments are socket-only, and deliberately: `POST .../sendMessage` takes a
 * message body and nothing else, so a REST fallback would drop the pictures and
 * send the caption alone — worse than saying it could not be sent. A reply
 * degrades more gracefully, arriving as an ordinary message, so it is allowed
 * through either path.
 */
export interface SendOptions {
  attachments?: { url: string }[] | null;
  repliedTo?: Message | null;
  /** The thread's message ids at the moment of sending; see `SentMessage`. */
  seen?: ReadonlySet<string>;
}

interface DispatchOptions extends SendOptions {
  sender?: MessageSenderChoice | null;
}

const NOTHING_SEEN: ReadonlySet<string> = new Set();

/** An outbox row, as the thread draws it. */
const fromOutbox = (entry: OutboxMessage): SentMessage => ({
  attachments: entry.attachments,
  createdAt: entry.createdAt,
  failed: false,
  id: entry.id,
  queued: true,
  repliedTo: entry.repliedTo,
  seen: NOTHING_SEEN,
  sender: entry.sender,
  text: entry.text,
});

export const useSendChatMessage = (conversationId: string | undefined) => {
  const { novelist } = useSession();
  const crypto = useChatCrypto();
  const { isConnected, onSendError, sendMessage } = useChatSocket();
  const restSend = useSendMessage(conversationId);

  const [inFlight, setInFlight] = useState<SentMessage[]>([]);
  const [sending, setSending] = useState(false);
  const queued = useOutboxMessages(conversationId);
  /**
   * Why the backend refused this conversation's last send, when the refusal
   * will not change on a retry: `blocked` (BLOCK_BLACKLIST_PLAN.md K3) or
   * `unavailable`. The screen puts its note where the composer was.
   */
  const [refusal, setRefusal] = useState<"blocked" | "unavailable" | null>(
    null,
  );

  useEffect(() => {
    setRefusal(null);
  }, [conversationId]);

  /*
   * A refused send comes back as a frame naming the conversation, not the
   * message: it never got an id. Everything of ours still in flight here is
   * what was refused — marked failed, so it can be retried or discarded.
   */
  useEffect(
    () =>
      onSendError((error) => {
        if (!conversationId || error.conversationId !== conversationId) return;
        setInFlight((previous) =>
          previous.map((entry) =>
            entry.failed ? entry : { ...entry, failed: true },
          ),
        );
        if (error.reason === API_MESSAGE.Blocked) setRefusal("blocked");
        else if (error.reason === API_MESSAGE.Unavailable)
          setRefusal("unavailable");
      }),
    [conversationId, onSendError],
  );

  /** The novelist, then every muse they have penned. */
  const senders = useMemo(() => senderOptions(novelist), [novelist]);
  const [sender, setSender] = useState<MessageSenderChoice | null>(null);

  /**
   * Default to the novelist, and reset when the conversation changes.
   *
   * Carrying a muse selection across conversations is the wrong default: the
   * choice is about who you are to *this* person, and silently continuing to
   * speak as a character in the next thread is a mistake nobody notices until
   * after they have sent it.
   */
  useEffect(() => {
    setSender(senders[0] ?? null);
  }, [senders, conversationId]);

  const dispatch = useCallback(
    async (
      text: string,
      optimisticId: string,
      options: DispatchOptions = {},
    ): Promise<boolean> => {
      if (!conversationId) return false;

      const attachments = options.attachments?.length
        ? options.attachments
        : null;

      // Encrypted here rather than inside the socket layer so both paths use
      // exactly one implementation of "what goes on the wire".
      const wire = await crypto.encryptMessageText(conversationId, text);

      if (isConnected) {
        const active = options.sender ?? sender ?? senders[0] ?? null;
        const accepted = sendMessage({
          attachments,
          conversationId,
          message: wire,
          repliedTo: options.repliedTo
            ? { id: options.repliedTo.id, type: "MESSAGE" }
            : null,
          sender: {
            // The chosen identity: the novelist, or one of their muses. This
            // is the part the server keeps — `messageSourceType` and `id` are
            // what make a message appear as the character rather than as you.
            id: active?.id ?? novelist?.id ?? "",
            image: active?.image ?? novelist?.image ?? null,
            messageSourceType: active?.type ?? "NOVELIST",
            name: active?.name ?? novelist?.firstName ?? "",
            // Overwritten by the server from the authenticated connection, so
            // speaking as a muse never changes who is accountable.
            username: novelist?.username ?? "",
          },
          type: "TEXT",
        });
        if (accepted) return true;
        // The socket reported itself open and the send still failed — fall
        // through to REST rather than dropping the message.
      }

      // Attachments have no REST route (`sendMessage` takes a body and nothing
      // else), so falling back would silently send the caption without the
      // pictures. Better to fail visibly and leave the retry to the socket.
      if (attachments) return false;

      const result = await restSend.mutateAsync(text).catch(() => false);
      if (result) {
        // REST does not echo the message back, so the optimistic bubble has
        // nothing to reconcile against. Drop it and let the invalidated query
        // supply the real one.
        setInFlight((previous) =>
          previous.filter((entry) => entry.id !== optimisticId),
        );
      }
      return Boolean(result);
    },
    [
      conversationId,
      crypto,
      isConnected,
      novelist,
      restSend,
      sendMessage,
      sender,
      senders,
    ],
  );

  const send = useCallback(
    async (text: string, options: SendOptions = {}): Promise<boolean> => {
      const trimmed = text.trim();
      const attachments = options.attachments ?? [];
      // A message with pictures and no words is a message; one with neither is
      // an empty send the composer should never have made.
      if ((!trimmed && attachments.length === 0) || !conversationId) {
        return false;
      }

      const chosen = sender ?? senders[0] ?? null;

      // No network: into the outbox, not into flight. The thread draws it from
      // there, and the drain sends it when there is something to send over.
      const store = getStore();
      if (isOffline() && store) {
        await enqueueOutbox(store, {
          attachments,
          conversationId,
          kind: "message",
          repliedTo: options.repliedTo ?? null,
          sender: chosen,
          text: trimmed,
        }).catch(() => undefined);
        return true;
      }

      const optimisticId = `pending-${Date.now()}-${Math.random()}`;
      setInFlight((previous) => [
        ...previous,
        {
          attachments,
          createdAt: new Date().toISOString(),
          failed: false,
          id: optimisticId,
          queued: false,
          repliedTo: options.repliedTo ?? null,
          seen: options.seen ?? NOTHING_SEEN,
          sender: chosen,
          text: trimmed,
        },
      ]);

      setSending(true);
      try {
        const ok = await dispatch(trimmed, optimisticId, {
          ...options,
          sender: chosen,
        });
        if (!ok) {
          setInFlight((previous) =>
            previous.map((entry) =>
              entry.id === optimisticId ? { ...entry, failed: true } : entry,
            ),
          );
        }
        // True either way: the draft is cleared and the message is on screen,
        // marked failed with a retry rather than shoved back into the input.
        return true;
      } finally {
        setSending(false);
      }
    },
    [conversationId, dispatch, sender, senders],
  );

  const retry = useCallback(
    (optimisticId: string) => {
      const entry = inFlight.find((item) => item.id === optimisticId);
      if (!entry) return;
      setInFlight((previous) =>
        previous.map((item) =>
          item.id === optimisticId ? { ...item, failed: false } : item,
        ),
      );
      void dispatch(entry.text, optimisticId, {
        attachments: entry.attachments,
        repliedTo: entry.repliedTo,
        sender: entry.sender,
      }).then((ok) => {
        if (ok) return;
        setInFlight((previous) =>
          previous.map((item) =>
            item.id === optimisticId ? { ...item, failed: true } : item,
          ),
        );
      });
    },
    [dispatch, inFlight],
  );

  /**
   * Takes a message out of the queue, or a failed one off the screen. A
   * queued message that is discarded is never sent.
   */
  const discard = useCallback((id: string) => {
    if (id.startsWith(OUTBOX_ID_PREFIX)) {
      const store = getStore();
      if (store) void discardOutbox(store, id).catch(() => undefined);
      return;
    }
    setInFlight((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  /**
   * Drops the optimistic copy of a message that has come back for real.
   *
   * By optimistic id: the screen decides which entries have come back
   * (`conversation.tsx`, matching text against messages that arrived after
   * each send), because it has to leave them out of the rows in the same
   * render the echo lands in. Text rather than "the oldest unfailed one",
   * which is what the web app does: two messages can be in flight at once and
   * be acknowledged out of order.
   */
  const reconcile = useCallback((optimisticIds: readonly string[]) => {
    setInFlight((previous) => {
      const next = previous.filter(
        (entry) => !optimisticIds.includes(entry.id),
      );
      return next.length === previous.length ? previous : next;
    });
  }, []);

  /** What the thread draws above the real messages: the queue, then what is in flight. */
  const pending = useMemo<SentMessage[]>(
    () => [...queued.map(fromOutbox), ...inFlight],
    [inFlight, queued],
  );

  return {
    discard,
    pending,
    reconcile,
    /** Why sending here stopped, if the backend said; see `refusal` above. */
    refusal,
    retry,
    /** Who the next message goes out as. */
    selectSender: setSender,
    send,
    sender,
    senders,
    sending,
  };
};
