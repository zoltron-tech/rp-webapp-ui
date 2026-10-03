import { MotionProvider } from "@nw/animations";
import {
  BADGE_ARTWORK,
  BADGE_MARK_CIRCLE,
  BADGE_VIEW_BOX,
  badgeMarkFill,
  DETAIL_THRESHOLD,
  SCORE_VIEW_BOX,
  ScoreBadgeArtwork,
} from "@nw/badges";
import type { Badge, BadgeCode } from "@nw/types/badge";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { radius, space, useAppTheme } from "@/theme";

/**
 * Badge crests on a phone, drawn from `@nw/badges` — the same twelve SVGs the
 * web profile renders, not a second set.
 *
 * What is here is only the frame and the arrangement: an `<Svg>` box, and the
 * row that sits beside a name. Web's frame is a styled wrapper with a hover
 * sweep, which is why the frame is the part each client keeps.
 *
 * ## Where crests are drawn, and where they are not
 *
 * Only on the profile and the badges page. They used to sit in the friends list
 * too, at 15px, and that is what forced the flat-disc fallback in `mark.ts`:
 * full crests in a scrolling list measured 75% janky frames on a mid-range
 * Android. Taking them out of the list is what lets the profile draw the real
 * artwork — nothing on a profile is being flung past at 60fps.
 *
 * The disc path stays, because `DETAIL_THRESHOLD` still guards any caller that
 * asks for a small crest, and because a badge at 15px was never legible as
 * artwork anyway.
 *
 * ## Motion
 *
 * The crests mark their moving parts with `className="nwb-…"`, which the web
 * matches with keyframes and `react-native-svg` ignores. `MotionProvider` from
 * `@nw/animations` is what turns those class names into animated transforms on
 * this platform — see that package's `motion-kit.native.tsx` for the clock, and
 * `@nw/badges`'s `motion.native.tsx` for the crests' own table. It is off below
 * the detail threshold, where there is no artwork to move.
 */

/** The monogram the Discord crest embeds; a bundler URL on web, a module here. */
const LOGO = require("../../assets/logo-mark.png");

/**
 * How many crests show before the rest collapse into a "+N".
 *
 * Two, the same as web, and for the same reason: the row sits inline next to a
 * username on a 375px screen, and a third crest is what starts pushing the
 * handle out of view.
 */
const DEFAULT_VISIBLE = 2;
const DEFAULT_SIZE = 20;

/**
 * One crest.
 *
 * Below `DETAIL_THRESHOLD` this draws the badge's *mark* — a single disc in the
 * badge's colour — rather than its artwork. That is not a cosmetic preference,
 * it is the difference between a friends list that scrolls and one that does
 * not: the full crests measured 75% janky frames on a mid-range Android, and
 * one flat shape per crest measured 1.2%. See `@nw/badges`'s `mark.ts` for the
 * numbers and why the paint alone was not enough.
 *
 * At 15px the artwork was never legible anyway — the colour is what a crest
 * that size actually communicates. Anything at profile size draws in full.
 */
export const BadgeCrest = ({
  animated = true,
  code,
  muted = false,
  size = DEFAULT_SIZE,
}: {
  /** Off for a crest that must hold still — a shelf being screenshotted. */
  animated?: boolean;
  code: BadgeCode;
  muted?: boolean;
  size?: number;
}) => {
  const Artwork = BADGE_ARTWORK[code];
  if (!Artwork) return null;

  if (size < DETAIL_THRESHOLD) {
    const fill = badgeMarkFill(code, muted);
    if (!fill) return null;
    return (
      <Svg height={size} viewBox={BADGE_VIEW_BOX} width={size}>
        <Circle {...BADGE_MARK_CIRCLE} fill={fill} />
      </Svg>
    );
  }

  return (
    <MotionProvider enabled={animated}>
      <Svg height={size} viewBox={BADGE_VIEW_BOX} width={size}>
        <Artwork logoHref={LOGO} muted={muted} size={size} />
      </Svg>
    </MotionProvider>
  );
};

/** Drops badges this bundle has no artwork for, as the web row does. */
const renderable = (badges: Badge[] | undefined): Badge[] =>
  (badges ?? []).filter((badge) => BADGE_ARTWORK[badge.code]);

export const hasVisibleBadges = (badges: Badge[] | undefined): boolean =>
  renderable(badges).length > 0;

/**
 * The badge row on a profile.
 *
 * Web opens a dialog on tap, and the dialog offers "See all badges". One step
 * rather than two here: the row goes straight to the catalogue, which is the
 * screen that answers both questions — what this novelist has, and what else
 * there is. A dialog whose only content is the same list the next screen opens
 * with is a tap in the way.
 *
 * `onPress` is optional so a surface with nothing to open still gets the row.
 */
export const BadgeRow = memo(function BadgeRow({
  animated = true,
  badges,
  max = DEFAULT_VISIBLE,
  onPress,
  size = DEFAULT_SIZE,
}: {
  /**
   * Whether the crests move. The clocks behind them are JS-driven (see
   * `@nw/animations`), so a profile turns them off while it scrolls and
   * while it is not the screen on top.
   */
  animated?: boolean;
  badges: Badge[] | undefined;
  max?: number;
  onPress?: () => void;
  size?: number;
}) {
  const theme = useAppTheme();
  const visible = renderable(badges);
  if (visible.length === 0) return null;

  const shown = visible.slice(0, max);
  const overflow = visible.length - shown.length;

  const Row = onPress ? Pressable : View;

  return (
    <Row
      accessibilityLabel={
        visible.length === 1
          ? `Badge: ${visible[0].title}`
          : `${visible.length} badges`
      }
      accessibilityRole={onPress ? "button" : undefined}
      hitSlop={onPress ? space.xs : undefined}
      onPress={onPress}
      style={styles.row}
    >
      {shown.map((badge) => (
        <BadgeCrest
          animated={animated}
          code={badge.code}
          key={badge.code}
          size={size}
        />
      ))}

      {overflow > 0 ? (
        <View
          style={[
            styles.overflow,
            {
              backgroundColor: theme.material.fillPressed,
              borderColor: theme.material.edge,
              height: size,
              minWidth: size,
            },
          ]}
        >
          <Text
            style={[
              styles.overflowLabel,
              {
                color: theme.textGray,
                fontSize: Math.max(9, Math.round(size * 0.46)),
              },
            ]}
          >
            +{overflow}
          </Text>
        </View>
      ) : null}
    </Row>
  );
});

/** The amber XP mark, for the chip on the avatar. */
export const ScoreIcon = ({ size = 14 }: { size?: number }) => (
  <Svg height={size} viewBox={SCORE_VIEW_BOX} width={size}>
    <ScoreBadgeArtwork />
  </Svg>
);

const styles = StyleSheet.create({
  overflow: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  overflowLabel: { fontWeight: "600" },
  row: { alignItems: "center", flexDirection: "row", gap: space.xs },
});
