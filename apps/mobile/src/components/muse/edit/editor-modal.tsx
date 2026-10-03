import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A full-screen editor, for the two muse forms too long for a tray: a story
 * section and a connection.
 *
 * The same shell as the post composer — a modal that slides up, a top bar
 * with close on the left and the title beside it, the confirm on the right,
 * and the whole thing riding the keyboard rather than being covered by it —
 * so the rich text editor inside has the room and the toolbar it was built
 * for.
 *
 * `tray` is laid beside the page at the foot of the window, as the composer
 * lays its media drawer: while it is open (`trayOpen`) the page stops riding
 * the keyboard, because the tray does that itself.
 */
export const EditorModal = ({
  busy = false,
  canConfirm = true,
  children,
  confirmLabel,
  error,
  onClose,
  onConfirm,
  title,
  tray,
  trayOpen = false,
  visible,
}: {
  busy?: boolean;
  canConfirm?: boolean;
  children: ReactNode;
  confirmLabel: string;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** A drawer under the page — the media tray. */
  tray?: ReactNode;
  trayOpen?: boolean;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible}
    >
      {/* The whole window in the theme: the tray's rounded corners sit on it. */}
      <View style={[styles.shell, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.root,
            {
              backgroundColor: theme.background,
              marginBottom: trayOpen ? 0 : keyboardOffset,
              paddingBottom: keyboardOffset > 0 || trayOpen ? 0 : insets.bottom,
              paddingTop: insets.top,
            },
          ]}
        >
          <View
            style={[
              styles.topBar,
              { borderBottomColor: theme.material.edge },
            ]}
          >
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              disabled={busy}
              hitSlop={space.sm}
              onPress={onClose}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: pressed
                    ? theme.material.fillPressed
                    : theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <Ionicons color={theme.text} name="close" size={20} />
            </Pressable>

            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.text }]}
            >
              {title}
            </Text>

            <Pressable
              accessibilityLabel={confirmLabel}
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: !canConfirm || busy }}
              disabled={!canConfirm || busy}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirm,
                {
                  backgroundColor:
                    !canConfirm || busy
                      ? theme.accent.surface
                      : pressed
                        ? theme.accent.solidHover
                        : theme.accent.solid,
                  opacity: !canConfirm && !busy ? 0.6 : 1,
                },
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.confirmLabel}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>

          {error ? (
            <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
          ) : null}

          <View style={styles.body}>{children}</View>
        </View>

        {tray}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1 },
  confirm: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  confirmLabel: {
    color: "#ffffff",
    fontSize: fontSize.label,
    fontWeight: "700",
  },
  error: {
    fontSize: fontSize.label,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  root: { flex: 1 },
  shell: { flex: 1 },
  title: { flex: 1, fontSize: fontSize.title, fontWeight: "700" },
  topBar: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
});
