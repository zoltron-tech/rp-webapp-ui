import { Ionicons } from "@expo/vector-icons";
import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";
import { Button } from "@/components/button";

/**
 * The grouped-list pieces the menu and the profile settings are built from.
 *
 * Web's user menu and its edit-profile sections are the same idea drawn twice —
 * a labelled card of rows, each an icon, a label, a line of detail and
 * something on the right. One set here keeps the menu and the screens it opens
 * looking like one place rather than two.
 */

type IconName = keyof typeof Ionicons.glyphMap;

export type RowTone = "accent" | "danger" | "neutral" | "discord" | "spotify";

/** Brand marks keep their brand colour whatever the accent is. */
const BRANDS = { discord: "#5865F2", spotify: "#1DB954" } as const;

/** A labelled card; dividers go between the rows it is given. */
export const SettingsGroup = ({
  children,
  footer,
  title,
}: {
  children: ReactNode;
  /** A muted line under the card — what a setting does, or why it is off. */
  footer?: string;
  title?: string;
}) => {
  const theme = useAppTheme();
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <View style={styles.group}>
      {title ? (
        <Text style={[styles.groupTitle, { color: theme.textGray }]}>
          {title}
        </Text>
      ) : null}
      {/*
        Translucent material: the same card sits on the glass menu sheet and on
        the settings pages, and a wash of the text colour reads as a card on
        both, where an opaque step would be a hole in the glass.
      */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.material.fillTranslucent,
            borderColor: theme.material.edgeTranslucent,
          },
        ]}
      >
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 ? (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.material.edgeTranslucent },
                ]}
              />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <Text style={[styles.groupFooter, { color: theme.textGray }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

/** The rounded square an icon sits in. */
export const IconTile = ({
  icon,
  size = 34,
  tone = "accent",
}: {
  icon: IconName;
  size?: number;
  tone?: RowTone;
}) => {
  const theme = useAppTheme();
  const colors =
    tone === "danger"
      ? { bg: theme.tones.danger.fill, fg: theme.tones.danger.ink }
      : tone === "discord" || tone === "spotify"
        ? { bg: BRANDS[tone], fg: "#ffffff" }
        : tone === "neutral"
          ? { bg: theme.material.fillPressed, fg: theme.text }
          : { bg: theme.accent.tint, fg: theme.accent.text };

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.bg,
          borderRadius: size * 0.28,
          height: size,
          width: size,
        },
      ]}
    >
      <Ionicons color={colors.fg} name={icon} size={size * 0.56} />
    </View>
  );
};

export const SettingsRow = ({
  accessory,
  badge,
  busy,
  chevron = true,
  disabled,
  external,
  icon,
  label,
  onPress,
  subtitle,
  tone = "accent",
}: {
  /** Replaces the chevron — a chip, a button, a switch. */
  accessory?: ReactNode;
  /** An unread count, drawn before the chevron. */
  badge?: number;
  busy?: boolean;
  chevron?: boolean;
  disabled?: boolean;
  /** An open-in-browser glyph instead of the chevron. */
  external?: boolean;
  icon?: IconName;
  label: string;
  onPress?: () => void;
  subtitle?: ReactNode;
  tone?: RowTone;
}) => {
  const theme = useAppTheme();
  const danger = tone === "danger";

  const body = (
    <>
      {icon ? <IconTile icon={icon} tone={tone} /> : null}
      <View style={styles.rowText}>
        <Text
          numberOfLines={1}
          style={[
            styles.rowLabel,
            { color: danger ? theme.error : theme.text },
          ]}
        >
          {label}
        </Text>
        {typeof subtitle === "string" ? (
          <Text
            numberOfLines={2}
            style={[styles.rowSubtitle, { color: theme.textGray }]}
          >
            {subtitle}
          </Text>
        ) : (
          subtitle
        )}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.error }]}>
          <Text style={styles.badgeLabel}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
      {busy ? (
        <ActivityIndicator color={theme.textGray} size="small" />
      ) : accessory !== undefined ? (
        accessory
      ) : onPress && chevron ? (
        <Ionicons
          color={theme.textGray}
          name={external ? "open-outline" : "chevron-forward"}
          size={16}
        />
      ) : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.glass.fillPressed },
        disabled && { opacity: 0.5 },
      ]}
    >
      {body}
    </Pressable>
  );
};

export type ChipTone = "positive" | "danger" | "neutral" | "accent";

export const Chip = ({
  icon,
  label,
  tone = "neutral",
}: {
  icon?: IconName;
  label: string;
  tone?: ChipTone;
}) => {
  const theme = useAppTheme();
  const colors =
    tone === "positive"
      ? theme.tones.positive
      : tone === "danger"
        ? theme.tones.danger
        : tone === "accent"
          ? { fill: theme.accent.tint, ink: theme.accent.text }
          : { fill: theme.material.fillPressed, ink: theme.textGray };

  return (
    <View style={[styles.chip, { backgroundColor: colors.fill }]}>
      {icon ? <Ionicons color={colors.ink} name={icon} size={12} /> : null}
      <Text style={[styles.chipLabel, { color: colors.ink }]}>{label}</Text>
    </View>
  );
};

/** A small action that sits at the end of a row: `Button`, at its row size. */
export const PillButton = ({
  busy,
  disabled,
  icon,
  label,
  onPress,
  tone = "neutral",
}: {
  busy?: boolean;
  disabled?: boolean;
  icon?: IconName;
  label: string;
  onPress: () => void;
  tone?: "neutral" | "accent" | "danger";
}) => (
  <Button
    busy={busy}
    disabled={disabled}
    hitSlop={space.xs}
    icon={icon}
    label={label}
    onPress={onPress}
    size="sm"
    variant={
      tone === "accent"
        ? "primary"
        : tone === "danger"
          ? "dangerOutline"
          : "secondary"
    }
  />
);

/** Web's `InlineMessage`: an outcome, said in place rather than in a toast. */
export const Notice = ({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "error";
}) => {
  const theme = useAppTheme();
  const colors =
    tone === "success"
      ? theme.tones.positive
      : tone === "error"
        ? theme.tones.danger
        : { fill: theme.material.fillPressed, ink: theme.text };
  const icon: IconName =
    tone === "success"
      ? "checkmark-circle"
      : tone === "error"
        ? "alert-circle"
        : "information-circle";

  return (
    <View style={[styles.notice, { backgroundColor: colors.fill }]}>
      <Ionicons color={colors.ink} name={icon} size={16} />
      <Text style={[styles.noticeText, { color: colors.ink }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: space.s,
    paddingVertical: 1,
  },
  badgeLabel: { color: "#ffffff", fontSize: fontSize.meta, fontWeight: "700" },
  card: {
    borderRadius: radius.group,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  chip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  chipLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
  group: { gap: space.s },
  groupFooter: {
    fontSize: fontSize.caption,
    lineHeight: 17,
    paddingHorizontal: space.xs,
  },
  groupTitle: {
    ...type.eyebrow,
    paddingHorizontal: space.xs,
  },
  notice: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.sm,
    marginHorizontal: space.md,
    marginVertical: space.sm,
    padding: space.ms,
  },
  noticeText: { flex: 1, fontSize: fontSize.label, lineHeight: 18 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    minHeight: 56,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  rowLabel: { fontSize: fontSize.lead, fontWeight: "500" },
  rowSubtitle: { fontSize: fontSize.caption, lineHeight: 16 },
  rowText: { flex: 1, gap: space.xxs, minWidth: 0 },
  tile: { alignItems: "center", justifyContent: "center" },
});
