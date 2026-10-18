import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { GradientSurface } from "@/components/gradient-surface";
import { Bone, SkeletonPulse } from "@/components/skeleton";
import { Text } from "@/components/text";
import { asHex, withAlpha } from "@/lib/color";
import { fontSize, radius, space, useAppTheme, weight } from "@/theme";

/**
 * What every link card shares.
 *
 * A gradient hairline running from the card's tone to a paler step of it,
 * a material pane inside, and a press that opens the thing. The muse, prompt,
 * thread, novelist, story and chapter cards are each a `children` of this,
 * so they agree on their edge, their shadow and their corner without each
 * drawing them. Mirrors web's `Frame` in `muse-embed/styles.ts`.
 */

/** A lighter step of a hex colour, for the far end of the frame's gradient. */
export const lighten = (hex: string, amount: number): string => {
  const clean = asHex(hex);
  if (!clean) return hex;
  const n = Number.parseInt(clean.slice(1), 16);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

/**
 * Below this width a card takes web's phone-bubble layout — web's
 * `@container … (max-width: 300px)` rules: tighter padding, smaller face,
 * fewer chips, buttons under the words instead of beside them.
 */
const NARROW_WIDTH = 300;

const NarrowContext = createContext(false);

/** Whether the card this is drawn in is under 300pt wide. */
export const useEmbedNarrow = () => useContext(NarrowContext);

export const EmbedFrame = ({
  accessibilityLabel,
  children,
  onPress,
  style,
  tone,
  toneTo,
}: {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  /** The frame's colour; the theme accent when absent. */
  tone?: string | null;
  /** A second colour for the far end, for a card with two voices. */
  toneTo?: string | null;
}) => {
  const theme = useAppTheme();
  const from = asHex(tone) ?? theme.accent.solid;
  const to = asHex(toneTo) ?? lighten(from, 0.45);
  const [narrow, setNarrow] = useState(false);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setNarrow(event.nativeEvent.layout.width < NARROW_WIDTH);
  }, []);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="link"
      onLayout={onLayout}
      onPress={onPress}
      style={({ pressed }) => [styles.frame, style, pressed && styles.pressed]}
    >
      <GradientSurface from={from} style={styles.gradient} to={to} />
      <View
        style={[
          styles.pane,
          {
            backgroundColor: theme.surfaces.card,
            borderColor: withAlpha("#ffffff", 0.06),
          },
        ]}
      >
        <NarrowContext.Provider value={narrow}>
          {children}
        </NarrowContext.Provider>
      </View>
    </Pressable>
  );
};

/** The card's "open" affordance: a label and an arrow in the card's tone. */
export const OpenRow = ({
  label,
  tone,
}: {
  label: string;
  tone?: string | null;
}) => {
  const theme = useAppTheme();
  const colour = asHex(tone) ?? theme.accent.text;
  return (
    <View style={styles.open}>
      <Text style={[styles.openLabel, { color: colour }]}>{label}</Text>
      <Ionicons color={colour} name="arrow-forward" size={13} />
    </View>
  );
};

/** A thin rule in the card's tone, between body and footer. */
export const Rule = ({ tone }: { tone?: string | null }) => {
  const theme = useAppTheme();
  const colour = asHex(tone) ?? theme.accent.solid;
  return (
    <View style={[styles.rule, { backgroundColor: withAlpha(colour, 0.22) }]} />
  );
};

/** Small uppercase label in the card's tone: "Character", "Story". */
export const KindLabel = ({
  icon,
  label,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: string | null;
}) => {
  const theme = useAppTheme();
  const colour = asHex(tone) ?? theme.accent.text;
  return (
    <View style={styles.kind}>
      <Ionicons color={colour} name={icon} size={11} />
      <Text style={[styles.kindLabel, { color: colour }]}>{label}</Text>
    </View>
  );
};

/** A chip on cover art: fixed dark dim, white text, like web's MEDIA_CHIP. */
export const MediaChip = ({
  children,
  tint,
}: {
  children: ReactNode;
  tint?: string | null;
}) => (
  <View
    style={[
      styles.chip,
      { backgroundColor: tint ? withAlpha(tint, 0.78) : "rgba(0,0,0,0.58)" },
    ]}
  >
    {children}
  </View>
);

export const chipText = StyleSheet.create({
  label: {
    color: "#ffffff",
    fontSize: fontSize.meta,
    fontWeight: weight.bold,
    letterSpacing: 0.6,
  },
}).label;

/** The same width as a card, pulsing, while the thing is fetched. */
export const EmbedSkeleton = ({ tall = 150 }: { tall?: number }) => {
  const theme = useAppTheme();
  return (
    <SkeletonPulse
      style={[
        styles.frame,
        styles.skeleton,
        { backgroundColor: theme.surfaces.card },
      ]}
    >
      <Bone height={tall * 0.5} radius={radius.md} />
      <View style={styles.skeletonRow}>
        <Bone circle height={44} />
        <View style={styles.skeletonLines}>
          <Bone height={13} width="60%" />
          <Bone height={10} width="40%" />
        </View>
      </View>
    </SkeletonPulse>
  );
};

/**
 * The card for a thing the viewer cannot see: private, deleted, or blocked.
 * Still a link, so the destination is one tap away.
 */
export const Unavailable = ({
  onPress,
  title,
  detail,
}: {
  onPress: () => void;
  title: string;
  detail: string;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [
        styles.unavailable,
        {
          backgroundColor: pressed
            ? theme.surfaces.cardActive
            : theme.surfaces.card,
          borderColor: theme.surfaces.border,
        },
      ]}
    >
      <View
        style={[
          styles.unavailableIcon,
          { backgroundColor: theme.accent.tintStrong },
        ]}
      >
        <Ionicons color={theme.accent.text} name="link-outline" size={16} />
      </View>
      <View style={styles.unavailableText}>
        <Text style={[styles.unavailableTitle, { color: theme.text }]}>
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.unavailableDetail, { color: theme.textGray }]}
        >
          {detail}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  /*
   * Web's bounds: the width of whatever holds it, never wider than 380 (it is
   * a card in prose, not a banner — smaller than web's 380, a phone holds
   * it) and never under 240 — the floor that keeps
   * it a card when the holder shrinks to fit, as a chat column does.
   */
  frame: {
    borderRadius: 16,
    marginVertical: space.s,
    maxWidth: 320,
    minWidth: 240,
    overflow: "hidden",
    width: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  kind: { alignItems: "center", flexDirection: "row", gap: 4 },
  kindLabel: {
    fontSize: 10.5,
    fontWeight: weight.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  open: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
  },
  openLabel: { fontSize: fontSize.caption, fontWeight: weight.semibold },
  pane: {
    borderRadius: 14,
    borderWidth: 1,
    margin: 2,
    overflow: "hidden",
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  rule: { height: 1, marginTop: space.sm, width: "100%" },
  skeleton: { gap: space.m, padding: space.m },
  skeletonLines: { flex: 1, gap: space.s },
  skeletonRow: { alignItems: "center", flexDirection: "row", gap: space.m },
  unavailable: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.ms,
    marginVertical: space.sm,
    maxWidth: 320,
    minWidth: 240,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
    width: "100%",
  },
  unavailableDetail: { fontSize: fontSize.meta },
  unavailableIcon: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  unavailableText: { flex: 1, gap: 2, minWidth: 0 },
  unavailableTitle: { fontSize: fontSize.label, fontWeight: weight.semibold },
});
