import { keyframes } from "styled-components";

/**
 * Keyframes that were declared identically in many files.
 *
 * Only exact-body duplicates live here. Several names — `fadeUp`, `popIn`,
 * `pulse`, and `dialogPopIn` among them — exist in deliberately tuned variants
 * (five different `translateY` distances for `fadeUp` alone), and those stay
 * local to the component that tuned them. Sharing those would quietly restyle
 * screens nobody asked to change.
 *
 * Web-only by nature: React Native has no CSS keyframes, so this file stays in
 * the app rather than moving to a package. Mobile will express the same motion
 * with Reanimated.
 *
 * Import with an alias to keep existing usages untouched:
 *   import { fadeIn as overlayFadeIn } from "@/theme/animations";
 */

/** Rotation spinner. No `from`, so it starts from the element's current angle. */
export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/** Plain opacity fade — also the body of `overlayFadeIn` and `overlayShow`. */
export const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

/** Centred dialog entrance. */
export const dialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

/** Skeleton shimmer sweep, paired with a 200%-wide background gradient. */
export const shimmerMove = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

/** Bottom-sheet / tray entrance. */
export const slideInUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

/* --- Book illustrations -------------------------------------------------
 *
 * The empty-feed art and the end-of-list marker are drawn as the same book,
 * so their motion is shared here rather than tuned per component. Anything
 * specific to one scene (the quill, the Zzz) stays local to it.
 */

/** Slow drift, like the book is floating just off a desk. */
export const bookFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
`;

/** The 3D angle the book rests at, breathing so the pages read as volume. */
export const bookTilt = keyframes`
  0%, 100% { transform: perspective(420px) rotateX(7deg) rotateY(-14deg) rotate(-1.5deg); }
  50%      { transform: perspective(420px) rotateX(4deg) rotateY(-9deg) rotate(-0.5deg); }
`;

/** Shadow tightens as the book lifts away from the desk. */
export const bookShadowBreathe = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(0.88); opacity: 0.7; }
`;

/** Coloured haze behind the book, so the art isn't a grey rectangle. */
export const artGlowPulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.94); }
  50%      { opacity: 0.75; transform: scale(1.06); }
`;

/** Star sparkles wink and turn as they flare. */
export const artStarTwinkle = keyframes`
  0%, 100% { opacity: 0.12; transform: scale(0.45) rotate(0deg); }
  50%      { opacity: 0.95; transform: scale(1.15) rotate(45deg); }
`;

/** Dot sparkles just breathe — quieter than the stars they sit between. */
export const artDotTwinkle = keyframes`
  0%, 100% { opacity: 0.12; transform: scale(0.65); }
  50%      { opacity: 0.5; transform: scale(1.2); }
`;

/** Ribbon marker sways like it's caught in the same breeze. */
export const ribbonSway = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(1.5px) rotate(2deg); }
`;
