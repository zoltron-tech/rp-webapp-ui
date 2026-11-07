import type { Muse } from "./novelist";

/**
 * A muse's Headcanons section: traits from a fixed list, quick facts (short
 * lists and this-or-that picks) and headcanon cards with their own
 * visibility. Mirrors portfolio-service `/headcanon` (HeadcanonController).
 */

/** Who may see one headcanon card. "Friends" are Novelist World friends. */
export type HeadcanonVisibility = "PUBLIC" | "FRIENDS" | "ONLY_ME";

export type HeadcanonCategory =
  | "HABITS"
  | "BACKSTORY"
  | "FEARS"
  | "COMFORT"
  | "FUN_FACT"
  | "SECRETS"
  | "RELATIONSHIPS";

export type FactBlockType =
  | "LIKES"
  | "DISLIKES"
  | "PET_PEEVES"
  | "FEARS"
  | "COMFORTS"
  | "HABITS"
  | "HOBBIES"
  | "STRENGTHS"
  | "FLAWS"
  | "THIS_OR_THAT";

// ── Catalogue (GET /headcanon/catalog) ─────────────────────────────────────

export type CatalogOption = { key: string; label: string };

export type TraitDefinition = {
  key: string;
  label: string;
  group: string;
  /** Traits that cannot be picked together with this one. */
  clashesWith: string[];
};

export type ThisOrThatPair = { key: string; a: string; b: string };

export type HeadcanonLimits = {
  maxTraits: number;
  traitNoteMax: number;
  factItemsMax: number;
  factItemMax: number;
  headcanonsMax: number;
  pinsMax: number;
  titleMax: number;
  bodyTextMax: number;
};

export type HeadcanonCatalog = {
  traitGroups: CatalogOption[];
  traits: TraitDefinition[];
  factBlocks: CatalogOption[];
  pairs: ThisOrThatPair[];
  categories: CatalogOption[];
  limits: HeadcanonLimits;
};

// ── Section ────────────────────────────────────────────────────────────────

export type MuseTrait = { key: string; note: string | null };

/** `items` is always empty for THIS_OR_THAT; its picks are `thisOrThat`. */
export type FactBlock = { block: string; items: string[] };

/** `pick` is "A" or "B", the sides of the catalogue pair. */
export type ThisOrThatPick = { pairKey: string; pick: "A" | "B" };

export type MuseFacts = {
  blocks: FactBlock[];
  thisOrThat: ThisOrThatPick[];
};

export type Headcanon = {
  id: string;
  /** The verse family's main muse. */
  museId: string;
  /** Null = shown on every verse of the family. */
  verseId: string | null;
  title: string | null;
  /** Sanitized rich-text HTML. */
  body: string;
  category: HeadcanonCategory;
  alternateUniverse: boolean;
  spoiler: boolean;
  pinned: boolean;
  visibility: HeadcanonVisibility;
  heartCount: number;
  hearted: boolean;
  createdAt: string;
  modifiedAt: string;
};

/**
 * One muse's section as the viewer may see it. The owner gets every block
 * (empty ones included) and every card; anyone else only filled blocks and
 * the cards their friendship allows. `hiddenCount` = friends-only cards a
 * non-friend is missing.
 */
export type HeadcanonSection = {
  museId: string;
  rootMuseId: string;
  canEdit: boolean;
  traits: MuseTrait[];
  facts: MuseFacts;
  headcanons: Headcanon[];
  hiddenCount: number;
};

export type HeadcanonDetail = {
  headcanon: Headcanon;
  /** The muse the card was opened on (its verse when it has one). */
  muse: Muse;
  canEdit: boolean;
};

export type HeartState = { hearted: boolean; heartCount: number };

// ── Requests ───────────────────────────────────────────────────────────────

export type TraitsRequest = { traits: { key: string; note?: string | null }[] };

export type FactsRequest = {
  blocks: { block: string; items: string[] }[];
  thisOrThat: ThisOrThatPick[];
};

export type HeadcanonRequest = {
  title: string | null;
  body: string;
  category: HeadcanonCategory;
  verseId: string | null;
  alternateUniverse: boolean;
  spoiler: boolean;
  visibility: HeadcanonVisibility;
};

// ── Errors ─────────────────────────────────────────────────────────────────

/** Reasons the backend answers with (BaseResponseModel.message). */
export const HEADCANON_ERROR = {
  BodyRequired: "BODY_REQUIRED",
  BodyTooLong: "BODY_TOO_LONG",
  FriendsOnly: "HEADCANON_FRIENDS_ONLY",
  HeadcanonsFull: "HEADCANONS_FULL",
  ItemTooLong: "ITEM_TOO_LONG",
  NoteTooLong: "NOTE_TOO_LONG",
  PinsFull: "PINS_FULL",
  TitleTooLong: "TITLE_TOO_LONG",
  TooManyItems: "TOO_MANY_ITEMS",
  TooManyTraits: "TOO_MANY_TRAITS",
  TraitsClash: "TRAITS_CLASH",
} as const;

/** What the limits say, for whichever client hit them. */
export const HEADCANON_REASON_COPY: Record<string, string> = {
  [HEADCANON_ERROR.BodyRequired]: "Write something first.",
  [HEADCANON_ERROR.BodyTooLong]:
    "That headcanon is too long. Trim it a little.",
  [HEADCANON_ERROR.HeadcanonsFull]:
    "This character has the most headcanons it can hold. Delete one first.",
  [HEADCANON_ERROR.ItemTooLong]: "Keep each item to a few words.",
  [HEADCANON_ERROR.NoteTooLong]: "Trait notes are one line.",
  [HEADCANON_ERROR.PinsFull]:
    "Three headcanons are already pinned here. Unpin one first.",
  [HEADCANON_ERROR.TitleTooLong]: "That title is too long.",
  [HEADCANON_ERROR.TooManyItems]: "A list holds five items.",
  [HEADCANON_ERROR.TooManyTraits]: "A character can have five traits.",
  [HEADCANON_ERROR.TraitsClash]: "Two of those traits are opposites.",
};

// ── Copy and links ─────────────────────────────────────────────────────────

export const HEADCANON_VISIBILITY_COPY: Record<
  HeadcanonVisibility,
  { label: string; hint: string }
> = {
  FRIENDS: {
    hint: "Your Novelist World friends. Others see a locked line instead.",
    label: "Friends only",
  },
  ONLY_ME: { hint: "A draft. Nobody else sees it.", label: "Only me" },
  PUBLIC: {
    hint: "Anyone who can see this character.",
    label: "Everyone",
  },
};

/**
 * Starter questions for the blank page. Shown one at a time with a shuffle,
 * never saved — the answer is the headcanon.
 */
export const HEADCANON_PROMPTS = [
  "What do they do when they can't sleep?",
  "What's their comfort food?",
  "What would they never admit out loud?",
  "What's the first thing they notice about a stranger?",
  "What do they keep in their pockets?",
  "What song do they sing when they think nobody's listening?",
  "How do they say sorry without saying sorry?",
  "What's a small thing that ruins their whole day?",
  "What's their worst habit?",
  "What scares them that shouldn't?",
  "Who taught them the thing they're best at?",
  "What do they do with their hands when they're nervous?",
  "What's the last thing they cried about?",
  "What do they order at a café?",
  "What gift would they secretly love?",
  "How do they act when they're jealous?",
] as const;

/**
 * A headcanon's shareable link: the muse page it lives on, opened at the
 * card. It is a muse link to anything that does not know headcanons yet, so
 * an older client still unfurls the character instead of dropping the link.
 */
export const headcanonPath = (museId: string, headcanonId: string) =>
  `/rp/muse/${museId}?headcanon=${headcanonId}`;

/** The headcanon id a muse link carries, or null. */
export const headcanonIdInUrl = (url: string): string | null => {
  const match =
    /[?&]headcanon=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(
      url,
    );
  return match ? match[1].toLowerCase() : null;
};

/** Cards pinned first, then the owner's order (what the server sends). */
export const pinnedFirst = (cards: Headcanon[]): Headcanon[] => [
  ...cards.filter((c) => c.pinned),
  ...cards.filter((c) => !c.pinned),
];
