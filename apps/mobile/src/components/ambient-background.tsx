import type { ReactElement } from "react";
import { memo, useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useAppTheme } from "@/theme";

/**
 * The page, with a soft light of the accent behind it.
 *
 * Glass is only as glassy as what is under it: over a flat page colour a blur
 * has nothing to pick up and a translucent bar reads as a grey one. This is
 * the same ambient canvas web draws on `PageContainer::before` — the accent at
 * low strength from the top-left corner, a weaker second light from the
 * bottom-right — so bars, sheets and the tab bar have colour to carry.
 *
 * It paints the page colour itself, opaque, so a copy drawn later covers one
 * drawn earlier completely. That is how a novelist's pages get *their* light:
 * each `AccentProvider` screen draws its own copy inside the provider, over the
 * viewer-accent copy the stack put behind every screen.
 *
 * Static — nothing here moves or re-renders with scrolling, and it is drawn
 * once per screen, never in a list row.
 */
export const AmbientBackground = memo(function AmbientBackground() {
  const theme = useAppTheme();
  if (!AMBIENT_ENABLED) {
    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]}
      />
    );
  }
  return <AmbientLight theme={theme} />;
});

/** Off = the flat page colour everywhere. A one-line rollback, and the A/B switch for perf checks. */
export const AMBIENT_ENABLED = true;

const AmbientLight = ({ theme }: { theme: ReturnType<typeof useAppTheme> }) => {
  const light = theme.name === "light";
  // Per instance: several screens are mounted at once in a stack, and a shared
  // gradient id would paint all of them in whichever mounted last.
  const id = `amb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const color = theme.accent.solid;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]}
    >
      <Svg height="100%" width="100%">
        <Defs>
          <RadialGradient
            cx="8%"
            cy="0%"
            fx="8%"
            fy="0%"
            id={`${id}a`}
            rx="95%"
            ry="60%"
          >
            <Stop offset="0" stopColor={color} stopOpacity={light ? 0.14 : 0.22} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient
            cx="100%"
            cy="100%"
            fx="100%"
            fy="100%"
            id={`${id}b`}
            rx="85%"
            ry="55%"
          >
            <Stop offset="0" stopColor={color} stopOpacity={light ? 0.1 : 0.14} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill={`url(#${id}a)`} height="100%" width="100%" />
        <Rect fill={`url(#${id}b)`} height="100%" width="100%" />
      </Svg>
    </View>
  );
};

/**
 * Routes that must stay see-through: the glass menu and the conversation
 * placeholder are transparent modals over the tabs, and the tabs host has a
 * backdrop in every stack inside it already.
 */
const PASS_THROUGH = new Set(["menu", "(tabs)", "[conversationId]/index"]);

/**
 * A stack's `screenLayout`: every screen drawn over the ambient page.
 *
 * Screens themselves no longer paint `theme.background` at their root, or they
 * would cover it.
 */
export const ambientScreenLayout = ({
  children,
  route,
}: {
  children: ReactElement;
  route: { name: string };
}) =>
  PASS_THROUGH.has(route.name) ? (
    children
  ) : (
    <View style={styles.fill}>
      <AmbientBackground />
      {children}
    </View>
  );

const styles = StyleSheet.create({ fill: { flex: 1 } });
