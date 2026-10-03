import { useEffect, useState } from "react";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { TextField } from "@/components/text-field";
import type { MuseEdit } from "@/hooks/use-muse-edit";

/** Web's note editor: the favourite quote, a hundred characters at most. */
export const NOTE_MAX = 100;

export const NoteSheet = ({
  edit,
  firstName,
  note,
  onClose,
  visible,
}: {
  edit: MuseEdit;
  firstName: string;
  note: string;
  onClose: () => void;
  visible: boolean;
}) => {
  const [draft, setDraft] = useState(note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(note);
      setError(null);
    }
  }, [note, visible]);

  const trimmed = draft.trim();

  const save = async () => {
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    const ok = await edit.setNote(trimmed);
    setBusy(false);
    if (!ok) {
      setError("Could not save the quote. Try again.");
      return;
    }
    onClose();
  };

  return (
    <FormSheet
      busy={busy}
      canConfirm={trimmed.length > 0 && trimmed !== note}
      error={error}
      onClose={onClose}
      onConfirm={() => void save()}
      title={note ? "Edit favourite quote" : `${firstName}'s favourite quote`}
      visible={visible}
    >
      <TextField
        autoFocus
        counterMax={NOTE_MAX}
        label="Quote"
        maxLength={NOTE_MAX}
        multiline
        onChangeText={setDraft}
        placeholder="Write a favourite quote…"
        style={{ minHeight: 72 }}
        value={draft}
      />
    </FormSheet>
  );
};
