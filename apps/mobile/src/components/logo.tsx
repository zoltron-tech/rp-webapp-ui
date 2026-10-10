import { Image, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The brand lockup: the accent tile, then "Novelist World".
 *
 * Reproduces `NWLogoInner` + the top bar's wordmark. The tile is `--accent`
 * (step 6) with a `--accent-hover` (step 7) border and a 5px radius — the same
 * three values the web CSS uses, read from `@nw/theme` rather than copied, so
 * changing the accent changes both clients. The mark inside it is the same
 * image file web uses (`assets/images/Logo text.png`).
 *
 * Two wordmarks:
 *
 *  - `default` — the landing screen's: "Novelist" in the text colour, "World"
 *    in the accent, set upright and large.
 *  - `header` — the web top bar's, for the Home header: both words uppercase
 *    and italic, "NOVELIST" regular in the text colour, "WORLD" bold, a size
 *    up, in `accent.brand` (web's `--accent-8`). Sized to sit in a native
 *    header the way web's lockup sits in its bar at phone widths.
 *
 * With a `label`, the header lockup names a page instead of the product: the
 * tile, then the label set exactly as "NOVELIST" is. The other tabs' headers
 * use it, so the tile stays put from tab to tab and only the word changes.
 */
export const Logo = ({
  label,
  size = 40,
  showWordmark = true,
  cornerRadius = radius.sm,
  variant = "default",
}: {
  /** A page's name, drawn in place of the wordmark. Header variant only. */
  label?: string;
  size?: number;
  showWordmark?: boolean;
  /**
   * The tile's corner radius. The brand's is 5px, which is what a 40px lockup
   * in a top bar wants. Drawn large — as the landing screen draws it — 5px on a
   * 60px square reads as a picture of the icon rather than the icon, so that
   * screen passes the app-icon radius instead.
   */
  cornerRadius?: number;
  variant?: "default" | "header";
}) => {
  const theme = useAppTheme();
  const header = variant === "header";
  // The mark is white. On web (dark only) it sits on `--accent`; the light
  // theme's accent surface is a pale wash that swallows it, so the tile takes
  // the solid accent there instead.
  const light = theme.name === "light";
  const tileFill = light ? theme.accent.solid : theme.accent.surface;
  const tileEdge = light ? theme.accent.solidHover : theme.accent.surfaceHover;

  return (
    <View
      accessibilityLabel={label ?? "Novelist World"}
      accessibilityRole={header ? "header" : undefined}
      accessible={header}
      style={[styles.row, header && styles.headerRow]}
    >
      <View
        style={[
          styles.tile,
          {
            backgroundColor: tileFill,
            borderColor: tileEdge,
            borderRadius: cornerRadius,
            height: size,
            width: size,
          },
        ]}
      >
        <Image
          resizeMode="contain"
          source={require("../../assets/logo-mark.png")}
          style={{ height: size, width: size }}
        />
      </View>

      {showWordmark && header && label ? (
        <Text
          numberOfLines={1}
          style={[
            styles.headerWordmark,
            styles.headerNovelist,
            styles.headerLabel,
            { color: theme.text },
          ]}
        >
          {label}
        </Text>
      ) : showWordmark && header ? (
        <Text numberOfLines={1} style={styles.headerWordmark}>
          <Text style={[styles.headerNovelist, { color: theme.text }]}>
            NOVELIST{" "}
          </Text>
          <Text style={[styles.headerWorld, { color: theme.accent.brand }]}>
            WORLD
          </Text>
        </Text>
      ) : showWordmark ? (
        <Text style={[styles.wordmark, { color: theme.text }]}>
          Novelist <Text style={{ color: theme.accent.text }}>World</Text>
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Web sets 5px between the tile and each word.
  // Uppercase, as the wordmark is written.
  headerLabel: { textTransform: "uppercase" },
  headerNovelist: { fontSize: 18, fontStyle: "italic", fontWeight: "400" },
  headerRow: { gap: 7 },
  headerWordmark: { flexShrink: 1 },
  headerWorld: {
    fontSize: fontSize.title,
    fontStyle: "italic",
    fontWeight: "700",
  },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm },
  tile: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  wordmark: { fontSize: fontSize.h2, fontWeight: "700" },
});
