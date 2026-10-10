import { Ionicons } from "@expo/vector-icons";
import { type ReactNode, useCallback, useRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A menu, as a sheet. The one menu on this client.
 *
 * Web opens these as a dropdown under a `⋯` button (`AppDropdownMenuResponsive`
 * — which is itself a bottom sheet once the viewport is narrow). A phone gets
 * the sheet directly: a dropdown pinned to a 32pt button in the corner of a
 * banner is a column of 44pt rows squeezed against the screen edge, and the
 * same list at the bottom of the screen is under the thumb that opened it.
 *
 * ## One shape for every menu
 *
 * A profile's `⋯`, a prompt's `⋯`, a long press on a message and a chapter's
 * menu all open this. They used to be three components that each drew their
 * own rows — plain here, bordered cards there, a third with different type
 * and spacing — and one of them put its cards flush against the sheet's
 * edges, so a tray that looked like a list of buttons on one screen looked
 * like something half off the screen on another. Now the rows, the type,
 * the row height, the padding and the red-after-a-rule ordering are decided
 * once, here, and a menu is only its items.
 *
 * What a menu may add is a header of its own — the message a long press
 * landed on, a row of reactions — through `children`, drawn above the rows
 * inside the same padding.
 *
 * Rows are plain, as iOS and web's sheet draw them: a glyph, a label, and
 * an optional second line. Destructive items are red and grouped after a
 * rule, exactly as web orders them — the separator is what stops "Block"
 * sitting one row under "Share".
 */

export interface ActionItem {
  /** Set for a rule between groups; nothing else on the item is read. */
  separator?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  /** A second line under the label: what the row needs saying about itself. */
  hint?: string;
  onPress?: () => void;
  /**
   * In place of `onPress`, for an item that opens another modal — an editor,
   * a sheet, the photo picker. The menu closes first and this runs once it
   * has really gone: iOS will not present a modal over one that is still
   * leaving (see `BottomSheet`'s `onDismissed`).
   */
  onSelect?: () => void;
  /** `danger` is red, `positive` is the accent. */
  variant?: "default" | "danger" | "positive";
  /** Shows a spinner in place of the icon and blocks the press. */
  busy?: boolean;
}

/** The row height, and what makes a short menu read as a list of choices. */
const ROW_HEIGHT = 48;

export const ActionMenu = ({
  children,
  items,
  onClose,
  subtitle,
  title,
  visible,
}: {
  /** Drawn above the rows: the thing the menu is about, a reaction row. */
  children?: ReactNode;
  items: ActionItem[];
  onClose: () => void;
  subtitle?: string;
  title: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  /** The chosen item's `onSelect`, held until the sheet has gone. */
  const pending = useRef<(() => void) | null>(null);
  const runPending = useCallback(() => {
    const run = pending.current;
    pending.current = null;
    run?.();
  }, []);

  return (
    <BottomSheet
      // Nothing to type into: the sheet sits at the foot of the screen.
      ignoreKeyboard
      maxHeightRatio={0.72}
      onClose={onClose}
      onDismissed={runPending}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
      <View style={styles.body}>
        {children ? <View style={styles.lead}>{children}</View> : null}

        {items.map((item, index) => {
          if (item.separator) {
            return (
              <View
                // Separators have nothing to key on but where they are.
                key={`separator-${index}`}
                style={[
                  styles.separator,
                  { backgroundColor: theme.glass.edge },
                ]}
              />
            );
          }

          const colour =
            item.variant === "danger"
              ? theme.error
              : item.variant === "positive"
                ? // The theme's green, not the accent: a novelist on the crimson
                  // or dracula palette had "Add friend" drawn in their accent,
                  // which is red — the same colour as "Block" one row below it.
                  theme.success
                : theme.text;

          return (
            <Pressable
              accessibilityHint={item.hint}
              accessibilityRole="button"
              accessibilityState={{ busy: item.busy, disabled: item.busy }}
              disabled={item.busy}
              key={item.label}
              onPress={
                item.onSelect
                  ? () => {
                      pending.current = item.onSelect ?? null;
                      onClose();
                    }
                  : item.onPress
              }
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : "transparent",
                  opacity: item.busy ? 0.6 : 1,
                },
              ]}
            >
              <View style={styles.glyph}>
                {item.busy ? (
                  <ActivityIndicator color={colour} size="small" />
                ) : (
                  <Ionicons
                    color={colour}
                    name={item.icon ?? "ellipse-outline"}
                    size={22}
                  />
                )}
              </View>
              <View style={styles.text}>
                <Text
                  numberOfLines={1}
                  style={[styles.label, { color: colour }]}
                >
                  {item.label}
                </Text>
                {item.hint ? (
                  <Text
                    numberOfLines={2}
                    style={[styles.hint, { color: theme.textGray }]}
                  >
                    {item.hint}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  /*
   * Inset from the sheet's edges on every side, so a row's pressed wash and
   * its label sit inside the sheet rather than against it, and the last row
   * clears the home indicator by the same margin the first clears the title.
   */
  body: {
    paddingBottom: space.lg,
    paddingHorizontal: space.sm,
    paddingTop: space.xs,
  },
  // A fixed slot, so labels line up whether the glyph is wide or narrow.
  glyph: { alignItems: "center", width: 26 },
  hint: { fontSize: fontSize.caption },
  // Web's sheet rows: 16/500.
  label: { fontSize: fontSize.lead, fontWeight: "500" },
  lead: { gap: space.sm, paddingBottom: space.sm, paddingHorizontal: space.xs },
  row: {
    alignItems: "center",
    borderRadius: radius.md + 2,
    flexDirection: "row",
    gap: space.m,
    minHeight: ROW_HEIGHT,
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: space.sm,
    marginVertical: space.xs,
  },
  text: { flex: 1, gap: 1, minWidth: 0 },
});
