import { useGlobalState } from "@nw/store";
import {
  ACCENT_DEFINITIONS,
  type Accent,
  type ColorScale,
  FIELD_ALPHA,
  FILL_ALPHA,
  GLASS_ALPHA,
  GLASS_FILL,
  type GlassVariant,
  getAccent,
  getNeutral,
  MATERIAL_ALPHA,
  mixColors,
  OLIVE,
  pSBC,
  SCRIM_ALPHA,
  THEME_DARK,
  THEME_LIGHT,
  type Theme,
} from "@nw/theme";
import { contrastRatio, darkenToContrast, withAlpha } from "../lib/color";
import { ACCENT_MAP } from "@nw/types/theme";
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { Platform, useColorScheme } from "react-native";

/**
 * The same palette and the same accent the web app renders, read directly.
 *
 * `@nw/theme` holds both as plain objects precisely so this file stays short
 * instead of becoming a second palette that drifts. What does not cross over is
 * anything expressed in CSS: gradients are arrays of `rgba(...) 80%` strings
 * that only mean something to `linear-gradient`, and shadows are box-shadow
 * strings. Those fields are ignored here rather than translated.
 */
export type { Accent, Theme };

/** A palette index (`ACCENT_MAP`) resolved to an accent, jade if it is not one. */
export const accentFromPalette = (palette: number | undefined | null): Accent =>
  getAccent(ACCENT_MAP[palette as keyof typeof ACCENT_MAP] ?? ACCENT_MAP[0]);

/**
 * An accent imposed on a subtree, overriding the signed-in user's.
 *
 * Web does this with a CSS class: the profile page renders
 * `<div className={profileAccent}>`, which redefines `--accent-*` for
 * everything inside it, so someone else's profile is painted in *their* colour
 * while the app around it stays yours. There is no cascade in React Native, so
 * the same idea has to be a context.
 *
 * `null` means "no override" and is the value at the root.
 */
const AccentOverrideContext = createContext<Accent | null>(null);

export const AccentProvider = ({
  children,
  palette,
}: {
  children: ReactNode;
  /** A palette index. `undefined` leaves the surrounding accent alone. */
  palette: number | undefined | null;
}) =>
  createElement(
    AccentOverrideContext.Provider,
    {
      value:
        palette === undefined || palette === null
          ? null
          : accentFromPalette(palette),
    },
    // The app theme is built once per accent, so an override has to build its
    // own — otherwise the subtree reads the accent it overrode but the theme
    // object of the one it replaced.
    createElement(AppThemeProvider, null, children),
  );

/**
 * The accent in force here.
 *
 * An override wins; otherwise it is the **account's** palette, which is where
 * the picker writes and what `apps/web/src/app/rp/layout.tsx` reads. The
 * novelist's own palette is the fallback and nothing more: the two objects are
 * separate and can disagree, and preferring the novelist is how this app
 * rendered jade for people who had chosen something else.
 *
 * Jade (`ACCENT_MAP[0]`) when there is neither, which is what the web landing
 * page shows a signed-out visitor.
 */
export const useAccent = (): Accent => {
  const override = useContext(AccentOverrideContext);
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");

  if (override) return override;
  return accentFromPalette(user?.palette ?? novelist?.palette);
};

export const useTheme = (): Theme =>
  useColorScheme() === "light" ? THEME_LIGHT : THEME_DARK;

/**
 * The neutral surfaces the web app builds panels and cards from.
 *
 * On web these are `--bg-2`, `--bg-3` and `--bg-6`, which in the dark theme
 * resolve to steps of the olive scale — the same scale `THEME_DARK.background`
 * is already the first step of. Naming them here is what lets a native panel be
 * the same colour as the web panel it mirrors instead of an approximation
 * assembled out of `modalBackground` and `hoverGrey`.
 *
 * The light values are not olive: the light theme is not a scale, so these come
 * from `THEME_LIGHT`, which is where the rest of the light palette lives.
 */
/**
 * A filled button that means something: yes, or no.
 *
 * `theme.success` and `theme.error` are *signal* colours — the green a
 * validated field turns, the red an error message is — and they are chosen to
 * be seen at a glance against a page, not to be sat on. Used raw as a button
 * fill with white on top, the green measures about 2.2:1 against its own label:
 * legible in the sense that you can tell it says Accept, and unpleasant to
 * read at any size.
 *
 * So each meaning gets a *pair*, the way the web app's `.positive` and
 * `.negative` buttons do (`components/common/button/styles.ts` darkens the
 * same two colours by half before using them): a deep fill and a pale ink of
 * the same hue in the dark theme, and the inverse in the light one — a tint
 * for the fill, the saturated colour for the ink. Both sides land above 7:1,
 * and a green button stops being the brightest thing on the screen.
 *
 * The signal colours themselves are untouched: a form error is still
 * `theme.error`. This is only for surfaces that carry text.
 */
export interface Tone {
  fill: string;
  ink: string;
}

export interface Tones {
  danger: Tone;
  positive: Tone;
}

/**
 * Dark theme: the fill sinks, the label rises.
 *
 * The two steps are picked by measuring rather than by eye, and `pSBC` blends
 * in gamma space — so these numbers are deeper than they look. They put the
 * green pair at about 7.7:1 and the red at 11:1, against **1.8:1** for the
 * signal green carrying white, which is what this replaced. Anything shallower
 * and the green is once again the brightest thing on the screen.
 */
const toneDark = (base: string): Tone => ({
  fill: pSBC(-0.85, base) as string,
  ink: pSBC(0.78, base) as string,
});

/** Light theme: a tint to sit on, the colour itself to read. 7.5:1 and 13:1. */
const toneLight = (base: string): Tone => ({
  fill: pSBC(0.92, base) as string,
  ink: pSBC(-0.78, base) as string,
});

export interface Surfaces {
  /** `--bg-2` — the sheet or page behind the cards. */
  panel: string;
  /** `--bg-3` — a card or a grouped list. */
  card: string;
  /** `--bg-4` — the same card, pressed. */
  cardActive: string;
  /** `--bg-5` — what the web app mixes accent borders against. */
  edge: string;
  /** `--bg-6` — every border and divider. */
  border: string;
}

/**
 * The dark surfaces, read off whichever neutral scale the accent is paired
 * with.
 *
 * Web's accent classes remap `--bg-1` … `--bg-12` as well as the accent steps:
 * jade is olive, crimson is mauve, iris and lunar are slate, gold and ember are
 * sand, cyan is gray, onyx has a scale of its own. Hardcoding olive here is
 * what made every theme on this client look like jade's even once the accent
 * itself was right.
 */
const surfacesFor = (neutral: ColorScale): Surfaces => ({
  border: neutral[5],
  card: neutral[2],
  cardActive: neutral[3],
  edge: neutral[4],
  panel: neutral[1],
});

const SURFACES_LIGHT: Surfaces = {
  border: THEME_LIGHT.hoverGrey,
  card: THEME_LIGHT.modalBackground,
  cardActive: THEME_LIGHT.hoverGrey,
  edge: THEME_LIGHT.inputBackground,
  panel: THEME_LIGHT.background,
};

/**
 * The functional layer: tab bar, headers, sheets, menus, composer bars.
 *
 * Read by `GlassSurface`, which chooses between the fills: `material` when an
 * iOS system blur is underneath, `unblurred` when nothing is (Android, glass
 * nested in glass), `opaque` when Reduce Transparency or Increase Contrast is
 * on. The alphas are `@nw/theme/glass`; the colours they are applied to are
 * the same steps web uses (`--bg-2` for fills, `--bg-12` for lines).
 */
export interface GlassTokens {
  fill: {
    material: Record<GlassVariant, string>;
    unblurred: Record<GlassVariant, string>;
  };
  /** Solid fill for Reduce Transparency and Increase Contrast. */
  opaque: string;
  edge: string;
  /** The edge under Increase Contrast. Web's `--bg-8`. */
  contrastEdge: string;
  highlight: string;
  sheen: string;
  /** A sheet's drag grip. */
  grip: string;
  fillHover: string;
  fillPressed: string;
  field: string;
  fieldEdge: string;
  /** Behind a sheet or dialog. */
  scrim: string;
  /** Behind clear glass over bright media. */
  dim: string;
  /** A chip straight on cover art, no blur. */
  mediaChip: string;
}

/**
 * The content layer: cards, grouped rows, chips.
 *
 * Pre-mixed against the page into opaque colours. Over a solid page a 4% wash
 * and its opaque equivalent are the same pixels, and the opaque one costs a
 * list row nothing to composite — which matters in a FlashList under a blurred
 * bar. Anything that sits on something other than the page — a card on a glass
 * sheet, a card on a banner — uses the translucent pair instead, which is web's
 * `--material-fill` / `--material-edge` as written.
 */
export interface MaterialTokens {
  fill: string;
  /**
   * One step up from `fill`, still opaque: a pressed card, and the blocks a
   * skeleton draws on a card. Web's `--material-fill` plus `--fill-hover`.
   */
  fillPressed: string;
  fillStrong: string;
  edge: string;
  highlight: string;
  /** `fill` as a wash of the text colour, for cards on glass. */
  fillTranslucent: string;
  /** `edge` as a wash of the text colour, for cards and dividers on glass. */
  edgeTranslucent: string;
}

const glassVariants = (
  base: string,
  alphas: Record<GlassVariant, number>,
): Record<GlassVariant, string> => ({
  bar: withAlpha(base, alphas.bar),
  clear: withAlpha(base, alphas.clear),
  panel: withAlpha(base, alphas.panel),
  sheet: withAlpha(base, alphas.sheet),
});

interface GlassBases {
  /** What glass is tinted with. `--bg-2`. */
  base: string;
  /** What lines and washes are drawn in. `--bg-12`. */
  ink: string;
  /** The page. `--bg-1`. */
  page: string;
  /** A strong visible edge. `--bg-8`. */
  strongEdge: string;
}

const glassFor = ({ base, ink, page, strongEdge }: GlassBases): GlassTokens => ({
  contrastEdge: strongEdge,
  dim: withAlpha("#000000", SCRIM_ALPHA.dim),
  edge: withAlpha(ink, GLASS_ALPHA.edge),
  field: withAlpha(page, FIELD_ALPHA.fill),
  fieldEdge: withAlpha(ink, FIELD_ALPHA.edge),
  fill: {
    material: glassVariants(base, GLASS_FILL.material),
    unblurred: glassVariants(base, GLASS_FILL.unblurred),
  },
  fillHover: withAlpha(ink, FILL_ALPHA.hover),
  fillPressed: withAlpha(ink, FILL_ALPHA.pressed),
  grip: withAlpha(ink, GLASS_ALPHA.grip),
  highlight: withAlpha(ink, GLASS_ALPHA.highlight),
  mediaChip: withAlpha("#000000", SCRIM_ALPHA.mediaChip),
  opaque: base,
  scrim: withAlpha("#000000", SCRIM_ALPHA.dialog),
  sheen: withAlpha(ink, GLASS_ALPHA.sheen),
});

const materialFor = ({ base, ink, page }: GlassBases): MaterialTokens => ({
  edge: mixColors(ink, MATERIAL_ALPHA.edge, page),
  edgeTranslucent: withAlpha(ink, MATERIAL_ALPHA.edge),
  fillTranslucent: withAlpha(ink, MATERIAL_ALPHA.fill),
  fill: mixColors(ink, MATERIAL_ALPHA.fill, page),
  fillPressed: mixColors(ink, MATERIAL_ALPHA.fill + FILL_ALPHA.hover, page),
  fillStrong: mixColors(base, MATERIAL_ALPHA.fillStrong, page),
  highlight: mixColors(ink, MATERIAL_ALPHA.highlight, page),
});

/**
 * Light glass is provisional: web has no light theme to copy, so these are
 * white glass with dark lines until the light pass (plan M4) measures them.
 */
const lightGlassBases = (): GlassBases => ({
  base: "#ffffff",
  ink: THEME_LIGHT.text,
  page: THEME_LIGHT.background,
  strongEdge: THEME_LIGHT.textGray,
});

const darkGlassBases = (neutral: ColorScale): GlassBases => ({
  base: neutral[1],
  ink: neutral[11],
  page: neutral[0],
  strongEdge: neutral[7],
});

/**
 * The accent as this client paints it: `@nw/theme`'s accent plus the two inks
 * that go *on* its fills.
 */
export type AppAccent = Accent & {
  /**
   * A label or icon on `solid` (primary buttons, send). White where white
   * reaches 3:1 — the bold-label threshold these buttons use — and the dark
   * ink where it does not, which today is gold (white measures 1.9:1 on it).
   */
  onSolid: string;
  /** An icon on `surface` (the tab lozenge). Step 12, or white where 12 is under 3:1 (lotus). */
  onSurface: string;
  /**
   * The brand wordmark's "WORLD": web's `--accent-8`. In the light theme the
   * contrast-tuned `text`, since a dark-scale step 8 on a white bar does not read.
   */
  brand: string;
};

/**
 * Secondary text in the light theme.
 *
 * `THEME_LIGHT.textGray` (#8d8b8b) measures 3.0:1 on the light page and 2.3:1
 * on a pressed card; this is the same grey darkened to 4.5:1 on the pressed
 * card, the darkest surface it sits on (5.8:1 on the page).
 */
const LIGHT_TEXT_GRAY = pSBC(-0.55, THEME_LIGHT.textGray) as string;

/**
 * The accent, rebuilt for the light theme.
 *
 * `@nw/theme` only carries dark scales (web has no light theme), so in the
 * light theme `text` was a pale step-11 pink on a near-white page — 1.4 to 2.7:1
 * across the twelve accents — and the tints were near-black blocks. Here the
 * tints are the solid colour washed into white, and the text is the solid
 * colour darkened only as far as 4.5:1 (7:1 for `textStrong`) against the
 * surfaces accent text sits on: a pressed card, the strong tint, and the peak
 * of the ambient light (0.14, `AmbientBackground`'s light strength).
 */
const lightAccent = (accent: Accent): Accent => {
  const page = THEME_LIGHT.background;
  const pressed = mixColors(
    THEME_LIGHT.text,
    MATERIAL_ALPHA.fill + FILL_ALPHA.hover,
    page,
  );
  const tintStrong = mixColors(accent.solid, 0.2, "#ffffff");
  const ambientPeak = mixColors(accent.solid, 0.14, page);

  return {
    ...accent,
    surface: mixColors(accent.solid, 0.18, "#ffffff"),
    surfaceActive: mixColors(accent.solid, 0.26, "#ffffff"),
    surfaceHover: mixColors(accent.solid, 0.3, "#ffffff"),
    text: darkenToContrast(accent.solid, 4.5, [pressed, tintStrong, ambientPeak]),
    textStrong: darkenToContrast(accent.solid, 7, [pressed, tintStrong]),
    tint: mixColors(accent.solid, 0.12, "#ffffff"),
    tintStrong,
  };
};

const withInks = (
  accent: Accent,
  darkInk: string,
  brand: string,
): AppAccent => ({
  ...accent,
  brand,
  onSolid: contrastRatio("#ffffff", accent.solid) >= 3 ? "#ffffff" : darkInk,
  onSurface:
    contrastRatio(accent.textStrong, accent.surface) >= 3
      ? accent.textStrong
      : "#ffffff",
});

export type AppTheme = Theme & {
  accent: AppAccent;
  glass: GlassTokens;
  material: MaterialTokens;
  surfaces: Surfaces;
  tones: Tones;
};

/**
 * Theme, accent and surfaces together, which is what most screens actually
 * want.
 *
 * The accent overrides the palette's `primary` family. The palette derives
 * those from a hardcoded blue that predates the accent system — on web nothing
 * reads it, because every accent surface goes through `--accent-*`. Overriding
 * here is what stops the native app being the one client showing that old blue.
 */
const buildAppTheme = (theme: Theme, baseAccent: Accent): AppTheme => {
  const light = theme.name === "light";
  const neutral = getNeutral(baseAccent.name);
  const glassBases = light ? lightGlassBases() : darkGlassBases(neutral);
  const shaded = light ? lightAccent(baseAccent) : baseAccent;
  const accent = withInks(
    shaded,
    light ? THEME_LIGHT.text : neutral[0],
    light ? shaded.text : ACCENT_DEFINITIONS[baseAccent.name].accent[7],
  );

  return {
    ...theme,
    accent,
    glass: glassFor(glassBases),
    material: materialFor(glassBases),
    /*
     * In the dark theme the page itself belongs to the accent's pairing.
     *
     * Web says this in one line per class — `--bg-1: var(--mauve-1)` and
     * `--text: var(--bg-12)` — and every surface, border and label follows from
     * it. These are the same steps: 1 is the page, 2 the bars and panels, 4 a
     * pressed row, 11 secondary text, 12 primary.
     *
     * The light theme is not a scale on either client, so it keeps its own
     * palette and takes only the accent.
     */
    ...(light
      ? { textGray: LIGHT_TEXT_GRAY }
      : {
          background: neutral[0],
          hoverGrey: neutral[3],
          inputBackground: neutral[2],
          modalBackground: neutral[1],
          navbar: neutral[1],
          text: neutral[11],
          textGray: neutral[10],
        }),
    primary: accent.solid,
    primaryAlpha: accent.tintStrong,
    primaryDisabled: accent.surfaceActive,
    primaryHover: accent.solidHover,
    surfaces: light ? SURFACES_LIGHT : surfacesFor(neutral),
    textLink: accent.text,
    textLinkHover: accent.textStrong,
    tones: light
      ? { danger: toneLight(theme.error), positive: toneLight(theme.success) }
      : { danger: toneDark(theme.error), positive: toneDark(theme.success) },
  };
};

/**
 * The default, for a consumer rendered outside any provider.
 *
 * A safety net rather than a real code path — the root layout wraps the whole
 * tree — but a context needs *some* value and a crash on a missing provider
 * would be a worse one.
 */
const AppThemeContext = createContext<AppTheme>(
  buildAppTheme(THEME_DARK, getAccent(ACCENT_MAP[0])),
);

/**
 * Builds the app theme once, for everything below it.
 *
 * `useAppTheme` used to do this work per call, and it is called four to six
 * times on a single friends-list row — the row, each of its buttons, each face,
 * the badge strip. Every one of those was a `useColorScheme()`, two store
 * subscriptions and a forty-field object assembled behind a `useMemo` that
 * could only ever cache for its own component. At eight rows on screen that is
 * upwards of forty subscriptions to answer a question with one answer.
 *
 * Now it is one subscription and one object, and `useAppTheme` is a context
 * read. Holding a single instance also keeps `surfaces` pointer-stable, which
 * is what lets a memoised child skip a re-render instead of failing its
 * comparison on a fresh object.
 *
 * `AccentProvider` renders one of these itself, so a subtree painted in
 * somebody else's accent gets a theme built from *their* colour with no call
 * site having to know.
 */
export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const accent = useAccent();

  const value = useMemo(() => buildAppTheme(theme, accent), [accent, theme]);

  return createElement(AppThemeContext.Provider, { value }, children);
};

export const useAppTheme = (): AppTheme => useContext(AppThemeContext);

/** The neutral scale jade is paired with on web, for borders and dividers. */
export const neutral = OLIVE;

/** The neutral scale in force, which follows the accent. */
export const useNeutral = (): ColorScale => getNeutral(useAccent().name);

/**
 * Spacing and type scale.
 *
 * Not in `@nw/theme`: the web app expresses both in `rem` inside
 * styled-components, and React Native has no `rem`. These are the values layout
 * actually uses, in the density-independent pixels RN counts in, kept here
 * until the design system publishes a unit-free scale both clients can read.
 */
export const space = {
  lg: 24,
  md: 16,
  sm: 8,
  xl: 32,
  xs: 4,
} as const;

export const radius = {
  full: 999,
  lg: 16,
  md: 8,
  /** The design system's `BORDER_RADIUS`, which is 5px. */
  sm: 5,
} as const;

/**
 * The monospace face, per platform.
 *
 * `"monospace"` is an Android family name and nothing on iOS, where an unknown
 * family silently falls back to the system font — so a code span written once
 * as `fontFamily: "monospace"` is monospaced on one platform and ordinary text
 * on the other, with no error either way. Named here so the two places that
 * draw code (the composer and the message bubble) cannot drift apart.
 */
export const monospace = Platform.select({
  android: "monospace",
  default: "Menlo",
  ios: "Menlo",
});

export const fontSize = {
  body: 15,
  caption: 12,
  display: 28,
  h2: 22,
  label: 13,
  title: 20,
} as const;
