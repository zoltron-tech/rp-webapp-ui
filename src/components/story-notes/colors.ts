/**
 * The sticky palette.
 *
 * Only a hex is stored, never a theme token — a note keeps the colour its
 * author picked whichever palette the *reader* is on. The card tints it into
 * the surface at render time (see `noteSurface`), so the same eight hues stay
 * legible in both the light and dark themes rather than shouting in one of
 * them.
 */

export type NoteColor = {
  /** Stored value. Null is the plain sticky. */
  hex: string | null;
  label: string;
};

/** Matches the codex/timeline accents, so the workspace reads as one system. */
export const NOTE_COLORS: NoteColor[] = [
  { hex: null, label: "Plain" },
  { hex: "#e5484d", label: "Coral" },
  { hex: "#f76b15", label: "Peach" },
  { hex: "#ffb224", label: "Sand" },
  { hex: "#46a758", label: "Fern" },
  { hex: "#12a594", label: "Sage" },
  { hex: "#0091ff", label: "Tide" },
  { hex: "#6e56cf", label: "Dusk" },
  { hex: "#e93d82", label: "Blossom" },
];

/** The card's background: the note's hue, mixed down into the app surface. */
export const noteSurface = (hex: string | null | undefined) =>
  hex ? `color-mix(in srgb, ${hex} 15%, var(--bg-2))` : "var(--bg-2)";

/** The card's border — the same hue, held a little stronger than the fill. */
export const noteBorder = (hex: string | null | undefined) =>
  hex ? `color-mix(in srgb, ${hex} 42%, var(--bg-6))` : "var(--bg-6)";
