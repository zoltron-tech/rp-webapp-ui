"use client";

import {
  HEADCANON_VISIBILITY_COPY,
  type Headcanon,
  headcanonPath,
} from "@nw/types/headcanon";
import classNames from "classnames";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  FiEyeOff,
  FiLink,
  FiLock,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
import { LuPencil, LuPin, LuPinOff } from "react-icons/lu";
import { setHeadcanonHeartAction } from "@/app/rp/muse/headcanon-actions";
import { HeartIcon } from "@/components/common/heart-icon";
import { LikeButton as LikeS } from "@/components/common/like-button/styled";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import type { CatalogLookups } from "./catalog";
import * as S from "./styles";
import { useAskAbout } from "./use-ask-about";

type Props = {
  open: boolean;
  headcanon: Headcanon | null;
  lookups: CatalogLookups;
  /** The muse page the card is being read on; its link opens here. */
  museId: string;
  museName: string;
  /** The writer, for "Ask about this". */
  ownerNovelistId: string | null;
  ownerUsername: string | null;
  canEdit: boolean;
  verseLabel?: string | null;
  onClose: () => void;
  onChange: (headcanon: Headcanon) => void;
  onEdit?: (headcanon: Headcanon) => void;
  onTogglePin?: (headcanon: Headcanon) => void;
  /** A pin change is out for this card: the pin button waits. */
  pinning?: boolean;
  onDelete?: (headcanon: Headcanon) => void;
};

/**
 * One headcanon, read in full: its tags, title, body, the heart, and the two
 * ways to take it further — ask the writer about it, or copy its link (which
 * unfurls as a card wherever it is pasted). The owner's edit / pin / delete
 * sit in the header, as on the story notes.
 */
export const HeadcanonDetailSheet: FC<Props> = ({
  open,
  headcanon,
  lookups,
  museId,
  museName,
  ownerNovelistId,
  ownerUsername,
  canEdit,
  verseLabel,
  onClose,
  onChange,
  onEdit,
  onTogglePin,
  pinning = false,
  onDelete,
}) => {
  const authState = useGlobalState("authState");
  const { successToast, errorToast } = useUIContext();
  const { ask, asking } = useAskAbout();
  const [revealed, setRevealed] = useState(false);
  const [unliked, setUnliked] = useState(false);
  const [hearting, setHearting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const id = headcanon?.id;
  useEffect(() => {
    setRevealed(false);
    setConfirmDelete(false);
  }, [id]);

  if (!headcanon) return null;

  const loggedIn = authState === "LOGGED_IN";
  const link = `${window.location.origin}${headcanonPath(museId, headcanon.id)}`;
  const hidden = headcanon.spoiler && !revealed && !canEdit;

  const toggleHeart = async () => {
    if (!loggedIn || hearting) return;
    const next = !headcanon.hearted;
    if (!next) {
      setUnliked(true);
      setTimeout(() => setUnliked(false), 500);
    }
    const optimistic = {
      ...headcanon,
      heartCount: Math.max(0, headcanon.heartCount + (next ? 1 : -1)),
      hearted: next,
    };
    onChange(optimistic);
    setHearting(true);
    const result = await setHeadcanonHeartAction(headcanon.id, next);
    setHearting(false);
    if (result && "hearted" in result) {
      onChange({
        ...optimistic,
        heartCount: result.heartCount,
        hearted: result.hearted,
      });
    } else {
      onChange(headcanon);
      errorToast("Couldn't save the heart. Please try again.");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      successToast("Link copied. It opens as a card in posts and chats.");
    } catch {
      errorToast("Couldn't copy the link.");
    }
  };

  const visibilityTag =
    headcanon.visibility === "PUBLIC" ? null : (
      <S.DetailTag>
        {headcanon.visibility === "FRIENDS" ? (
          <FiUsers size={12} />
        ) : (
          <FiLock size={12} />
        )}
        {HEADCANON_VISIBILITY_COPY[headcanon.visibility].label}
      </S.DetailTag>
    );

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title={`${museName} · Headcanon`}
      onClose={onClose}
      headerActions={
        canEdit ? (
          <>
            {onEdit && (
              <F.SheetActionButton
                type="button"
                aria-label="Edit this headcanon"
                title="Edit"
                onClick={() => onEdit(headcanon)}
              >
                <LuPencil size={16} />
              </F.SheetActionButton>
            )}
            {onTogglePin && (
              <F.SheetActionButton
                type="button"
                aria-label={
                  headcanon.pinned
                    ? "Unpin from the profile"
                    : "Pin to the profile"
                }
                title={headcanon.pinned ? "Unpin" : "Pin"}
                disabled={pinning}
                aria-busy={pinning}
                onClick={() => onTogglePin(headcanon)}
              >
                {pinning ? (
                  <F.SheetSpinner aria-hidden />
                ) : headcanon.pinned ? (
                  <LuPinOff size={16} />
                ) : (
                  <LuPin size={16} />
                )}
              </F.SheetActionButton>
            )}
            {onDelete && (
              <F.SheetActionButton
                type="button"
                $variant="danger"
                aria-label="Delete this headcanon"
                title="Delete"
                onClick={() => setConfirmDelete(true)}
              >
                <FaRegTrashCan size={14} />
              </F.SheetActionButton>
            )}
          </>
        ) : null
      }
      footer={
        <S.DetailFoot>
          <LikeS.Root>
            <LikeS.HeartButton
              type="button"
              className={classNames({ liked: headcanon.hearted, unliked })}
              aria-label={
                headcanon.hearted
                  ? "Take your heart back"
                  : "Heart this headcanon"
              }
              aria-pressed={headcanon.hearted}
              title={loggedIn ? undefined : "Sign in to heart headcanons"}
              disabled={!loggedIn}
              onClick={toggleHeart}
            >
              <HeartIcon filled={headcanon.hearted} />
            </LikeS.HeartButton>
            <S.HeartCount>
              {headcanon.heartCount === 0
                ? "No hearts yet"
                : `${headcanon.heartCount} ${headcanon.heartCount === 1 ? "heart" : "hearts"}`}
            </S.HeartCount>
          </LikeS.Root>
          <S.DetailActions>
            {loggedIn && !canEdit && ownerNovelistId && (
              <S.ActionPill
                type="button"
                $primary
                disabled={asking}
                title="Sends this headcanon to the writer as a card, then opens your chat with them."
                onClick={async () => {
                  if (await ask(ownerNovelistId, link)) onClose();
                }}
              >
                <FiMessageCircle size={15} />
                {asking
                  ? "Opening the chat…"
                  : `Ask ${ownerUsername ? `@${ownerUsername}` : "the writer"}`}
              </S.ActionPill>
            )}
            <S.ActionPill type="button" onClick={copyLink}>
              <FiLink size={15} />
              Copy link
            </S.ActionPill>
          </S.DetailActions>
        </S.DetailFoot>
      }
    >
      <S.DetailMeta>
        <S.DetailTag $accent>
          {lookups.categoryLabel(headcanon.category)}
        </S.DetailTag>
        <S.DetailTag>
          {headcanon.alternateUniverse ? "AU" : "Canon"}
        </S.DetailTag>
        {verseLabel && <S.DetailTag>{verseLabel}</S.DetailTag>}
        {visibilityTag}
        {headcanon.pinned && (
          <S.DetailTag>
            <LuPin size={12} /> Pinned
          </S.DetailTag>
        )}
      </S.DetailMeta>

      {headcanon.title && <S.DetailTitle>{headcanon.title}</S.DetailTitle>}

      {hidden ? (
        <S.Empty>
          <FiEyeOff size={18} />
          <strong>Spoiler</strong>
          <span>The writer marked this one as a spoiler.</span>
          <S.PrimaryButton type="button" onClick={() => setRevealed(true)}>
            Show it
          </S.PrimaryButton>
        </S.Empty>
      ) : (
        <RichTextRenderer savedText={headcanon.body} disableCollapse />
      )}

      <AppAlertDialog
        heading="Delete this headcanon?"
        text="It disappears from the profile, along with its hearts. This cannot be undone."
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete?.(headcanon);
        }}
      />
    </ResponsiveSheet>
  );
};
