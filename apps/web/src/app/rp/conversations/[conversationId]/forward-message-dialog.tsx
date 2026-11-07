"use client";

import { participantName } from "@nw/chat";
import type { Conversation, Message } from "@nw/types";
import { useCallback, useEffect, useState } from "react";
import { BsCheckLg } from "react-icons/bs";
import styled from "styled-components";
import { getConversationsAction } from "@/app/rp/conversations/actions";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import { LoadMore } from "@/components/load-more/page";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import {
  decryptConversations,
  encryptMessageText,
} from "@/utils/e2e-crypto";

// --- styled components ---

const ConvList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
  overflow-y: auto;
  margin-top: 8px;
`;

const ConvRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--material-fill);
  border: 1px solid var(--material-edge);
  transition: background 0.15s ease;

  &:hover {
    background: var(--fill-hover);
  }
`;

const ConvInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ConvName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConvPreview = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SendButton = styled.button<{ $sent?: boolean }>`
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid ${({ $sent }) => ($sent ? "var(--success, #22c55e)" : "var(--accent)")};
  background: ${({ $sent }) => ($sent ? "color-mix(in srgb, var(--success, #22c55e) 12%, transparent)" : "transparent")};
  color: ${({ $sent }) => ($sent ? "var(--success, #22c55e)" : "var(--accent)")};
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  cursor: ${({ $sent }) => ($sent ? "default" : "pointer")};
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled):not([data-sent]) {
    background: var(--accent);
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusText = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  padding: 20px 0;
  margin: 0;
`;

// --- helpers ---

const HTML_TAG_RE = /<[^>]+>/g;

const getForwardText = (message: Message): string => {
  if (message.message?.trim()) {
    return message.message
      .replace(HTML_TAG_RE, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();
  }
  if (message.attachments?.length) {
    return message.attachments[0]!.url;
  }
  return "";
};

/** The conversations a message can go to: not one whose other side disabled their account. */
const forwardable = (conversations: Conversation[]) =>
  conversations.filter((conversation) => !conversation.isUnavailable);

const getConvDisplayName = (
  conversation: Conversation,
  currentUsername?: string,
): string => {
  if (conversation.name) return conversation.name;
  const other = conversation.members?.find(
    (m) => m.userName !== currentUsername,
  );
  if (other) {
    return participantName(other);
  }
  return "Conversation";
};

const getConvPreview = (conversation: Conversation): string => {
  const msg = conversation.lastMessage;
  if (!msg) return "";
  const text = msg.message?.replace(HTML_TAG_RE, "").trim();
  if (text) return text.slice(0, 50);
  if (msg.attachments?.length) return "Sent an attachment";
  return "";
};

// --- component ---

const PAGE_SIZE = 10;

type Props = {
  message: Message | null;
  onClose: () => void;
};

export function ForwardMessageDialog({ message, onClose }: Props) {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { socket, isConnected } = useSocket();
  const { successToast, errorToast } = useUIContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const fetchPage = useCallback(async (pageNumber: number, append: boolean) => {
    const result = await getConversationsAction(pageNumber, PAGE_SIZE);
    if (!Array.isArray(result)) return;
    if (result.length < PAGE_SIZE) setHasMore(false);
    const decrypted = await decryptConversations(result);
    setConversations((prev) => (append ? [...prev, ...decrypted] : decrypted));
  }, []);

  // Reset and load first page whenever a new message is opened
  useEffect(() => {
    if (!message) return;
    setSentIds(new Set());
    setConversations([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    fetchPage(1, false).finally(() => setLoading(false));
  }, [message, fetchPage]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetchPage(nextPage, true).finally(() => {
      setPage(nextPage);
      setLoadingMore(false);
    });
  };

  const handleSend = async (conversationId: string) => {
    if (!message) return;
    const text = getForwardText(message);
    if (!text) {
      errorToast("Nothing to forward.");
      return;
    }
    if (!socket || !isConnected) {
      errorToast("Not connected. Please wait and try again.");
      return;
    }
    setSendingId(conversationId);
    // Re-encrypt for the target conversation — its key differs from the
    // source conversation's.
    const payload = {
      attachments: null,
      conversationId,
      message: await encryptMessageText(conversationId, text),
      repliedTo: null,
      sender: {
        id: novelist?.id ?? "",
        image: novelist?.image ?? null,
        messageSourceType: "NOVELIST",
        name:
          `${novelist?.firstName ?? ""} ${novelist?.lastName ?? ""}`.trim() ||
          novelist?.username ||
          user?.username ||
          "",
        username: user?.username ?? "",
      },
      type: "TEXT",
    };
    try {
      socket.send(JSON.stringify({ payload, type: "message" }));
      setSentIds((prev) => new Set(prev).add(conversationId));
      successToast("Message forwarded.");
    } catch {
      errorToast("Failed to forward message. Please try again.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <AppAlertDialog
      heading="Forward message"
      text=""
      open={!!message}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      showConfirm={false}
      closeButtonText="Cancel"
      body={
        <ConvList>
          {loading ? (
            <StatusText>Loading conversations…</StatusText>
          ) : conversations.length === 0 ? (
            <StatusText>No conversations found.</StatusText>
          ) : (
            <>
              {/* Nothing can be sent to someone who disabled their account. */}
              {forwardable(conversations).map((conv) => {
                const displayName = getConvDisplayName(conv, user?.username);
                const preview = getConvPreview(conv);
                const otherMember = conv.members?.find(
                  (m) => m.userName !== user?.username,
                );
                return (
                  <ConvRow key={conv.id}>
                    <AvatarNew
                      src={conv.image || otherMember?.image || null}
                      alt={displayName}
                      username={otherMember?.userName}
                    />
                    <ConvInfo>
                      <ConvName>{displayName}</ConvName>
                      {preview ? <ConvPreview>{preview}</ConvPreview> : null}
                    </ConvInfo>
                    <SendButton
                      type="button"
                      $sent={sentIds.has(conv.id)}
                      disabled={sendingId === conv.id || sentIds.has(conv.id)}
                      onClick={() => handleSend(conv.id)}
                    >
                      {sentIds.has(conv.id) ? (
                        <>
                          <BsCheckLg size={11} /> Sent
                        </>
                      ) : sendingId === conv.id ? (
                        "Sending…"
                      ) : (
                        "Send"
                      )}
                    </SendButton>
                  </ConvRow>
                );
              })}
              <LoadMore
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            </>
          )}
        </ConvList>
      }
    />
  );
}
