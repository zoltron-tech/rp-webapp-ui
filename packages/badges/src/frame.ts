import { useId } from "react";

/**
 * What every crest shares, minus the frame itself.
 *
 * The frame is the one part that stays in each app: on web it is a styled
 * wrapper carrying the hover sweep and the CSS keyframes, on native it is an
 * `<Svg>` with a width and a height. Neither belongs in a package that must not
 * know about styling engines, and both wrap the identical 120×120 drawing.
 *
 * Everything visible is the badge's own. The crests share no plate, frame or
 * ring — a shelf where every entry is the same silhouette in a different colour
 * reads as one badge awarded three times.
 */

/** The view box every crest is drawn in. */
export const BADGE_VIEW_BOX = "0 0 120 120";

/**
 * Below this the fine detail stops being detail and starts being dirt on the
 * screen, so each badge falls back to its silhouette and its emblem.
 */
export const DETAIL_THRESHOLD = 30;

/** Shared by every badge artwork component. */
export interface BadgeArtworkProps {
  size: number;
  /**
   * Locked badges render the same shape drained of colour, so the badge a
   * novelist is working towards is the one they eventually get.
   */
  muted?: boolean;
  /**
   * The Novelist World monogram, for the one crest that embeds it.
   *
   * Passed in rather than imported: the same image is a bundler URL on web and
   * a `require`d asset module on native, and this package can resolve neither.
   * Absent means the crest draws its tile without the logo.
   */
  logoHref?: unknown;
}

/**
 * The greys a locked badge is drawn in.
 *
 * One set across all of them: the point of a locked badge is its silhouette,
 * and different greys would imply a distinction that does not exist until
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
