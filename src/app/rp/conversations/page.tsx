"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MdOutlineSupportAgent } from "react-icons/md";
import { BreadCrumb } from "@/components/breadcrumb";
import { AddNewButton } from "@/components/common";
import { ConversationCard } from "@/components/conversation-card";
import { LoadMore } from "@/components/load-more/page";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Conversation } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import {
  getConversationByUsernameAction,
  getConversationsAction,
} from "./actions";
import * as S from "./styles";

const PAGE_SIZE = 15;

export default function ConversationsPage() {
  const user = useGlobalState("user");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const { lastIncomingMessage } = useSocket();
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [contactSupportLoading, setContactSupportLoading] = useState(false);

  const { baseDataLoader, routeToPage } = usePageRouter();

  const handleContactSupport = useCallback(async () => {
    setContactSupportLoading(true);
    const conversation = await baseDataLoader(() =>
      getConversationByUsernameAction("novelistworld"),
    );
    setContactSupportLoading(false);
    if (conversation) {
      routeToPage(ROUTES.Conversation.View(conversation.id));
    }
  }, [baseDataLoader, routeToPage]);

  const fetchConversations = useCallback(
    async (pageNumber: number, append = false) => {
      const _conversations = await baseDataLoader(() =>
        getConversationsAction(pageNumber, PAGE_SIZE),
      );

      if (!_conversations || _conversations.length === 0) {
        setHasMore(false);
        return false;
      }

      if (_conversations.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setConversations((prev) =>
        append ? [...(prev || []), ..._conversations] : _conversations,
      );
      return true;
    },
    [baseDataLoader],
  );

  useEffect(() => {
    fetchConversations(1);
  }, [fetchConversations]);

  // Update the matching conversation's lastMessage when a new real-time message arrives,
  // then re-sort so the most recently active conversation floats to the top.
  useEffect(() => {
    if (!lastIncomingMessage) return;
    setConversations((prev) => {
      if (!prev) return prev;
      const updated = prev.map((conv) =>
        conv.id === lastIncomingMessage.conversationId
          ? { ...conv, lastMessage: lastIncomingMessage }
          : conv,
      );
      return [...updated].sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? a.modifiedAt ?? "";
        const bTime = b.lastMessage?.createdAt ?? b.modifiedAt ?? "";
        return bTime.localeCompare(aTime);
      });
    });
  }, [lastIncomingMessage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const loaded = await fetchConversations(nextPage, true);

    if (loaded) {
      setPage(nextPage);
    }

    setLoadingMore(false);
  };

  const unreadBadgeCount = useMemo(() => {
    if (!unreadConversationIds?.length || !hasMore) return 0;
    const fetchedIds = new Set(conversations?.map((c) => c.id) ?? []);
    return unreadConversationIds.filter((id) => !fetchedIds.has(id)).length;
  }, [unreadConversationIds, conversations, hasMore]);

  return (
    <S.Container>
      <BreadCrumb label="Conversations" username={user?.username ?? ""} />
      <AddNewButton
        label={contactSupportLoading ? "Opening..." : "Contact Support"}
        icon={<MdOutlineSupportAgent size={20} />}
        onClick={handleContactSupport}
      />
      <S.ConversationListContainer>
        {conversations && conversations.length > 0 ? (
          <S.ConversationList>
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationCard conversation={conversation} />
              </li>
            ))}
          </S.ConversationList>
        ) : (
          <p>No conversations found.</p>
        )}

        <LoadMore
          hasMore={hasMore && !!conversations?.length}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          unreadCount={unreadBadgeCount}
        />
      </S.ConversationListContainer>
    </S.Container>
  );
}
