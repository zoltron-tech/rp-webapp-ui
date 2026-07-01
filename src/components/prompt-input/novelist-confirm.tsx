"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppAlertDialog } from "@/components/dialog";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import { useGlobalState } from "@/context/store/stores";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novelistName: string;
  onPostAsNovelist: () => void;
  onSelectCharacter: () => void;
}

export const NovelistConfirm: FC<Props> = ({
  open,
  onOpenChange,
  novelistName,
  onPostAsNovelist,
  onSelectCharacter,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

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
    requestAnimationFrame(() => requestAnimationFrame(() => setSheetOpen(true)));
  };

  const closeSheet = () => {
    setSheetOpen(false);
    closeTimerRef.current = setTimeout(() => setVisible(false), 300);
  };

  useEffect(() => {
    if (open) openSheet();
    else closeSheet();
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  if (!isMobile) {
    return (
      <AppAlertDialog
        heading="Who is posting?"
        text={`Post as ${novelistName} or select a Character?`}
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={() => {
          onOpenChange(false);
          onPostAsNovelist();
        }}
        onCancel={onSelectCharacter}
        actionButtonLabel={`Post as ${novelistName}`}
        closeButtonText="Select a Character"
        actionColor="neutral"
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
          <SheetS.MobileHeaderRow>
            <span
              style={{
                fontWeight: 600,
                fontSize: "var(--font-size-input)",
                color: "var(--text)",
              }}
            >
              Who is posting?
            </span>
          </SheetS.MobileHeaderRow>
          <SheetS.MobileItem
            onClick={() => {
              onOpenChange(false);
              onPostAsNovelist();
            }}
          >
            Post as {novelistName}
          </SheetS.MobileItem>
          <SheetS.MobileSeparator />
          <SheetS.MobileItem
            onClick={() => {
              onOpenChange(false);
              onSelectCharacter();
            }}
          >
            Select a Character
          </SheetS.MobileItem>
        </SheetS.MobileContent>
      </SheetS.MobileSheet>
    </SheetS.MobilePortalRoot>,
    document.body,
  );
};
