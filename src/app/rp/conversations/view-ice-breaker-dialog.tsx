"use client";

import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsChevronLeft, BsChevronRight, BsX } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiPaperAirplane } from "react-icons/hi2";
import { ChatRichInput } from "@/components/chat-rich-input";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import {
  museToSource,
  novelistToSource,
} from "@/components/prompt-input/helpers";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { IceBreaker, Muse, Novelist, PromptSource } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import {
  createConversationIfNotExistAction,
  deleteIceBreakerAction,
} from "./actions";
import {
  getSourceRingAccent,
  parseIceBreakerTimestamp,
  truncateIceBreakerSourceName,
} from "./ice-breaker-helpers";
import { IceBreakerTrayHeader } from "./ice-breaker-tray-header";
import {
  QuickAddMuseButton,
  QuickAddMuseForm,
  useQuickAddMuse,
} from "./quick-add-muse";
import * as S from "./styles";

type ViewIceBreakerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iceBreaker: IceBreaker | null;
  novelist: Novelist | null | undefined;
  /** Called after the ice breaker has been successfully deleted. */
  onDeleted: (iceBreaker: IceBreaker) => void;
};

export function ViewIceBreakerDialog({
  open,
  onOpenChange,
  iceBreaker,
  novelist,
  onDeleted,
}: ViewIceBreakerDialogProps) {
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const user = useGlobalState("user");
  const { socket, isConnected } = useSocket();
  const { routeToPage } = usePageRouter();
  const { errorToast } = useUIContext();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [replyMessage, setReplyMessage] = useState("");
  const [replyHtml, setReplyHtml] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const replySenderRowRef = useRef<HTMLDivElement>(null);

  // Muses created on the fly from this picker (session-local — merged with
  // the novelist's real muses so a freshly created character is immediately
  // selectable without requiring a refetch of the novelist).
  const [addedReplyMuses, setAddedReplyMuses] = useState<Muse[]>([]);

  const replyNovelistSource = useMemo<PromptSource | null>(
    () => (novelist ? novelistToSource(novelist) : null),
    [novelist],
  );
  const replyMuseSources = useMemo<PromptSource[]>(
    () => [...(novelist?.muses ?? []), ...addedReplyMuses].map(museToSource),
    [novelist, addedReplyMuses],
  );
  const replySources = useMemo<PromptSource[]>(
    () =>
      replyNovelistSource
        ? [replyNovelistSource, ...replyMuseSources]
        : replyMuseSources,
    [replyNovelistSource, replyMuseSources],
  );
  const [replySelectedSourceId, setReplySelectedSourceId] = useState<
    string | undefined
  >(replySources[0]?.sourceId);
  const replySource =
    replySources.find((s) => s.sourceId === replySelectedSourceId) ??
    replySources[0];

  const quickAddReplyMuse = useQuickAddMuse((muse) => {
    setAddedReplyMuses((prev) => [...prev, muse]);
    setReplySelectedSourceId(muse.id ?? undefined);
  });

  const scrollReplySenders = (dir: "left" | "right") => {
    replySenderRowRef.current?.scrollBy({
      behavior: "smooth",
      left: dir === "right" ? 180 : -180,
    });
  };

  // ── Mobile sheet open/close animation ──────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [startY, setStartY] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSheet = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setVisible(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSheetOpen(true)),
    );
  };

  const closeSheet = () => {
    setSheetOpen(false);
    closeTimerRef.current = setTimeout(() => setVisible(false), 300);
  };

  useEffect(() => {
    if (!isMobile) return;
    if (open) openSheet();
    else closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  // Reset the confirmation step and reply draft whenever the dialog closes or
  // a different ice breaker is opened.
  useEffect(() => {
    if (!open) {
      setConfirmDeleteOpen(false);
      setReplyMessage("");
      setReplyHtml("");
      quickAddReplyMuse.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    setConfirmDeleteOpen(false);
    setReplyMessage("");
    setReplyHtml("");
    setReplySelectedSourceId(replySources[0]?.sourceId);
    quickAddReplyMuse.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iceBreaker?.sourceId]);
  // ── /Mobile sheet open/close animation ─────────────────────────────────────

  if (!iceBreaker) return null;

  const isOwner =
    !!novelist &&
    (iceBreaker.sourceId === novelist.id ||
      novelist.muses.some((muse) => muse.id === iceBreaker.sourceId));

  const ringAccent = getSourceRingAccent(iceBreaker.source);
  const createdOnMs = parseIceBreakerTimestamp(iceBreaker.createdOn);
  const handleClose = () => onOpenChange(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const result = await deleteIceBreakerAction(iceBreaker.sourceId);
    setDeleting(false);

    if (result.message !== API_MESSAGE.Success) {
      errorToast("Failed to delete ice breaker. Please try again.");
      return;
    }

    setConfirmDeleteOpen(false);
    onDeleted(iceBreaker);
    onOpenChange(false);
  };

  const handleSendReply = async () => {
    const trimmed = replyMessage.trim();
    if (!trimmed || !replySource || sendingReply) return;

    if (!socket || !isConnected) {
      errorToast("Not connected. Please wait and try again.");
      return;
    }

    setSendingReply(true);
    const conversation = await createConversationIfNotExistAction(
      iceBreaker.ownerNovelistId,
    );
    setSendingReply(false);

    if (!conversation || "message" in conversation) {
      errorToast("Failed to start the conversation. Please try again.");
      return;
    }

    socket.send(
      JSON.stringify({
        payload: {
          attachments: null,
          conversationId: conversation.id,
          message: replyHtml || trimmed,
          repliedTo: { id: iceBreaker.sourceId, type: "ICE_BREAKER" },
          sender: {
            id: replySource.sourceId,
            image: replySource.image,
            messageSourceType: replySource.sourceType,
            name: replySource.name,
            username: user?.username ?? "",
          },
          type: "TEXT",
        },
        type: "message",
      }),
    );

    setReplyMessage("");
    setReplyHtml("");
    onOpenChange(false);
    routeToPage(ROUTES.Conversation.View(conversation.id));
  };

  const renderReplySourceButton = (source: PromptSource) => {
    const isActive = replySource?.sourceId === source.sourceId;
    return (
      <S.IceBreakerSourceItem
        key={source.sourceId}
        type="button"
        $active={isActive}
        onClick={() => setReplySelectedSourceId(source.sourceId)}
        aria-pressed={isActive}
      >
        <span className="avatar-ring">
          <AvatarNew
            src={source.image ?? null}
            alt={source.name}
            nwImage={source.avatar}
          />
        </span>
        <span className="name">
          {truncateIceBreakerSourceName(source.name.split(" ")[0])}
        </span>
      </S.IceBreakerSourceItem>
    );
  };

  // Delete confirmation is always a centered dialog — even on mobile — since
  // it would otherwise render behind the mobile sheet's higher z-index.
  if (confirmDeleteOpen) {
    return (
      <AppAlertDialog
        heading="Delete ice breaker?"
        text="Ice breaker"
        body={
          <S.ViewIceBreakerConfirmBody>
            <S.ViewIceBreakerConfirmIcon>
              <FaRegTrashCan size={20} />
            </S.ViewIceBreakerConfirmIcon>
            <S.ViewIceBreakerConfirmText>
              Are you sure you want to delete this ice breaker? This can&apos;t
              be undone.
            </S.ViewIceBreakerConfirmText>
          </S.ViewIceBreakerConfirmBody>
        }
        open={open}
        onOpenChange={onOpenChange}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        actionButtonLabel={deleting ? "Deleting..." : "Delete"}
        actionColor="negative"
        isConfirmDisabled={deleting}
        closeButtonText="Cancel"
      />
    );
  }

  // Shared body — identical markup for the centered dialog and the bottom sheet.
  const body = (
    <div>
      <S.ViewIceBreakerHeroWrap>
        <S.ViewIceBreakerHero>
          <S.ViewIceBreakerHeroAvatarRing
            className={classNames(ringAccent.className)}
            $ringColor={ringAccent.color}
          >
            <AvatarNew
              src={iceBreaker.source.image ?? null}
              alt={iceBreaker.source.name}
              nwImage={iceBreaker.source.avatar}
            />
          </S.ViewIceBreakerHeroAvatarRing>
          <S.ViewIceBreakerName>
            {truncateIceBreakerSourceName(iceBreaker.source.name)}
          </S.ViewIceBreakerName>
        </S.ViewIceBreakerHero>

        <S.ViewIceBreakerBubbleGroup>
          <S.ViewIceBreakerBubble $color={iceBreaker.color}>
            {iceBreaker.message}
          </S.ViewIceBreakerBubble>
          <S.ViewIceBreakerMeta title={displayDate(createdOnMs)}>
            {toFormattedDate(createdOnMs)}
          </S.ViewIceBreakerMeta>
        </S.ViewIceBreakerBubbleGroup>
      </S.ViewIceBreakerHeroWrap>

      {isOwner && (
        <S.ViewIceBreakerDeleteLink
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <FaRegTrashCan size={12} />
          Delete this ice breaker
        </S.ViewIceBreakerDeleteLink>
      )}

      {!isOwner && replySources.length > 0 && (
        <S.IceBreakerSection style={{ marginTop: 20 }}>
          <S.IceBreakerSectionLabel>Reply as</S.IceBreakerSectionLabel>
          <S.IceBreakerSenderRow>
            <S.IceBreakerScrollArrow
              type="button"
              aria-label="Scroll senders left"
              onClick={() => scrollReplySenders("left")}
            >
              <BsChevronLeft size={11} />
            </S.IceBreakerScrollArrow>

            <S.IceBreakerSourceList ref={replySenderRowRef}>
              {replyNovelistSource &&
                renderReplySourceButton(replyNovelistSource)}
              <S.IceBreakerSourceDivider />
              {replyMuseSources.length > 0 ? (
                replyMuseSources.map(renderReplySourceButton)
              ) : (
                <QuickAddMuseButton onClick={quickAddReplyMuse.openAddMuse} />
              )}
            </S.IceBreakerSourceList>

            <S.IceBreakerScrollArrow
              type="button"
              aria-label="Scroll senders right"
              onClick={() => scrollReplySenders("right")}
            >
              <BsChevronRight size={11} />
            </S.IceBreakerScrollArrow>
          </S.IceBreakerSenderRow>

          {quickAddReplyMuse.addingMuse && (
            <QuickAddMuseForm
              value={quickAddReplyMuse.newMuseName}
              onChange={quickAddReplyMuse.setNewMuseName}
              onConfirm={quickAddReplyMuse.handleCreateMuse}
              onCancel={quickAddReplyMuse.cancelAddMuse}
              disabled={
                quickAddReplyMuse.creatingMuse ||
                !quickAddReplyMuse.newMuseName.trim()
              }
            />
          )}

          <S.ViewIceBreakerReplyRow>
            <S.ViewIceBreakerReplyAvatar>
              <AvatarNew
                src={replySource?.image ?? null}
                alt={replySource?.name ?? "Sender"}
                nwImage={replySource?.avatar}
              />
            </S.ViewIceBreakerReplyAvatar>
            <S.ViewIceBreakerReplyInputWrap>
              <ChatRichInput
                placeholder={`Reply as ${replySource?.name.split(" ")[0] ?? ""}...`}
                value={replyMessage}
                onChange={setReplyMessage}
                onHtmlChange={setReplyHtml}
                submitOnEnter={false}
                trailingAction={
                  <S.IceBreakerInlineSendButton
                    type="button"
                    $visible={replyMessage.trim().length > 0}
                    disabled={sendingReply}
                    title="Send"
                    onClick={handleSendReply}
                  >
                    <HiPaperAirplane size={14} />
                  </S.IceBreakerInlineSendButton>
                }
              />
            </S.ViewIceBreakerReplyInputWrap>
          </S.ViewIceBreakerReplyRow>
        </S.IceBreakerSection>
      )}
    </div>
  );

  if (!isMobile) {
    return (
      <AppAlertDialog
        heading={
          <IceBreakerTrayHeader title="Ice breaker">
            <S.IceBreakerTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Close"
              onClick={handleClose}
            >
              <BsX size={18} />
            </S.IceBreakerTrayActionButton>
          </IceBreakerTrayHeader>
        }
        text="Ice breaker"
        body={
          <S.IceBreakerDialogInlinePadding>
            {body}
          </S.IceBreakerDialogInlinePadding>
        }
        open={open}
        onOpenChange={onOpenChange}
        showConfirm={false}
        isCancelHidden
      />
    );
  }

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <SheetS.MobilePortalRoot className={classNames([accent, theme])}>
      <SheetS.MobileBackdrop
        $open={sheetOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      />
      <SheetS.MobileSheet
        $open={sheetOpen}
        onTouchStart={(e) => setStartY(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (e.changedTouches[0].clientY - startY > 50) handleClose();
        }}
      >
        <SheetS.DragHandle />
        <SheetS.MobileContent>
          <IceBreakerTrayHeader title="Ice breaker">
            <S.IceBreakerTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Close"
              onClick={handleClose}
            >
              <BsX size={18} />
            </S.IceBreakerTrayActionButton>
          </IceBreakerTrayHeader>

          {body}
        </SheetS.MobileContent>
      </SheetS.MobileSheet>
    </SheetS.MobilePortalRoot>,
    document.body,
  );
}
