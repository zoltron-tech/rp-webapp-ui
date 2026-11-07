import { Ionicons } from "@expo/vector-icons";
import { TraitGlyph } from "@nw/animations";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { withAlpha } from "@/lib/color";
import { PICKED_INK, traitHue } from "@/lib/headcanons";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The pieces every Headcanons surface is built from: the colours for the two
 * grounds it is drawn on, the trait chip, and the fixed-size tray.
 *
 * ## Two grounds
 *
 * `card` is the character's dark panel on the profile — white type at fixed
 * opacities over a gradient to black, as every muse section is. `page` is the
 * Edit character screen and the trays, which follow the viewer's theme. Web's
 * `--hc-*` tokens, as a plain object.
 */

export type HcTone = "card" | "page";

export type HcColors = {
  accent: string;
  edge: string;
  faint: string;
  fill: string;
  fillStrong: string;
  muted: string;
  text: string;
};

export const useHcColors = (tone: HcTone, accent?: string | null): HcColors => {
  const theme = useAppTheme();
  const hue = accent?.trim() ? accent : theme.accent.solid;
  return tone === "card"
    ? {
        accent: hue,
        edge: "rgba(255,255,255,0.14)",
        faint: "rgba(255,255,255,0.45)",
        fill: "rgba(255,255,255,0.07)",
        fillStrong: "rgba(255,255,255,0.13)",
        muted: "rgba(255,255,255,0.66)",
        text: "rgba(255,255,255,0.95)",
      }
    : {
        accent: hue,
        edge: theme.material.edgeTranslucent,
        faint: theme.textGray,
        fill: theme.material.fillTranslucent,
        fillStrong: theme.material.fill,
        muted: theme.textGray,
        text: theme.text,
      };
};

/* ─── Trait chip ─────────────────────────────────────────────────────── */

/**
 * One trait: its little drawing in a bubble, then the name.
 *
 * Web's `TraitChip`. Picked is filled solid in the group's hue with dark type,
 * a ring round it and a check (or × when it removes) at the end —
 * unmistakable beside the tinted ones. The ring is always there, transparent
 * when not picked, so picking a chip never moves its neighbours.
 */
export const TraitChip = ({
  checked,
  clash,
  colors,
  disabled,
  group,
  hasNote,
  label,
  on,
  onPress,
  removable,
  traitKey,
}: {
  checked?: boolean;
  clash?: boolean;
  colors: HcColors;
  disabled?: boolean;
  group?: string | null;
  hasNote?: boolean;
  label: string;
  on?: boolean;
  onPress?: () => void;
  removable?: boolean;
  traitKey: string;
}) => {
  const hue = traitHue(group, colors.accent);
  return (
    <Pressable
      accessibilityHint={clash ? "Clashes with a picked trait" : undefined}
      accessibilityLabel={removable ? `Remove ${label}` : label}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityState={{ disabled, selected: on }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ring,
        { borderColor: on ? withAlpha(hue, 0.3) : "transparent" },
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
    >
      <View
        style={[
          styles.chip,
          disabled
            ? {
                backgroundColor: "transparent",
                borderColor: withAlpha(hue, 0.4),
                borderStyle: "dashed",
              }
            : on
              ? { backgroundColor: hue, borderColor: hue }
              : {
                  backgroundColor: withAlpha(hue, 0.14),
                  borderColor: withAlpha(hue, 0.4),
                },
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: on
                ? "rgba(255,255,255,0.9)"
                : withAlpha(hue, 0.2),
              borderColor: withAlpha(hue, 0.35),
            },
          ]}
        >
          <TraitGlyph
            group={group ?? undefined}
            size={16}
            traitKey={traitKey}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.chipLabel,
            { color: on ? PICKED_INK : colors.text },
            clash ? styles.clash : null,
          ]}
        >
          {label}
        </Text>
        {hasNote ? (
          <View
            style={[styles.dot, { backgroundColor: on ? PICKED_INK : hue }]}
          />
        ) : null}
        {removable || checked ? (
          <View style={styles.mark}>
            <Ionicons
              color={on ? PICKED_INK : colors.text}
              name={removable ? "close" : "checkmark"}
              size={12}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

/** A row of chips that wraps. */
export const ChipRow = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) => <View style={[styles.chipRow, style]}>{children}</View>;

/* ─── Small chips and buttons ────────────────────────────────────────── */

/** A plain pill: a fact item, a this-or-that answer, a tag. */
export const Pill = ({
  colors,
  label,
  soft,
}: {
  colors: HcColors;
  label: string;
  /** Tinted with the accent (an answer, a category). */
  soft?: boolean;
}) => (
  <View
    style={[
      styles.pill,
      soft
        ? {
            backgroundColor: withAlpha(colors.accent, 0.18),
            borderColor: withAlpha(colors.accent, 0.4),
          }
        : { backgroundColor: colors.fill, borderColor: colors.edge },
    ]}
  >
    <Text numberOfLines={1} style={[styles.pillLabel, { color: colors.text }]}>
      {label}
    </Text>
  </View>
);

/** A choice in a tray: a category, a verse, who can see it. */
export const Choice = ({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: active
            ? theme.accent.fill
            : pressed
              ? theme.material.fillPressed
              : theme.material.fillTranslucent,
          borderColor: active
            ? theme.accent.fill
            : theme.material.edgeTranslucent,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          color={active ? theme.accent.onFill : theme.text}
          name={icon}
          size={13}
        />
      ) : null}
      <Text
        style={[
          styles.choiceLabel,
          { color: active ? theme.accent.onFill : theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

/** Web's `SmallButton`: a quiet pill beside a block's label. */
export const SmallButton = ({
  colors,
  icon,
  label,
  onPress,
  primary,
}: {
  colors: HcColors;
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  /** Web's `PrimaryButton`: filled with the accent. */
  primary?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    hitSlop={space.xs}
    onPress={onPress}
    style={({ pressed }) => [
      styles.small,
      primary
        ? { backgroundColor: colors.accent, borderColor: colors.accent }
        : {
            backgroundColor: pressed ? colors.fillStrong : colors.fill,
            borderColor: colors.edge,
          },
      { opacity: pressed && primary ? 0.8 : 1 },
    ]}
  >
    {icon ? (
      <Ionicons
        color={primary ? "#ffffff" : colors.muted}
        name={icon}
        size={12}
      />
    ) : null}
    <Text
      style={[styles.smallLabel, { color: primary ? "#ffffff" : colors.muted }]}
    >
      {label}
    </Text>
  </Pressable>
);

/** A small uppercase label over a group inside a tray. */
export const GroupLabel = ({ children }: { children: string }) => {
  const theme = useAppTheme();
  return (
    <Text style={[styles.groupLabel, { color: theme.textGray }]}>
      {children}
    </Text>
  );
};

/* ─── The tray ───────────────────────────────────────────────────────── */

/**
 * Every Headcanons tray: one fixed height whatever it holds, a scrolling
 * body and a footer pinned under it.
 *
 * The user's rule for these: a dialog never grows or shrinks with its
 * content. `BottomSheet`'s `fill` gives the fixed height; the body scrolls
 * inside it and the footer — the picked strip, a count, the danger button —
 * stays put above the home indicator. The header is the app's tray header:
 * title on the left, cancel and confirm as circles on the right.
 */
export const HcSheet = ({
  busy = false,
  canConfirm = true,
  children,
  confirmLabel = "Save",
  footer,
  headerAction,
  onClose,
  onConfirm,
  onDismissed,
  subtitle,
  title,
  visible,
}: {
  busy?: boolean;
  canConfirm?: boolean;
  children: ReactNode;
  confirmLabel?: string;
  footer?: ReactNode;
  /** Once the tray has left the screen; see `BottomSheet`'s note. */
  onDismissed?: () => void;
  /** In place of cancel + confirm. */
  headerAction?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  subtitle?: string;
  title: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  return (
    <BottomSheet
      fill
      headerAction={
        headerAction ?? (
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
        )
      }
      maxHeightRatio={0.82}
      onClose={onClose}
      onDismissed={onDismissed}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
      <View style={styles.sheetBody}>
        <ScrollView
          contentContainerStyle={styles.sheetScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.fill}
        >
          {children}
        </ScrollView>
        {footer ? (
          <View style={[styles.footer, { borderTopColor: theme.glass.edge }]}>
            {footer}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
};

/** A footer line: a hint on the left, something small on the right. */
export const FootRow = ({
  children,
  trailing,
}: {
  children: ReactNode;
  trailing?: ReactNode;
}) => (
  <View style={styles.footRow}>
    <View style={styles.fill}>{children}</View>
    {trailing}
  </View>
);

export const Hint = ({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) => {
  const theme = useAppTheme();
  return (
    <Text style={[styles.hint, { color: color ?? theme.textGray }]}>
      {children}
    </Text>
  );
};

/** A small red-text button for a footer: "Remove this list". */
export const DangerLink = ({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={space.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.danger,
        {
          borderColor: withAlpha(theme.tones.danger.ink, 0.4),
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.dangerLabel, { color: theme.tones.danger.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: space.sm },
  bubble: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: border.edge,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 6,
    minHeight: 30,
    paddingLeft: 3,
    paddingRight: 11,
    paddingVertical: 2,
  },
  chipLabel: { flexShrink: 1, fontSize: 12.5, fontWeight: "700" },
  chipRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    width: "100%",
  },
  choice: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: space.m,
  },
  choiceLabel: { fontSize: fontSize.label, fontWeight: "600" },
  clash: { textDecorationLine: "line-through" },
  danger: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  dangerLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  dot: { borderRadius: 3, height: 6, marginLeft: -2, width: 6 },
  fill: { flex: 1 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: space.s,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  footRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  groupLabel: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  hint: { fontSize: fontSize.caption, lineHeight: 17 },
  mark: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    marginRight: -5,
    width: 18,
  },
  pill: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    maxWidth: "100%",
    paddingHorizontal: space.ms,
    paddingVertical: 4,
  },
  pillLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  ring: { borderRadius: radius.full, borderWidth: 3, maxWidth: "100%" },
  sheetBody: { flex: 1 },
  sheetScroll: {
    gap: space.m,
    paddingBottom: space.lg,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  small: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 5,
    minHeight: 28,
    paddingHorizontal: 11,
  },
  smallLabel: { fontSize: fontSize.caption, fontWeight: "600" },
});
