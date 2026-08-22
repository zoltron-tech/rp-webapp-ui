/**
 * Fixture data for the promo capture.
 *
 * Shaped exactly like what `getStoryboardAction` / `getStoryCodexAction` return,
 * so the real components render it without knowing they are in a demo. Nothing
 * here is fetched and nothing here is saved — the scene never triggers a write
 * path (see `promo-gif/README.md`).
 */

import type {
  Codex,
  CodexCategory,
  CodexEntry,
  CodexRelationship,
  CodexTone,
  StoryBoard,
  StoryBoardEvent,
  StoryCastMember,
  StoryCharacter,
} from "@nw/types";
import { portrait } from "./art";

export const STORYBOARD_ID = "promo-storyboard";

/** The viewer. `canEdit` is derived from membership, so the promo is a member
 *  and gets the authoring chrome (New entry, the Categories tool, the rail's
 *  members-only views). */
export const DEMO_USERNAME = "wren";

// ── Chapters ───────────────────────────────────────────────────────────────

/**
 * Chapter covers come from `public/promo/`, not from the generated plates the
 * other scenes use — real 2:3 artwork, which is the ratio both the chapter card
 * and the hero cover already draw at, so nothing is cropped.
 */
const chapter = (
  ordinal: number,
  name: string,
  description: string,
): StoryBoardEvent => ({
  avatar: null,
  createdAt: "2026-02-11T09:00:00Z",
  description: `<div>${description}</div>`,
  eventTime: null,
  id: `promo-chapter-${ordinal}`,
  image: `/promo/ch-${ordinal}.png`,
  location: null,
  name,
  ordinal,
  overtureAsterism: "ASTERISM",
  passageAsterism: "ASTERISM",
  song: null,
  storyBoardId: STORYBOARD_ID,
});

export const CHAPTERS: StoryBoardEvent[] = [
  chapter(
    1,
    "The Dust Before Dawn",
    "The city wakes to grey snow and nobody says the word for it yet.",
  ),
  chapter(
    2,
    "The Ashfall Compact",
    "Two houses sign a truce in a room nobody leaves unchanged.",
  ),
  chapter(
    3,
    "Beyond the Frozen Walls",
    "What the truce keeps out, and the one night it does not.",
  ),
  chapter(
    4,
    "Embers in the Dark",
    "Bram pays what he owes in the only currency the Compact accepts.",
  ),
  chapter(
    5,
    "The Seed of Tomorrow",
    "The dead king's name is spoken aloud for the first time since the truce.",
  ),
];

// ── The cast (muses) ───────────────────────────────────────────────────────

const castMember = (
  id: string,
  name: string,
  from: string,
  to: string,
  seed: number,
): StoryCastMember => ({
  accent: null,
  avatar: null,
  id,
  image: portrait(name.charAt(0), from, to, seed),
  name,
});

export const CAST: StoryCastMember[] = [
  castMember("muse-sera", "Sera Vane", "#1f7a5c", "#0d3a2c", 1),
  castMember("muse-iolen", "Iolen Marsh", "#2f6ea8", "#132a44", 2),
  castMember("muse-rhue", "Rhue", "#a85f2f", "#3d2213", 3),
  castMember("muse-nyx", "Nyx", "#6b3f8a", "#281734", 4),
  castMember("muse-halda", "Halda Orre", "#3f7a8a", "#16303a", 5),
];

// ── The story's own characters ─────────────────────────────────────────────

const storyCharacter = (
  id: string,
  firstName: string,
  lastName: string | null,
  from: string,
  to: string,
  seed: number,
  about: string,
): StoryCharacter => ({
  about: `<div>${about}</div>`,
  accent: null,
  avatar: null,
  createdBy: DEMO_USERNAME,
  extraAttributes: {},
  firstName,
  id,
  image: portrait(firstName.charAt(0), from, to, seed),
  lastName,
  storyBoardId: STORYBOARD_ID,
  useAccent: false,
});

export const CHARACTERS: StoryCharacter[] = [
  storyCharacter(
    "char-bram",
    "Bram",
    "Tolliver",
    "#8a6b2f",
    "#332714",
    6,
    "Keeps the Gullhouse. Keeps worse things than that.",
  ),
  storyCharacter(
    "char-aurel",
    "King",
    "Aurel",
    "#5b5f6b",
    "#1f2229",
    7,
    "Dead eleven years. Still the reason half the room stays standing.",
  ),
  storyCharacter(
    "char-mirek",
    "Mirek",
    "Sable",
    "#8a3f3f",
    "#331717",
    8,
    "Signed the Compact first and has regretted it loudest ever since.",
  ),
  storyCharacter(
    "char-fen",
    "Archivist",
    "Fen",
    "#3f6b5a",
    "#16291f",
    9,
    "Copies the ledgers. Decides, quietly, what the record will say.",
  ),
];

// ── Codex ──────────────────────────────────────────────────────────────────

const category = (
  id: string,
  name: string,
  icon: string,
  ordinal: number,
  isSystem = false,
): CodexCategory => ({
  icon,
  id,
  isSystem,
  name,
  ordinal,
  storyBoardId: STORYBOARD_ID,
});

export const CATEGORIES: CodexCategory[] = [
  category("cat-places", "Places", "castle", 0, true),
  category("cat-items", "Items", "key", 1, true),
  category("cat-lore", "Lore", "scroll", 2, true),
  category("cat-factions", "Factions", "shield", 3),
];

const entry = (
  id: string,
  categoryId: string,
  name: string,
  icon: string,
  color: string,
  description: string,
  chapterIds: string[],
): CodexEntry => ({
  categoryId,
  chapterIds,
  color,
  description: `<div>${description}</div>`,
  icon,
  id,
  image: null,
  name,
  storyBoardId: STORYBOARD_ID,
});

export const ENTRIES: CodexEntry[] = [
  entry(
    "entry-gullhouse",
    "cat-places",
    "The Gullhouse",
    "castle",
    "#1f7a5c",
    "Bram's inn on the harbour wall. Neutral ground, by an agreement nobody wrote down.",
    ["promo-chapter-1", "promo-chapter-4"],
  ),
  entry(
    "entry-harbour",
    "cat-places",
    "Saltwall Harbour",
    "anchor",
    "#2f6ea8",
    "Sixty lanterns, one code, and a wall that has never once been rebuilt.",
    ["promo-chapter-2"],
  ),
  entry(
    "entry-ledger",
    "cat-items",
    "The Compact Ledger",
    "scroll",
    "#8a6b2f",
    "Every debt the truce created, in Fen's handwriting.",
    ["promo-chapter-3", "promo-chapter-5"],
  ),
  entry(
    "entry-signet",
    "cat-items",
    "Aurel's Signet",
    "crown",
    "#5b5f6b",
    "Buried with him. Seen twice since.",
    ["promo-chapter-5"],
  ),
  entry(
    "entry-ashfall",
    "cat-lore",
    "The Ashfall",
    "flame",
    "#a85f2f",
    "Three days of grey snow, and the winter that made the Compact necessary.",
    ["promo-chapter-1"],
  ),
  entry(
    "entry-sable",
    "cat-factions",
    "House Sable",
    "shield",
    "#8a3f3f",
    "Signed first, complied least.",
    ["promo-chapter-1", "promo-chapter-4"],
  ),
];

/** One tone of the story's own, on top of the built-in Bond/Strain/Neutral. */
export const TONES: CodexTone[] = [
  {
    color: "#b45cc9",
    id: "tone-oath",
    label: "Blood oath",
    lineStyle: "DASHED",
    ordinal: 0,
    storyBoardId: STORYBOARD_ID,
  },
];

const relationship = (
  id: string,
  fromId: string,
  toId: string,
  label: string,
  tone: CodexRelationship["tone"],
  strength: number,
  isDirected: boolean,
  toneId: string | null = null,
): CodexRelationship => ({
  fromId,
  fromType: fromId.startsWith("muse-") ? "MUSE" : "CHARACTER",
  id,
  isDirected,
  label,
  storyBoardId: STORYBOARD_ID,
  strength,
  toId,
  tone,
  toneId,
  toType: toId.startsWith("muse-") ? "MUSE" : "CHARACTER",
});

/** Ten edges over nine characters — dense enough to read as a mesh, under the
 *  fourteen past which the mesh stops labelling every arc. */
export const RELATIONSHIPS: CodexRelationship[] = [
  relationship(
    "rel-1",
    "muse-sera",
    "muse-iolen",
    "raised him",
    "BOND",
    3,
    true,
  ),
  relationship(
    "rel-2",
    "muse-sera",
    "char-mirek",
    "signed against",
    "STRAIN",
    3,
    false,
  ),
  relationship(
    "rel-3",
    "muse-iolen",
    "muse-rhue",
    "sailed under",
    "BOND",
    2,
    true,
  ),
  relationship(
    "rel-4",
    "muse-rhue",
    "char-bram",
    "owes a debt",
    "NEUTRAL",
    2,
    true,
  ),
  relationship(
    "rel-5",
    "muse-nyx",
    "char-fen",
    "reads for",
    "NEUTRAL",
    1,
    true,
  ),
  relationship(
    "rel-6",
    "muse-nyx",
    "char-mirek",
    "can't stand",
    "STRAIN",
    2,
    false,
  ),
  relationship("rel-7", "muse-halda", "char-aurel", "served", "BOND", 2, true),
  relationship(
    "rel-8",
    "char-bram",
    "char-fen",
    "sworn to silence",
    "BOND",
    3,
    false,
    "tone-oath",
  ),
  relationship(
    "rel-9",
    "char-mirek",
    "char-aurel",
    "betrayed",
    "STRAIN",
    3,
    true,
  ),
  relationship(
    "rel-10",
    "muse-sera",
    "muse-halda",
    "old company",
    "BOND",
    1,
    false,
  ),
];

export const CODEX: Codex = {
  categories: CATEGORIES,
  characters: CHARACTERS,
  entries: ENTRIES,
  relationships: RELATIONSHIPS,
  storyBoardId: STORYBOARD_ID,
  tones: TONES,
};

// ── The storyboard ─────────────────────────────────────────────────────────

export const STORYBOARD: StoryBoard = {
  avatar: null,
  cast: CAST,
  createdBy: {
    connection: null,
    firstName: "Wren",
    id: "promo-novelist",
    image: portrait("W", "#1f7a5c", "#0d3a2c", 0),
    isVerified: true,
    lastName: "Ashby",
    level: 12,
    muses: [],
    mutualFriendCount: 0,
    totalPoints: 4200,
    username: DEMO_USERNAME,
  },
  description:
    "<div>A truce held together by debts nobody will name out loud.</div>",
  events: CHAPTERS,
  fandom: {
    color: "#1f7a5c",
    description: "An original world",
    id: "FANDOMLESS",
    name: "Original",
  },
  genres: [
    { color: "#8a6bd4", id: 1, label: "Political" },
    { color: "#d48a3f", id: 2, label: "Low fantasy" },
    { color: "#4f9bd4", id: 3, label: "Mystery" },
  ],
  id: STORYBOARD_ID,
  image: "/promo/Cover.png",
  isPublic: true,
  // The creator plus two more — `StoryMembers` puts `createdBy` at the head of
  // the list and drops it from `members`, so three co-authors is one entry
  // here for the author and two beside them.
  members: [
    {
      image: portrait("W", "#1f7a5c", "#0d3a2c", 0),
      isAdmin: true,
      storyBoardId: STORYBOARD_ID,
      username: DEMO_USERNAME,
    },
    {
      image: portrait("M", "#8a3f6b", "#2a1120", 3),
      isAdmin: true,
      storyBoardId: STORYBOARD_ID,
      username: "mira.lowe",
    },
    {
      image: portrait("T", "#2f6ea8", "#132a44", 2),
      isAdmin: false,
      storyBoardId: STORYBOARD_ID,
      username: "tobin",
    },
  ],
  name: "The Ashfall Compact",
  reacted: false,
  reactions: 128,
  tags: [],
};
