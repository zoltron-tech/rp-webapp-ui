"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";
import { ChatBubble, EmailVerifiedBadge } from "@/components/common";
import { AdminBadge } from "@/components/common/admin-badge";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import { LoadMore } from "@/components/load-more/page";
import type { ComposerSender } from "@/components/send-message-composer";
import { SendMessageComposer } from "@/components/send-message-composer";
import { useSocket } from "@/context/socket";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Conversation, MentionDataItem, Message } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { getUnreadConversationIdsAction } from "../actions";
import {
  getConversationByIdAction,
  getConversationMessagesAction,
  getConversationMusesAction,
  markConversationReadAction,
  reportMessageAction,
} from "./actions";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { ReplyPreview } from "./reply-preview";
import * as S from "./styles";

const useUpdateUnreadConversations = () => {
  const setGlobalState = useGlobalStoreSet();
  return async () => {
    const unreadIds = await getUnreadConversationIdsAction();
    if (Array.isArray(unreadIds)) {
      setGlobalState({ unreadConversationIds: unreadIds });
    }
  };
};

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

const HELLO_MESSAGES: { line1: string; line2: string }[] = [
  {
    line1: "No messages here yet.",
    line2: "Be the first to break the ice! 🧊",
  },
  {
    line1: "The conversation starts with you.",
    line2: "Send a little hello and see what happens. ✨",
  },
  {
    line1: "Silence can be golden...",
    line2: "But a warm hello is even better. 🌟",
  },
  {
    line1: "Nothing here yet — it's a blank canvas.",
    line2: "Paint it with your first message. 🎨",
  },
  {
    line1: "Every great story has a first line.",
    line2: "Write yours and say hello. 📖",
  },
  {
    line1: "This chat is waiting for you.",
    line2: "Don't keep it waiting too long! ⏳",
  },
];

const RETENTION_NOTICES: { line1: string; line2: string }[] = [
  {
    line1: "✨ This is a safe space — speak freely.",
    line2: "Chats quietly disappear after 14 days.",
  },
  {
    line1: "🕊️ Words shared here are yours alone.",
    line2: "Messages vanish after 14 days, no trace left.",
  },
  {
    line1: "🌙 Every conversation has a natural end.",
    line2: "These messages fade away after 14 days.",
  },
  {
    line1: "💬 Keep it real, keep it private.",
    line2: "This chat self-destructs in 14 days.",
  },
  {
    line1: "🔥 Live in the moment — this chat does too.",
    line2: "All messages are gone after 14 days.",
  },
  {
    line1: "🌊 Like whispers on the wind.",
    line2: "Your messages drift away after 14 days.",
  },
];

export default function ConversationDetailPage() {
  const updateUnreadConversations = useUpdateUnreadConversations();
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

  const retentionNotice = useMemo(
    () =>
      RETENTION_NOTICES[Math.floor(Math.random() * RETENTION_NOTICES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId],
  );

  const helloStickers = useGlobalState("helloStickers");

  const helloMessage = useMemo(
    () => HELLO_MESSAGES[Math.floor(Math.random() * HELLO_MESSAGES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId],
  );

  const helloSticker = useMemo(() => {
    if (!helloStickers?.length) return null;
    return helloStickers[Math.floor(Math.random() * helloStickers.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, helloStickers?.length]);

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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reportingMessage, setReportingMessage] = useState<Message | null>(
    null,
  );
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null,
  );
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

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
    conversation && !conversation.isGroup
      ? `${targetMember?.firstName} ${targetMember?.lastName}`.trim() ||
        targetMember?.userName ||
        fallbackTargetName
      : conversation?.name || fallbackTargetName;
  const targetImage =
    conversation?.image ||
    targetMember?.image ||
    conversation?.lastMessage?.sender?.image ||
    null;

  const onBackClick = () => {
    routeToPage(`${ROUTES.conversations}`);
  };

  const handleConvHeaderClick = () => {
    if (!conversation) return;
    if (conversation.isGroup) {
      routeToPage(ROUTES.Conversation.Details(conversationId));
    } else {
      routeToPage(ROUTES.Profile.View(resolvedTargetUserName).Index);
    }
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
    await markConversationReadAction(conversationId);
    await updateUnreadConversations();
  }, [baseDataLoader, conversationId, updateUnreadConversations]);

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

  // Fetch a hello/wave sticker for the empty state — now handled globally in layout.tsx

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

  const sendMessage = async (
    text: string,
    attachments: { url: string }[] | null = null,
    type = "TEXT",
  ) => {
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
      attachments,
      conversationId,
      message: text,
      repliedTo: replyingTo?.id ?? null,
      sender: {
        id: activeSender?.id ?? novelist?.id ?? "",
        image: activeSender?.image ?? novelist?.image ?? null,
        messageSourceType: activeSender?.type ?? "NOVELIST",
        name: activeSender?.name ?? novelist?.firstName ?? user?.username ?? "",
        username: user?.username ?? "",
      },
      type,
    };

    console.log("Sending message with payload:", payload);

    try {
      socket.send(JSON.stringify({ payload, type: "message" }));
      setReplyingTo(null);
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

  const onSendClip = async (clipUrl: string) => {
    if (!clipUrl || sending) return;
    await sendMessage(clipUrl);
  };

  const onSendMedia = async (urls: string[]) => {
    if (!urls.length || sending) return;
    const text = messageHtml || messageText.trim();
    await sendMessage(
      text,
      urls.map((url) => ({ url })),
    );
    setMessageText("");
    setMessageHtml("");
  };

  const handleReportMessage = async () => {
    if (!reportingMessage) return;
    const response = await reportMessageAction(reportingMessage.id);
    if (response === true) {
      successToast("Message reported successfully.");
    } else {
      errorToast("There was an issue while reporting this message.");
    }
    setReportingMessage(null);
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
    (async () => {
      await markConversationReadAction(conversationId);
      await updateUnreadConversations();
    })();
  }, [lastIncomingMessage, conversationId, updateUnreadConversations]);

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
            <button
              type="button"
              onClick={handleConvHeaderClick}
              style={{
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: conversation ? "pointer" : "default",
                display: "flex",
                gap: "10px",
                minWidth: 0,
                padding: 0,
              }}
            >
              <AvatarNew
                src={targetImage}
                alt={targetDisplayName || "Conversation"}
                username={resolvedTargetUserName}
              />
              <S.ChatTitleWrap>
                <S.ChatTitleRow>
                  <S.ChatTitle>{targetDisplayName}</S.ChatTitle>
                  {!conversation?.isGroup &&
                    targetMember?.isVerified &&
                    (resolvedTargetUserName === "novelistworld" ? (
                      <AdminBadge size={20} />
                    ) : (
                      <EmailVerifiedBadge size={14} />
                    ))}
                </S.ChatTitleRow>
                <S.ChatMeta>
                  @
                  {conversation?.name ||
                    resolvedTargetUserName ||
                    conversationId}
                </S.ChatMeta>
              </S.ChatTitleWrap>
            </button>
          </S.ChatPerson>
          <BsThreeDotsVertical
            size={18}
            style={{
              color: "var(--text-secondary)",
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: "auto",
            }}
            onClick={() =>
              routeToPage(ROUTES.Conversation.Details(conversationId))
            }
          />
        </S.ChatHeader>

        <S.MessagesWrapper>
          <S.MessagesContainer
            ref={messagesContainerRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const distanceFromBottom =
                el.scrollHeight - el.scrollTop - el.clientHeight;
              setIsScrolledUp(distanceFromBottom > 120);
            }}
          >
            <S.RetentionNotice>
              <span>{retentionNotice.line1}</span>
              <S.RetentionNoticeHighlight>
                {retentionNotice.line2.replace("14 days", "").trim()}{" "}
                <strong>14 days</strong>
                {retentionNotice.line2.endsWith("14 days.") ? "." : ""}
              </S.RetentionNoticeHighlight>
            </S.RetentionNotice>
            {fallbackMessages.length > 0 ? (
              <S.MessagesList>
                <LoadMore
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={loadMoreMessages}
                />
                {fallbackMessages.map((message, idx) => {
                  const msgDate = message.createdAt
                    ? new Date(message.createdAt).toDateString()
                    : null;
                  const prevDate =
                    idx > 0 && fallbackMessages[idx - 1].createdAt
                      ? new Date(
                          fallbackMessages[idx - 1].createdAt,
                        ).toDateString()
                      : null;
                  const showSeparator =
                    idx > 0 && msgDate && msgDate !== prevDate;
                  return (
                    <span key={message.id}>
                      {showSeparator && (
                        <S.DateSeparator>
                          {new Date(message.createdAt).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </S.DateSeparator>
                      )}
                      <ChatBubble
                        message={message}
                        currentUsername={user?.username || ""}
                        onReply={(msg) => setReplyingTo(msg)}
                        onForward={(msg) => setForwardingMessage(msg)}
                        onReport={(msg) => setReportingMessage(msg)}
                      />
                    </span>
                  );
                })}
              </S.MessagesList>
            ) : helloSticker ? (
              <S.HelloState>
                <S.HelloBox
                  type="button"
                  disabled={sending}
                  onClick={() => onSendSticker(helloSticker.stickerUrl)}
                >
                  <S.EmptyText>{helloMessage.line1}</S.EmptyText>
                  <S.EmptyTextSub>{helloMessage.line2}</S.EmptyTextSub>
                  <S.HelloStickerImg
                    src={helloSticker.previewUrl}
                    alt="Say hello"
                  />
                  <S.HelloLabel>Tap here to say Hello 👋</S.HelloLabel>
                </S.HelloBox>
              </S.HelloState>
            ) : (
              <S.EmptyText>No messages yet. Say hello!</S.EmptyText>
            )}
          </S.MessagesContainer>
          <S.ScrollToBottomButton
            type="button"
            $visible={isScrolledUp}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <FaChevronDown size={16} />
          </S.ScrollToBottomButton>
        </S.MessagesWrapper>

        {replyingTo ? (
          <ReplyPreview
            message={replyingTo}
            onDismiss={() => setReplyingTo(null)}
          />
        ) : null}

        <SendMessageComposer
          value={messageText}
          onChange={setMessageText}
          onHtmlChange={setMessageHtml}
          onSubmit={onSendMessage}
          onSendGif={onSendGif}
          onSendSticker={onSendSticker}
          onSendClip={onSendClip}
          onSendMedia={onSendMedia}
          sending={sending}
          conversationId={conversationId}
          selectedSender={selectedSender}
          onSenderChange={setSelectedSender}
          mentionItems={mentionItems}
          getMentionMuseItems={getMentionMuseItems}
        />
      </S.ChatWrapper>

      <AppAlertDialog
        heading="Report this message?"
        text="We strive to maintain a safe and welcoming community. If this message violates our guidelines, please report it. Our team will review and take appropriate action as quickly as possible."
        open={!!reportingMessage}
        onOpenChange={(open) => {
          if (!open) setReportingMessage(null);
        }}
        onConfirm={handleReportMessage}
        actionButtonLabel="Report"
      />

      <ForwardMessageDialog
        message={forwardingMessage}
        onClose={() => setForwardingMessage(null)}
      />
    </S.Container>
  );
}
