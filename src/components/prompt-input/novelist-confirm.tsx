"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IoAddOutline,
  IoCheckmark,
  IoChevronForward,
  IoCloseOutline,
} from "react-icons/io5";
import { PiMaskHappyBold } from "react-icons/pi";
import { useQuickAddMuse } from "@/app/rp/conversations/quick-add-muse";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import { useGlobalState } from "@/context/store/stores";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { Muse, PromptSource } from "@/types";
import * as S from "./styles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novelistSource: PromptSource | undefined;
  hasMuseOptions: boolean;
  onPostAsNovelist: () => void;
  onSelectCharacter: () => void;
  onCharacterCreated: (muse: Muse) => void;
}

export const NovelistConfirm: FC<Props> = ({
  open,
  onOpenChange,
  novelistSource,
  hasMuseOptions,
  onPostAsNovelist,
  onSelectCharacter,
  onCharacterCreated,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const novelistName = novelistSource?.name ?? "yourself";

  const quickAddMuse = useQuickAddMuse((muse) => {
    onCharacterCreated(muse);
    onOpenChange(false);
  });

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
    if (open) openSheet();
    else closeSheet();
  }, [open]);

  useEffect(() => {
    if (!open) quickAddMuse.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const title = quickAddMuse.addingMuse
    ? "Name your character"
    : "Who's posting?";

  const handleCharacterOptionClick = () => {
    if (hasMuseOptions) {
      onOpenChange(false);
      onSelectCharacter();
    } else {
      quickAddMuse.openAddMuse();
    }
  };

  const optionsView = (
    <S.NovelistConfirmBody>
      <S.NovelistConfirmOption
        type="button"
        onClick={() => {
          onOpenChange(false);
          onPostAsNovelist();
        }}
      >
        <AvatarNew
          src={novelistSource?.image ?? null}
          alt={novelistName}
          nwImage={novelistSource?.avatar}
        />
        <S.NovelistConfirmOptionText>
          <S.NovelistConfirmOptionTitle>
            Post as yourself
          </S.NovelistConfirmOptionTitle>
          <S.NovelistConfirmOptionDesc>
            Out of character (OOC) — this post comes from you, not one of your
            characters. Characters can&apos;t reply or comment on it.
          </S.NovelistConfirmOptionDesc>
        </S.NovelistConfirmOptionText>
        <S.NovelistConfirmOptionChevron>
          <IoChevronForward size={16} />
        </S.NovelistConfirmOptionChevron>
      </S.NovelistConfirmOption>

      <S.NovelistConfirmOption
        type="button"
        onClick={handleCharacterOptionClick}
      >
        <S.NovelistConfirmOptionIcon>
          <PiMaskHappyBold />
        </S.NovelistConfirmOptionIcon>
        <S.NovelistConfirmOptionText>
          <S.NovelistConfirmOptionTitle>
            Post as a Character
          </S.NovelistConfirmOptionTitle>
          <S.NovelistConfirmOptionDesc>
            {hasMuseOptions
              ? "Stay in character — other Muses can reply and comment on this post."
              : "You don't have a character yet — create one now to post as them."}
          </S.NovelistConfirmOptionDesc>
        </S.NovelistConfirmOptionText>
        <S.NovelistConfirmOptionChevron>
          {hasMuseOptions ? (
            <IoChevronForward size={16} />
          ) : (
            <IoAddOutline size={18} />
          )}
        </S.NovelistConfirmOptionChevron>
      </S.NovelistConfirmOption>
    </S.NovelistConfirmBody>
  );

  const createView = (
    <S.NovelistConfirmCreateWrap>
      <S.NovelistConfirmOptionDesc>
        Give your character a name to post as them. You can flesh out the rest
        of their profile later.
      </S.NovelistConfirmOptionDesc>
      <S.NovelistConfirmCreateRow>
        <S.NovelistConfirmCreateInput
          autoFocus
          placeholder="Character's first name"
          value={quickAddMuse.newMuseName}
          maxLength={40}
          onChange={(e) => quickAddMuse.setNewMuseName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") quickAddMuse.handleCreateMuse();
            if (e.key === "Escape") quickAddMuse.cancelAddMuse();
          }}
        />
        <S.NovelistConfirmCreateIconButton
          type="button"
          $variant="cancel"
          aria-label="Back"
          onClick={quickAddMuse.cancelAddMuse}
        >
          <IoCloseOutline size={16} />
        </S.NovelistConfirmCreateIconButton>
        <S.NovelistConfirmCreateIconButton
          type="button"
          $variant="confirm"
          aria-label="Create character"
          disabled={
            quickAddMuse.creatingMuse || !quickAddMuse.newMuseName.trim()
          }
          onClick={quickAddMuse.handleCreateMuse}
        >
          <IoCheckmark size={18} />
        </S.NovelistConfirmCreateIconButton>
      </S.NovelistConfirmCreateRow>
    </S.NovelistConfirmCreateWrap>
  );

  const body = quickAddMuse.addingMuse ? createView : optionsView;

  if (!isMobile) {
    return (
      <AppAlertDialog
        heading={
          <S.NovelistConfirmHeaderBar>
            <S.NovelistConfirmHeaderTitle>{title}</S.NovelistConfirmHeaderTitle>
            <S.NovelistConfirmCloseButton
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <IoCloseOutline size={17} />
            </S.NovelistConfirmCloseButton>
          </S.NovelistConfirmHeaderBar>
        }
        text=""
        body={body}
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
          if (e.target === e.currentTarget) onOpenChange(false);
        }}
      />
      <SheetS.MobileSheet
        $open={sheetOpen}
        onTouchStart={(e) => setStartY(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (e.changedTouches[0].clientY - startY > 50) onOpenChange(false);
        }}
      >
        <SheetS.DragHandle />
        <SheetS.MobileContent>
          <S.NovelistConfirmHeaderBar>
            <S.NovelistConfirmHeaderTitle>{title}</S.NovelistConfirmHeaderTitle>
            <S.NovelistConfirmCloseButton
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <IoCloseOutline size={17} />
            </S.NovelistConfirmCloseButton>
          </S.NovelistConfirmHeaderBar>
          {body}
        </SheetS.MobileContent>
      </SheetS.MobileSheet>
    </SheetS.MobilePortalRoot>,
    document.body,
  );
};
