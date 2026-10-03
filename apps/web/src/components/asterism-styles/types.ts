/** Selectable scene-divider glyphs ("asterisms") shown in the story reader. */
export type AsterismStyle =
  | "classic"
  | "fleuron"
  | "flourish"
  | "diamond"
  | "stars"
  | "dots"
  | "none";

export const DEFAULT_ASTERISM_STYLE: AsterismStyle = "classic";

/** The rule flanking the glyph on either side (ignored when there's no glyph). */
export type AsterismLineVariant =
  | "gradient"
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "beaded";

/** Dropdown option describing an asterism style. An empty `glyph` means no
 *  divider is rendered at all (the "none" style). */
export type AsterismStyleOption = {
  value: AsterismStyle;
  label: string;
  description: string;
  glyph: string;
  lineVariant: AsterismLineVariant;
};
