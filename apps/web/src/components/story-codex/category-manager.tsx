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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CodexCategory } from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { GrEdit } from "react-icons/gr";
import { RxDragHandleDots2 } from "react-icons/rx";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { resolveCodexIcon } from "./icons";
import * as S from "./styles";

type RowProps = {
  category: CodexCategory & { id: string };
  entryCount: number;
  onEdit: (category: CodexCategory) => void;
};

const SortableCategoryRow: FC<RowProps> = ({
  category,
  entryCount,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });
  const Icon = resolveCodexIcon(category.icon);

  return (
    <S.ManagerRow
      ref={setNodeRef}
      $dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <S.DragHandle
        type="button"
        aria-label={`Drag to reorder ${category.name}`}
        {...attributes}
        {...listeners}
      >
        <RxDragHandleDots2 size={18} />
      </S.DragHandle>
      <Icon size={15} style={{ flexShrink: 0 }} />
      <S.ManagerName>{category.name}</S.ManagerName>
      <S.ManagerCount>
        {entryCount}{" "}
        <span className="unit">{entryCount === 1 ? "entry" : "entries"}</span>
      </S.ManagerCount>
      <S.RowAction
        type="button"
        aria-label={`Edit ${category.name}`}
        title="Edit category"
        onClick={() => onEdit(category)}
      >
        <GrEdit size={13} />
      </S.RowAction>
    </S.ManagerRow>
  );
};

type Props = {
  open: boolean;
  categories: CodexCategory[];
  /** Entries per category id, so a row can show what deleting would strand. */
  entryCounts: Record<string, number>;
  onClose: () => void;
  /** Fired on confirm with the full new order; the backend is called once. */
  onReorder: (orderedCategoryIds: string[]) => void;
  onEditCategory: (category: CodexCategory) => void;
};

/**
 * Drag-to-reorder the codex tabs. Dragging only restages the order locally —
 * the reorder endpoint is called once, on confirm, exactly like the chapter
 * reorder.
 */
export const CategoryManager: FC<Props> = ({
  open,
  categories,
  entryCounts,
  onClose,
  onReorder,
  onEditCategory,
}) => {
  const [ordered, setOrdered] = useState<CodexCategory[]>(categories);

  // Re-seed from the saved order every time the sheet opens.
  useEffect(() => {
    if (open) setOrdered(categories);
  }, [open, categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrdered((current) => {
      const from = current.findIndex((c) => c.id === active.id);
      const to = current.findIndex((c) => c.id === over.id);
      if (from < 0 || to < 0) return current;
      return arrayMove(current, from, to);
    });
  };

  const rows = ordered.filter(
    (category): category is CodexCategory & { id: string } =>
      category.id !== null,
  );

  return (
    <ResponsiveSheet
      open={open}
      title="Categories"
      onConfirm={() => onReorder(rows.map((category) => category.id))}
      onClose={onClose}
    >
      <F.Hint>
        Drag to reorder the tabs. Renaming and deleting live on each row — a
        category can only be deleted once it is empty.
      </F.Hint>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rows.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((category) => (
              <SortableCategoryRow
                key={category.id}
                category={category}
                entryCount={entryCounts[category.id] ?? 0}
                onEdit={onEditCategory}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </ResponsiveSheet>
  );
};
