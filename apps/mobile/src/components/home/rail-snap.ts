import { useMemo } from "react";
import { useWindowDimensions, type ViewStyle } from "react-native";
import { space } from "@/theme";

/**
 * The geometry the home rails share: one card in the middle, its neighbours
 * peeking in at the sides, one card per flick.
 *
 * Facebook's suggestions rail, not web's row of three. A card takes a share
 * of the screen and sits centred, with the one before and the one after
 * showing at the edges, so there is always exactly one thing being looked at.
 * The first card is the exception — it sits at the track's left edge with
 * only the next one peeking, since there is nothing before it to show.
 * `snapToOffsets` carries that rule: the first offset is zero, every other
 * one centres its card. The right padding is what lets the last card reach
 * the middle too.
 *
 * `share` is the rail's call: a portrait card (a character, a story cover)
 * is already tall and takes a smaller share than a landscape one, or the
 * rail would be a screen high.
 */

/** Between cards. */
export const RAIL_GAP = space.sm + 2;
/** The track's inset, which is also where the first card sits. */
export const RAIL_PAD = space.md;

export const useRailSnap = ({
  count,
  share,
}: {
  /** How many cards the rail holds — one snap offset each. */
  count: number;
  /** The card's width as a share of the screen's. */
  share: number;
}) => {
  const { width: screen } = useWindowDimensions();
  const cardWidth = Math.round(screen * share);

  const offsets = useMemo(() => {
    const centre = (screen - cardWidth) / 2;
    const step = cardWidth + RAIL_GAP;
    return Array.from({ length: count }, (_, index) =>
      index === 0 ? 0 : RAIL_PAD + index * step - centre,
    );
  }, [cardWidth, count, screen]);

  const contentContainerStyle = useMemo<ViewStyle>(
    () => ({
      paddingLeft: RAIL_PAD,
      // Room for the last card to reach the middle.
      paddingRight: Math.max(RAIL_PAD, screen - cardWidth - RAIL_PAD),
    }),
    [cardWidth, screen],
  );

  return {
    cardWidth,
    contentContainerStyle,
    /** Spread onto the `FlatList`. */
    listProps: {
      decelerationRate: "fast" as const,
      // One card per flick, however hard: momentum does not skip ahead.
      disableIntervalMomentum: true,
      snapToOffsets: offsets,
    },
    offsets,
  };
};
