"use client";

import type { FC } from "react";
import { EditTray } from "./edit-tray";
import { NoteDialogBody } from "./note-dialog-body";

type NoteEditTrayProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  value: string;
  onChange: (value: string) => void;
  color: string | null;
  onColorChange: (color: string | null) => void;
  emoji: string | null;
  onEmojiChange: (emoji: string | null) => void;
};

export const NoteEditTray: FC<NoteEditTrayProps> = ({
  open,
  onCancel,
  onConfirm,
  ...bodyProps
}) => (
  <EditTray
    open={open}
    title="Edit your note"
    confirmLabel="Done"
    onCancel={onCancel}
    onConfirm={onConfirm}
  >
    <NoteDialogBody {...bodyProps} />
  </EditTray>
);
