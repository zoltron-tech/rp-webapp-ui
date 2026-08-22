"use client";

import type { IceBreaker, Novelist, PromptSource } from "@nw/types";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsChevronLeft, BsChevronRight, BsX } from "react-icons/bs";
import { HiPaperAirplane } from "react-icons/hi2";
import { IoCheckmark } from "react-icons/io5";
import { ChatRichInput } from "@/components/chat-rich-input";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import {
  museToSource,
  novelistToSource,
} from "@/components/prompt-input/helpers";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import { createIceBreakerAction } from "./actions";
import {
  htmlToIceBreakerMarkdown,
  truncateIceBreakerSourceName,
} from "./ice-breaker-helpers";
import { IceBreakerTrayHeader } from "./ice-breaker-tray-header";
import {
  QuickAddMuseButton,
  QuickAddMuseForm,
  useQuickAddMuse,
} from "./quick-add-muse";
import * as S from "./styles";

const MAX_MESSAGE_LENGTH = 160;

const ICE_BREAKER_COLORS = [
  "#8b3a3a", // crimson
  "#a0522d", // sienna
  "#8b6914", // goldenrod
  "#2d6e45", // forest green
  "#1e6b63", // deep teal
  "#1a5276", // ocean blue
  "#4a3f8f", // indigo
  "#8b2d6b", // plum
] as const;

type CreateIceBreakerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novelist: Novelist | null | undefined;
  /** Called with the freshly created ice breaker after a successful create. */
  onCreated: (iceBreaker: IceBreaker) => void;
};

export function CreateIceBreakerDialog({
  open,
  onOpenChange,
  novelist,
  onCreated,
}: CreateIceBreakerDialogProps) {
  const { errorToast } = useUIContext();
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [message, setMessage] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [messageFocused, setMessageFocused] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const senderRowRef = useRef<HTMLDivElement>(null);

  const novelistSource = useMemo<PromptSource | null>(
    () => (novelist ? novelistToSource(novelist) : null),
    [novelist],
  );
  const museSources = useMemo<PromptSource[]>(
    () => (novelist?.muses ?? []).map(museToSource),
    [novelist],
  );
  const sources = useMemo<PromptSource[]>(
    () => (novelistSource ? [novelistSource, ...museSources] : museSources),
    [novelistSource, museSources],
  );

  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(
    sources[0]?.sourceId,
  );

  const selectedSource =
    sources.find((s) => s.sourceId === selectedSourceId) ?? sources[0];

  const quickAddMuse = useQuickAddMuse((muse) => {
    setSelectedSourceId(muse.id ?? undefined);
  });

  const scrollSenders = (dir: "left" | "right") => {
    senderRowRef.current?.scrollBy({
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
  // ── /Mobile sheet open/close animation ─────────────────────────────────────

  const reset = () => {
    setMessage("");
    setMessageHtml("");
    setColor(null);
    setSelectedSourceId(sources[0]?.sourceId);
    quickAddMuse.reset();
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      errorToast("Ice breaker message must not be blank.");
      return;
    }
    if (!selectedSource) {
      errorToast("Select a sender for the ice breaker.");
      return;
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      errorToast(
        `Ice breaker message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      );
      return;
    }

    // The composer live-converts typed **bold**/*italic* into <strong>/<em>
    // (same as ChatRichInput does for a reply), so flatten it back to plain
    // markdown text before saving — ice breakers are stored as plain text.
    const finalMessage =
      htmlToIceBreakerMarkdown(messageHtml).trim() || trimmedMessage;

    setLoading(true);
    const result = await createIceBreakerAction(
      selectedSource.sourceId,
      selectedSource.sourceType,
      finalMessage,
      color,
    );
    setLoading(false);

    if (result.message !== API_MESSAGE.Success) {
      errorToast("Failed to create ice breaker. Please try again.");
      return;
    }

    onCreated({
      color,
      createdOn: new Date().toISOString(),
      message: finalMessage,
      ownerNovelistId: novelist?.id ?? "",
      source: selectedSource,
      sourceId: selectedSource.sourceId,
    });

    reset();
    onOpenChange(false);
  };

  const isConfirmDisabled =
    loading ||
    !message.trim() ||
    message.trim().length > MAX_MESSAGE_LENGTH ||
    !selectedSource;
  const remaining = MAX_MESSAGE_LENGTH - message.length;

  const renderSourceButton = (source: PromptSource) => {
    const isActive = selectedSource?.sourceId === source.sourceId;
    return (
      <S.IceBreakerSourceItem
        key={source.sourceId}
        type="button"
        $active={isActive}
        onClick={() => setSelectedSourceId(source.sourceId)}
        aria-pressed={isActive}
      >
        <span className="avatar-ring">
          <AvatarNew
            src={source.image ?? null}
            alt={source.name}
            nwImage={source.avatar}
          />
        </span>
        {isActive && (
          <span className="check-badge">
            <IoCheckmark size={9} />
          </span>
        )}
        <span className="name">
          {truncateIceBreakerSourceName(source.name.split(" ")[0])}
        </span>
      </S.IceBreakerSourceItem>
    );
  };

  // Shared body — identical markup for the centered dialog and the bottom sheet.
  const body = (
    <S.IceBreakerDialogBody>
      <S.IceBreakerSection>
        <S.IceBreakerSectionLabel>Who's sending this?</S.IceBreakerSectionLabel>
        <S.IceBreakerSenderRow>
          <S.IceBreakerScrollArrow
            type="button"
            aria-label="Scroll senders left"
            onClick={() => scrollSenders("left")}
          >
            <BsChevronLeft size={11} />
          </S.IceBreakerScrollArrow>

          <S.IceBreakerSourceList ref={senderRowRef}>
            {novelistSource && renderSourceButton(novelistSource)}
            <S.IceBreakerSourceDivider />
            {museSources.length > 0 ? (
              museSources.map(renderSourceButton)
            ) : (
              <QuickAddMuseButton onClick={quickAddMuse.openAddMuse} />
            )}
          </S.IceBreakerSourceList>

          <S.IceBreakerScrollArrow
            type="button"
            aria-label="Scroll senders right"
            onClick={() => scrollSenders("right")}
          >
            <BsChevronRight size={11} />
          </S.IceBreakerScrollArrow>
        </S.IceBreakerSenderRow>

        {quickAddMuse.addingMuse && (
          <QuickAddMuseForm
            value={quickAddMuse.newMuseName}
            onChange={quickAddMuse.setNewMuseName}
            onConfirm={quickAddMuse.handleCreateMuse}
            onCancel={quickAddMuse.cancelAddMuse}
            disabled={
              quickAddMuse.creatingMuse || !quickAddMuse.newMuseName.trim()
            }
          />
        )}
      </S.IceBreakerSection>

      <S.IceBreakerSection>
        <S.IceBreakerSectionLabel>Ice breaker message</S.IceBreakerSectionLabel>
        <S.IceBreakerMessageBubble
          $focused={messageFocused}
          $color={color}
          onFocus={() => setMessageFocused(true)}
          onBlur={() => setMessageFocused(false)}
        >
          <ChatRichInput
            bare
            placeholder="Say something to break the ice..."
            value={message}
            onChange={setMessage}
            onHtmlChange={setMessageHtml}
            submitOnEnter={false}
          />
          <S.IceBreakerInlineSendButton
            type="button"
            style={{ bottom: 8, position: "absolute", right: 10 }}
            $visible={message.trim().length > 0}
            disabled={isConfirmDisabled}
            title="Create"
            onClick={handleConfirm}
          >
            <HiPaperAirplane size={14} />
          </S.IceBreakerInlineSendButton>
        </S.IceBreakerMessageBubble>
        <S.IceBreakerCharCount className={remaining <= 20 ? "warn" : undefined}>
          {message.length} / {MAX_MESSAGE_LENGTH}
        </S.IceBreakerCharCount>
      </S.IceBreakerSection>

      <S.IceBreakerSection>
        <S.IceBreakerSectionLabel>Bubble color</S.IceBreakerSectionLabel>
        <S.IceBreakerColorRow>
          <S.IceBreakerNoColorSwatch
            type="button"
            $active={color === null}
            onClick={() => setColor(null)}
            aria-label="No color"
            title="Default color"
          />
          {ICE_BREAKER_COLORS.map((c) => (
            <S.IceBreakerColorSwatch
              key={c}
              type="button"
              $color={c}
              $active={color === c}
              onClick={() => setColor(color === c ? null : c)}
              aria-label={`Bubble color ${c}`}
            />
          ))}
        </S.IceBreakerColorRow>
      </S.IceBreakerSection>
    </S.IceBreakerDialogBody>
  );

  if (!isMobile) {
    return (
      <AppAlertDialog
        heading={
          <IceBreakerTrayHeader title="What's on your mind?">
            <S.IceBreakerTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Cancel"
              onClick={handleCancel}
            >
              <BsX size={18} />
            </S.IceBreakerTrayActionButton>
          </IceBreakerTrayHeader>
        }
        text="What's on your mind?"
        body={
          <S.IceBreakerDialogInlinePadding>
            {body}
          </S.IceBreakerDialogInlinePadding>
        }
        open={open}
        onOpenChange={(next) => {
          if (!next) reset();
          onOpenChange(next);
        }}
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
          if (e.target === e.currentTarget) handleCancel();
        }}
      />
      <SheetS.MobileSheet
        $open={sheetOpen}
        onTouchStart={(e) => setStartY(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (e.changedTouches[0].clientY - startY > 50) handleCancel();
        }}
      >
        <SheetS.DragHandle />
        <SheetS.MobileContent>
          <IceBreakerTrayHeader title="What's on your mind?">
            <S.IceBreakerTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Cancel"
              onClick={handleCancel}
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
