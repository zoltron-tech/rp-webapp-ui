import { mixColors } from "@nw/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  createContext,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { SceneArt, type SceneName } from "@/components/scene-art";
import { markScrolling } from "@/context/scroll-activity";
import { withAlpha } from "@/lib/color";
import { fontSize, radius, space } from "@/theme";

/**
 * The glass panel every muse section is drawn on, and the small pieces they
 * all share.
 *
 * Web's `CardBack`: a gradient from a whisper of the muse's accent at the top
 * to solid black at the bottom, over the blurred wallpaper. Because the panel
 * always ends in black, the type on it is white at fixed opacities rather than
 * theme colours — the same literals web's styles use — so a section reads the
 * same on both clients whatever the viewer's own theme is.
 *
 * ## The frosted glass is drawn, not filtered
 *
 * Web puts `backdrop-filter: blur(20px)` on the panel, so whatever the
 * wallpaper looks like — and an author can set its own blur to nothing — the
 * words sit on frosted glass. React Native has no backdrop filter and this app
 * does not ship `expo-blur`, so the panel draws the glass itself: a second copy
 * of the wallpaper, blurred, positioned so it lines up pixel for pixel with the
 * one behind the page, clipped to the panel and dimmed by the same wash. The
 * screen tells it where the wallpaper is through `MuseBackdropProvider`; the
 * panel measures itself in the same window coordinates and subtracts. Without
 * this a sharp, bright wallpaper showed straight through the gradient's
 * transparent top and the section read as if it had no background at all.
 *
 * ## Full width, not a 9:16 card
 *
 * Web's sections live inside the same portrait frame as the character card,
 * which on a 375pt phone is a 240pt-wide column of story text. Here only the
 * CARD section keeps that shape — it *is* a picture — and the six text
 * sections take the whole panel between the header and the section menu, which
 * is the mobile-friendly reading of the same design: same gradient, same type,
 * more room for the words.
 */

/** Web's white-on-black literals, named once. */
export const PANEL = {
  card: "rgba(255,255,255,0.07)",
  cardBorder: "rgba(255,255,255,0.12)",
  faint: "rgba(255,255,255,0.38)",
  line: "rgba(255,255,255,0.1)",
  muted: "rgba(255,255,255,0.5)",
  pill: "rgba(255,255,255,0.1)",
  pillBorder: "rgba(255,255,255,0.2)",
  primary: "#ffffff",
  secondary: "rgba(255,255,255,0.75)",
  shimmer: "rgba(255,255,255,0.08)",
} as const;

/** Web's `InfoDivider`: a hairline, tinted by the accent when there is one. */
export const dividerColor = (accent?: string) =>
  accent ? withAlpha(accent, 0.28) : PANEL.line;

/** Web's `InfoAttributeCard` fill and border. */
export const glassCard = (accent?: string) => ({
  backgroundColor: accent
    ? withAlpha(mixColors(accent, 0.3, "#000000"), 0.5)
    : PANEL.card,
  borderColor: accent ? withAlpha(accent, 0.3) : PANEL.cardBorder,
});

/** Where the wallpaper is, and how it is drawn, for the panels over it. */
export interface MuseBackdrop {
  /** The wallpaper's own blur, in pixels; the glass adds web's twenty on top. */
  blur: number;
  /** The black wash over the wallpaper, 0–1. */
  dim: number;
  /** The wallpaper's box in window coordinates, once it has been measured. */
  frame: { height: number; width: number; x: number; y: number } | null;
  uri: string | null;
}

const BackdropContext = createContext<MuseBackdrop | null>(null);
export const MuseBackdropProvider = BackdropContext.Provider;

/** Web's `BACKGROUND_BLUR`: `backdrop-filter: blur(20px)`. */
const GLASS_BLUR = 20;
/** `expo-image` draws nothing past this on Android. */
const MAX_BLUR = 40;

export const MusePanel = ({
  accent,
  children,
  hideBackground = false,
  scroll = true,
  style,
}: {
  accent?: string;
  children: ReactNode;
  /** Advanced appearance: drop the gradient entirely. */
  hideBackground?: boolean;
  /** Off for a section that manages its own scrolling (the gallery grid). */
  scroll?: boolean;
  style?: ViewStyle;
}) => {
  // Web: `linear-gradient(to bottom, ${accent}18, black)` — `18` is 9.4%.
  const colors: [string, string] = hideBackground
    ? ["transparent", "transparent"]
    : [accent ? withAlpha(accent, 0.094) : "rgba(0,0,0,0)", "#000000"];

  const backdrop = useContext(BackdropContext);
  const ref = useRef<View>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const measure = () => {
    ref.current?.measureInWindow((x, y) => {
      setOrigin((current) =>
        current && current.x === x && current.y === y ? current : { x, y },
      );
    });
  };

  const glass =
    !hideBackground && backdrop?.uri && backdrop.frame && origin
      ? {
          height: backdrop.frame.height,
          left: backdrop.frame.x - origin.x,
          position: "absolute" as const,
          top: backdrop.frame.y - origin.y,
          width: backdrop.frame.width,
        }
      : null;

  return (
    <View onLayout={measure} ref={ref} style={[styles.panel, style]}>
      {glass && backdrop?.uri ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            blurRadius={Math.min(backdrop.blur + GLASS_BLUR, MAX_BLUR)}
            cachePolicy="memory-disk"
            contentFit="cover"
            recyclingKey={backdrop.uri}
            source={{ uri: backdrop.uri }}
            style={glass}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0,0,0,${backdrop.dim.toFixed(2)})` },
            ]}
          />
        </View>
      ) : null}
      <LinearGradient
        colors={colors}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          // Tells the shared drawings to hold still while the reader moves —
          // see `context/scroll-activity`.
          onScroll={markScrolling}
          scrollEventThrottle={32}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{children}</View>
      )}
    </View>
  );
};

/** Web's `InfoSectionLabel`: a small uppercase eyebrow over a block. */
export const SectionLabel = ({
  children,
  trailing,
}: {
  children: string;
  trailing?: ReactNode;
}) => (
  <View style={styles.labelRow}>
    <Text style={styles.label}>{children}</Text>
    {trailing}
  </View>
);

export const Divider = ({ accent }: { accent?: string }) => (
  <View style={[styles.divider, { backgroundColor: dividerColor(accent) }]} />
);

/**
 * Web's `SectionEmptyWrap`: the scene, centred in a fixed-height box so the
 * gap above it is the same in every section, then the line under it.
 */
export const SectionEmpty = ({
  accent,
  children,
  label,
  motion,
  scene,
}: {
  accent?: string;
  /** A call to action under the label, when the viewer can fill the gap. */
  children?: ReactNode;
  label: string;
  motion: boolean;
  scene: SceneName;
}) => (
  <View style={styles.empty}>
    <SceneArt accent={accent} motion={motion} scene={scene} />
    <Text style={styles.emptyLabel}>{label}</Text>
    {children}
  </View>
);

/** A block of the panel still on its way. */
export const PanelLoading = () => (
  <View style={styles.loading}>
    <ActivityIndicator color={PANEL.secondary} />
  </View>
);

/** Web's `ShimmerBlock`, for a list still loading. */
export const Shimmer = ({
  height,
  radius: r = radius.md,
  width = "100%",
}: {
  height: number;
  radius?: number;
  width?: number | `${number}%`;
}) => (
  <View
    style={{
      backgroundColor: PANEL.shimmer,
      borderRadius: r,
      height,
      width,
    }}
  />
);

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    marginVertical: space.sm + 2,
    width: "100%",
  },
  empty: {
    alignItems: "center",
    gap: space.sm + 2,
    justifyContent: "center",
    minHeight: 260,
    paddingVertical: space.lg,
    width: "100%",
  },
  emptyLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: fontSize.label,
    fontStyle: "italic",
    paddingTop: space.md,
    textAlign: "center",
  },
  fill: { flex: 1 },
  label: {
    color: PANEL.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.sm + 2,
    width: "100%",
  },
  loading: { alignItems: "center", paddingVertical: space.xl },
  panel: {
    borderRadius: radius.md,
    flex: 1,
    overflow: "hidden",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: space.lg,
    paddingHorizontal: space.sm + 4,
    paddingTop: space.sm,
  },
});
