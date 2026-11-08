"use client";

import { resolveConversationTarget } from "@nw/chat";
import type { Conversation } from "@nw/types";
import {
  type ButtonHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiMessageCircle,
  FiSearch,
} from "react-icons/fi";
import { getConversationsAction } from "@/app/rp/conversations/actions";
import { AvatarNew } from "@/components/common/avatar-new";
import { LoadMore } from "@/components/load-more/page";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import { encryptMessageText } from "@/utils/e2e-crypto";
import { sendAndAwaitAnswer } from "./await-send";
import * as S from "./styles";

/**
 * Send what a share dialog is sharing — a muse, a profile, a prompt, a story,
 * a chapter — into one of your conversations, as a message from you.
 *
 * The message is the item's link and nothing else: the chat already unfurls
 * Novelist World links into cards (`nw-link-embed`), so the link *is* the
 * share. It goes out the way the forward dialog sends — encrypted for the
 * target conversation, over the socket the app already holds open — and each
 * row sends on its own, so one share can go to several chats.
 *
 * The share dialogs swap their content for this panel (`SendToChatPanel`)
 * when their `SendToChatButton` is pressed, so it lives in whichever shell the
 * dialog is in: the centred dialog on desktop, the slide-up tray on phones.
 */

const PAGE_SIZE = 20;

/** The button in a share dialog's actions that opens the panel. */
export const SendToChatButton = (
  props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type">,
) => {
  // A signed-out visitor to a public page has no chats to send to.
  const authState = useGlobalState("authState");
  if (authState !== "LOGGED_IN") return null;
  return (
    <S.OpenButton type="button" {...props}>
      <FiMessageCircle aria-hidden="true" />
      Send in a chat
    </S.OpenButton>
  );
};

type Row = {
  conversation: Conversation;
  image: string | null;
  name: string;
  /** "@handle" for a friend, "Group · N members" for a group. */
  detail: string;
  username: string;
};

/** The conversations a message can go to: not one whose other side disabled their account. */
const sendable = (conversations: Conversation[]) =>
  conversations.filter((conversation) => !conversation.isUnavailable);

export const SendToChatPanel = ({
  label,
  onBack,
  url,
}: {
  /** What is being sent, for the heading: "prompt", "muse", "story"… */
  label: string;
  onBack: () => void;
  url: string;
}) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { isConnected, socket } = useSocket();
  const myUsername = user?.username ?? novelist?.username;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageNumber: number) => {
    const result = await getConversationsAction(pageNumber, PAGE_SIZE);
    if (!Array.isArray(result)) {
      if (pageNumber === 1) setLoadFailed(true);
      return;
    }
    if (result.length < PAGE_SIZE) setHasMore(false);
    // Previews are not shown, so nothing here needs decrypting.
    setConversations((prev) => {
      if (pageNumber === 1) return result;
      const seen = new Set(prev.map((c) => c.id));
      return [...prev, ...result.filter((c) => !seen.has(c.id))];
    });
  }, []);

  useEffect(() => {
    fetchPage(1).finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    fetchPage(next).finally(() => {
      setPage(next);
      setLoadingMore(false);
    });
  };

  const rows = useMemo<Row[]>(
    () =>
      // Nothing can be sent to someone who disabled their account.
      sendable(conversations).map((conversation) => {
        const target = resolveConversationTarget(conversation, myUsername);
        const members = conversation.memberCount ?? conversation.members?.length;
        return {
          conversation,
          detail: conversation.isGroup
            ? members
              ? `Group · ${members} members`
              : "Group"
            : target.username
              ? `@${target.username}`
              : "",
          image: target.image,
          name: target.name || "Conversation",
          username: target.username,
        };
      }),
    [conversations, myUsername],
  );

  /*
   * Only over the pages already loaded, as the inbox's own search is — there
   * is no conversation search endpoint. "Load more" stays under the results
   * so an older chat can still be reached.
   */
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.username.toLowerCase().includes(query),
    );
  }, [rows, search]);

  const send = async (conversationId: string) => {
    if (!url || sendingId || sentIds.has(conversationId)) return;
    if (!socket || !isConnected) {
      setError("Not connected to chat. Wait a moment and try again.");
      return;
    }
    setError(null);
    setSendingId(conversationId);
    try {
      const payload = {
        attachments: null,
        conversationId,
        // Encrypted for this conversation's own key, as every message is.
        message: await encryptMessageText(conversationId, url),
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
      // Wait for chat-server's answer, so a refusal (blocked, unavailable)
      // shows instead of a "Sent" that never arrived.
      const outcome = await sendAndAwaitAnswer(socket, payload, user?.username);
      if (outcome.ok) {
        setSentIds((prev) => new Set(prev).add(conversationId));
      } else {
        setError(outcome.message);
      }
    } catch {
      setError("Couldn't send it. Please try again.");
    } finally {
      setSendingId(null);
    }
  };

  // The tray closes on a downward swipe; scrolling the list must not count.
  const keepTouch = (event: React.TouchEvent) => event.stopPropagation();

  return (
    <S.Panel>
      <S.Header>
        <S.BackButton
          type="button"
          onClick={onBack}
          aria-label="Back to share options"
        >
          <FiChevronLeft aria-hidden="true" />
        </S.BackButton>
        <S.HeaderText>
          <S.Title>Send in a chat</S.Title>
          <S.Subtitle>
            The {label}'s link goes to the chat from you, and opens as a card.
          </S.Subtitle>
        </S.HeaderText>
      </S.Header>

      <S.SearchWrap>
        <FiSearch aria-hidden="true" />
        <S.SearchInput
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search friends and groups"
          aria-label="Search friends and groups"
        />
      </S.SearchWrap>

      <S.List onTouchStart={keepTouch} onTouchEnd={keepTouch}>
        {loading ? (
          <S.Status>Loading your chats…</S.Status>
        ) : loadFailed ? (
          <S.Status>Couldn't load your chats. Close this and try again.</S.Status>
        ) : visible.length === 0 ? (
          <S.Status>
            {rows.length === 0
              ? "No chats yet. Add a friend or join a group to send things here."
              : "No chats match that."}
          </S.Status>
        ) : (
          visible.map((row) => {
            const id = row.conversation.id;
            const sent = sentIds.has(id);
            const sending = sendingId === id;
            return (
              <S.Row key={id}>
                <AvatarNew
                  src={row.image}
                  alt={row.name}
                  username={row.username || undefined}
                />
                <S.RowText>
                  <S.RowName>{row.name}</S.RowName>
                  {row.detail ? <S.RowDetail>{row.detail}</S.RowDetail> : null}
                </S.RowText>
                <S.SendButton
                  type="button"
                  $sent={sent}
                  disabled={sent || sending || !!sendingId}
                  onClick={() => void send(id)}
                  aria-label={sent ? `Sent to ${row.name}` : `Send to ${row.name}`}
                >
                  {sent ? (
                    <>
                      <FiCheck aria-hidden="true" /> Sent
                    </>
                  ) : sending ? (
                    "Sending…"
                  ) : (
                    "Send"
                  )}
                </S.SendButton>
              </S.Row>
            );
          })
        )}
        {!loading && !loadFailed && rows.length > 0 ? (
          <LoadMore
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />
        ) : null}
      </S.List>

      {error ? (
        <S.ErrorText role="alert">
          <FiAlertCircle aria-hidden="true" />
          {error}
        </S.ErrorText>
      ) : null}
    </S.Panel>
  );
};
