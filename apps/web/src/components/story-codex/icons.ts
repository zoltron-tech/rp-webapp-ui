import type { IconType } from "react-icons";
import {
  LuAnchor,
  LuBookOpen,
  LuCastle,
  LuCrown,
  LuDroplet,
  LuFeather,
  LuFlame,
  LuGem,
  LuKey,
  LuLeaf,
  LuMapPin,
  LuMoon,
  LuMountain,
  LuPackage,
  LuScroll,
  LuShield,
  LuShip,
  LuSkull,
  LuSparkles,
  LuStar,
  LuSwords,
  LuTrees,
} from "react-icons/lu";

/**
 * A curated icon set for codex categories and entries.
 *
 * Only the *key* is stored (a short string), never markup or a component —
 * that keeps the payload small and the stored value safe to render anywhere.
 */
export const CODEX_ICONS: Record<string, IconType> = {
  anchor: LuAnchor,
  book: LuBookOpen,
  castle: LuCastle,
  crown: LuCrown,
  droplet: LuDroplet,
  feather: LuFeather,
  flame: LuFlame,
  gem: LuGem,
  key: LuKey,
  leaf: LuLeaf,
  "map-pin": LuMapPin,
  moon: LuMoon,
  mountain: LuMountain,
  package: LuPackage,
  scroll: LuScroll,
  shield: LuShield,
  ship: LuShip,
  skull: LuSkull,
  sparkles: LuSparkles,
  star: LuStar,
  swords: LuSwords,
  trees: LuTrees,
};

export const CODEX_ICON_KEYS = Object.keys(CODEX_ICONS);

export const DEFAULT_CODEX_ICON = "sparkles";

/** Falls back to a neutral glyph for anything the client doesn't recognise. */
export const resolveCodexIcon = (key: string | null | undefined): IconType =>
  CODEX_ICONS[key ?? ""] ?? CODEX_ICONS[DEFAULT_CODEX_ICON];

/** Entry accents — the same palette the timeline lanes use. */
export const CODEX_COLORS = [
  "#e5484d",
  "#f76b15",
  "#ffb224",
  "#46a758",
  "#12a594",
  "#0091ff",
  "#6e56cf",
  "#e93d82",
];
