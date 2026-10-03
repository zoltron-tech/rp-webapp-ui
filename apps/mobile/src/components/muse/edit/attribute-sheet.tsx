import { useEffect, useState } from "react";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { TextField } from "@/components/text-field";
import type { MuseEdit } from "@/hooks/use-muse-edit";

/**
 * Web's `InfoAttrForm`: a key and a value — "Age", "27" — added to the
 * Details grid, or an existing pair renamed and re-valued in place.
 */
export const AttributeSheet = ({
  edit,
  existing,
  onClose,
  target,
  visible,
}: {
  edit: MuseEdit;
  /** Keys already in use, so a new one cannot silently overwrite another. */
  existing: string[];
  onClose: () => void;
  /** The pair being edited, or `null` for a new one. */
  target: { key: string; value: string } | null;
  visible: boolean;
}) => {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setKey(target?.key ?? "");
    setValue(target?.value ?? "");
    setError(null);
  }, [target, visible]);

  const trimmedKey = key.trim();
  const trimmedValue = value.trim();
  const duplicate =
    trimmedKey.length > 0 &&
    trimmedKey !== target?.key &&
    existing.some((k) => k.toLowerCase() === trimmedKey.toLowerCase());
  const canConfirm = Boolean(trimmedKey && trimmedValue) && !duplicate;

  const save = async () => {
    if (!canConfirm || busy) return;
    setBusy(true);
    setError(null);
    const ok = target
      ? await edit.editAttribute(target.key, trimmedKey, trimmedValue)
      : await edit.addAttribute(trimmedKey, trimmedValue);
    setBusy(false);
    if (!ok) {
      setError("Could not save that detail. Try again.");
      return;
    }
    onClose();
  };

  return (
    <FormSheet
      busy={busy}
      canConfirm={canConfirm}
      error={error}
      onClose={onClose}
      onConfirm={() => void save()}
      title={target ? "Edit detail" : "Add a detail"}
      visible={visible}
    >
      <TextField
        autoCapitalize="words"
        autoCorrect={false}
        autoFocus
        counterMax={30}
        hint={duplicate ? "That detail is already on the card." : undefined}
        invalid={duplicate}
        label="Detail"
        maxLength={30}
        onChangeText={setKey}
        placeholder="e.g. Age, Height, Alignment"
        returnKeyType="next"
        value={key}
      />
      <TextField
        counterMax={120}
        label="Value"
        maxLength={120}
        onChangeText={setValue}
        onSubmitEditing={() => void save()}
        placeholder="e.g. 27"
        returnKeyType="done"
        value={value}
      />
    </FormSheet>
  );
};
