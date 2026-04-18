"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { VscVerifiedFilled } from "react-icons/vsc";
import { AvatarNew } from "@/components/common/avatar-new";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Conversation } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { getConversationByIdAction } from "../actions";
import * as S from "./styles";

export default function ConversationDetailsPage() {
  const params = useParams();
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { baseDataLoader, routeToPage } = usePageRouter();

  const conversationId = useMemo(() => {
    const routeParam = params?.conversationId;
    if (Array.isArray(routeParam)) return routeParam[0] || "";
    return routeParam || "";
  }, [params]);

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;
    const result = await baseDataLoader(() =>
      getConversationByIdAction(conversationId),
    );
    if (result) setConversation(result);
  }, [baseDataLoader, conversationId]);

  useEffect(() => {
    if (authState === "LOADING") return;
    fetchConversation();
  }, [authState, fetchConversation]);

  const targetDisplayName = useMemo(() => {
    if (!conversation) return "";
    if (conversation.isGroup) return conversation.name;
    const other = conversation.members?.find(
      (m) => m.userName !== user?.username,
    );
    if (other)
      return `${other.firstName} ${other.lastName}`.trim() || other.userName;
    return conversation.lastMessage?.sender?.name || "";
  }, [conversation, user?.username]);

  const targetImage = useMemo(() => {
    if (!conversation) return null;
    if (conversation.image) return conversation.image;
    const other = conversation.members?.find(
      (m) => m.userName !== user?.username,
    );
    return other?.image || conversation.lastMessage?.sender?.image || null;
  }, [conversation, user?.username]);

  const targetUsername = useMemo(() => {
    if (!conversation) return "";
    const other = conversation.members?.find(
      (m) => m.userName !== user?.username,
    );
    return other?.userName || conversation.lastMessage?.sender?.username || "";
  }, [conversation, user?.username]);

  return (
    <S.Container>
      <S.Header>
        <S.BackButton
          onClick={() => routeToPage(ROUTES.Conversation.View(conversationId))}
          aria-label="Back to conversation"
        >
          <IoArrowBackOutline size={15} />
        </S.BackButton>

        <S.AvatarWrap>
          <AvatarNew
            src={targetImage}
            alt={targetDisplayName || "Conversation"}
            username={targetUsername}
          />
        </S.AvatarWrap>

        <S.HeaderInfo>
          <S.ConvName>{targetDisplayName || "Conversation"}</S.ConvName>
          <S.ConvTypeBadge>
            {conversation?.isGroup ? "Group conversation" : "Direct message"}
          </S.ConvTypeBadge>
        </S.HeaderInfo>
      </S.Header>

      {conversation?.members && conversation.members.length > 0 && (
        <S.Section>
          <S.SectionTitle>
            Members ({conversation.members.length})
          </S.SectionTitle>
          <S.MembersList>
            {conversation.members.map((member) => (
              <S.MemberRow
                key={member.novelistId}
                type="button"
                onClick={() =>
                  routeToPage(ROUTES.Profile.View(member.userName).Index)
                }
              >
                <AvatarNew
                  src={member.image}
                  alt={
                    `${member.firstName} ${member.lastName}`.trim() ||
                    member.userName
                  }
                  username={member.userName}
                />
                <S.MemberInfo>
                  <S.MemberNameRow>
                    <S.MemberName>
                      {`${member.firstName} ${member.lastName}`.trim() ||
                        member.userName}
                    </S.MemberName>
                    {member.isVerified && (
                      <VscVerifiedFilled size={14} color="rgb(28, 123, 201)" />
                    )}
                  </S.MemberNameRow>
                  <S.MemberUsername>@{member.userName}</S.MemberUsername>
                </S.MemberInfo>
                {member.role && <S.MemberRole>{member.role}</S.MemberRole>}
              </S.MemberRow>
            ))}
          </S.MembersList>
        </S.Section>
      )}
    </S.Container>
  );
}
