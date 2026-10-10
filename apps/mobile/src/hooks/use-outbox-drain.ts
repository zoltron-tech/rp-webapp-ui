import { queryKeys, useApi, useChatCrypto, useSession } from "@nw/features";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useChatSocket } from "@/context/socket";
import { useOffline } from "@/lib/connectivity";
import {
  drainOutbox,
  getStore,
  isOutboxMessage,
  isOutboxPost,
  type OutboxEntry,
  sendPost,
  useOutbox,
} from "@/lib/local-store";

/**
 * Sends the outbox as soon as there is a connection.
 *
 * Mounted once, at the root, under the socket provider. It runs when the
 * phone is not offline and something is waiting, and again whenever the
 * queue grows while connected (a message written in the second before the
 * platform noticed the signal was back).
 *
 * Messages go over the socket — exactly as they would have online: the
 * chosen muse, the reply, the pictures — and only once the socket reports
 * itself connected. Posts go over REST through the same `submitPrompt` the
 * composer uses, as soon as there is network at all. A sent entry is removed
 * and what it belongs to is invalidated, so the echo or the refetch brings
 * the real row into the place the waiting one held. See
 * `local-store/outbox.ts` for the other sender, the background refresh.
 */
export const useOutboxDrain = (): void => {
  const api = useApi();
  const { isConnected, sendMessage } = useChatSocket();
  const crypto = useChatCrypto();
  const { novelist } = useSession();
  const queryClient = useQueryClient();
  const offline = useOffline();
  const waiting = useOutbox().length;

  useEffect(() => {
    if (offline || waiting === 0) return;
    const store = getStore();
    if (!store) return;

    let cancelled = false;

    const run = async () => {
      const sent: OutboxEntry[] = [];

      if (isConnected) {
        const messages = await drainOutbox(
          store,
          async (entry) => {
            if (cancelled || !isOutboxMessage(entry)) return false;
            const wire = await crypto.encryptMessageText(entry.conversationId, entry.text);
            const active = entry.sender;
            return sendMessage({
              attachments: entry.attachments.length > 0 ? entry.attachments : null,
              conversationId: entry.conversationId,
              message: wire,
              repliedTo: entry.repliedTo
                ? { id: entry.repliedTo.id, type: "MESSAGE" }
                : null,
              sender: {
                id: active?.id ?? novelist?.id ?? "",
                image: active?.image ?? novelist?.image ?? null,
                messageSourceType: active?.type ?? "NOVELIST",
                name: active?.name ?? novelist?.firstName ?? "",
                username: novelist?.username ?? "",
              },
              type: "TEXT",
            });
          },
          isOutboxMessage,
        );
        sent.push(...messages.sent);
      }

      const posts = await drainOutbox(
        store,
        (entry) =>
          cancelled || !isOutboxPost(entry)
            ? Promise.resolve(false)
            : sendPost(api, entry),
        isOutboxPost,
      );
      sent.push(...posts.sent);

      if (cancelled || sent.length === 0) return;

      // Where each one lands, refetched: the thread's messages and the inbox;
      // the feeds for a prompt; the comment list and its prompt's count for a
      // comment; the thread for a reply.
      const invalidate = (queryKey: readonly unknown[]) =>
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      let feeds = false;
      for (const entry of sent) {
        if (isOutboxMessage(entry)) {
          invalidate(queryKeys.conversationMessages(entry.conversationId));
          continue;
        }
        feeds = true;
        if (entry.type === "comment" && entry.payload.promptId) {
          invalidate(queryKeys.promptComments(entry.payload.promptId));
          invalidate(queryKeys.prompt(entry.payload.promptId));
        } else if (entry.type === "reply" && entry.payload.commentId) {
          invalidate(queryKeys.thread(entry.payload.commentId));
        }
      }
      if (sent.some(isOutboxMessage)) invalidate(queryKeys.conversations());
      if (feeds) {
        invalidate(["explore"]);
        invalidate(["home"]);
        invalidate(["novelist"]);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [api, crypto, isConnected, novelist, offline, queryClient, sendMessage, waiting]);
};

/** The hook as a component, for the root layout. Renders nothing. */
export const OutboxDrain = () => {
  useOutboxDrain();
  return null;
};
