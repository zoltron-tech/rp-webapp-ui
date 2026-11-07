import {
  BLANK_CARD_VIEW_BOX,
  BLANK_SCROLL_VIEW_BOX,
  BLANK_STORYBOARD_VIEW_BOX,
  BlankCardScene,
  BlankScrollScene,
  BlankStoryboardScene,
  DARK_LIGHTHOUSE_VIEW_BOX,
  DarkLighthouseScene,
  EMPTY_GALLERY_VIEW_BOX,
  EMPTY_SHELF_VIEW_BOX,
  EmptyGalleryScene,
  EmptyShelfScene,
  FROZEN_SILENCE_VIEW_BOX,
  FrozenSilenceScene,
  MotionProvider,
  MUSE_BOND_VIEW_BOX,
  MuseBondScene,
  NO_CONVERSATIONS_VIEW_BOX,
  NO_FRIENDS_VIEW_BOX,
  NO_INTERACTIONS_VIEW_BOX,
  NO_MATCHES_VIEW_BOX,
  NoConversationsScene,
  NoFriendsScene,
  NoInteractionsScene,
  NoMatchesScene,
  OPEN_BOOK_VIEW_BOX,
  OPEN_STARTER_VIEW_BOX,
  OpenBookScene,
  OpenStarterScene,
  type ScenePalette,
  SILENT_BELL_VIEW_BOX,
  SilentBellScene,
  TORN_THREAD_VIEW_BOX,
  TornThreadScene,
  UNLIT_BULB_VIEW_BOX,
  UnlitBulbScene,
  VANISHED_MUSE_VIEW_BOX,
  VanishedMuseScene,
} from "@nw/animations";
import { mixColors } from "@nw/theme";
import { useMemo } from "react";
import Svg from "react-native-svg";
import { MOTION_BURST_MS } from "@/animation";
import { useMotionBurst } from "@/animation/effects";
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
  | "blank-storyboard"
  | "dark-lighthouse"
  | "frozen-silence"
  | "no-conversations"
  | "no-friends"
  | "no-interactions"
  | "no-matches"
  | "torn-thread"
  | "vanished-muse"
  | "blank-card"
  | "blank-scroll"
  | "empty-gallery"
  | "empty-shelf"
  | "muse-bond"
  | "open-book"
  | "open-starter"
  | "silent-bell"
  | "unlit-bulb";

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
  "blank-storyboard": {
    height: 113,
    Scene: BlankStoryboardScene,
    viewBox: BLANK_STORYBOARD_VIEW_BOX,
    width: 148,
  },
  "dark-lighthouse": {
    height: 116,
    Scene: DarkLighthouseScene,
    viewBox: DARK_LIGHTHOUSE_VIEW_BOX,
    width: 152,
  },
  "empty-gallery": {
    height: 96,
    Scene: EmptyGalleryScene,
    viewBox: EMPTY_GALLERY_VIEW_BOX,
    width: 120,
  },
  "empty-shelf": {
    height: 113,
    Scene: EmptyShelfScene,
    viewBox: EMPTY_SHELF_VIEW_BOX,
    width: 148,
  },
  "frozen-silence": {
    height: 44,
    Scene: FrozenSilenceScene,
    viewBox: FROZEN_SILENCE_VIEW_BOX,
    width: 50,
  },
  "muse-bond": {
    height: 96,
    Scene: MuseBondScene,
    viewBox: MUSE_BOND_VIEW_BOX,
    width: 124,
  },
  "no-conversations": {
    height: 98,
    Scene: NoConversationsScene,
    viewBox: NO_CONVERSATIONS_VIEW_BOX,
    width: 128,
  },
  "no-friends": {
    height: 94,
    Scene: NoFriendsScene,
    viewBox: NO_FRIENDS_VIEW_BOX,
    width: 124,
  },
  "no-interactions": {
    height: 104,
    Scene: NoInteractionsScene,
    viewBox: NO_INTERACTIONS_VIEW_BOX,
    width: 136,
  },
  "no-matches": {
    height: 96,
    Scene: NoMatchesScene,
    viewBox: NO_MATCHES_VIEW_BOX,
    width: 124,
  },
  "open-book": {
    height: 128,
    Scene: OpenBookScene,
    viewBox: OPEN_BOOK_VIEW_BOX,
    width: 160,
  },
  "open-starter": {
    height: 96,
    Scene: OpenStarterScene,
    viewBox: OPEN_STARTER_VIEW_BOX,
    width: 112,
  },
  "silent-bell": {
    height: 92,
    Scene: SilentBellScene,
    viewBox: SILENT_BELL_VIEW_BOX,
    width: 120,
  },
  "unlit-bulb": {
    height: 94,
    Scene: UnlitBulbScene,
    viewBox: UNLIT_BULB_VIEW_BOX,
    width: 124,
  },
  "torn-thread": {
    height: 116,
    Scene: TornThreadScene,
    viewBox: TORN_THREAD_VIEW_BOX,
    width: 152,
  },
  "vanished-muse": {
    height: 116,
    Scene: VanishedMuseScene,
    viewBox: VANISHED_MUSE_VIEW_BOX,
    width: 152,
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
  // A moment of motion when the scene appears, then its rest pose — the
  // same rule as the crests and the end-of-list art (`useMotionBurst`).
  const burst = useMotionBurst(motion, MOTION_BURST_MS);

  return (
    <MotionProvider enabled={burst.live}>
      <Svg height={height} viewBox={viewBox} width={width}>
        <Scene palette={palette} />
      </Svg>
    </MotionProvider>
  );
};
