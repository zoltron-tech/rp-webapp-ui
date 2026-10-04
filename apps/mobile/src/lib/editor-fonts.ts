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
