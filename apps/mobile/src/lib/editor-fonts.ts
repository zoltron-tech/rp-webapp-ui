import { faceName, faceOf, fontOf } from "@nw/fonts";
import { loadAsync } from "expo-font";
import { useEffect, useState } from "react";
import { InteractionManager, Platform } from "react-native";

/**
 * The editor's faces, on the phone.
 *
 * `@nw/fonts` is the list both clients share and the files behind it; this is
 * the half only a bundler can do. Metro needs one literal `require` per file
 * to know what to ship, so the table below is written out rather than built
 * from the list — the keys are `faceName(family, face)`, which is also what
 * `nativeFace` answers with, so the two cannot disagree.
 *
 * Four faces per family rather than every weight web declares: an editor
 * produces regular, bold, italic and bold italic, and nothing else, and every
 * extra file is a megabyte in the binary.
 */
const FILES: Record<string, number> = {
  "BodoniModaSC-Bold": require("@nw/fonts/files/BodoniModaSC_18pt-Bold.ttf"),
  "BodoniModaSC-BoldItalic": require("@nw/fonts/files/BodoniModaSC_18pt-BoldItalic.ttf"),
  "BodoniModaSC-Italic": require("@nw/fonts/files/BodoniModaSC_18pt-Italic.ttf"),
  "BodoniModaSC-Regular": require("@nw/fonts/files/BodoniModaSC_18pt-Regular.ttf"),
  "Genos-Bold": require("@nw/fonts/files/Genos-Bold.ttf"),
  "Genos-BoldItalic": require("@nw/fonts/files/Genos-BoldItalic.ttf"),
  "Genos-Italic": require("@nw/fonts/files/Genos-Italic.ttf"),
  "Genos-Regular": require("@nw/fonts/files/Genos-Regular.ttf"),
  "Montserrat-Bold": require("@nw/fonts/files/Montserrat-Bold.ttf"),
  "Montserrat-BoldItalic": require("@nw/fonts/files/Montserrat-BoldItalic.ttf"),
  "Montserrat-Italic": require("@nw/fonts/files/Montserrat-Italic.ttf"),
  "Montserrat-Regular": require("@nw/fonts/files/Montserrat-Regular.ttf"),
  "MontserratUnderline-Bold": require("@nw/fonts/files/MontserratUnderline-Bold.ttf"),
  "MontserratUnderline-BoldItalic": require("@nw/fonts/files/MontserratUnderline-BoldItalic.ttf"),
  "MontserratUnderline-Italic": require("@nw/fonts/files/MontserratUnderline-Italic.ttf"),
  "MontserratUnderline-Regular": require("@nw/fonts/files/MontserratUnderline-Regular.ttf"),
  "PlayfairDisplaySC-Bold": require("@nw/fonts/files/PlayfairDisplaySC-Bold.ttf"),
  "PlayfairDisplaySC-BoldItalic": require("@nw/fonts/files/PlayfairDisplaySC-BoldItalic.ttf"),
  "PlayfairDisplaySC-Italic": require("@nw/fonts/files/PlayfairDisplaySC-Italic.ttf"),
  "PlayfairDisplaySC-Regular": require("@nw/fonts/files/PlayfairDisplaySC-Regular.ttf"),
  "Savate-Bold": require("@nw/fonts/files/Savate-Bold.ttf"),
  "Savate-BoldItalic": require("@nw/fonts/files/Savate-BoldItalic.ttf"),
  "Savate-Italic": require("@nw/fonts/files/Savate-Italic.ttf"),
  "Savate-Regular": require("@nw/fonts/files/Savate-Regular.ttf"),
  "ShantellSans-Bold": require("@nw/fonts/files/ShantellSans-Bold.ttf"),
  "ShantellSans-BoldItalic": require("@nw/fonts/files/ShantellSans-BoldItalic.ttf"),
  "ShantellSans-Italic": require("@nw/fonts/files/ShantellSans-Italic.ttf"),
  "ShantellSans-Regular": require("@nw/fonts/files/ShantellSans-Regular.ttf"),
  "Tourney-Bold": require("@nw/fonts/files/Tourney-Bold.ttf"),
  "Tourney-BoldItalic": require("@nw/fonts/files/Tourney-BoldItalic.ttf"),
  "Tourney-Italic": require("@nw/fonts/files/Tourney-Italic.ttf"),
  "Tourney-Regular": require("@nw/fonts/files/Tourney-Regular.ttf"),
  "ZillaSlab-Bold": require("@nw/fonts/files/ZillaSlab-Bold.ttf"),
  "ZillaSlab-BoldItalic": require("@nw/fonts/files/ZillaSlab-BoldItalic.ttf"),
  "ZillaSlab-Italic": require("@nw/fonts/files/ZillaSlab-Italic.ttf"),
  "ZillaSlab-Regular": require("@nw/fonts/files/ZillaSlab-Regular.ttf"),
};

/**
 * Loads every face once, at the root. Not awaited: text drawn before a face
 * arrives falls back to the system font for a frame or two, which is better
 * than holding the whole app on a font decode.
 */
export const useEditorFonts = () => {
  const [, setLoaded] = useState(false);

  useEffect(() => {
    // After the first screen has settled, not beside it: these are the faces
    // an author *can* pick, thirty-six files, and registering them competed
    // with the first paint for text that almost never uses them. A post set
    // in one draws in the interface face until its file lands, as it already
    // did for the frames before the load finished.
    const task = InteractionManager.runAfterInteractions(() => {
      void loadAsync(FILES)
        .catch(() => undefined)
        // A render from the root once they are in, as `useFonts` gave: text
        // already on screen in one of these faces is drawn again with it.
        .then(() => setLoaded(true));
    });
    return () => task.cancel();
  }, []);
};

/**
 * Two vertical metrics per family, from the fonts' `hhea` tables — the
 * bundled files under `@nw/fonts/files`, and for the three system families
 * the same Monotype fonts. CoreText lays lines out by these.
 *
 * `content` is ascent plus descent, in em: how tall a line of the face is
 * before any gap between lines. The editor fixes each line's height
 * (`lineHeight` is both the minimum and the maximum on iOS), and a face
 * taller than the box it is given has its tops clipped on the first line
 * and draws its lines into one another; `blockSizing` widens the box for it.
 *
 * `leading` is the `lineGap`, in em. iOS adds it under every line of a
 * `TextInput` on top of `lineHeight`, while React Native measures the field
 * without it, so the native view wants `lines × leading` more than the
 * frame it is given. With `scrollEnabled` off the text container is only as
 * tall as the frame, and the last line of a leaded face never fits: nothing
 * laid it out, nothing drew it, and the caret sat at the top-left corner
 * until the measurement reached the line after. Only Times New Roman and
 * Arial carry a gap; every bundled file and Courier New are at zero. See
 * `BlockInputView` for the slack that gives it back.
 */
const METRICS: Record<string, { content: number; leading: number }> = {
  Arial: { content: 1.117, leading: 67 / 2048 },
  BodoniModaSC: { content: 1.525, leading: 0 },
  "Courier New": { content: 1.133, leading: 0 },
  Genos: { content: 1.2, leading: 0 },
  Montserrat: { content: 1.219, leading: 0 },
  MontserratUnderline: { content: 1.219, leading: 0 },
  PlayfairDisplaySC: { content: 1.333, leading: 0 },
  Savate: { content: 1.3, leading: 0 },
  ShantellSans: { content: 1.34, leading: 0 },
  "Times New Roman": { content: 1.107, leading: 87 / 2048 },
  Tourney: { content: 1.1, leading: 0 },
  ZillaSlab: { content: 1.2, leading: 0 },
};

/** No family means the interface face, which is Montserrat. */
const metricsOf = (family: string | undefined) =>
  (family && METRICS[family]) || METRICS.Montserrat;

export const fontContentEm = (family: string | undefined): number =>
  metricsOf(family).content;

export const fontLeading = (family: string | undefined): number =>
  metricsOf(family).leading;

/**
 * What to put in `fontFamily` for a run in this family with these marks.
 *
 * Two answers, and the caller has to know which it got. A system family
 * maps to a family the platform has (`sans-serif`, `Times New Roman`) and
 * the marks are still drawn with `fontWeight` and `fontStyle`. A loaded
 * family maps to one *file* — `Savate-BoldItalic` — which already is bold
 * and italic; setting `fontWeight` on top of it makes Android fake-bold a
 * face that is bold already. `baked` says the marks are in the name.
 */
export const nativeFace = (
  family: string | undefined,
  bold: boolean,
  italic: boolean,
): { baked: boolean; fontFamily: string } | undefined => {
  const font = fontOf(family);
  if (!font) return undefined;
  if (font.system) {
    return { baked: false, fontFamily: Platform.select(font.system) ?? "" };
  }
  return {
    baked: true,
    fontFamily: faceName(font.family, faceOf(bold, italic)),
  };
};
