"use client";

import { useParams, useSearchParams } from "@/lib/navigation";
import { useMemo } from "react";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { ConversationPanel } from "./conversation-panel";

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const setGlobalState = useGlobalStoreSet();
  const cachedConversations = useGlobalState("cachedConversations");
  const { routeToPage } = usePageRouter();

  const conversationId = useMemo(() => {
    const routeParam = params?.conversationId;
    if (Array.isArray(routeParam)) return routeParam[0] || "";
    return routeParam || "";
  }, [params]);

  const targetUserName = searchParams?.get("target") || "";

  const onBack = () => {
    setGlobalState({ conversationNavDirection: "back" });
    routeToPage(ROUTES.conversations, {
      skipLoading: cachedConversations ? true : undefined,
    });
  };

  return (
    <ConversationPanel
      conversationId={conversationId}
      targetUserName={targetUserName}
      onBack={onBack}
    />
  );
}
