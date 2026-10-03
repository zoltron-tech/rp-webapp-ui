/**
 * The faces the rich text editor offers, shared by both clients.
 *
 * The saved HTML carries a family name — `font-family: Savate` — and nothing
 * else, so the two clients have to agree on what that name means. This is the
 * one list they agree on: web builds its font menu from it and draws each
 * family through `fonts.css`; the phone builds its font sheet from it and
 * loads each family's files through `expo-font`.
 *
 * ## Three kinds of family
 *
 * The first three are fonts every reader already has — Arial, Times New
 * Roman, Courier New — and ship no file. A browser has them by name; a phone
 * has an equivalent under a different name, which `system` records.
 *
 * The rest are files under `files/`, one per weight and style. The web
 * `@font-face` rules cover every weight that was shipped; the phone registers
 * the four an editor can produce (regular, bold, italic, bold italic), each
 * under the name `faceName` returns, because React Native on Android looks a
 * loaded face up by exact name rather than by family and weight.
 */

export type Face = "regular" | "bold" | "italic" | "boldItalic";

export interface EditorFont {
  /** The family name as the saved HTML carries it, and as web shows it. */
  family: string;
  /** File names under `files/`, per face. Absent for a system font. */
  files?: Record<Face, string>;
  /** What the phone already has, for a font that ships no file. */
  system?: { android: string; ios: string };
}

const SUFFIX: Record<Face, string> = {
  bold: "Bold",
  boldItalic: "BoldItalic",
  italic: "Italic",
  regular: "Regular",
};

const files = (prefix: string): Record<Face, string> => ({
  bold: `${prefix}-${SUFFIX.bold}.ttf`,
  boldItalic: `${prefix}-${SUFFIX.boldItalic}.ttf`,
  italic: `${prefix}-${SUFFIX.italic}.ttf`,
  regular: `${prefix}-${SUFFIX.regular}.ttf`,
});

/** In web's menu order. */
export const EDITOR_FONTS: EditorFont[] = [
  { family: "Arial", system: { android: "sans-serif", ios: "Arial" } },
  {
    family: "Times New Roman",
    system: { android: "serif", ios: "Times New Roman" },
  },
  {
    family: "Courier New",
    system: { android: "monospace", ios: "Courier New" },
  },
  { family: "Montserrat", files: files("Montserrat") },
  { family: "MontserratUnderline", files: files("MontserratUnderline") },
  { family: "Savate", files: files("Savate") },
  { family: "PlayfairDisplaySC", files: files("PlayfairDisplaySC") },
  { family: "ZillaSlab", files: files("ZillaSlab") },
  { family: "ShantellSans", files: files("ShantellSans") },
  { family: "Genos", files: files("Genos") },
  // The file set is the 18pt optical size; the family name is what web
  // declares in its @font-face rules.
  { family: "BodoniModaSC", files: files("BodoniModaSC_18pt") },
  { family: "Tourney", files: files("Tourney") },
];

/** The family names alone — web's `FONTS`. */
export const FONT_FAMILIES: string[] = EDITOR_FONTS.map((font) => font.family);

/** What text is in when no family was chosen. */
export const DEFAULT_FONT = "Arial";

export const fontOf = (family: string | undefined): EditorFont | undefined =>
  family ? EDITOR_FONTS.find((font) => font.family === family) : undefined;

/** Which face a run's marks call for. */
export const faceOf = (bold: boolean, italic: boolean): Face =>
  bold && italic ? "boldItalic" : bold ? "bold" : italic ? "italic" : "regular";

/**
 * The name a family's face is registered under on the phone.
 *
 * `Savate-Bold`, `Montserrat-Italic` — the family and the face, which is also
 * how the files are named. One name per file, because that is the unit a
 * native font loader works in.
 */
export const faceName = (family: string, face: Face): string =>
  `${family}-${SUFFIX[face]}`;
