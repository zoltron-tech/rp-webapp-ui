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
