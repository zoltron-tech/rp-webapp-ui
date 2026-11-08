"use client";

import {
  canDeleteIceBreaker,
  isOwnIceBreaker,
  isReadingBreaker,
} from "@nw/chat";
import type { IceBreaker, Novelist, PromptSource } from "@nw/types";
import { bookCoverUrl } from "@nw/types/books";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsChevronLeft, BsChevronRight, BsX } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiPaperAirplane } from "react-icons/hi2";
import { IoBookOutline } from "react-icons/io5";
import { ChatRichInput } from "@/components/chat-rich-input";
import { AvatarNew } from "@/components/common/avatar-new";
import { SheetSpinner } from "@/components/common/responsive-sheet/styles";
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
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { encryptMessageText } from "@/utils/e2e-crypto";
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
  // Guards a second tap that lands before the `sendingReply` re-render.
  const sendingReplyRef = useRef(false);
  const replySenderRowRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const replyNovelistSource = useMemo<PromptSource | null>(
    () => (novelist ? novelistToSource(novelist) : null),
    [novelist],
  );
  const replyMuseSources = useMemo<PromptSource[]>(
    () => (novelist?.muses ?? []).map(museToSource),
    [novelist],
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
  // Where a swipe-to-close began; null when it began in the body (the reply
  // field, the pickers), which must never dismiss the draft.
  const dragStartYRef = useRef<number | null>(null);
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

  const isOwner = isOwnIceBreaker(iceBreaker, novelist);
  // A reading entry has no delete: it follows the book's shelf status.
  const canDelete = canDeleteIceBreaker(iceBreaker, novelist);
  const reading = isReadingBreaker(iceBreaker);

  const ringAccent = getSourceRingAccent(iceBreaker.source);
  const createdOnMs = parseIceBreakerTimestamp(iceBreaker.createdOn);
  const handleClose = () => onOpenChange(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const result = await deleteIceBreakerAction(iceBreaker.sourceId).catch(
      () => null,
    );
    setDeleting(false);

    if (result?.message !== API_MESSAGE.Success) {
      errorToast("Failed to delete ice breaker. Please try again.");
      // Back to the ice breaker; the confirm never lingers after a try.
      setConfirmDeleteOpen(false);
      return;
    }

    setConfirmDeleteOpen(false);
    onDeleted(iceBreaker);
    onOpenChange(false);
  };

  const handleSendReply = async () => {
    const trimmed = replyMessage.trim();
    if (!trimmed || !replySource || sendingReplyRef.current) return;

    if (!socket || !isConnected) {
      errorToast("Not connected. Please wait and try again.");
      return;
    }

    // Busy until the reply is fully sent (conversation, encryption, socket),
    // so a second tap can't send it twice.
    sendingReplyRef.current = true;
    setSendingReply(true);
    try {
      const conversation = await createConversationIfNotExistAction(
        iceBreaker.ownerNovelistId,
      ).catch(() => null);

      if (!conversation || "message" in conversation) {
        errorToast("Failed to start the conversation. Please try again.");
        return;
      }

      const wireText = await encryptMessageText(
        conversation.id,
        replyHtml || trimmed,
      );

      socket.send(
        JSON.stringify({
          payload: {
            attachments: null,
            conversationId: conversation.id,
            message: wireText,
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
    } catch {
      errorToast("Failed to send your reply. Please try again.");
    } finally {
      sendingReplyRef.current = false;
      setSendingReply(false);
    }
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
        // Escape / overlay / Cancel step back to the ice breaker; they never
        // close it from here, and wait while the delete is in flight.
        onOpenChange={(next) => {
          if (!next && !deleting) setConfirmDeleteOpen(false);
        }}
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
    <div ref={bodyRef}>
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
          {reading && iceBreaker.book ? (
            <S.ViewReadingCard>
              {iceBreaker.book.coverId && (
                <img src={bookCoverUrl(iceBreaker.book.coverId, "M")} alt="" />
              )}
              <S.ViewReadingText>
                <small>
                  <IoBookOutline size={11} />
                  Currently reading
                </small>
                <strong>{iceBreaker.book.title}</strong>
                {iceBreaker.book.authors[0] && (
                  <span>by {iceBreaker.book.authors[0]}</span>
                )}
              </S.ViewReadingText>
            </S.ViewReadingCard>
          ) : (
            <S.ViewIceBreakerBubble $color={iceBreaker.color}>
              {iceBreaker.message}
            </S.ViewIceBreakerBubble>
          )}
          <S.ViewIceBreakerMeta title={displayDate(createdOnMs)}>
            {toFormattedDate(createdOnMs)}
          </S.ViewIceBreakerMeta>
        </S.ViewIceBreakerBubbleGroup>
      </S.ViewIceBreakerHeroWrap>

      {isOwner && reading && (
        <S.ViewReadingOwnerNote>
          <IoBookOutline size={12} />
          From your bookshelf — it stays here while the book is marked Reading.
        </S.ViewReadingOwnerNote>
      )}

      {canDelete && (
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
                    aria-busy={sendingReply}
                    title="Send"
                    onClick={handleSendReply}
                  >
                    {sendingReply ? (
                      <SheetSpinner aria-hidden />
                    ) : (
                      <HiPaperAirplane size={14} />
                    )}
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
          <IceBreakerTrayHeader title={reading ? "Reading" : "Ice breaker"}>
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
        // Swipe-to-close only from the handle / header, never from the body.
        onTouchStart={(e) => {
          dragStartYRef.current = bodyRef.current?.contains(e.target as Node)
            ? null
            : e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const start = dragStartYRef.current;
          dragStartYRef.current = null;
          if (start !== null && e.changedTouches[0].clientY - start > 50) {
            handleClose();
          }
        }}
      >
        <SheetS.DragHandle />
        <SheetS.MobileContent>
          <IceBreakerTrayHeader title={reading ? "Reading" : "Ice breaker"}>
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
