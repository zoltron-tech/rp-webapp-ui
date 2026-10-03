import { useEffect, useState } from "react";
import { ColorPicker } from "@/components/color-picker";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { PillButton } from "@/components/settings";
import { asHex } from "@/lib/color";

/**
 * Web's "Pick an accent color" dialog, as a tray: the picker, and the tick
 * that keeps the colour. Nothing is written while the thumb moves — a colour
 * is chosen when it is confirmed, as on web.
 *
 * With `onReset`, a "Use default" button clears the override instead, for
 * the advanced colours where "unset" is a real choice.
 */
export const ColorSheet = ({
  busy,
  fallback = "#e5484d",
  onClose,
  onConfirm,
  onReset,
  subtitle,
  title,
  value,
  visible,
}: {
  busy?: boolean;
  /** What the picker starts on when there is no colour yet. */
  fallback?: string;
  onClose: () => void;
  onConfirm: (hex: string) => void;
  onReset?: () => void;
  subtitle?: string;
  title: string;
  value: string | null | undefined;
  visible: boolean;
}) => {
  const [draft, setDraft] = useState(asHex(value) ?? fallback);

  // Each opening starts from what is saved.
  useEffect(() => {
    if (visible) setDraft(asHex(value) ?? fallback);
  }, [fallback, value, visible]);

  return (
    <FormSheet
      busy={busy}
      canConfirm={Boolean(asHex(draft))}
      onClose={onClose}
      onConfirm={() => onConfirm(draft)}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
      <ColorPicker onChange={setDraft} value={draft} />
      {onReset && value ? (
        <PillButton
          disabled={busy}
          icon="refresh"
          label="Use default"
          onPress={onReset}
        />
      ) : null}
    </FormSheet>
  );
};
