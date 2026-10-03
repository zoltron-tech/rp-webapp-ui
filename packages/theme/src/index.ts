/**
 * Design tokens shared by every client.
 *
 * What belongs here: values. Colours, radii, stacking order, accent names —
 * anything a React Native view and a styled-component both need to agree on.
 *
 * What does not: `styled-components` helpers, keyframes, and the `common.styled`
 * primitives. Those stay in `apps/web/src/theme`, which re-exports this module
 * so existing `@/theme` imports keep resolving.
 */
export {
  type Accent,
  type ColorScale,
  DEFAULT_ACCENT,
  getAccent,
  getNeutral,
  JADE,
  mixColors,
  OLIVE,
} from "./accents";
export { BORDER_RADIUS, Z_INDEX } from "./geometry";
export {
  FIELD_ALPHA,
  FILL_ALPHA,
  GLASS_ALPHA,
  GLASS_BLUR_PX,
  GLASS_FILL,
  type GlassVariant,
  MATERIAL_ALPHA,
  SCRIM_ALPHA,
} from "./glass";
export { accentColor, THEME_DARK, THEME_LIGHT, type Theme } from "./palette";
export { pSBC } from "./psbc.js";
export { ACCENT_DEFINITIONS } from "./scales";
