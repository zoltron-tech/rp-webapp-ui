import type {
  CodexRelationship,
  CodexTone,
  CodexToneLineStyle,
  RelationshipTone,
} from "@nw/types";
import type { ThemeType } from "@nw/types/theme";

/**
 * The mesh's colour encoding.
 *
 * **Why only three are built in.** A mesh draws every edge against every other,
 * so the palette has to survive an *all-pairs* comparison, not just neighbouring
 * pairs in a legend. Validated against the six checks (lightness band, chroma
 * floor, CVD separation, normal-vision floor, contrast) in both modes: three
 * hues pass with room to spare (worst all-pairs CVD ΔE 9.2 light / 9.4 dark,
 * normal-vision 24.0 / 20.9); four already fail. So the built-in tone is a
 * coarse *feeling* — warm, hostile, or neither — and what a relationship
 * actually means lives in the author's own label.
 *
 * These three are constants, not rows. That is what makes them permanent: there
 * is nothing on the server to rename and nothing to delete, so every story has
 * them whatever else its authors add.
 *
 * **A story may add its own on top.** Those carry one hex (see [CodexTone]) and
 * a stroke pattern of their own. Past three hues the colours can no longer be
 * trusted to separate on their own — which is exactly why the pattern is not
 * decoration. Each mode's built-in values are stepped for that mode's surface,
 * not flipped.
 *
 * **Colour is never the only signal.** Every tone carries a stroke pattern, so
 * the mesh still reads with no colour vision at all, and every edge is labelled
 * in the tooltip and the table view.
 */
export interface ToneSpec {
  tone: RelationshipTone;
  label: string;
  /** What this tone is for, shown in the legend's title attribute. */
  description: string;
  light: string;
  dark: string;
  /** SVG `stroke-dasharray` — the secondary encoding. */
  dash: string;
}

export const TONE_SPECS: Record<RelationshipTone, ToneSpec> = {
  BOND: {
    dark: "#199e70",
    dash: "none",
    description:
      "Loyalty, love, family, mentorship — whatever holds them together",
    label: "Bond",
    light: "#1baf7a",
    tone: "BOND",
  },
  NEUTRAL: {
    dark: "#3987e5",
    dash: "2 5",
    description: "Known to each other, but neither warm nor hostile",
    label: "Neutral",
    light: "#2a78d6",
    tone: "NEUTRAL",
  },
  STRAIN: {
    dark: "#d95926",
    dash: "7 5",
    description: "Rivalry, grudges, betrayal — whatever pulls them apart",
    label: "Strain",
    light: "#eb6834",
    tone: "STRAIN",
  },
};

/** Legend order — bonds first, since that is what most casts are made of. */
export const TONE_ORDER: RelationshipTone[] = ["BOND", "STRAIN", "NEUTRAL"];

/**
 * The stroke each line style draws as.
 *
 * The same three patterns the built-ins already use, so a custom tone never
 * introduces a stroke the reader has not already learnt from the legend.
 */
export const LINE_STYLE_DASH: Record<CodexToneLineStyle, string> = {
  DASHED: "7 5",
  DOTTED: "2 5",
  SOLID: "none",
};

export const LINE_STYLE_ORDER: CodexToneLineStyle[] = [
  "SOLID",
  "DASHED",
  "DOTTED",
];

export const LINE_STYLE_LABELS: Record<CodexToneLineStyle, string> = {
  DASHED: "Dashed",
  DOTTED: "Dotted",
  SOLID: "Continuous",
};

/**
 * A tone the mesh can actually draw: one colour for the current theme, one
 * stroke, and a name. Built-ins and custom tones both resolve to this, so
 * nothing downstream has to care which it is drawing.
 */
export interface ResolvedTone {
  /** Identity across both pools: a built-in's name, or a custom tone's id. */
  key: string;
  label: string;
  description?: string;
  color: string;
  /** SVG `stroke-dasharray`, or undefined for a continuous line. */
  dash?: string;
  /** True for the built-in three, which cannot be edited or removed. */
  isSystem: boolean;
}

/**
 * What identifies the tone an edge is drawn in.
 *
 * A custom tone's id when it has one, the built-in name otherwise. The two
 * spaces cannot collide — one is a UUID, the other is one of three words.
 */
export const toneKeyOf = (
  relationship: Pick<CodexRelationship, "tone" | "toneId">,
): string => relationship.toneId ?? relationship.tone;

const resolveSystemTone = (
  tone: RelationshipTone,
  theme: ThemeType,
): ResolvedTone => {
  const spec = TONE_SPECS[tone];
  return {
    color: theme === "dark" ? spec.dark : spec.light,
    dash: spec.dash === "none" ? undefined : spec.dash,
    description: spec.description,
    isSystem: true,
    key: tone,
    label: spec.label,
  };
};

/**
 * Every tone this story can draw, in legend and picker order: the built-in
 * three first — always, and in that order — then whatever its authors added.
 */
export const buildTonePalette = (
  customTones: CodexTone[],
  theme: ThemeType,
): ResolvedTone[] => [
  ...TONE_ORDER.map((tone) => resolveSystemTone(tone, theme)),
  ...[...customTones]
    .sort((a, b) => a.ordinal - b.ordinal)
    .filter((tone) => tone.id)
    .map((tone) => ({
      color: tone.color,
      dash:
        LINE_STYLE_DASH[tone.lineStyle] === "none"
          ? undefined
          : LINE_STYLE_DASH[tone.lineStyle],
      isSystem: false,
      key: tone.id as string,
      label: tone.label,
    })),
];

/**
 * The tone an edge is drawn in.
 *
 * Falls back to the edge's built-in when its custom tone is gone — a tone can
 * be retired out from under a relationship (the server nulls the link rather
 * than deleting the edge), and a line with no colour is worse than a line in
 * the colour it fell back to.
 */
export const resolveTone = (
  relationship: Pick<CodexRelationship, "tone" | "toneId">,
  palette: ResolvedTone[],
  theme: ThemeType,
): ResolvedTone =>
  palette.find((candidate) => candidate.key === toneKeyOf(relationship)) ??
  palette.find((candidate) => candidate.key === relationship.tone) ??
  resolveSystemTone("NEUTRAL", theme);

/** Stroke weight by strength (1–3). Thin marks: 1.5px base, 3.5px at most. */
export const strengthWidth = (strength: number): number =>
  [1.5, 2.5, 3.5][Math.min(2, Math.max(0, Math.round(strength) - 1))];
