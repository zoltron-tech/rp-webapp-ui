"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

type Variant = "bordered" | "minimal";

interface DropdownItem {
  label?: string;
  onClick?: () => void;
  variant?: "default" | "positive" | "danger";
  separator?: boolean;
  icon?: React.ReactNode;
}

interface AppDropdownMenuMobileProps {
  items: DropdownItem[];
  trigger: React.ReactNode;
  showUnread?: boolean;
  variant?: Variant;
  headerContent?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AppDropdownMenuMobile: FC<AppDropdownMenuMobileProps> = ({
  items,
  trigger,
  showUnread,
  variant = "minimal",
  headerContent,
  open: controlledOpen,
  onOpenChange,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSheet = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setVisible(true);
    // Double rAF ensures the closed state paints before transitioning open,
    // so the slide-up animation runs instead of snapping into place.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpen(true));
    });
  };

  const closeSheet = () => {
    setOpen(false);
    // Unmount after slide-down animation (300ms) completes
    closeTimerRef.current = setTimeout(() => setVisible(false), 300);
  };

  const handleOpen = () => {
    onOpenChange?.(true);
    if (controlledOpen === undefined) openSheet();
  };

  const handleClose = () => {
    onOpenChange?.(false);
    if (controlledOpen === undefined) closeSheet();
  };

  // Drive the sheet from the controlled `open` prop when provided.
  useEffect(() => {
    if (controlledOpen === undefined) return;
    if (controlledOpen) openSheet();
    else closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle touch start for swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  // Handle touch end for swipe down
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY;

    // If swiped down more than 50px, close the sheet
    if (diff > 50) {
      handleClose();
    }
  };

  // Close when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [open]);

  return (
    <>
      <S.TriggerWrapper>
        <S.TriggerButton className={classNames([variant])} onClick={handleOpen}>
          {trigger}
        </S.TriggerButton>
        {showUnread && <S.ActionBadge />}
      </S.TriggerWrapper>

      {/* Portaled to body so the fixed sheet anchors to the viewport (escaping
          any transformed / container-type ancestor) and so the accent + theme
          CSS variables (e.g. --bg-2) resolve regardless of where it's used. */}
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <S.MobilePortalRoot className={classNames([accent, theme])}>
            <S.MobileBackdrop $open={open} onClick={handleBackdropClick} />

            <S.MobileSheet
              ref={sheetRef}
              $open={open}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Drag Handle */}
              <S.DragHandle />

              {/* Content */}
              <S.MobileContent>
                {headerContent ? (
                  <S.MobileHeaderRow onClick={handleClose}>
                    {headerContent}
                  </S.MobileHeaderRow>
                ) : null}
                {items.map((item, i) =>
                  item.separator ? (
                    <S.MobileSeparator key={`sep-${i}`} />
                  ) : (
                    <S.MobileItem
                      key={i}
                      onClick={() => {
                        item.onClick?.();
                        handleClose();
                      }}
                      data-variant={item.variant || "default"}
                    >
                      {item.icon && <S.ItemIcon>{item.icon}</S.ItemIcon>}
                      {item.label}
                    </S.MobileItem>
                  ),
                )}
              </S.MobileContent>
            </S.MobileSheet>
          </S.MobilePortalRoot>,
          document.body,
        )}
    </>
  );
};
