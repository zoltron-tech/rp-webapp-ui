"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { ChatBubble } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { LoadMore } from "@/components/load-more/page";
import type { ComposerSender } from "@/components/send-message-composer";
import { SendMessageComposer } from "@/components/send-message-composer";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Conversation, MentionDataItem, Message } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import {
  getConversationByIdAction,
  getConversationMessagesAction,
  getConversationMusesAction,
  markConversationReadAction,
} from "./actions";
import * as S from "./styles";

const deriveTargetUserName = (
  conversation: Conversation | null,
  currentUsername?: string,
) => {
  if (!conversation) return "";

  return (
    conversation.members?.find((member) => member.userName !== currentUsername)
      ?.userName ||
    conversation.lastMessage?.sender?.username ||
    ""
  );
};

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const musicPlayer = useGlobalState("musicPlayer");
  const musicPlayerHeight =
    musicPlayer?.playingSongId && musicPlayer?.playingSongName ? 53 : 0;
  const { socket, isConnected, lastIncomingMessage } = useSocket();
  const { baseDataLoader, routeToPage } = usePageRouter();
  const { errorToast, successToast } = useUIContext();

  const conversationId = useMemo(() => {
    const routeParam = params?.conversationId;
    if (Array.isArray(routeParam)) return routeParam[0] || "";
    return routeParam || "";
  }, [params]);

  const defaultSender = useMemo<ComposerSender | null>(() => {
    if (!novelist) return null;
    return {
      id: novelist.id,
      image: novelist.image ?? null,
      name:
        `${novelist.firstName} ${novelist.lastName}`.trim() ||
        novelist.username,
      type: "NOVELIST",
    };
  }, [novelist]);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedSender, setSelectedSender] = useState<ComposerSender | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const PAGE_SIZE = 10;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (!container) return;
      container.scrollTop = container.scrollHeight;
    });
  }, []);

  // Initialise selectedSender to the novelist once available
  useEffect(() => {
    if (defaultSender && !selectedSender) {
      setSelectedSender(defaultSender);
    }
  }, [defaultSender, selectedSender]);

  const queryTargetUserName = searchParams?.get("target") || "";
  const resolvedTargetUserName =
    queryTargetUserName || deriveTargetUserName(conversation, user?.username);
  const targetMember = conversation?.members?.find(
    (member) => member.userName === resolvedTargetUserName,
  );
  const fallbackTargetName =
    conversation?.name ||
    conversation?.lastMessage?.sender?.name ||
    conversation?.lastMessage?.sender?.username ||
    "Conversation";
  // Prefer conversation name > target member's name > last message sender's name > last message sender's username > fallback text
  const targetDisplayName =
    conversation?.name ||
    `${targetMember?.firstName} ${targetMember?.lastName}`.trim() ||
    fallbackTargetName;
  const targetImage =
    conversation?.image ||
    targetMember?.image ||
    conversation?.lastMessage?.sender?.image ||
    null;

  const onBackClick = () => {
    routeToPage(`${ROUTES.conversations}`);
  };

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;

    const result = await baseDataLoader(() =>
      getConversationByIdAction(conversationId),
    );

    if (!result) {
      setConversation(null);
      return;
    }

    setConversation(result);
    markConversationReadAction(conversationId);
  }, [baseDataLoader, conversationId]);

  const fetchMessages = useCallback(
    async (conversationId: string, pageNumber = 1, append = false) => {
      if (!conversationId) return false;

      const result = await baseDataLoader(
        () =>
          getConversationMessagesAction(conversationId, pageNumber, PAGE_SIZE),
        true,
      );

      if (!result) {
        if (!append) setMessages([]);
        return false;
      }

      if (result.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const batch = [...result].reverse(); // oldest first within the batch

      if (append) {
        // Prepend older messages, preserving the current scroll position
        const container = messagesContainerRef.current;
        const prevScrollHeight = container?.scrollHeight ?? 0;
        setMessages((prev) => [...batch, ...prev]);
        requestAnimationFrame(() => {
          if (!container) return;
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        });
      } else {
        setMessages(batch);
      }

      return result.length > 0;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseDataLoader, PAGE_SIZE],
  );

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    if (!conversationId) return;
    setPage(1);
    setHasMore(true);
    fetchMessages(conversationId, 1).then(() => scrollToBottom());
  }, [fetchMessages, conversationId, scrollToBottom]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !conversationId) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const loaded = await fetchMessages(conversationId, nextPage, true);
    if (loaded) setPage(nextPage);
    setLoadingMore(false);
  };

  const sendMessage = async (text: string) => {
    if (!conversationId) {
      errorToast("Unable to resolve recipient for this conversation.");
      return;
    }

    if (!socket || !isConnected) {
      errorToast("Not connected. Please wait and try again.");
      return;
    }

    setSending(true);

    const activeSender = selectedSender;
    const payload = {
      attachments: null,
      conversationId,
      message: text,
      repliedTo: null,
      sender: {
        id: activeSender?.id ?? novelist?.id ?? "",
        image: activeSender?.image ?? novelist?.image ?? null,
        messageSourceType: activeSender?.type ?? "NOVELIST",
        name: activeSender?.name ?? novelist?.firstName ?? user?.username ?? "",
        username: user?.username ?? "",
      },
      type: "TEXT",
    };

    try {
      socket.send(JSON.stringify({ payload, type: "message" }));
      successToast("Message sent.");
      scrollToBottom();
    } catch {
      errorToast("Unable to send message right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const mentionItems = useMemo<MentionDataItem[]>(() => {
    const items: MentionDataItem[] = [];
    if (conversation?.members) {
      for (const member of conversation.members) {
        if (member.userName !== user?.username) {
          items.push({
            displayName:
              `${member.firstName} ${member.lastName}`.trim() ||
              member.userName,
            id: member.novelistId || member.userName,
            image: member.image || "",
            type: "NOVELIST",
          });
        }
      }
    }
    return items;
  }, [conversation, user]);

  const getMentionMuseItems = useCallback(
    (prefix: string) => getConversationMusesAction(conversationId, prefix),
    [conversationId],
  );

  const onSendMessage = async () => {
    const text = messageHtml || messageText.trim();
    if (!text || sending) return;
    await sendMessage(text);
    setMessageText("");
    setMessageHtml("");
  };

  const onSendGif = async (gifUrl: string) => {
    if (!gifUrl || sending) return;
    await sendMessage(gifUrl);
  };

  const onSendSticker = async (stickerUrl: string) => {
    if (!stickerUrl || sending) return;
    await sendMessage(stickerUrl);
  };

  // Append incoming real-time messages that belong to this conversation
  useEffect(() => {
    if (!lastIncomingMessage) return;
    if (lastIncomingMessage.conversationId !== conversationId) return;

    setMessages((prev) => {
      // Avoid duplicates if the message was already added optimistically
      if (prev.some((m) => m.id === lastIncomingMessage.id)) return prev;
      return [...prev, lastIncomingMessage];
    });
    markConversationReadAction(conversationId);
  }, [lastIncomingMessage, conversationId]);

  const fallbackMessages =
    messages.length > 0
      ? messages
      : conversation?.lastMessage
        ? [conversation.lastMessage]
        : [];

  const lastMessageId = fallbackMessages[fallbackMessages.length - 1]?.id;

  useEffect(() => {
    if (fallbackMessages.length === 0) return;
    scrollToBottom();
  }, [conversationId, lastMessageId, scrollToBottom]);

  return (
    <S.Container $playerHeight={musicPlayerHeight}>
      <S.ChatWrapper>
        <S.ChatHeader>
          <S.ChatPerson>
            <IoArrowBackOutline
              size={15}
              onClick={() => onBackClick()}
              style={{ cursor: "pointer" }}
            />
            <AvatarNew
              src={targetImage}
              alt={targetDisplayName || "Conversation"}
              username={resolvedTargetUserName}
            />
            <S.ChatTitleWrap>
              <S.ChatTitle>{targetDisplayName}</S.ChatTitle>
              <S.ChatMeta>
                @
                {conversation?.name || resolvedTargetUserName || conversationId}
              </S.ChatMeta>
            </S.ChatTitleWrap>
          </S.ChatPerson>
        </S.ChatHeader>

        <S.MessagesContainer ref={messagesContainerRef}>
          {fallbackMessages.length > 0 ? (
            <S.MessagesList>
              <LoadMore
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMoreMessages}
              />
              {fallbackMessages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  currentUsername={user?.username || ""}
                />
              ))}
            </S.MessagesList>
          ) : (
            <S.EmptyText>
              No messages found for this conversation yet.
            </S.EmptyText>
          )}
        </S.MessagesContainer>

        <SendMessageComposer
          value={messageText}
          onChange={setMessageText}
          onHtmlChange={setMessageHtml}
          onSubmit={onSendMessage}
          onSendGif={onSendGif}
          onSendSticker={onSendSticker}
          sending={sending}
          selectedSender={selectedSender}
          onSenderChange={setSelectedSender}
          mentionItems={mentionItems}
          getMentionMuseItems={getMentionMuseItems}
        />
      </S.ChatWrapper>
    </S.Container>
  );
}
