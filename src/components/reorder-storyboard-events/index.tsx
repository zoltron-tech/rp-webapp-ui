"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { StoryBoardEvent } from "@nw/types";
import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { reorderStoryBoardEventsAction } from "@/app/rp/story/actions";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import * as O from "./overlay.styled";
import { SortableEventRow } from "./sortable-event-row";
import * as S from "./styles";

type Props = {
  open: boolean;
  storyboardId: string;
  events: StoryBoardEvent[];
  onClose: () => void;
  onReordered: (events: StoryBoardEvent[]) => void;
};

/**
 * Vertical drag-to-reorder list for a story's chapters — a centered dialog on
 * desktop and a slide-up tray on mobile, fully separate from the chapter
 * cards' own hover-preview dialog / tray so dragging never conflicts with
 * that existing interaction. Dragging only restages the order locally; the
 * backend is only called once, when the user confirms with "Done".
 */
export const ReorderStoryboardEventsOverlay: FC<Props> = ({
  open,
  storyboardId,
  events,
  onClose,
  onReordered,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { errorToast } = useUIContext();

  // Keep the tray/dialog mounted through its exit animation.
  const [visible, setVisible] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [startY, setStartY] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [orderedEvents, setOrderedEvents] = useState<StoryBoardEvent[]>(events);
  const [saving, setSaving] = useState(false);

  // Re-seed from the latest saved order every time the overlay opens.
  useEffect(() => {
    if (open) setOrderedEvents(events);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const isDirty = orderedEvents.some(
    (event, index) => event.id !== events[index]?.id,
  );

  // Discard any staged (unsaved) drag and close.
  const handleCancel = () => {
    setOrderedEvents(events);
    onClose();
  };

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Mouse via PointerSensor; a short hold-delay + tolerance on TouchSensor so
  // dragging doesn't fight the tray's vertical scroll; KeyboardSensor gives
  // arrow-key reordering for free.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Local-only: just restages the order in state, no backend call.
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedEvents.findIndex((ev) => ev.id === active.id);
    const newIndex = orderedEvents.findIndex((ev) => ev.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setOrderedEvents(arrayMove(orderedEvents, oldIndex, newIndex));
  };

  const handleDone = async () => {
    if (!isDirty) {
      onClose();
      return;
    }

    const orderedEventIds = orderedEvents
      .map((event) => event.id)
      .filter((id): id is string => Boolean(id));

    setSaving(true);
    const response = await reorderStoryBoardEventsAction(
      storyboardId,
      orderedEventIds,
    );
    setSaving(false);

    if (!response || "message" in response) {
      errorToast("Could not reorder chapters. Please try again.");
      return;
    }

    onReordered(response);
    onClose();
  };

  if (!visible || typeof document === "undefined") return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) handleCancel();
  };

  const body = (
    <>
      <S.Header>
        <S.HeaderText>
          <S.Heading>Reorder chapters</S.Heading>
          <S.SubHeading>Drag a chapter to change its position</S.SubHeading>
        </S.HeaderText>
        <S.CloseButton type="button" aria-label="Close" onClick={handleCancel}>
          <FiX size={18} />
        </S.CloseButton>
      </S.Header>
      {orderedEvents.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedEvents.map((ev) => ev.id ?? "")}
            strategy={verticalListSortingStrategy}
          >
            <S.ListContainer>
              {orderedEvents.map((event) =>
                event.id ? (
                  <SortableEventRow
                    key={event.id}
                    event={event as StoryBoardEvent & { id: string }}
                  />
                ) : null,
              )}
            </S.ListContainer>
          </SortableContext>
        </DndContext>
      ) : (
        <S.EmptyText>No chapters yet.</S.EmptyText>
      )}
      <S.Footer>
        <S.CancelButton type="button" onClick={handleCancel} disabled={saving}>
          Cancel
        </S.CancelButton>
        <S.DoneButton type="button" onClick={handleDone} disabled={saving}>
          {saving ? "Saving..." : "Done"}
        </S.DoneButton>
      </S.Footer>
    </>
  );

  return createPortal(
    <O.PortalRoot className={classNames([accent, theme])}>
      {isMobile ? (
        <>
          <O.MobileBackdrop $open={animateOpen} onClick={handleCancel} />
          <O.MobileSheet $open={animateOpen}>
            <O.DragArea
              onClick={handleCancel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <O.DragHandle />
            </O.DragArea>
            <O.MobileScroll>{body}</O.MobileScroll>
          </O.MobileSheet>
        </>
      ) : (
        <>
          <O.DesktopBackdrop onClick={handleCancel} />
          <O.DesktopPanel
            role="dialog"
            aria-modal="true"
            aria-label="Reorder chapters"
          >
            {body}
          </O.DesktopPanel>
        </>
      )}
    </O.PortalRoot>,
    document.body,
  );
};

export default ReorderStoryboardEventsOverlay;
