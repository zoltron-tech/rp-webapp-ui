"use client";

import type { CodexCategory } from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { CODEX_ICON_KEYS, DEFAULT_CODEX_ICON, resolveCodexIcon } from "./icons";

type Props = {
  open: boolean;
  /** Null when creating a new category. */
  category: CodexCategory | null;
  /** How many entries the category holds — it can only be deleted at zero. */
  entryCount: number;
  onClose: () => void;
  onSave: (category: CodexCategory) => unknown;
  onDelete?: (category: CodexCategory) => unknown;
};

/** Create/rename/re-icon one codex category, and delete it once it's empty. */
export const CategorySheet: FC<Props> = ({
  open,
  category,
  entryCount,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(DEFAULT_CODEX_ICON);
  // Held while a delete is in flight: no second delete, no save, no closing.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category || !onDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(category);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setIcon(category?.icon ?? DEFAULT_CODEX_ICON);
  }, [open, category]);

  const trimmed = name.trim();

  return (
    <ResponsiveSheet
      open={open}
      title={category ? "Edit category" : "New category"}
      confirmDisabled={trimmed.length === 0 || deleting}
      onConfirm={() =>
        onSave({
          icon,
          id: category?.id ?? null,
          isSystem: category?.isSystem ?? false,
          name: trimmed,
          ordinal: category?.ordinal ?? 0,
        })
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      <F.Field>
        Name
        <F.TextInput
          value={name}
          maxLength={40}
          placeholder="Factions"
          onChange={(e) => setName(e.target.value)}
        />
      </F.Field>

      <F.Field as="div">
        Icon
        <F.ChoiceRow>
          {CODEX_ICON_KEYS.map((key) => {
            const Icon = resolveCodexIcon(key);
            return (
              <F.Choice
                key={key}
                type="button"
                $active={icon === key}
                aria-label={`Icon ${key}`}
                aria-pressed={icon === key}
                onClick={() => setIcon(key)}
              >
                <Icon size={15} />
              </F.Choice>
            );
          })}
        </F.ChoiceRow>
      </F.Field>

      {/* Deleting never takes a category's entries with it, so the option only
          appears once the category is empty. */}
      {category && onDelete && entryCount > 0 && (
        <F.Hint>
          This category still holds {entryCount}{" "}
          {entryCount === 1 ? "entry" : "entries"}. Move them elsewhere first.
        </F.Hint>
      )}
      {category && onDelete && entryCount === 0 && (
        <F.DangerButton
          type="button"
          disabled={deleting}
          aria-busy={deleting}
          onClick={handleDelete}
        >
          <FaRegTrashCan size={13} />
          Delete category
        </F.DangerButton>
      )}
    </ResponsiveSheet>
  );
};
