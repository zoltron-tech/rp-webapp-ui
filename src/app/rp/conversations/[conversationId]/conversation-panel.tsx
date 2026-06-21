"use client";

import { useRouter } from "next/navigation";
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
import type { MessageSender, Reaction } from "@/types/conversation";
import { ROUTES } from "@/utils/constants/routes";
import {
  createEditSocketMessage,
  createReactionSocketMessage,
} from "@/utils/socket-helpers";
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

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConversationPanelProps = {
  conversationId: string;
  targetUserName?: string;
  onBack: () => void;
  /** When true the panel is embedded inside a ConversationSheet overlay.
   *  - Skips entry animation on the inner Container (sheet handles it).
   *  - Skips stopPageLoading / nav-direction reset (parent manages those).
   *  - Uses 0 for player-height so the Container fills the sheet exactly. */
  isPanel?: boolean;
  /** Controls whether data fetching is allowed. Defaults to true.
   *  Set to false while the panel is pre-mounted but not yet visible (mobile)
   *  so the idle panel never triggers network requests. */
  active?: boolean;
};

type OptimisticMessage = {
  id: string;
  msg: Message;
  failed: boolean;
  hideSender: boolean;
  socketPayload: object;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const useUpdateUnreadConversations = () => {
  const setGlobalState = useGlobalStoreSet();
  return useCallback(async () => {
    const unreadIds = await getUnreadConversationIdsAction();
    if (Array.isArray(unreadIds)) {
      setGlobalState({ unreadConversationIds: unreadIds });
    }
  }, [setGlobalState]);
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

// ── Component ─────────────────────────────────────────────────────────────────

export function ConversationPanel({
  conversationId,
  targetUserName: propTargetUserName = "",
  onBack,
  isPanel = false,
  active = true,
}: ConversationPanelProps) {
  const updateUnreadConversations = useUpdateUnreadConversations();
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const musicPlayer = useGlobalState("musicPlayer");
  const activeConversation = useGlobalState("activeConversation");
  const conversationNavDirection = useGlobalState("conversationNavDirection");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const setGlobalState = useGlobalStoreSet();
  const router = useRouter();
  const musicPlayerHeight =
    musicPlayer?.playingSongId && musicPlayer?.playingSongName ? 53 : 0;
  const { socket, isConnected, lastIncomingMessage, lastIncomingReaction, lastIncomingEdit } =
    useSocket();
  const { routeToPage, stopPageLoading } = usePageRouter();
  const { errorToast, successToast } = useUIContext();

  // Capture nav direction at mount before it gets cleared; used for entry animation
  // (only relevant for the standalone-page path, not the panel path).
  const slideDirectionRef = useRef(conversationNavDirection);

  // Live ref to activeConversation so reset effect can read it without being a dep.
  const activeConversationRef = useRef(activeConversation);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // ── Derived ────────────────────────────────────────────────────────────────

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

  const helloStickers = useGlobalState("helloStickers");

  const retentionNotice = useMemo(
    () =>
      RETENTION_NOTICES[Math.floor(Math.random() * RETENTION_NOTICES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId],
  );

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

  // ── State ──────────────────────────────────────────────────────────────────

  const [conversation, setConversation] = useState<Conversation | null>(() =>
    activeConversation?.id === conversationId ? activeConversation : null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const swipeTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeActiveRef = useRef(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [latestSentMessageId, setLatestSentMessageId] = useState<string | null>(
    null,
  );
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);

  const PAGE_SIZE = 10;

  // ── Reset state on conversationId change ───────────────────────────────────
  // Defined first so it executes before data-fetching effects in the same cycle.
  useEffect(() => {
    const cached = conversationId
      ? activeConversationRef.current?.id === conversationId
        ? activeConversationRef.current
        : null
      : null;
    setConversation(cached);
    setMessages([]);
    setMessagesLoading(true);
    setOptimisticMessages([]);
    setReplyingTo(null);
    setReportingMessage(null);
    setForwardingMessage(null);
    setEditingMessage(null);
    setPage(1);
    setHasMore(true);
    setIsScrolledUp(false);
  }, [conversationId]);

  // ── Scroll helpers ─────────────────────────────────────────────────────────

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

  // ── Resolved header values ─────────────────────────────────────────────────

  const resolvedTargetUserName =
    propTargetUserName || deriveTargetUserName(conversation, user?.username);
  const targetMember = conversation?.members?.find(
    (member) => member.userName === resolvedTargetUserName,
  );
  const fallbackTargetName =
    conversation?.name ||
    conversation?.lastMessage?.sender?.name ||
    conversation?.lastMessage?.sender?.username ||
    "Conversation";
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

  // ── Navigation handlers ────────────────────────────────────────────────────

  const onBackClick = () => {
    onBack();
  };

  const onSwipeTouchStart = (e: React.TouchEvent) => {
    swipeTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    swipeActiveRef.current = false;
  };

  const onSwipeTouchMove = (e: React.TouchEvent) => {
    if (!swipeTouchStartRef.current || !containerRef.current) return;
    const dx = e.touches[0].clientX - swipeTouchStartRef.current.x;
    const dy = e.touches[0].clientY - swipeTouchStartRef.current.y;
    if (dx <= 0) return;
    if (!swipeActiveRef.current) {
      if (Math.abs(dy) > Math.abs(dx) * 0.8) {
        swipeTouchStartRef.current = null;
        return;
      }
      if (dx > 8) swipeActiveRef.current = true;
    }
    if (swipeActiveRef.current) {
      containerRef.current.style.transition = "none";
      containerRef.current.style.transform = `translateX(${dx}px)`;
    }
  };

  const onSwipeTouchEnd = (e: React.TouchEvent) => {
    if (!swipeTouchStartRef.current || !containerRef.current) {
      swipeTouchStartRef.current = null;
      swipeActiveRef.current = false;
      return;
    }
    const dx = e.changedTouches[0].clientX - swipeTouchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - swipeTouchStartRef.current.y;
    swipeTouchStartRef.current = null;
    swipeActiveRef.current = false;

    if (dx > 80 && Math.abs(dy) < Math.abs(dx) * 0.8) {
      // Animate out then delegate back-navigation to the caller.
      containerRef.current.style.transition = "transform 0.22s ease";
      containerRef.current.style.transform = "translateX(100%)";
      setTimeout(onBack, 210);
    } else {
      // Snap back.
      containerRef.current.style.transition = "transform 0.2s ease";
      containerRef.current.style.transform = "translateX(0)";
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = "";
          containerRef.current.style.transform = "";
        }
      }, 200);
    }
  };

  const handleConvHeaderClick = () => {
    if (!conversation) return;
    if (conversation.isGroup) {
      routeToPage(ROUTES.Conversation.Details(conversationId));
    } else {
      routeToPage(ROUTES.Profile.View(resolvedTargetUserName).Index);
    }
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;

    const result = await getConversationByIdAction(conversationId);

    if (!result || !("id" in result)) {
      if (!activeConversationRef.current) setConversation(null);
      return;
    }

    setConversation(result as Conversation);
    await markConversationReadAction(conversationId);
    setGlobalState((prev) => {
      const patched: typeof prev = {
        ...prev,
        lastReadConversationId: conversationId,
      };
      if (prev.cachedConversations) {
        patched.cachedConversations = prev.cachedConversations.map((conv) =>
          conv.id === conversationId &&
          conv.lastMessage &&
          !conv.lastMessage.isRead
            ? { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } }
            : conv,
        );
      }
      return patched;
    });
    await updateUnreadConversations();
  }, [conversationId, updateUnreadConversations, setGlobalState]);

  const fetchMessages = useCallback(
    async (convId: string, pageNumber = 1, append = false) => {
      if (!convId) return false;

      if (!append) setMessagesLoading(true);

      const rawResult = await getConversationMessagesAction(
        convId,
        pageNumber,
        PAGE_SIZE,
      );

      if (!append) setMessagesLoading(false);

      const result =
        rawResult && Array.isArray(rawResult) ? (rawResult as Message[]) : null;

      if (!result) {
        if (!append) setMessages([]);
        return false;
      }

      if (result.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const batch = [...result].reverse();

      if (append) {
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
    [PAGE_SIZE],
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  // Stop the full-page loader and clear nav direction on mount (standalone page only).
  // Re-runs when conversationId changes (fetchConversation is a new fn) to re-fetch.
  useEffect(() => {
    if (!active) return;
    if (!isPanel) {
      setGlobalState({ conversationNavDirection: null });
      stopPageLoading();
    }
    fetchConversation();
  }, [active, fetchConversation, stopPageLoading, setGlobalState, isPanel]);

  // Prefetch the details page so the first click is instant.
  useEffect(() => {
    if (!active || !conversationId) return;
    router.prefetch(ROUTES.Conversation.Details(conversationId));
  }, [active, router, conversationId]);

  useEffect(() => {
    if (!active || !conversationId) return;
    fetchMessages(conversationId, 1).then(() => scrollToBottom());
  }, [active, fetchMessages, conversationId, scrollToBottom]);

  // Clear cached conversation when the component unmounts (user leaves the page).
  useEffect(() => {
    return () => {
      setGlobalState({ activeConversation: null });
      setOptimisticMessages([]);
    };
  }, [setGlobalState]);

  // ── Actions ────────────────────────────────────────────────────────────────

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

    const tempId = `optimistic-${Date.now()}-${Math.random()}`;
    const activeSender = selectedSender;
    const capturedReplyingTo = replyingTo;

    const socketPayload = {
      attachments,
      conversationId,
      message: text,
      repliedTo: capturedReplyingTo?.id ?? null,
      sender: {
        id: activeSender?.id ?? novelist?.id ?? "",
        image: activeSender?.image ?? novelist?.image ?? null,
        messageSourceType: activeSender?.type ?? "NOVELIST",
        name: activeSender?.name ?? novelist?.firstName ?? user?.username ?? "",
        username: user?.username ?? "",
      },
      type,
    };

    const optimisticMsg: Message = {
      attachments:
        attachments?.map((a, i) => ({ id: `opt-att-${i}`, url: a.url })) ?? [],
      conversationId,
      createdAt: new Date().toISOString(),
      id: tempId,
      image: "",
      isRead: false,
      message: text,
      reactions: [],
      repliedTo: capturedReplyingTo ?? undefined,
      sender: {
        id: activeSender?.id ?? novelist?.id ?? "",
        image: activeSender?.image ?? novelist?.image ?? "",
        messageSourceType: activeSender?.type ?? "NOVELIST",
        name: activeSender?.name ?? novelist?.firstName ?? user?.username ?? "",
        username: user?.username ?? "",
      },
      senderId: activeSender?.id ?? novelist?.id ?? "",
      type,
    };

    const allCurrentMessages: Message[] = [
      ...messages,
      ...optimisticMessages.map((o) => o.msg),
    ];
    const lastMsg = allCurrentMessages[allCurrentMessages.length - 1] ?? null;
    const activeSenderId = activeSender?.id ?? novelist?.id ?? "";
    const sameSenderId =
      !!lastMsg && !!activeSenderId && lastMsg.sender?.id === activeSenderId;
    const msSinceLast = lastMsg?.createdAt
      ? Date.now() - new Date(lastMsg.createdAt).getTime()
      : Infinity;
    const optimisticHideSender = sameSenderId && msSinceLast < 10 * 60 * 1000;

    setOptimisticMessages((prev) => [
      ...prev,
      {
        failed: false,
        hideSender: optimisticHideSender,
        id: tempId,
        msg: optimisticMsg,
        socketPayload,
      },
    ]);
    setLatestSentMessageId(tempId);
    setTimeout(() => setLatestSentMessageId(null), 500);
    setReplyingTo(null);
    scrollToBottom();

    setSending(true);
    try {
      socket.send(JSON.stringify({ payload: socketPayload, type: "message" }));
    } catch {
      setOptimisticMessages((prev) =>
        prev.map((o) => (o.id === tempId ? { ...o, failed: true } : o)),
      );
    } finally {
      setSending(false);
    }
  };

  const retrySend = useCallback(
    (optimisticId: string) => {
      if (!socket || !isConnected) {
        errorToast("Not connected. Please wait and try again.");
        return;
      }
      setOptimisticMessages((prev) => {
        const entry = prev.find((o) => o.id === optimisticId);
        if (!entry) return prev;
        try {
          socket.send(
            JSON.stringify({ payload: entry.socketPayload, type: "message" }),
          );
          return prev.map((o) =>
            o.id === optimisticId ? { ...o, failed: false } : o,
          );
        } catch {
          return prev;
        }
      });
    },
    [socket, isConnected, errorToast],
  );

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
    if (editingMessage) {
      await submitEdit(text);
      return;
    }
    await sendMessage(text);
    setMessageText("");
    setMessageHtml("");
  };

  // ── Edit message ────────────────────────────────────────────────────────────

  const startEditing = useCallback((message: Message) => {
    // Editing and replying are mutually exclusive composer states.
    setReplyingTo(null);
    setEditingMessage(message);
    setMessageText(message.message ?? "");
    setMessageHtml(message.message ?? "");
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMessage(null);
    setMessageText("");
    setMessageHtml("");
  }, []);

  const submitEdit = async (text: string) => {
    if (!editingMessage) return;

    if (!socket || !isConnected) {
      errorToast("Not connected. Please wait and try again.");
      return;
    }

    const messageId = editingMessage.id;

    // 1. Optimistically reflect the new text locally.
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, message: text } : m)),
    );

    // 2. Send the edit over the chat-server socket, which persists it via the
    //    backend and broadcasts the updated message to every participant.
    setSending(true);
    try {
      socket.send(
        JSON.stringify(
          createEditSocketMessage({ conversationId, message: text, messageId }),
        ),
      );
    } catch {
      errorToast("Could not save your changes. Please try again.");
    } finally {
      setSending(false);
    }

    setEditingMessage(null);
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

  // ── Reactions ───────────────────────────────────────────────────────────────

  // Merge a single reaction into the message list. A novelist may only have one
  // reaction per message, so any existing reaction from the same sender is
  // replaced (mirrors the backend composite key messageId + novelistId).
  const applyReaction = useCallback(
    (reaction: Reaction) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== reaction.messageId) return m;
          const others = (m.reactions || []).filter(
            (r) => r.sender?.id !== reaction.sender?.id,
          );
          return { ...m, reactions: [...others, reaction] };
        }),
      );
    },
    [],
  );

  const handleReact = useCallback(
    (message: Message, reactionKey: string) => {
      // Optimistic messages have no server id yet — reactions need a real one.
      if (message.id.startsWith("optimistic-")) return;

      if (!socket || !isConnected) {
        errorToast("Not connected. Please wait and try again.");
        return;
      }

      const sender: MessageSender = {
        id: novelist?.id ?? "",
        image: novelist?.image ?? "",
        messageSourceType: "NOVELIST",
        name: novelist?.firstName ?? user?.username ?? "",
        username: user?.username ?? "",
      };
      const reaction: Reaction = {
        messageId: message.id,
        reaction: reactionKey,
        sender,
      };

      // 1. Optimistically reflect the reaction locally.
      applyReaction(reaction);

      // 2. Send it over the chat-server socket, which persists the reaction
      //    and broadcasts it to every other participant in real time.
      try {
        socket.send(
          JSON.stringify(
            createReactionSocketMessage({ ...reaction, conversationId }),
          ),
        );
      } catch {
        errorToast("Could not send your reaction. Please try again.");
      }
    },
    [
      applyReaction,
      novelist,
      user?.username,
      socket,
      isConnected,
      conversationId,
      errorToast,
    ],
  );

  // ── Socket: incoming real-time messages ────────────────────────────────────

  useEffect(() => {
    if (!lastIncomingMessage) return;
    if (lastIncomingMessage.conversationId !== conversationId) return;

    if (lastIncomingMessage.sender?.username === user?.username) {
      setOptimisticMessages((prev) => {
        const idx = prev.findIndex((o) => !o.failed);
        if (idx === -1) return prev;
        return prev.filter((_, i) => i !== idx);
      });
      setLatestSentMessageId(lastIncomingMessage.id);
      setTimeout(() => setLatestSentMessageId(null), 500);
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === lastIncomingMessage.id)) return prev;
      return [...prev, lastIncomingMessage];
    });
    (async () => {
      await markConversationReadAction(conversationId);
      setGlobalState((prev) => {
        const patched: typeof prev = {
          ...prev,
          lastReadConversationId: conversationId,
        };
        if (prev.cachedConversations) {
          patched.cachedConversations = prev.cachedConversations.map((conv) =>
            conv.id === conversationId &&
            conv.lastMessage &&
            !conv.lastMessage.isRead
              ? { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } }
              : conv,
          );
        }
        return patched;
      });
      await updateUnreadConversations();
    })();
  }, [
    lastIncomingMessage,
    conversationId,
    updateUnreadConversations,
    user?.username,
  ]);

  // ── Socket: incoming real-time reactions ───────────────────────────────────

  useEffect(() => {
    if (!lastIncomingReaction) return;
    if (lastIncomingReaction.conversationId !== conversationId) return;
    // Our own reaction was already applied optimistically.
    if (lastIncomingReaction.sender?.username === user?.username) return;
    applyReaction(lastIncomingReaction);
  }, [lastIncomingReaction, conversationId, applyReaction, user?.username]);

  // ── Socket: incoming real-time message edits ───────────────────────────────

  useEffect(() => {
    if (!lastIncomingEdit) return;
    if (lastIncomingEdit.conversationId !== conversationId) return;
    // The server message is authoritative; patch the text (and attachments) of
    // the matching message wherever it appears in the open conversation.
    setMessages((prev) =>
      prev.map((m) =>
        m.id === lastIncomingEdit.id
          ? {
              ...m,
              attachments: lastIncomingEdit.attachments ?? m.attachments,
              message: lastIncomingEdit.message,
            }
          : m,
      ),
    );
  }, [lastIncomingEdit, conversationId]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const fallbackMessages = [
    ...(messages.length > 0
      ? messages
      : conversation?.lastMessage
        ? [conversation.lastMessage]
        : []),
    ...optimisticMessages.map((o) => o.msg),
  ];

  const lastMessageId = fallbackMessages[fallbackMessages.length - 1]?.id;

  useEffect(() => {
    if (fallbackMessages.length === 0) return;
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastMessageId, scrollToBottom]);

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <S.Container
      ref={containerRef}
      $playerHeight={isPanel ? 0 : musicPlayerHeight}
      $slideFrom={
        isPanel
          ? undefined
          : slideDirectionRef.current === "back"
            ? "left"
            : "right"
      }
      $animate={!isPanel}
    >
      <S.ChatWrapper>
        <S.ChatHeader>
          <S.ChatPerson>
            <S.BackButtonWrap
              onClick={onBackClick}
              aria-label="Back to conversations"
            >
              <IoArrowBackOutline size={22} />
              {(unreadConversationIds?.filter((id) => id !== conversationId)
                .length ?? 0) > 0 && (
                <S.BackBadge>
                  {(unreadConversationIds?.filter((id) => id !== conversationId)
                    .length ?? 0) > 99
                    ? "99+"
                    : unreadConversationIds?.filter(
                        (id) => id !== conversationId,
                      ).length}
                </S.BackBadge>
              )}
            </S.BackButtonWrap>
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
            onClick={() => {
              setGlobalState({ conversationNavDirection: "forward" });
              routeToPage(ROUTES.Conversation.Details(conversationId), {
                skipLoading: true,
              });
            }}
          />
        </S.ChatHeader>

        <S.MessagesWrapper
          {...(!isPanel && {
            onTouchEnd: onSwipeTouchEnd,
            onTouchMove: onSwipeTouchMove,
            onTouchStart: onSwipeTouchStart,
          })}
        >
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
            {messagesLoading ? (
              <S.MessagesLoadingState>
                <S.SkeletonRow>
                  <S.SkeletonBubble $align="left" $width="42%" />
                </S.SkeletonRow>
                <S.SkeletonRow>
                  <S.SkeletonBubble $align="right" $width="58%" />
                  <S.SkeletonBubble $align="right" $width="35%" />
                </S.SkeletonRow>
                <S.SkeletonRow>
                  <S.SkeletonBubble $align="left" $width="65%" />
                </S.SkeletonRow>
                <S.SkeletonRow>
                  <S.SkeletonBubble $align="right" $width="48%" />
                </S.SkeletonRow>
                <S.SkeletonRow>
                  <S.SkeletonBubble $align="left" $width="52%" />
                  <S.SkeletonBubble $align="left" $width="38%" />
                </S.SkeletonRow>
                <S.SkeletonRow>
                  <S.SkeletonBubble $align="right" $width="60%" />
                </S.SkeletonRow>
              </S.MessagesLoadingState>
            ) : fallbackMessages.length > 0 ? (
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
                  const prevMessage =
                    idx > 0 ? fallbackMessages[idx - 1] : null;
                  const nextMessage =
                    idx < fallbackMessages.length - 1
                      ? fallbackMessages[idx + 1]
                      : null;
                  const prevDate = prevMessage?.createdAt
                    ? new Date(prevMessage.createdAt).toDateString()
                    : null;
                  const showSeparator =
                    idx > 0 && msgDate && msgDate !== prevDate;
                  const sameSenderAsPrev =
                    !!prevMessage &&
                    prevMessage.sender?.username === message.sender?.username;
                  const timeDiffMinutes =
                    prevMessage?.createdAt && message.createdAt
                      ? (new Date(message.createdAt).getTime() -
                          new Date(prevMessage.createdAt).getTime()) /
                        60000
                      : Infinity;
                  const optimisticEntry = optimisticMessages.find(
                    (o) => o.id === message.id,
                  );
                  const hideSender =
                    optimisticEntry !== undefined
                      ? optimisticEntry.hideSender
                      : sameSenderAsPrev && timeDiffMinutes < 10;
                  const sameSenderAsNext =
                    !!nextMessage &&
                    nextMessage.sender?.username === message.sender?.username;
                  const timeDiffToNextMinutes =
                    nextMessage?.createdAt && message.createdAt
                      ? (new Date(nextMessage.createdAt).getTime() -
                          new Date(message.createdAt).getTime()) /
                        60000
                      : Infinity;
                  const hideDate =
                    sameSenderAsNext && timeDiffToNextMinutes < 10;
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
                        hideSender={hideSender}
                        hideDate={hideDate}
                        isNew={message.id === latestSentMessageId}
                        failed={
                          optimisticMessages.find((o) => o.id === message.id)
                            ?.failed ?? false
                        }
                        onRetry={() => retrySend(message.id)}
                        onReply={(msg) => setReplyingTo(msg)}
                        onForward={(msg) => setForwardingMessage(msg)}
                        onReport={(msg) => setReportingMessage(msg)}
                        onReact={handleReact}
                        onEdit={startEditing}
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
          editingMessage={editingMessage}
          onCancelEdit={cancelEditing}
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
