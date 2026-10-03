import {
  BLANK_CARD_VIEW_BOX,
  BLANK_SCROLL_VIEW_BOX,
  BlankCardScene,
  BlankScrollScene,
  EMPTY_GALLERY_VIEW_BOX,
  EmptyGalleryScene,
  MotionProvider,
  MUSE_BOND_VIEW_BOX,
  MuseBondScene,
  OPEN_STARTER_VIEW_BOX,
  OpenStarterScene,
  type ScenePalette,
} from "@nw/animations";
import { mixColors } from "@nw/theme";
import { useMemo } from "react";
import Svg from "react-native-svg";
import { asHex } from "@/lib/color";
import { useAppTheme } from "@/theme";

/**
 * The native frame round a shared paper scene.
 *
 * Web wraps each drawing in a sized `styled.svg` whose stylesheet animates it;
 * this is the same frame for the phone — an `<Svg>` box at web's own pixel
 * size, the palette resolved from the theme, and the motion gate the native
 * kit requires (its clocks are JS-driven, so a caller says when the reader is
 * actually looking).
 */

/**
 * The theme, as a scene asks for it.
 *
 * Web passes `var(--…)` references; there are no CSS variables here, so the
 * same roles come off `useAppTheme` — the accent the account chose (or the
 * profile's override) and the neutral scale paired with it.
 *
 * ## A muse's own colour
 *
 * A character can carry an accent of its own — a single hex, not one of the
 * twelve palettes — and web's `Art` wrapper redefines the accent scale from it
 * with `color-mix`: `--accent` is 82% of it over black, `--accent-8` 72%,
 * `--accent-10` 88% over white, `--accent-11` 62%. `mixColors` is that mix, so
 * the drawing on a muse's page is painted in the muse's colour on both clients
 * from the same arithmetic.
 */
export const useScenePalette = (accent?: string | null): ScenePalette => {
  const theme = useAppTheme();
  const own = asHex(accent);

  return useMemo(() => {
    const paper = {
      edge: theme.material.edge,
      line: theme.material.edge,
      paperBottom: theme.background,
      paperTop: theme.material.fill,
    };

    if (own) {
      return {
        ...paper,
        accent: mixColors(own, 0.82, "#000000"),
        accentBright: mixColors(own, 0.88, "#ffffff"),
        accentSoft: mixColors(own, 0.72, "#000000"),
        accentSolid: own,
        accentText: mixColors(own, 0.62, "#ffffff"),
      };
    }

    return {
      ...paper,
      accent: theme.accent.solid,
      accentBright: theme.accent.textStrong,
      accentSoft: theme.accent.surfaceHover,
      accentSolid: theme.accent.solid,
      accentText: theme.accent.text,
    };
  }, [own, theme]);
};

export type SceneName =
  | "blank-card"
  | "blank-scroll"
  | "empty-gallery"
  | "muse-bond"
  | "open-starter";

/**
 * Web's frame sizes, from `book-art/styles.ts`, so the art is the same size on
 * both clients — the view box gives the shape, this gives the scale.
 */
const SCENES: Record<
  SceneName,
  {
    Scene: (props: { palette: ScenePalette }) => React.JSX.Element;
    height: number;
    viewBox: string;
    width: number;
  }
> = {
  "blank-card": {
    height: 96,
    Scene: BlankCardScene,
    viewBox: BLANK_CARD_VIEW_BOX,
    width: 112,
  },
  "blank-scroll": {
    height: 104,
    Scene: BlankScrollScene,
    viewBox: BLANK_SCROLL_VIEW_BOX,
    width: 104,
  },
  "empty-gallery": {
    height: 96,
    Scene: EmptyGalleryScene,
    viewBox: EMPTY_GALLERY_VIEW_BOX,
    width: 120,
  },
  "muse-bond": {
    height: 96,
    Scene: MuseBondScene,
    viewBox: MUSE_BOND_VIEW_BOX,
    width: 124,
  },
  "open-starter": {
    height: 96,
    Scene: OpenStarterScene,
    viewBox: OPEN_STARTER_VIEW_BOX,
    width: 112,
  },
};

export const SceneArt = ({
  accent,
  motion = false,
  scene,
}: {
  /** A muse's own accent hex, when the art sits on that muse's page. */
  accent?: string | null;
  /**
   * Whether the scene moves. Off by default — see `motion-kit.native`: the
   * clocks are JS-driven, so the caller gates this on the reader being still.
   */
  motion?: boolean;
  scene: SceneName;
}) => {
  const palette = useScenePalette(accent);
  const { Scene, height, viewBox, width } = SCENES[scene];

  return (
    <MotionProvider enabled={motion}>
      <Svg height={height} viewBox={viewBox} width={width}>
        <Scene palette={palette} />
      </Svg>
    </MotionProvider>
  );
};
