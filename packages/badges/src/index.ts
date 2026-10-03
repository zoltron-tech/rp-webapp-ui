import { registerBadgeMotion } from "./motion";

/**
 * Badge crests, drawn once.
 *
 * Twelve hand-tuned SVGs used to live in `apps/web` alone. A phone showing a
 * novelist's badges as coloured chips while the web shows their crests is two
 * products, so the drawings moved here and both clients render them: the DOM on
 * web, `react-native-svg` on device, resolved by the bundler through
 * `primitives`.
 *
 * What stays in each app is the frame — the styled wrapper with the hover sweep
 * on web, an `<Svg>` box on native — and the row that arranges crests beside a
 * name. Those are genuinely different; the artwork is not.
 */
export {
  BADGE_ARTWORK,
  hasBadgeArtwork,
} from "./artwork";
export {
  BADGE_VIEW_BOX,
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "./frame";
export {
  BADGE_MARK,
  BADGE_MARK_CIRCLE,
  badgeMarkFill,
} from "./mark";
export { registerBadgeMotion } from "./motion";
export { SCORE_VIEW_BOX, ScoreBadgeArtwork } from "./score";

/*
 * Teaches the shared motion table about the crests' class names. A no-op on the
 * web, where the browser matches them from the stylesheet — and a call rather
 * than an import for its side effect, so nothing can tree-shake it away.
 */
registerBadgeMotion();
