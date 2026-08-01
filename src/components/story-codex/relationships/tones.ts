import type { RelationshipTone } from "@/types";
import type { ThemeType } from "@/types/theme";

/**
 * The mesh's colour encoding.
 *
 * **Why only three tones.** A mesh draws every edge against every other, so
 * the palette has to survive an *all-pairs* comparison, not just neighbouring
 * pairs in a legend. Validated against the six checks (lightness band, chroma
 * floor, CVD separation, normal-vision floor, contrast) in both modes: three
 * hues pass with room to spare (worst all-pairs CVD ΔE 9.2 light / 9.4 dark,
 * normal-vision 24.0 / 20.9); four already fail. So the tone is a coarse
 * *feeling* — warm, hostile, or neither — and what a relationship actually
 * means lives in the author's own label.
 *
 * Each mode's values are stepped for that mode's surface, not flipped.
 *
 * **Colour is never the only signal.** Every tone also carries a stroke
 * pattern, so the mesh still reads with no colour vision at all, and every
 * edge is labelled in the tooltip and the table view.
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

export const toneSpec = (tone: string | null | undefined): ToneSpec =>
  TONE_SPECS[(tone ?? "NEUTRAL") as RelationshipTone] ?? TONE_SPECS.NEUTRAL;

export const toneColor = (
  tone: string | null | undefined,
  theme: ThemeType,
): string => {
  const spec = toneSpec(tone);
  return theme === "dark" ? spec.dark : spec.light;
};

/** Stroke weight by strength (1–3). Thin marks: 1.5px base, 3.5px at most. */
export const strengthWidth = (strength: number): number =>
  [1.5, 2.5, 3.5][Math.min(2, Math.max(0, Math.round(strength) - 1))];
