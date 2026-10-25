import type { BadgeCode } from "@nw/types/badge";
import { GREY } from "./frame";

/**
 * A crest reduced to one shape and one colour, for list sizes.
 *
 * ## Why this exists
 *
 * The crests are drawn the way a crest should be: two or three gradients for
 * the body, a radial aura behind it, a clip path, and on three of them a
 * Gaussian-blur glow — twenty to fifty SVG nodes each. That is right at 120px
 * on a profile, where someone is actually looking at the artwork.
 *
 * In a list row they are 15px across, and they were the single most expensive
 * thing on the screen. Measured with `dumpsys gfxinfo` on a Redmi Note 10 Pro,
 * scrolling the same fourteen-row friends list, from a cold app start each
 * time:
 *
 * | Row contents | List | Janky frames | 90th pct | Slow UI thread |
 * | --- | --- | --- | --- | --- |
 * | Full crests | FlatList | 75.2% | 61ms | 133 |
 * | No badges at all | FlatList | 10.7% | 31ms | 5 |
 * | This mark | FlatList | 31.7% | 30ms | 6 |
 * | This mark | FlashList | 1.4% | 22ms | 0 |
 *
 * The `<Svg>` host views are free: an experiment keeping exactly as many of
 * them but putting a single `<Circle>` in each measured 1.2%. What costs is the
 * node count *inside* them, and it is paid on every cell mount while a finger
 * is moving — which is why it reads as rows arriving blank and filling in.
 *
 * Flattening only the *paint* — gradients and filters gated behind the detail
 * threshold, solid fills below it — was tried first and did not help: 75.2%,
 * within noise of leaving it alone. That attempt was reverted. The element
 * count is what matters, so the small-size path has to be genuinely one shape.
 *
 * ## What is lost, and why a disc
 *
 * A disc rather than each badge's own silhouette. Picking a hero path out of
 * each artwork is guesswork — several of the obvious candidates are details
 * (`SHOULDERS` on the muse crest, `RIBBON_LEFT` on the storyboard one), and a
 * wrong pick renders a fragment of a badge rather than a badge. A disc is
 * honest about being a mark.
 *
 * What survives is the colour, which is what a 15px crest was communicating
 * anyway. Above `DETAIL_THRESHOLD` nothing changes: the full artwork is drawn
 * exactly as before.
 */
export const BADGE_MARK: Partial<Record<BadgeCode, string>> = {
  AMBASSADOR: "#2E7BE0",
  BOOK_CLUB: "#3A55B0",
  BOOKWORM: "#8BC34A",
  CAMPFIRE: "#F2552C",
  CHRONICLER: "#9A6236",
  CO_AUTHOR: "#9C63E0",
  COMPLETIONIST: "#8A3C86",
  CREATIVE: "#D89A56",
  DEDICATED: "#2F8E96",
  DISCORD_GUILD_MEMBER: "#5865F2",
  ENSEMBLE_CAST: "#C99A2E",
  FRIENDLY_NOVELIST: "#5FD693",
  GLOBETROTTER: "#29A383",
  LOREKEEPER: "#7F9A3A",
  MATCHMAKER: "#E23C64",
  MUSE_KEEPER: "#C6337E",
  MUSICIAN: "#6B36A6",
  PAGE_TURNER: "#F4A3C1",
  POSTAHOLIC: "#FB9B4E",
  PROLIFIC_WRITER: "#4A5E92",
  SHAPESHIFTER: "#36CFD9",
  SOCIAL_BIRD: "#FFC864",
  SPOTIFY_LINKED: "#1DB954",
  STORY_BOARD_AUTHOR: "#8E1F2C",
  TIMEKEEPER: "#9BE15D",
  VETERAN_QUILL: "#EADBB8",
  WORLDBUILDER: "#4F8FB0",
};

/** The mark's fill, drained of colour when the badge is not yet earned. */
export const badgeMarkFill = (
  code: BadgeCode,
  muted = false,
): string | undefined => {
  const colour = BADGE_MARK[code];
  if (!colour) return undefined;
  return muted ? GREY.soft : colour;
};

/** The disc, in the 120×120 box every crest is drawn in. */
export const BADGE_MARK_CIRCLE = { cx: 60, cy: 60, r: 52 } as const;
