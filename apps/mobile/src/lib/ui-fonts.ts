import { loadAsync } from "expo-font";
import { font } from "@/theme";

/** The family name the Google sign-in label asks for. */
export const GOOGLE_BUTTON_FONT = "Roboto-Medium";

/**
 * The interface's own faces: Montserrat at web's four weights, upright and
 * italic.
 *
 * Separate from `editor-fonts.ts`, which loads every face an author can pick
 * and is not waited for. These are waited for — the root holds its first frame
 * on them, beside the keychain read it already holds for — because every label
 * in the app is drawn in one, and text that arrives in the system font and
 * then changes width reflows the whole screen under the reader.
 *
 * One literal `require` per file, which is how Metro learns what to ship.
 */
const FILES: Record<string, number> = {
  [font.bold]: require("@nw/fonts/files/Montserrat-Bold.ttf"),
  [font.boldItalic]: require("@nw/fonts/files/Montserrat-BoldItalic.ttf"),
  [font.italic]: require("@nw/fonts/files/Montserrat-Italic.ttf"),
  [font.medium]: require("@nw/fonts/files/Montserrat-Medium.ttf"),
  [font.mediumItalic]: require("@nw/fonts/files/Montserrat-MediumItalic.ttf"),
  [font.regular]: require("@nw/fonts/files/Montserrat-Regular.ttf"),
  [font.semibold]: require("@nw/fonts/files/Montserrat-SemiBold.ttf"),
  [font.semiboldItalic]: require("@nw/fonts/files/Montserrat-SemiBoldItalic.ttf"),
  // Google's sign-in branding names Roboto Medium for the button label
  // (`components/auth/socials.tsx`). OFL; licence beside the file.
  [GOOGLE_BUTTON_FONT]: require("../../assets/fonts/Roboto-Medium.ttf"),
};

/**
 * Never rejects: a face that fails to load leaves the system font in its
 * place, which is a worse-looking app and still a working one.
 */
export const loadUiFonts = (): Promise<void> =>
  loadAsync(FILES).catch(() => undefined);
