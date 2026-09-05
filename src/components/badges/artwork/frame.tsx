"use client";

import { type FC, type ReactNode, useId } from "react";
import * as S from "./styles";

/**
 * The only thing every badge shares: a sized box, a 120×120 view box, and a set
 * of ids scoped to the instance.
 *
 * Everything visible is the badge's own. The three of them are a hexagon guild
 * sigil, a wax seal and a speech bubble — no plate, frame or ring in common —
 * because a badge shelf where every entry is the same silhouette in a different
 * colour reads as one badge awarded three times.
 */

/**
 * Below this the fine detail stops being detail and starts being dirt on the
 * screen, so each badge falls back to its silhouette and its emblem.
 */
export const DETAIL_THRESHOLD = 30;

/** Shared by every badge artwork component. */
export interface BadgeArtworkProps {
  size: number;
  animated: boolean;
  /**
   * Locked badges render the same shape drained of colour, so the badge a
   * novelist is working towards is the one they eventually get.
   */
  muted?: boolean;
}

/**
 * The greys a locked badge is drawn in.
 *
 * One set across all three: the point of a locked badge is its silhouette, and
 * three different greys would imply a distinction that does not exist until
 * something is earned.
 */
export const GREY = {
  deep: "#22242F",
  edge: "#5A5E73",
  ink: "#6C7080",
  light: "#8A8DA0",
  mid: "#33364A",
  pale: "#B9BCC8",
  soft: "#4A4E63",
} as const;

/**
 * Ids for the gradients, clips and filters one badge instance defines.
 *
 * A profile can show the same badge in several places at once, and without
 * per-instance ids the second copy paints with the first one's (possibly
 * unmounted) gradient.
 *
 * React's own ids are wrapped in delimiters (`:r0:` on 18, `«r0»` on 19), and
 * both sets are hostile inside a `url(#…)` reference — one is a CSS selector
 * character, the other is non-ASCII. Everything but letters and digits goes.
 */
export const useBadgeIds = (): ((name: string) => string) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (name: string) => `nwb-${name}-${uid}`;
};

interface Props {
  size: number;
  animated: boolean;
  children: ReactNode;
}

export const BadgeSvg: FC<Props> = ({ size, animated, children }) => (
  <S.Frame $size={size} $animated={animated} aria-hidden="true">
    <svg viewBox="0 0 120 120" role="presentation" focusable="false">
      {children}
    </svg>
  </S.Frame>
);
