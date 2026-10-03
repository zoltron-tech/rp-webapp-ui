/**
 * Glass and material, as numbers.
 *
 * Web expresses these as `color-mix(in srgb, X N%, transparent)` in
 * `apps/web/src/app/globals.css` ("Glass & material tokens"); React Native
 * resolves the same numbers into `#rrggbbaa` in `apps/mobile/src/theme`. The
 * percentages there and the fractions here are one set of values — change
 * both together.
 *
 * What is *not* here is which colour each alpha is applied to. That depends on
 * the client's palette (`--bg-2` / `--bg-12` on web, the accent's neutral scale
 * or the light palette on mobile), so each client pairs these with its own
 * base colours.
 *
 * Two layers, and the split is the whole design:
 *
 *  - **glass** — the functional layer: bars, menus, sheets. Translucent,
 *    blurred where the platform can afford it.
 *  - **material** — depth inside the content layer: cards, rows, chips. A faint
 *    fill and a hairline, never a blur.
 */

export type GlassVariant = "bar" | "clear" | "panel" | "sheet";

/**
 * How much of the base colour a glass surface keeps, by what is behind it.
 *
 *  - `css` — over a CSS `backdrop-filter`, where the fill does all of the
 *    tinting. Web's `--glass-fill-bar/-panel/-clear/-dialog`.
 *  - `material` — over an iOS system material (`UIVisualEffectView`), which
 *    already darkens or lightens what it blurs. The fill only has to carry the
 *    accent's neutral, so it is much thinner. Starting values: tune them in the
 *    mobile glass lab, not by eye in a screenshot.
 *  - `unblurred` — no blur at all: Android, and glass nested inside glass.
 *    Legibility has to come from opacity. `bar` is the tab bar's `BAR_ALPHA`,
 *    set against a white shirt in a photo; `clear` is web's `MEDIA_CHIP`.
 *    `panel` and `sheet` are solid: at 0.96 the full-screen menu showed the
 *    feed under it as ghost text on a device, and a text-heavy surface with
 *    no blur has nothing else to make it legible (HIG: Android prefers an
 *    opaque or lightly translucent bar over imitation glass).
 */
export const GLASS_FILL = {
  css: { bar: 0.64, clear: 0.4, panel: 0.8, sheet: 0.62 },
  material: { bar: 0.3, clear: 0.1, panel: 0.45, sheet: 0.3 },
  unblurred: { bar: 0.9, clear: 0.58, panel: 1, sheet: 1 },
} as const satisfies Record<string, Record<GlassVariant, number>>;

/** Backdrop blur radius on web, in px. `--glass-blur`, `--glass-blur-dialog`. */
export const GLASS_BLUR_PX = {
  bar: 24,
  clear: 24,
  panel: 24,
  sheet: 40,
} as const satisfies Record<GlassVariant, number>;

/** Lines on glass, as a fraction of the text colour. */
export const GLASS_ALPHA = {
  /** `--glass-edge` — the hairline around the surface. */
  edge: 0.11,
  /** Mobile only: a sheet's drag grip. Web's sheets have no grip. */
  grip: 0.3,
  /** `--glass-highlight` — light catching the top edge of a bar or panel. */
  highlight: 0.07,
  /** `--glass-sheen` — the same, on dialogs and sheets. */
  sheen: 0.09,
} as const;

/** Content-layer depth. `--material-*`. */
export const MATERIAL_ALPHA = {
  /** Hairline, fraction of the text colour. */
  edge: 0.09,
  /** Card fill, fraction of the text colour. */
  fill: 0.04,
  /** Heavier panel fill, fraction of the panel colour. */
  fillStrong: 0.72,
  /** Top-edge highlight, fraction of the text colour. */
  highlight: 0.06,
} as const;

/** Hover and pressed washes, fraction of the text colour. `--fill-*`. */
export const FILL_ALPHA = {
  hover: 0.08,
  pressed: 0.12,
} as const;

/** Text-entry wells. `--field-fill` (of the page colour), `--field-edge`. */
export const FIELD_ALPHA = {
  edge: 0.1,
  fill: 0.55,
} as const;

/** Black overlays. */
export const SCRIM_ALPHA = {
  /** Behind a dialog or sheet. Light, so the glass above has something to show. */
  dialog: 0.4,
  /** Apple's one published number: behind clear glass over bright media. */
  dim: 0.35,
  /** Chips sitting straight on cover art, with no blur. `MEDIA_CHIP`. */
  mediaChip: 0.58,
} as const;
