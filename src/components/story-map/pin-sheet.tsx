"use client";

import { type FC, useEffect, useMemo, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { resolveCodexIcon } from "@/components/story-codex/icons";
import type {
  CodexCategory,
  CodexEntry,
  StoryBoardEvent,
  StoryMapPin,
} from "@/types";
import * as S from "./styles";

type Props = {
  open: boolean;
  /** Null while placing a brand-new pin at `pendingPoint`. */
  pin: StoryMapPin | null;
  /** Where a new pin was dropped, in image percentages. */
  pendingPoint: { x: number; y: number } | null;
  codexEntries: CodexEntry[];
  codexCategories: CodexCategory[];
  chapters: StoryBoardEvent[];
  canEdit: boolean;
  onClose: () => void;
  onSave: (pin: StoryMapPin) => void;
  onDelete?: (pin: StoryMapPin) => void;
  onOpenChapter: (chapterId: string) => void;
};

/**
 * What a pin points at: a codex entry (its name and description come from
 * there) or a free label. On mobile this is also where a pin's detail is read,
 * since there is no room for the desktop side panel.
 */
export const PinSheet: FC<Props> = ({
  open,
  pin,
  pendingPoint,
  codexEntries,
  codexCategories,
  chapters,
  canEdit,
  onClose,
  onSave,
  onDelete,
  onOpenChapter,
}) => {
  const [codexEntryId, setCodexEntryId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setCodexEntryId(pin?.codexEntryId ?? null);
    setLabel(pin?.label ?? "");
    setQuery("");
  }, [open, pin]);

  const categoriesById = useMemo(() => {
    const map = new Map<string, CodexCategory>();
    for (const category of codexCategories) {
      if (category.id) map.set(category.id, category);
    }
    return map;
  }, [codexCategories]);

  /**
   * Places first — a pin on a map is nearly always a place, so the category
   * whose entries are most likely wanted leads the list.
   */
  const ranked = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const placesId = codexCategories.find(
      (category) => category.name.toLowerCase() === "places",
    )?.id;
    return codexEntries
      .filter((entry) => !needle || entry.name.toLowerCase().includes(needle))
      .sort((a, b) => {
        const aPlaces = a.categoryId === placesId ? 0 : 1;
        const bPlaces = b.categoryId === placesId ? 0 : 1;
        if (aPlaces !== bPlaces) return aPlaces - bPlaces;
        return a.name.localeCompare(b.name);
      });
  }, [codexEntries, codexCategories, query]);

  const selectedEntry =
    codexEntries.find((entry) => entry.id === codexEntryId) ?? null;

  const trimmedLabel = label.trim();
  // A pin has to be identifiable: a codex entry, or a label of its own.
  const canSave = Boolean(codexEntryId) || trimmedLabel.length > 0;

  const point = pin ? { x: pin.x, y: pin.y } : pendingPoint;

  return (
    <ResponsiveSheet
      open={open}
      title={pin ? "Pin" : "New pin"}
      confirmDisabled={!canSave}
      onConfirm={
        canEdit && point
          ? () =>
              onSave({
                codexEntryId,
                id: pin?.id ?? null,
                // A codex-backed pin needs no label of its own; the entry
                // supplies the name, and stays the single source of it.
                label: codexEntryId ? null : trimmedLabel,
                x: point.x,
                y: point.y,
              })
          : undefined
      }
      onClose={onClose}
    >
      {!canEdit ? (
        <>
          <F.NoteRow>
            <b>{selectedEntry?.name ?? pin?.label ?? "Unnamed"}</b>
            {selectedEntry?.categoryId && (
              <span>{categoriesById.get(selectedEntry.categoryId)?.name}</span>
            )}
          </F.NoteRow>
          {selectedEntry?.chapterIds.length ? (
            <S.ChapterRow>
              Used in
              {selectedEntry.chapterIds.map((chapterId) => {
                const chapter = chapters.find((c) => c.id === chapterId);
                if (!chapter) return null;
                return (
                  <S.ChapterChip
                    key={chapterId}
                    type="button"
                    onClick={() => onOpenChapter(chapterId)}
                  >
                    {chapter.name}
                  </S.ChapterChip>
                );
              })}
            </S.ChapterRow>
          ) : null}
        </>
      ) : (
        <>
          <F.Field as="div">
            Codex entry
            <F.TextInput
              value={query}
              placeholder="Search places, items, lore…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </F.Field>

          <S.PickerList>
            <S.PickerItem
              type="button"
              $active={codexEntryId === null}
              onClick={() => setCodexEntryId(null)}
            >
              Just a label
              <span className="category">no codex entry</span>
            </S.PickerItem>
            {ranked.map((entry) => {
              const Icon = resolveCodexIcon(entry.icon);
              return (
                <S.PickerItem
                  key={entry.id}
                  type="button"
                  $active={codexEntryId === entry.id}
                  onClick={() => setCodexEntryId(entry.id)}
                >
                  <Icon size={15} style={{ color: entry.color ?? undefined }} />
                  {entry.name}
                  <span className="category">
                    {categoriesById.get(entry.categoryId)?.name}
                  </span>
                </S.PickerItem>
              );
            })}
            {ranked.length === 0 && (
              <F.Hint>
                Nothing in the codex matches. Add it to the codex first, or pin
                it with a label of its own.
              </F.Hint>
            )}
          </S.PickerList>

          {codexEntryId === null && (
            <F.Field>
              Label
              <F.TextInput
                value={label}
                maxLength={60}
                placeholder="The old harbour"
                onChange={(e) => setLabel(e.target.value)}
              />
            </F.Field>
          )}

          {pin && onDelete && (
            <F.DangerButton type="button" onClick={() => onDelete(pin)}>
              <FaRegTrashCan size={13} />
              Remove pin
            </F.DangerButton>
          )}
        </>
      )}
    </ResponsiveSheet>
  );
};
