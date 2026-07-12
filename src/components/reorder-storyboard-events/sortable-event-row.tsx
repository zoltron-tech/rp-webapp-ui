"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FC } from "react";
import { RxDragHandleDots2 } from "react-icons/rx";
import { CoverImage } from "@/components/common";
import type { StoryBoardEvent } from "@/types";
import * as S from "./styles";

type Props = {
  /** Only persisted events (non-null id) ever appear in the reorder list. */
  event: StoryBoardEvent & { id: string };
};

export const SortableEventRow: FC<Props> = ({ event }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <S.Row ref={setNodeRef} style={style} $dragging={isDragging}>
      <S.Thumbnail>
        <CoverImage src={event.image} nwImage={event.avatar} />
      </S.Thumbnail>
      <S.Title>{event.name}</S.Title>
      <S.DragHandleButton
        type="button"
        aria-label={`Drag to reorder ${event.name}`}
        {...attributes}
        {...listeners}
      >
        <RxDragHandleDots2 size={20} />
      </S.DragHandleButton>
    </S.Row>
  );
};

export default SortableEventRow;
