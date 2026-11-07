import {
  HEADCANON_PROMPTS,
  HEADCANON_REASON_COPY,
  type HeadcanonCatalog,
  type HeadcanonCategory,
  type TraitDefinition,
} from "@nw/types/headcanon";

/**
 * What the Headcanons screens share that is not drawing: catalogue lookups,
 * the trait group hues, verse options and the reason copy.
 *
 * Web's `components/headcanons/catalog.ts`, `styles.ts` (`GROUP_HUE`) and
 * `headcanon-editor-sheet.tsx` (`toVerseOptions`), kept in step by hand.
 */

/** Labels and lookups the components need, derived once per catalogue. */
export const catalogLookups = (catalog: HeadcanonCatalog | null) => {
  const traits = new Map<string, TraitDefinition>(
    (catalog?.traits ?? []).map((t) => [t.key, t]),
  );
  const blocks = new Map<string, string>(
    (catalog?.factBlocks ?? []).map((b) => [b.key, b.label]),
  );
  const categories = new Map<string, string>(
    (catalog?.categories ?? []).map((c) => [c.key, c.label]),
  );
  const pairs = new Map((catalog?.pairs ?? []).map((p) => [p.key, p] as const));
  return {
    blockLabel: (key: string) => blocks.get(key) ?? key,
    categoryLabel: (key: HeadcanonCategory | string) =>
      categories.get(key) ?? key,
    pair: (key: string) => pairs.get(key),
    traitLabel: (key: string) => traits.get(key)?.label ?? key,
    traits,
  };
};

export type CatalogLookups = ReturnType<typeof catalogLookups>;

/**
 * Each trait group's hue, so a character's chips read as a little spread of
 * colours rather than five identical pills. Web's `GROUP_HUE`.
 */
const GROUP_HUE: Record<string, string> = {
  DARK: "#a78bfa",
  EMOTIONAL: "#f472b6",
  LIFESTYLE: "#34d399",
  MIND: "#38bdf8",
  SOCIAL: "#fbbf24",
};

export const traitHue = (group: string | null | undefined, fallback: string) =>
  (group && GROUP_HUE[group]) || fallback;

/** Type on a picked (solid) chip: dark, whatever the hue. */
export const PICKED_INK = "#1d1426";

export type VerseOption = { id: string; label: string };

/** A character's `verses` (main verse first) as picker options. */
export const toVerseOptions = (
  verses: { id: string; verseNumber?: number | null }[] | null | undefined,
): VerseOption[] =>
  (verses ?? []).map((v) => ({
    id: v.id,
    label: (v.verseNumber ?? 1) <= 1 ? "Main verse" : `Verse ${v.verseNumber}`,
  }));

/** The server's reason, as words, or the fallback. */
export const reasonCopy = (result: unknown, fallback: string) => {
  const reason =
    result && typeof result === "object" && "reason" in result
      ? (result as { reason?: string }).reason
      : undefined;
  return (reason && HEADCANON_REASON_COPY[reason]) || fallback;
};

/** No answer, or `{ message }` instead of the thing asked for. */
export const isApiError = (
  value: unknown,
): value is { message: string } | null | undefined =>
  !value || (typeof value === "object" && "message" in value);

export const randomPrompt = (not?: string | null) => {
  const pool = HEADCANON_PROMPTS.filter((p) => p !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Strengths and flaws are two blocks the owner turns on as one. */
export const PAIRED_BLOCKS = ["STRENGTHS", "FLAWS"];

/** The one-line example under each block in the blocks tray. */
export const BLOCK_EXAMPLES: Record<string, string> = {
  COMFORTS: "warm socks, tea, re-reads",
  DISLIKES: "being interrupted",
  FEARS: "thunderstorms, deep water",
  HABITS: "hums when nervous",
  HOBBIES: "chess, potions, lockpicking",
  LIKES: "rain, old libraries",
  PET_PEEVES: "dog-eared pages",
  STRENGTHS: "two short lists side by side",
  THIS_OR_THAT: "tea or coffee, cats or dogs…",
};
