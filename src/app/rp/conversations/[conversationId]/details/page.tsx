"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { AdminBadge } from "@/components/common/admin-badge";
import { AvatarNew } from "@/components/common/avatar-new";
import { EmailVerifiedBadge } from "@/components/common/email-verified-badge";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Conversation, ConversationParticipant } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import {
  getConversationByIdAction,
  getConversationMembersAction,
} from "../actions";
import * as S from "./styles";

export default function ConversationDetailsPage() {
  const params = useParams();
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage, stopPageLoading } = usePageRouter();

  const conversationId = useMemo(() => {
    const routeParam = params?.conversationId;
    if (Array.isArray(routeParam)) return routeParam[0] || "";
    return routeParam || "";
  }, [params]);

  // Seed immediately from the active conversation (already loaded by the parent page)
  const activeConversation = useGlobalState("activeConversation");
  const cachedRef = useRef(
    activeConversation?.id === conversationId ? activeConversation : null,
  );
  const [conversation, setConversation] = useState<Conversation | null>(
    cachedRef.current,
  );
  const [members, setMembers] = useState<ConversationParticipant[]>(
    cachedRef.current?.members ?? [],
  );
  const [membersLoading, setMembersLoading] = useState(true);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;
    const result = await getConversationByIdAction(conversationId);
    if (result && "id" in result) setConversation(result as Conversation);
  }, [conversationId]);

  const fetchMembers = useCallback(async () => {
    if (!conversationId) return;
    setMembersLoading(true);
    const result = await getConversationMembersAction(conversationId);
    if (Array.isArray(result)) setMembers(result);
    setMembersLoading(false);
  }, [conversationId]);

  useEffect(() => {
    stopPageLoading();
    fetchConversation();
    fetchMembers();
  }, [fetchConversation, fetchMembers, stopPageLoading]);

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
          onClick={() => {
            setGlobalState({ conversationNavDirection: "back" });
            routeToPage(ROUTES.Conversation.View(conversationId), {
              skipLoading: true,
            });
          }}
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

      {(membersLoading || members.length > 0) && (
        <S.Section>
          <S.SectionTitle>
            {membersLoading ? "Members" : `Members (${members.length})`}
          </S.SectionTitle>
          <S.MembersList>
            {membersLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <S.MemberRowSkeleton key={`member-skeleton-${i}`}>
                    <S.SkeletonAvatar />
                    <S.SkeletonLines>
                      <S.SkeletonLine $width="42%" $height="13px" />
                      <S.SkeletonLine $width="28%" $height="11px" />
                    </S.SkeletonLines>
                  </S.MemberRowSkeleton>
                ))
              : members.map((member) => (
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
                      nwImage={member.avatar}
                    />
                    <S.MemberInfo>
                      <S.MemberNameRow>
                        <S.MemberName>
                          {`${member.firstName} ${member.lastName}`.trim() ||
                            member.userName}
                        </S.MemberName>
                        {member.isVerified &&
                          (member.userName === "novelistworld" ? (
                            <AdminBadge size={20} />
                          ) : (
                            <EmailVerifiedBadge size={14} />
                          ))}
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
