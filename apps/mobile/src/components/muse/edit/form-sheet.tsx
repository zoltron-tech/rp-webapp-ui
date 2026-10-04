import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { BottomSheet } from "@/components/sheet";
import { fontSize, space, useAppTheme } from "@/theme";
import { IconButton } from "@/components/icon-button";

/**
 * A form in a tray, with the header this app's trays share: the title on the
 * left and two circular actions on the right — cancel, then confirm — rather
 * than a full-width footer button that costs a row of content at 667pt.
 *
 * Every muse editor that is a short form (a nickname, an attribute, the note,
 * the fandom) sits in one of these. The long ones — a story section, a
 * connection — are full-screen modals for the editor's sake, and copy the
 * same header there.
 */
export const FormSheet = ({
  busy = false,
  canConfirm = true,
  children,
  confirmLabel = "Save",
  error,
  fill = false,
  maxHeightRatio,
  onClose,
  onConfirm,
  subtitle,
  title,
  visible,
}: {
  busy?: boolean;
  canConfirm?: boolean;
  children: ReactNode;
  confirmLabel?: string;
  /** Shown in red under the title while set. */
  error?: string | null;
  fill?: boolean;
  maxHeightRatio?: number;
  onClose: () => void;
  /** Omitted for a sheet whose rows act on their own (no confirm button). */
  onConfirm?: () => void;
  subtitle?: string;
  title: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  return (
    <BottomSheet
      fill={fill}
      headerAction={
        <View style={styles.actions}>
          <IconButton
            accessibilityLabel="Cancel"
            disabled={busy}
            hitSlop={space.xs}
            icon="close"
            onPress={onClose}
            tone="material"
          />
          {onConfirm ? (
            <IconButton
              accessibilityLabel={confirmLabel}
              busy={busy}
              disabled={!canConfirm || busy}
              hitSlop={space.xs}
              icon="checkmark"
              onPress={onConfirm}
              tone="primary"
            />
          ) : null}
        </View>
      }
      maxHeightRatio={maxHeightRatio}
      onClose={onClose}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}
      <View style={fill ? styles.bodyFill : styles.body}>{children}</View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: space.sm },
  body: {
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  bodyFill: {
    flex: 1,
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  error: {
    fontSize: fontSize.label,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
});
