import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, memo, useContext, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { RevealRow } from "@/components/reveal-row";
import { asColor, asHex, withAlpha } from "@/lib/color";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One character in a novelist's list of characters.
 *
 * ## Only what the list already carries
 *
 * `GET /muse/by/:username` is deliberately lean: identity, images, fandom,
 * accent, privacy, the video flag and the verse fields — no note, nicknames,
 * bonds or song. So the row draws from exactly those and fetches nothing:
 *
 *  - the **fandom**, as its coloured chip (off inside a fandom group);
 *  - how many **verses** the character has, counted by the list from the same
 *    response (`verseCount`);
 *  - whether the character has a **video** card, and its **privacy** when it is
 *    anything other than public;
 *  - the character's **accent**, as the spine and the ring round the face — and,
 *    when the author has "use accent colour" on, as a soft wash across the row,
 *    the way their profile is washed in it.
 *
 * ## Your own characters
 *
 * Given `onEdit` and `onDelete`, the row slides left to show both
 * (`RevealRow`). A swipe is invisible to a screen reader, so the same two are
 * accessibility actions on the row.
 *
 * `memo`, with stable callbacks from the list, so a list re-render does not
 * redraw rows whose character has not changed.
 */

const PRIVACY: Partial<
  Record<
    Muse["privacy"],
    { icon: keyof typeof Ionicons.glyphMap; label: string }
  >
> = {
  CUSTOM: { icon: "options-outline", label: "Custom" },
  FRIENDS: { icon: "people-outline", label: "Friends" },
  ONLY_ME: { icon: "lock-closed-outline", label: "Only me" },
};

const Badge = ({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.accent.text} name={icon} size={11} />
      <Text style={[styles.badgeLabel, { color: theme.textGray }]}>
        {label}
      </Text>
    </View>
  );
};

/**
 * Whether rows are drawn inside a fandom group, whose header already names the
 * fandom. A context rather than a prop so that toggling "Group by fandom"
 * redraws each row's chips and nothing else of it — a prop re-rendered every
 * row whole, face and all.
 */
export const InFandomGroup = createContext(false);

const RowChips = ({ muse, verseCount }: { muse: Muse; verseCount: number }) => {
  const theme = useAppTheme();
  const showFandom = !useContext(InFandomGroup);
  const privacy = PRIVACY[muse.privacy];
  if (!showFandom && verseCount <= 1 && !muse.video && !privacy) return null;

  const hasFandom = Boolean(
    muse.fandom?.name && muse.fandom.id !== "FANDOMLESS",
  );
  return (
    <View style={styles.chips}>
      {!showFandom ? null : hasFandom ? (
        <View
          style={[
            styles.fandom,
            {
              backgroundColor:
                asColor(muse.fandom?.color) ?? theme.material.edge,
            },
          ]}
        >
          <View style={styles.fandomDot} />
          <Text numberOfLines={1} style={styles.fandomLabel}>
            {muse.fandom.name}
          </Text>
        </View>
      ) : (
        <Text style={[styles.noFandom, { color: theme.textGray }]}>
          Fandomless
        </Text>
      )}
      {verseCount > 1 ? (
        <Badge icon="git-branch-outline" label={`${verseCount} verses`} />
      ) : null}
      {muse.video ? <Badge icon="videocam-outline" label="Video" /> : null}
      {privacy ? <Badge icon={privacy.icon} label={privacy.label} /> : null}
    </View>
  );
};

export const MuseListRow = memo(function MuseListRow({
  deleting = false,
  muse,
  onDelete,
  onEdit,
  onOpen,
  verseCount,
}: {
  /** The delete for this row is in flight. */
  deleting?: boolean;
  muse: Muse;
  /** With `onEdit`, makes the row swipeable. Only for your own characters. */
  onDelete?: (muse: Muse) => void;
  onEdit?: (muse: Muse) => void;
  onOpen: (museId: string) => void;
  /** The whole verse family, this one included; 1 when there are no others. */
  verseCount: number;
}) {
  const theme = useAppTheme();

  const hasFandom = Boolean(
    muse.fandom?.name && muse.fandom.id !== "FANDOMLESS",
  );
  const fandomColor = asColor(muse.fandom?.color);
  const accentHex = asHex(muse.accent);
  const edgeColor = accentHex ?? fandomColor ?? theme.accent.solid;
  const washColors = useMemo(
    () =>
      muse.useAccent && accentHex
        ? ([
            withAlpha(accentHex, 0.22),
            withAlpha(accentHex, 0.07),
            withAlpha(accentHex, 0),
          ] as const)
        : null,
    [accentHex, muse.useAccent],
  );
  const privacy = PRIVACY[muse.privacy];
  const name = [muse.firstName, muse.lastName].filter(Boolean).join(" ");
  const editable = Boolean(onEdit && onDelete);

  const details = [
    hasFandom ? muse.fandom.name : null,
    verseCount > 1 ? `${verseCount} verses` : null,
    muse.video ? "video card" : null,
    privacy ? `visible to ${privacy.label.toLowerCase()}` : null,
  ].filter(Boolean);

  const row = (
    <Pressable
      accessibilityActions={
        editable
          ? [
              { label: "Edit", name: "edit" },
              { label: "Delete", name: "delete" },
            ]
          : undefined
      }
      accessibilityHint="Opens the character"
      accessibilityLabel={[name || "Character", ...details].join(", ")}
      accessibilityRole="button"
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "edit") onEdit?.(muse);
        if (event.nativeEvent.actionName === "delete") onDelete?.(muse);
      }}
      onPress={() => muse.id && onOpen(muse.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
          opacity: deleting ? 0.5 : 1,
        },
      ]}
    >
      {washColors ? (
        <LinearGradient
          colors={washColors}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.45, 1]}
          pointerEvents="none"
          start={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {/* The character's own colour, as a spine down the left edge. */}
      <View style={[styles.edge, { backgroundColor: edgeColor }]} />

      <View style={[styles.face, { borderColor: edgeColor }]}>
        <Avatar
          image={muse.avatar}
          name={muse.firstName}
          size={56}
          uri={muse.avatar?.src ?? muse.image}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.nameLine}>
            <Text style={[styles.firstName, { color: theme.text }]}>
              {muse.firstName}
            </Text>
            {muse.lastName ? (
              <Text style={[styles.lastName, { color: theme.textGray }]}>
                {` ${muse.lastName}`}
              </Text>
            ) : null}
          </Text>
        </View>

        <RowChips muse={muse} verseCount={verseCount} />
      </View>

      <Ionicons
        color={theme.textGray}
        name={editable ? "chevron-back" : "chevron-forward"}
        size={editable ? 14 : 18}
        style={editable ? styles.swipeHint : undefined}
      />
    </Pressable>
  );

  if (!editable) return row;

  return (
    <RevealRow
      actions={[
        {
          icon: "create-outline",
          label: "Edit",
          onPress: () => onEdit?.(muse),
        },
        {
          busy: deleting,
          icon: "trash-outline",
          label: "Delete",
          onPress: () => onDelete?.(muse),
          tone: "danger",
        },
      ]}
    >
      {row}
    </RevealRow>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: space.s,
    paddingVertical: 1.5,
  },
  badgeLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  body: { flex: 1, gap: space.s, minWidth: 0 },
  card: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    overflow: "hidden",
    paddingLeft: space.md,
    paddingRight: space.ms,
    paddingVertical: space.ms,
  },
  chips: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  edge: { bottom: 0, left: 0, position: "absolute", top: 0, width: 3 },
  face: { borderRadius: radius.full, borderWidth: 2, padding: space.xxs },
  fandom: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    flexShrink: 1,
    gap: space.xs,
    maxWidth: "100%",
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
  },
  fandomDot: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 2.5,
    height: 5,
    width: 5,
  },
  fandomLabel: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  firstName: { fontSize: fontSize.body, fontWeight: "700" },
  lastName: { fontSize: fontSize.label },
  nameLine: { flex: 1, flexShrink: 1 },
  noFandom: { fontSize: fontSize.caption, fontStyle: "italic" },
  /** Your own rows point the way they open. */
  swipeHint: { opacity: 0.7 },
  titleRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
