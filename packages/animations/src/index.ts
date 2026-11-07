/**
 * Standard animated scenes, drawn once.
 *
 * The product has a handful of drawings that both clients show in the same
 * situations — an end-of-list marker, the five empty states of a character's
 * profile, the badge crests in `@nw/badges`, and more to come. A scene that exists only in `apps/web` is a scene the phone
 * either does without or redraws by hand, and both of those are how two clients
 * stop agreeing about what the product looks like.
 *
 * So the drawing lives here, against injected SVG primitives, and each app
 * keeps only the frame it wraps it in. What is genuinely per-platform is not
 * the artwork:
 *
 *  - `primitives` — the same tags, as DOM elements or `react-native-svg` views,
 *    resolved by the bundler. Every shared drawing imports its tags from here.
 *  - `motion-kit` — how a class name on a moving part becomes motion. The
 *    browser does it from a stylesheet; the phone has no stylesheet, so the kit
 *    is a clock and a table of rhythms that the native primitives read.
 */
export {
  BLANK_STORYBOARD_VIEW_BOX,
  BlankStoryboardScene,
  DARK_LIGHTHOUSE_VIEW_BOX,
  DarkLighthouseScene,
  EMPTY_SHELF_VIEW_BOX,
  EmptyShelfScene,
  FROZEN_SILENCE_VIEW_BOX,
  FrozenSilenceScene,
  NO_CONVERSATIONS_VIEW_BOX,
  NO_FRIENDS_VIEW_BOX,
  NO_INTERACTIONS_VIEW_BOX,
  NO_MATCHES_VIEW_BOX,
  NoConversationsScene,
  NoFriendsScene,
  NoInteractionsScene,
  NoMatchesScene,
  TORN_THREAD_VIEW_BOX,
  TornThreadScene,
  VANISHED_MUSE_VIEW_BOX,
  VanishedMuseScene,
} from "./empty-scenes";
export {
  END_OF_LIST_LABEL,
  END_OF_LIST_VIEW_BOX,
  EndOfListArt,
  type EndOfListPalette,
} from "./end-of-list";
export {
  type MotionProps,
  MotionProvider,
  pingPong,
  registerMotion,
  stops,
  sweep,
  useMotion,
} from "./motion-kit";
export type { MotionClock, MotionRhythm, MotionTable } from "./motion-types";
export {
  BLANK_CARD_VIEW_BOX,
  BLANK_SCROLL_VIEW_BOX,
  BlankCardScene,
  BlankScrollScene,
  EMPTY_GALLERY_VIEW_BOX,
  EmptyGalleryScene,
  MUSE_BOND_VIEW_BOX,
  MuseBondScene,
  OPEN_STARTER_VIEW_BOX,
  OpenStarterScene,
} from "./muse-scenes";
export { OPEN_BOOK_VIEW_BOX, OpenBookScene } from "./open-book";
/*
 * The primitives come out of the package root rather than a subpath.
 *
 * A subpath would have to travel through the `exports` map, and the map cannot
 * describe a platform pair: `./primitives` is `primitives.tsx` in a browser and
 * `primitives.native.tsx` on a phone, and that choice is the bundler's to make
 * from a *relative* import. Re-exporting here keeps the one import specifier
 * every consumer uses pointed at `index.ts`, which is a plain `.ts` file the
 * map handles, and lets the split happen inside the package where it works.
 */
export {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Filter,
  G,
  Line,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Svg,
  SvgImage,
  type SvgProps,
  SvgText,
} from "./primitives";
export type { ScenePalette } from "./scene-palette";
export { SILENT_BELL_VIEW_BOX, SilentBellScene } from "./silent-bell";
export { TraitGlyph } from "./trait-art";
export { UNLIT_BULB_VIEW_BOX, UnlitBulbScene } from "./unlit-bulb";
