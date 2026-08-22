import type {
  CodexCategory,
  CodexEntry,
  CodexRelationship,
  CodexTone,
  StoryCastMember,
  StoryCharacter,
  StoryPerson,
} from "@nw/types";

/**
 * Sample data for the storyboard guide.
 *
 * A made-up story, so every stage in the guide shows a populated screen rather
 * than the empty states a new author would otherwise be reading about. None of
 * it is ever saved: the stages render the real components, but their handlers
 * go nowhere.
 */

/**
 * A portrait drawn inline rather than fetched.
 *
 * Data URIs keep the guide off the network — a sample avatar has no endpoint to
 * come from, and a broken image in a teaching screenshot teaches the wrong
 * thing.
 */
const portrait = (initial: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" fill="${color}"/>` +
      `<text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" ` +
      `font-size="30" fill="#ffffff">${initial}</text></svg>`,
  )}`;

/** Chapters, cut down to what the guide's stages actually draw. */
export const MOCK_CHAPTERS = [
  { id: "chapter-1", name: "The Salt Road" },
  { id: "chapter-2", name: "What the Tide Left" },
  { id: "chapter-3", name: "Hollowmere" },
];

/** The derived cast: muses, in the story because they speak in it. */
export const MOCK_CAST: StoryCastMember[] = [
  {
    accent: null,
    avatar: null,
    id: "muse-elenna",
    image: portrait("E", "#6e56cf"),
    name: "Elenna Vale",
  },
  {
    accent: null,
    avatar: null,
    id: "muse-corvin",
    image: portrait("C", "#0091ff"),
    name: "Corvin Ash",
  },
];

/** The story's own characters: owned by the storyboard, written by anyone. */
export const MOCK_CHARACTERS: StoryCharacter[] = [
  {
    about: "Keeps the only inn on the Salt Road, and every secret told in it.",
    extraAttributes: { House: "None", Owes: "A debt to Corvin" },
    firstName: "Bela",
    id: "character-bela",
    image: portrait("B", "#12a594"),
    lastName: "Ruk",
    nicknames: ["The Innkeeper"],
  },
  {
    about: "Dead these twelve years, and still the loudest voice in the room.",
    extraAttributes: { House: "Aldric", Status: "Dead" },
    firstName: "King",
    id: "character-aldric",
    image: portrait("A", "#e5484d"),
    lastName: "Aldric",
  },
];

/** Both pools in one list — the shape the mesh works in. */
export const MOCK_PEOPLE: StoryPerson[] = [
  ...MOCK_CAST.map((member) => ({ ...member, refType: "MUSE" as const })),
  ...MOCK_CHARACTERS.map((character) => ({
    accent: null,
    avatar: null,
    id: character.id as string,
    image: character.image ?? null,
    name: `${character.firstName} ${character.lastName ?? ""}`.trim(),
    refType: "CHARACTER" as const,
  })),
];

/** One tone of the story's own, on top of the built-in three. */
export const MOCK_TONES: CodexTone[] = [
  {
    color: "#a855f7",
    id: "tone-oath",
    label: "Blood oath",
    lineStyle: "DOTTED",
    ordinal: 0,
  },
];

export const MOCK_RELATIONSHIPS: CodexRelationship[] = [
  {
    fromId: "muse-elenna",
    fromType: "MUSE",
    id: "rel-1",
    isDirected: true,
    label: "trained him",
    strength: 3,
    toId: "muse-corvin",
    tone: "BOND",
    toType: "MUSE",
  },
  {
    fromId: "muse-elenna",
    fromType: "MUSE",
    id: "rel-2",
    isDirected: false,
    label: "sworn to unseat",
    strength: 3,
    toId: "character-aldric",
    tone: "STRAIN",
    toType: "CHARACTER",
  },
  {
    fromId: "muse-corvin",
    fromType: "MUSE",
    id: "rel-3",
    isDirected: false,
    label: "drinks at her inn",
    strength: 1,
    toId: "character-bela",
    tone: "NEUTRAL",
    toType: "CHARACTER",
  },
  {
    fromId: "character-bela",
    fromType: "CHARACTER",
    id: "rel-4",
    isDirected: true,
    label: "swore to his heir",
    strength: 2,
    toId: "character-aldric",
    tone: "BOND",
    toneId: "tone-oath",
    toType: "CHARACTER",
  },
];

/** Three seeded categories, plus one the authors invented. */
export const MOCK_CATEGORIES: CodexCategory[] = [
  {
    icon: "map-pin",
    id: "cat-places",
    isSystem: true,
    name: "Places",
    ordinal: 0,
  },
  {
    icon: "package",
    id: "cat-items",
    isSystem: true,
    name: "Items",
    ordinal: 1,
  },
  { icon: "scroll", id: "cat-lore", isSystem: true, name: "Lore", ordinal: 2 },
  { icon: "crown", id: "cat-factions", name: "Factions", ordinal: 3 },
];

export const MOCK_ENTRIES: CodexEntry[] = [
  {
    categoryId: "cat-places",
    chapterIds: ["chapter-3"],
    color: "#12a594",
    description:
      "A drowned town on the estuary. Half its roofs still break the water at low tide, and nobody who lives there will say what happened to the rest.",
    icon: "mountain",
    id: "entry-hollowmere",
    name: "Hollowmere",
  },
  {
    categoryId: "cat-places",
    chapterIds: ["chapter-1", "chapter-2"],
    color: "#ffb224",
    description:
      "The old trade road along the coast. Four days on foot, one inn, and no law between them.",
    icon: "map-pin",
    id: "entry-salt-road",
    name: "The Salt Road",
  },
  {
    categoryId: "cat-lore",
    chapterIds: ["chapter-2"],
    color: "#6e56cf",
    description:
      "The twelve years since the king died, in which nobody has claimed the throne and nobody has explained why.",
    icon: "moon",
    id: "entry-long-silence",
    name: "The Long Silence",
  },
  {
    categoryId: "cat-factions",
    chapterIds: [],
    color: "#e5484d",
    description:
      "What is left of Aldric's court, still meeting in a hall with no chair at its head.",
    icon: "crown",
    id: "entry-ashen-court",
    name: "The Ashen Court",
  },
];

/** How many entries each category holds — what the manager rows show. */
export const MOCK_ENTRY_COUNTS: Record<string, number> = MOCK_ENTRIES.reduce<
  Record<string, number>
>((counts, entry) => {
  counts[entry.categoryId] = (counts[entry.categoryId] ?? 0) + 1;
  return counts;
}, {});
