"use client";

import {
  type Friend,
  PLACEHOLDER_LABELS,
  type StoryBoardMember,
} from "@nw/types";
import classNames from "classnames";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsCheck } from "react-icons/bs";
import { FiChevronRight, FiUserMinus, FiX } from "react-icons/fi";
import { IoIosStarOutline, IoMdAdd } from "react-icons/io";
import { TbStarFilled } from "react-icons/tb";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import * as DropS from "../profile-more-dropdown/styled";
import {
  addStoryBoardMember,
  removeStoryBoardMember,
  setStoryBoardMemberAdmin,
} from "./actions";
import * as S from "./styled";

interface StoryboardMembersDialogProps {
  storyBoardId: string;
  members: StoryBoardMember[];
  /** Username of the story's creator — fixed role, cannot be changed/removed. */
  creatorUsername: string | null;
  open: boolean;
  onClose: () => void;
  onMembersChange: (members: StoryBoardMember[]) => void;
}

/** Manages a storyboard's members: promote/demote admins (creator only),
 *  add/remove members (admins only). Follows the same desktop dialog /
 *  mobile tray shell as SharedWithDialog. */
export const StoryboardMembersDialog: FC<StoryboardMembersDialogProps> = ({
  storyBoardId,
  members,
  creatorUsername,
  open,
  onClose,
  onMembersChange,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { routeToPage } = usePageRouter();
  const { errorToast } = useUIContext();

  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<StoryBoardMember | null>(
    null,
  );

  const dialogRef = useRef<HTMLDivElement>(null);

  // Mobile tray animation state (mirrors SharedWithDialog / AppDropdownMenuMobile)
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const openTray = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setTrayVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTrayOpen(true));
    });
  };

  const closeTray = () => {
    setTrayOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setTrayVisible(false);
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (!isMobile) return;
    if (open) openTray();
    else if (trayVisible) closeTray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setMemberToRemove(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isMobile) closeTray();
      else onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile, onClose]);

  useEffect(() => {
    if (open && !isMobile) dialogRef.current?.focus();
  }, [open, isMobile]);

  const viewerIsCreator = !!user?.username && creatorUsername === user.username;
  const viewerIsAdmin =
    viewerIsCreator ||
    !!members.some((m) => m.username === user?.username && m.isAdmin);

  const availableFriends: Friend[] = useMemo(() => {
    const existing = new Set(members.map((m) => m.username));
    if (creatorUsername) existing.add(creatorUsername);
    return (novelist?.friends ?? []).filter(
      (friend) =>
        !existing.has(friend.username) &&
        friend.username.toLowerCase().includes(search.toLowerCase()),
    );
  }, [novelist?.friends, members, creatorUsername, search]);

  const handleClose = () => {
    if (isMobile) closeTray();
    else onClose();
  };

  const handleProfileClick = (username: string) => {
    // A member who disabled their account shows as a placeholder with no handle.
    if (!username) return;
    handleClose();
    routeToPage(ROUTES.Profile.View(username).Index);
  };

  const handleAdd = async (friend: Friend) => {
    setPending(friend.username);
    const response = await addStoryBoardMember({
      image: friend.image,
      isAdmin: false,
      storyBoardId,
      username: friend.username,
    });
    setPending(null);

    if (response?.message === API_MESSAGE.Success) {
      onMembersChange([
        ...members,
        {
          image: friend.image,
          isAdmin: false,
          storyBoardId,
          username: friend.username,
        },
      ]);
    } else {
      errorToast("Could not add member. Please try again.");
    }
  };

  const handleRemove = async (member: StoryBoardMember) => {
    setPending(member.username);
    const response = await removeStoryBoardMember({ ...member, storyBoardId });
    setPending(null);

    if (response?.message === API_MESSAGE.Success) {
      onMembersChange(members.filter((m) => m.username !== member.username));
    } else {
      errorToast("Could not remove member. Please try again.");
    }
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    const member = memberToRemove;
    setMemberToRemove(null);
    handleRemove(member);
  };

  const handleToggleAdmin = async (
    member: StoryBoardMember,
    nextIsAdmin: boolean,
  ) => {
    setPending(member.username);
    const response = await setStoryBoardMemberAdmin({
      ...member,
      isAdmin: nextIsAdmin,
      storyBoardId,
    });
    setPending(null);

    if (response?.message === API_MESSAGE.Success) {
      onMembersChange(
        members.map((m) =>
          m.username === member.username ? { ...m, isAdmin: nextIsAdmin } : m,
        ),
      );
    } else {
      errorToast("Could not update role. Please try again.");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) closeTray();
  };

  if (typeof document === "undefined") return null;

  const description =
    "Members can edit chapters and threads. Admins can also add or " +
    "remove members. Only the creator can promote or demote admins.";

  const body = (
    <>
      {viewerIsAdmin && (
        <S.AddMemberSection
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <S.SearchInput
            type="text"
            placeholder="Search friends to add..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.trim() && (
            <S.SuggestionList>
              {availableFriends.length > 0 ? (
                availableFriends.map((friend) => (
                  <S.SuggestionRow
                    key={friend.username}
                    type="button"
                    disabled={pending === friend.username}
                    onClick={() => handleAdd(friend)}
                  >
                    <AvatarNew
                      className="memberAvatar"
                      src={friend.image}
                      alt={friend.username}
                      nwImage={friend.avatar}
                    />
                    <S.FriendInfo as="span">
                      <S.FriendNameRow>
                        <S.FriendName>
                          {[friend.firstName, friend.lastName]
                            .filter(Boolean)
                            .join(" ")}
                        </S.FriendName>
                      </S.FriendNameRow>
                      <S.FriendUsername>@{friend.username}</S.FriendUsername>
                    </S.FriendInfo>
                    <S.AddIcon>
                      <IoMdAdd />
                    </S.AddIcon>
                  </S.SuggestionRow>
                ))
              ) : (
                <S.EmptyText>No matching friends.</S.EmptyText>
              )}
            </S.SuggestionList>
          )}
        </S.AddMemberSection>
      )}

      {members.length > 0 ? (
        <S.FriendList
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {members.map((member) => {
            const isCreatorRow = member.username === creatorUsername;
            return (
              <S.FriendRow key={member.username}>
                <AvatarNew
                  className="sharedWithAvatar"
                  src={member.image}
                  alt={member.username}
                  onClick={() => handleProfileClick(member.username)}
                />
                <S.FriendInfo
                  type="button"
                  onClick={() => handleProfileClick(member.username)}
                >
                  <S.FriendNameRow>
                    <S.FriendName>
                      {member.isPlaceholder
                        ? PLACEHOLDER_LABELS.NOVELIST
                        : `@${member.username}`}
                    </S.FriendName>
                    {isCreatorRow ? (
                      <S.RoleBadge $variant="creator">Creator</S.RoleBadge>
                    ) : member.isAdmin ? (
                      <S.RoleBadge $variant="admin">Admin</S.RoleBadge>
                    ) : null}
                  </S.FriendNameRow>
                </S.FriendInfo>
                <S.FriendActions>
                  {viewerIsCreator &&
                    !isCreatorRow &&
                    !member.isPlaceholder && (
                      <S.RoleActionButton
                        type="button"
                        title={
                          member.isAdmin ? "Remove admin role" : "Make admin"
                        }
                        disabled={pending === member.username}
                        onClick={() =>
                          handleToggleAdmin(member, !member.isAdmin)
                        }
                      >
                        {member.isAdmin ? (
                          <TbStarFilled />
                        ) : (
                          <IoIosStarOutline />
                        )}
                      </S.RoleActionButton>
                    )}
                  {viewerIsAdmin && !isCreatorRow && !member.isPlaceholder && (
                    <S.RemoveActionButton
                      type="button"
                      title="Remove member"
                      disabled={pending === member.username}
                      onClick={() => setMemberToRemove(member)}
                    >
                      <FiUserMinus />
                    </S.RemoveActionButton>
                  )}
                  {(isCreatorRow || (!viewerIsCreator && !viewerIsAdmin)) && (
                    <FiChevronRight aria-hidden="true" />
                  )}
                </S.FriendActions>
              </S.FriendRow>
            );
          })}
        </S.FriendList>
      ) : (
        <S.EmptyText>No members yet.</S.EmptyText>
      )}
    </>
  );

  const confirmDialog = (
    <AppAlertDialog
      heading="Remove member?"
      text={
        memberToRemove
          ? `@${memberToRemove.username} will lose access to this story and its threads.`
          : ""
      }
      open={!!memberToRemove}
      onOpenChange={(next) => {
        if (!next) setMemberToRemove(null);
      }}
      onCancel={() => setMemberToRemove(null)}
      onConfirm={handleConfirmRemove}
      actionButtonLabel="Remove"
      actionColor="negative"
      isConfirmDisabled={pending === memberToRemove?.username}
    />
  );

  // ── Mobile: slide-up tray ────────────────────────────────────────────────
  if (isMobile) {
    if (!trayVisible) return null;
    return createPortal(
      <DropS.MobilePortalRoot className={classNames([accent, theme])}>
        <DropS.MobileBackdrop $open={trayOpen} onClick={closeTray} />
        <DropS.MobileSheet
          $open={trayOpen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DropS.DragHandle />
          <S.TrayContent>
            <S.MobileHeaderBar>
              <S.TitleRow>
                <S.DialogTitle>Story members</S.DialogTitle>
                <S.CountBadge>{members.length}</S.CountBadge>
              </S.TitleRow>
              <S.MobileConfirmButton
                type="button"
                aria-label="Done"
                onClick={closeTray}
              >
                <BsCheck size={18} />
              </S.MobileConfirmButton>
            </S.MobileHeaderBar>
            <S.DialogDescription>{description}</S.DialogDescription>
            {body}
          </S.TrayContent>
        </DropS.MobileSheet>
        {confirmDialog}
      </DropS.MobilePortalRoot>,
      document.body,
    );
  }

  // ── Desktop: centered dialog ─────────────────────────────────────────────
  if (!open) return null;
  return createPortal(
    <>
      <S.DialogOverlay onClick={onClose} />
      <S.DialogContent
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Story members"
        className={classNames([accent, theme])}
      >
        <S.DialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.DialogClose>
        <S.DialogHeader>
          <S.TitleRow>
            <S.DialogTitle>Story members</S.DialogTitle>
            <S.CountBadge>{members.length}</S.CountBadge>
          </S.TitleRow>
          <S.DialogDescription>{description}</S.DialogDescription>
        </S.DialogHeader>
        {body}
        <S.DoneButton type="button" onClick={onClose}>
          Done
        </S.DoneButton>
      </S.DialogContent>
      {confirmDialog}
    </>,
    document.body,
  );
};

export default StoryboardMembersDialog;
