"use client";

import type { StoryBoardEvent } from "@nw/types";
import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGlobalState } from "@/context/store/stores";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { EditStoryboardEventDataCardHandle } from "./edit-storyboard-event-data-card";
import { EditStoryboardEventForm } from "./index";
import * as O from "./overlay.styled";

type Props = {
  open: boolean;
  storyboardId: string;
  /** Omit / null to create a new chapter; set to edit an existing one. */
  storyboardEventId?: string | null;
  onClose: () => void;
  onSaved: (event: StoryBoardEvent) => void;
};

/**
 * Renders the chapter create/edit form in place on the story page — a centered
 * dialog on desktop and a slide-up tray on mobile — instead of routing away.
 */
export const EditStoryboardEventOverlay: FC<Props> = ({
  open,
  storyboardId,
  storyboardEventId,
  onClose,
  onSaved,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;

  const formRef = useRef<EditStoryboardEventDataCardHandle | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the tray mounted through its exit animation.
  const [visible, setVisible] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateOpen(true));
      });
    } else if (visible) {
      setAnimateOpen(false);
      closeTimerRef.current = setTimeout(() => setVisible(false), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Lock background scroll while the overlay is showing.
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  // Route dismissals through the form so unsaved changes prompt to discard.
  const requestClose = () => {
    if (formRef.current) {
      formRef.current.requestClose();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible || typeof document === "undefined") return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) requestClose();
  };

  const form = (
    <EditStoryboardEventForm
      key={storyboardEventId ?? "new"}
      ref={formRef}
      embedded
      storyboardId={storyboardId}
      storyboardEventId={storyboardEventId ?? undefined}
      onClose={onClose}
      onSaved={onSaved}
    />
  );

  return createPortal(
    <O.PortalRoot className={classNames([accent, theme])}>
      {isMobile ? (
        <>
          <O.MobileBackdrop $open={animateOpen} onClick={requestClose} />
          <O.MobileSheet $open={animateOpen}>
            <O.DragArea
              onClick={requestClose}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <O.DragHandle />
            </O.DragArea>
            <O.MobileScroll>{form}</O.MobileScroll>
          </O.MobileSheet>
        </>
      ) : (
        <>
          <O.DesktopBackdrop onClick={requestClose} />
          <O.DesktopPanel
            role="dialog"
            aria-modal="true"
            aria-label={storyboardEventId ? "Edit chapter" : "Create a chapter"}
          >
            {form}
          </O.DesktopPanel>
        </>
      )}
    </O.PortalRoot>,
    document.body,
  );
};

export default EditStoryboardEventOverlay;
