"use client";

import type { Conversation, ConversationParticipant } from "@nw/types";
import { useParams } from "@/lib/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  MdDelete,
  MdEdit,
  MdPersonAddAlt1,
  MdPersonRemove,
} from "react-icons/md";
import { AdminBadge } from "@/components/common/admin-badge";
import { AvatarNew } from "@/components/common/avatar-new";
import { EmailVerifiedBadge } from "@/components/common/email-verified-badge";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { ROUTES } from "@/utils/constants/routes";
import {
  deleteGroupAction,
  getConversationByIdAction,
  getConversationMembersAction,
  leaveGroupAction,
  removeGroupMemberAction,
} from "../actions";
import { AddMembersDialog } from "./add-members-dialog";
import { EditGroupDialog } from "./edit-group-dialog";
import * as S from "./styles";

export default function ConversationDetailsPage() {
  const params = useParams();
  const user = useGlobalState("user");
  const cachedConversations = useGlobalState("cachedConversations");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage, stopPageLoading } = usePageRouter();
  const { successToast, errorToast } = useUIContext();

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
  const [editOpen, setEditOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] =
    useState<ConversationParticipant | null>(null);
  const [removing, setRemoving] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Only group admins may edit the group's name/image.
  const isGroupAdmin = useMemo(() => {
    if (!conversation?.isGroup) return false;
    const me = members.find((m) => m.userName === user?.username);
    const role = me?.role?.toUpperCase() ?? "";
    return role === "ADMIN" || role === "OWNER";
  }, [conversation?.isGroup, members, user?.username]);

  // After an update, patch local state plus the global caches so the change
  // is reflected immediately across the inbox and conversation views.
  const handleGroupUpdated = useCallback(
    (updated: Conversation) => {
      const merged: Conversation = {
        ...updated,
        members: updated.members?.length ? updated.members : members,
      };
      setConversation(merged);
      setGlobalState({ activeConversation: merged });
      if (cachedConversations) {
        setGlobalState({
          cachedConversations: cachedConversations.map((conv) =>
            conv.id === merged.id
              ? { ...conv, image: merged.image, name: merged.name }
              : conv,
          ),
        });
      }
    },
    [cachedConversations, members, setGlobalState],
  );

  const handleConfirmRemoveMember = useCallback(async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    const result = await removeGroupMemberAction(
      conversationId,
      memberToRemove.novelistId,
    );
    setRemoving(false);

    if (!result || (typeof result === "object" && "message" in result)) {
      errorToast("Failed to remove member. Please try again.");
      return;
    }

    setMembers((prev) =>
      prev.filter((m) => m.novelistId !== memberToRemove.novelistId),
    );
    successToast("Member removed from group.");
    setMemberToRemove(null);
  }, [conversationId, errorToast, memberToRemove, successToast]);

  const handleConfirmLeave = useCallback(async () => {
    setLeaving(true);
    const result = await leaveGroupAction(conversationId);
    setLeaving(false);

    if (!result || (typeof result === "object" && "message" in result)) {
      errorToast("Failed to leave group. Please try again.");
      return;
    }

    // Remove this conversation from the cached list and navigate to inbox.
    if (cachedConversations) {
      setGlobalState({
        cachedConversations: cachedConversations.filter(
          (conv) => conv.id !== conversationId,
        ),
      });
    }
    setGlobalState({ activeConversation: null });
    routeToPage(ROUTES.conversations);
  }, [
    cachedConversations,
    conversationId,
    errorToast,
    routeToPage,
    setGlobalState,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    setDeleting(true);
    const result = await deleteGroupAction(conversationId);
    setDeleting(false);

    if (!result || (typeof result === "object" && "message" in result)) {
      errorToast("Failed to delete group. Please try again.");
      return;
    }

    if (cachedConversations) {
      setGlobalState({
        cachedConversations: cachedConversations.filter(
          (conv) => conv.id !== conversationId,
        ),
      });
    }
    setGlobalState({ activeConversation: null });
    routeToPage(ROUTES.conversations);
  }, [
    cachedConversations,
    conversationId,
    errorToast,
    routeToPage,
    setGlobalState,
  ]);

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

        {isGroupAdmin && (
          <S.EditButton
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Edit group"
            title="Edit group"
          >
            <MdEdit size={16} />
          </S.EditButton>
        )}

        {conversation?.isGroup && isGroupAdmin && (
          <S.DeleteButton
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            aria-label="Delete group"
            title="Delete group"
          >
            <MdDelete size={15} />
            <span className="delete-label">Delete</span>
          </S.DeleteButton>
        )}

        {conversation?.isGroup && !isGroupAdmin && (
          <S.LeaveButton
            type="button"
            onClick={() => setLeaveConfirmOpen(true)}
            aria-label="Leave group"
            title="Leave group"
          >
            Leave
          </S.LeaveButton>
        )}
      </S.Header>

      {(membersLoading || members.length > 0) && (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>
              {membersLoading ? "Members" : `Members (${members.length})`}
            </S.SectionTitle>
            {conversation?.isGroup && isGroupAdmin && (
              <S.AddMembersButton
                type="button"
                onClick={() => setAddMembersOpen(true)}
                aria-label="Add members"
                title="Add members"
              >
                <MdPersonAddAlt1 size={16} />
                Add
              </S.AddMembersButton>
            )}
          </S.SectionHeader>
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
                  <S.MemberRow key={member.novelistId}>
                    <S.MemberMain
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
                    </S.MemberMain>
                    {member.role && <S.MemberRole>{member.role}</S.MemberRole>}
                    {isGroupAdmin && member.userName !== user?.username && (
                      <S.RemoveMemberButton
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        aria-label={`Remove ${member.userName}`}
                        title="Remove from group"
                      >
                        <MdPersonRemove size={16} />
                      </S.RemoveMemberButton>
                    )}
                  </S.MemberRow>
                ))}
          </S.MembersList>
        </S.Section>
      )}

      {conversation?.isGroup && isGroupAdmin && (
        <EditGroupDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          conversation={conversation}
          onUpdated={handleGroupUpdated}
        />
      )}

      {conversation?.isGroup && isGroupAdmin && (
        <AddMembersDialog
          open={addMembersOpen}
          onOpenChange={setAddMembersOpen}
          groupId={conversationId}
          members={members}
          onAdded={fetchMembers}
        />
      )}

      {isGroupAdmin && (
        <AppAlertDialog
          open={!!memberToRemove}
          onOpenChange={(next) => {
            if (!next) setMemberToRemove(null);
          }}
          heading="Remove member"
          text={
            memberToRemove
              ? `Remove ${
                  `${memberToRemove.firstName} ${memberToRemove.lastName}`.trim() ||
                  memberToRemove.userName
                } from this group?`
              : ""
          }
          onCancel={() => setMemberToRemove(null)}
          onConfirm={handleConfirmRemoveMember}
          actionButtonLabel={removing ? "Removing..." : "Remove"}
          actionColor="negative"
          closeButtonText="Cancel"
          isConfirmDisabled={removing}
        />
      )}

      {conversation?.isGroup && !isGroupAdmin && (
        <AppAlertDialog
          open={leaveConfirmOpen}
          onOpenChange={setLeaveConfirmOpen}
          heading="Leave group"
          text={`Leave ${conversation.name || "this group"}? You won't be able to see messages until you're added back.`}
          onCancel={() => setLeaveConfirmOpen(false)}
          onConfirm={handleConfirmLeave}
          actionButtonLabel={leaving ? "Leaving..." : "Leave"}
          actionColor="negative"
          closeButtonText="Cancel"
          isConfirmDisabled={leaving}
        />
      )}

      {conversation?.isGroup && isGroupAdmin && (
        <AppAlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          heading="Delete group"
          text={`Permanently delete "${conversation.name || "this group"}"? This cannot be undone.`}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          actionButtonLabel={deleting ? "Deleting..." : "Delete"}
          actionColor="negative"
          closeButtonText="Cancel"
          isConfirmDisabled={deleting}
        />
      )}
    </S.Container>
  );
}
