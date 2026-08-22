/**
 * Fixtures for the muse-profile reveal.
 *
 * Same rules as the other scenes: the shapes are what the app's own fetches
 * return, so the real preview cards, profile sections and side menu render them
 * without knowing they are in a demo, and nothing here touches the network.
 */

import type {
  Muse,
  MuseAboutSection,
  MuseConnectionGroup,
  MuseNavItem,
} from "@nw/types";
import { museCover, portrait, storyPlate } from "./art";

/** A muse, at the depth the profile actually reads.
 *
 *  `Muse` carries a full `pennedBy: Novelist`, which carries `muses` back
 *  again — a literal of the whole type is not writable by hand, so this fills
 *  in what the card, the sections and the nav read and asserts the rest. */
const muse = (fields: Partial<Muse>): Muse =>
  ({
    accent: null,
    avatar: null,
    cardBackground: null,
    connections: [],
    extraAttributes: {
      Allegiance: "The Saltwall Compact",
      Born: "Gullhouse Reach, winter",
      Carries: "A ledger she did not write",
      Occupation: "Lantern-keeper, Saltwall Harbour",
    },
    featuredSong: null,
    lastName: "",
    next: null,
    nicknames: ["Lantern", "The Keeper"],
    note: "",
    prev: null,
    privacy: "PUBLIC",
    song: null,
    story: "",
    tags: [],
    useAccent: true,
    useExtraImages: true,
    video: null,
    wallpaper: null,
    ...fields,
  }) as unknown as Muse;

const nav = (m: Muse): MuseNavItem =>
  ({
    accent: m.accent,
    avatar: m.avatar,
    cardBackground: m.cardBackground,
    extraAttributes: m.extraAttributes,
    featuredSong: m.featuredSong,
    firstName: m.firstName,
    gender: null,
    id: m.id as string,
    image: m.image,
    lastName: m.lastName,
    nicknames: m.nicknames,
    note: m.note,
    originalVerseId: m.originalVerseId ?? null,
    privacy: m.privacy,
    song: m.song,
    story: m.story,
    useAccent: m.useAccent,
    useExtraImages: m.useExtraImages,
    verseNumber: m.verseNumber ?? null,
    video: m.video,
    wallpaper: m.wallpaper,
  }) as MuseNavItem;

const PENNED_BY = {
  firstName: "Wren",
  id: "promo-novelist",
  image: portrait("W", "#3f6b5a", "#16291f", 0),
  lastName: "Ashby",
  username: "wren",
};

const withAuthor = (m: Muse): Muse =>
  ({ ...m, pennedBy: PENNED_BY }) as unknown as Muse;

const image = (name: string, from: string, to: string, seed: number) => {
  const src = museCover(name, from, to, seed);
  const crop = { height: 100, src, width: 100, x: 50, y: 50 };
  return {
    cardBackground: {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src,
    },
    image: src,
    // The wallpaper is the same plate, blurred and dimmed behind everything —
    // the profile's own default treatment.
    wallpaper: {
      crop,
      filterValues: { blur: 20, brightness: 50, greyscale: 20 },
      src,
    },
  };
};

// ── The roster ─────────────────────────────────────────────────────────────
// Six characters. The third — the one the scene opens — carries three verses,
// and the two after it are what Next walks onto.

const ROSTER: Muse[] = [
  muse({
    accent: "#1f7a5c",
    firstName: "Eyra",
    id: "muse-eyra",
    lastName: "Solberg",
    note: "Keeps the lamp lit, whatever it costs her.",
    ...image("Eyra", "#1f7a5c", "#0a2a20", 1),
  }),
  muse({
    accent: "#2f6ea8",
    firstName: "Dorian",
    id: "muse-dorian",
    lastName: "Vale",
    note: "Owes three people the same favour.",
    ...image("Dorian", "#2f6ea8", "#0f2033", 2),
  }),
  muse({
    accent: "#8a3f6b",
    firstName: "Inez",
    id: "muse-inez",
    lastName: "Marchetti",
    note: "Reads the harbour the way other people read faces.",
    ...image("Inez", "#8a3f6b", "#2a1120", 3),
  }),
  muse({
    accent: "#a85f2f",
    firstName: "Caspar",
    id: "muse-caspar",
    lastName: "Wilde",
    note: "Never once been where he said he would be.",
    ...image("Caspar", "#a85f2f", "#33190a", 4),
  }),
  muse({
    accent: "#3f7a8a",
    firstName: "Halda",
    id: "muse-halda",
    lastName: "Orre",
    note: "Signed the ledger first and has not slept since.",
    ...image("Halda", "#3f7a8a", "#122a33", 5),
  }),
  muse({
    accent: "#5b3f8a",
    firstName: "Sable",
    id: "muse-sable",
    lastName: "Rook",
    note: "Answers to a name that is not hers.",
    ...image("Sable", "#5b3f8a", "#1c1130", 6),
  }),
];

/** The card the scene opens — the third in the grid. */
export const OPENED_INDEX = 2;

/**
 * Where the walk ends.
 *
 * Two steps of Next from the opened card, and the character it lands on is the
 * one with alternate verses — so the flip has something to flip.
 */
export const VERSE_WALK_INDEX = 2;

// ── Halda's three verses ───────────────────────────────────────────────────
// Alternate verses are full muses of their own; the profile switches between
// them the way it switches between characters.

const HALDA = ROSTER[4];

const VERSE_2 = muse({
  accent: "#c2703a",
  firstName: "Halda",
  id: "muse-halda-v2",
  lastName: "Orre",
  note: "The one who burned the ledger instead. Louder, and freer for it.",
  originalVerseId: HALDA.id,
  verseNumber: 2,
  ...image("Halda", "#c2703a", "#331a0d", 7),
});

const VERSE_3 = muse({
  accent: "#4a7d5c",
  firstName: "Halda",
  id: "muse-halda-v3",
  lastName: "Orre",
  note: "Never signed at all. Never learned what it cost the others.",
  originalVerseId: HALDA.id,
  verseNumber: 3,
  ...image("Halda", "#4a7d5c", "#132a1c", 8),
});

/** Halda's verse family, in verse order. Verse 1 is the root character. */
export const VERSES: Muse[] = [
  { ...HALDA, verseNumber: 1 } as Muse,
  VERSE_2,
  VERSE_3,
];

export const VERSE_NAV: MuseNavItem[] = VERSES.map(nav);

/**
 * The characters the profile walks through: the one the grid opens, then the
 * two Next lands on. Each carries its neighbours the way the server sends them.
 */
export const WALK: Muse[] = [ROSTER[OPENED_INDEX], ROSTER[3], VERSES[0]].map(
  (m, index, all) =>
    withAuthor(
      muse({
        ...m,
        next: all[index + 1] ? nav(all[index + 1]) : nav(ROSTER[5]),
        prev: index > 0 ? nav(all[index - 1]) : nav(ROSTER[1]),
        verses: index === VERSE_WALK_INDEX ? VERSE_NAV : undefined,
      }),
    ),
);

/** The grid the scene opens with — every character, verses grouped as the
 *  list page groups them. */
export const GRID: { root: Muse; verses: Muse[] }[] = ROSTER.map((root, i) => ({
  root: withAuthor(root),
  verses: i === 4 ? [VERSE_2, VERSE_3] : [],
}));

/** The verse family as full muses, for the flip. */
export const VERSE_MUSES: Muse[] = VERSES.map((v, index) =>
  withAuthor(
    muse({
      ...v,
      next: nav(ROSTER[5]),
      prev: nav(ROSTER[3]),
      verseNumber: index + 1,
      verses: VERSE_NAV,
    }),
  ),
);

// ── The back story ─────────────────────────────────────────────────────────
// Headings and plates, long enough that the section has to be scrolled.

const section = (
  ordinal: number,
  heading: string,
  body: string[],
  plate: { label: string; from: string; to: string } | null,
): MuseAboutSection => ({
  id: `promo-about-${ordinal}`,
  image: plate ? storyPlate(plate.label, plate.from, plate.to, ordinal) : null,
  ordinal,
  parentId: "muse-halda",
  text: [
    `<div style="font-size: var(--font-size-h4); font-weight: 600;">${heading}</div>`,
    ...body.map((line) => `<div>${line}</div>`),
  ].join("<div><br></div>"),
});

export const ABOUT_SECTIONS: MuseAboutSection[] = [
  section(
    0,
    "Before the harbour",
    [
      "She was born on the wrong side of a wall that no longer exists, in a year the registry lost, to a mother who is remembered only for leaving.",
      "What she kept from it: a habit of counting exits, and an ear for the moment a room decides something.",
    ],
    { from: "#2a1120", label: "The wall", to: "#5b2244" },
  ),
  section(
    1,
    "The lantern years",
    [
      "Eleven winters on the Saltwall, reading a code nobody had written down and answering ships that were never supposed to arrive.",
      "She learned the harbour the way other people learn a face — by what it does when it thinks no one is watching.",
    ],
    { from: "#0f2033", label: "Saltwall", to: "#2f6ea8" },
  ),
  section(
    2,
    "What she owes",
    [
      "Three debts, none of them money. One to a man who is dead, one to a house that pretends she is not, and one she has never named aloud.",
      "The third is the one that moves her.",
    ],
    null,
  ),
  section(
    3,
    "How she reads",
    [
      "Quiet first. Always quiet first — she would rather be underestimated than explained.",
      "When she does speak it lands like a door closing, and she has never once taken a sentence back.",
    ],
    { from: "#132a1c", label: "The long dark", to: "#4a7d5c" },
  ),
];

// ── Peers ──────────────────────────────────────────────────────────────────

const peer = (
  id: string,
  title: string,
  description: string,
  other: Muse,
): MuseConnectionGroup => ({
  approvals: [],
  canEdit: false,
  createdAt: Date.now(),
  createdBy: "promo-novelist",
  createdByName: "Wren Ashby",
  description,
  id,
  modifiedAt: Date.now(),
  muses: [
    {
      firstName: "Halda",
      image: HALDA.image,
      lastName: "Orre",
      museId: HALDA.id as string,
      novelistId: "promo-novelist",
      novelistName: "Wren Ashby",
    },
    {
      firstName: other.firstName,
      image: other.image,
      lastName: other.lastName,
      museId: other.id as string,
      novelistId: "promo-novelist",
      novelistName: "Wren Ashby",
    },
  ],
  status: "DONE",
  title,
  viewerApproved: null,
  viewerIsCreator: false,
});

export const CONNECTIONS: MuseConnectionGroup[] = [
  peer(
    "promo-peer-1",
    "Raised her",
    "Took her off the harbour wall at nine and never once said why.",
    ROSTER[0],
  ),
  peer(
    "promo-peer-2",
    "Owes a debt",
    "A favour called in twice, and settled neither time.",
    ROSTER[1],
  ),
  peer(
    "promo-peer-3",
    "Can't stand him",
    "They have agreed on exactly one thing, and it cost them both.",
    ROSTER[3],
  ),
  peer(
    "promo-peer-4",
    "Old company",
    "Eleven winters on the same wall, and still not friends.",
    ROSTER[4],
  ),
];

// ── The featured song ──────────────────────────────────────────────────────

export const FEATURED_SONG = {
  artist: "The Lamplighters",
  externalUrl: null,
  imageUrl: portrait("♪", "#8a3f6b", "#2a1120", 3),
  songId: "promo-song",
  source: "LIBRARY" as const,
  spotifyTrackId: null,
  title: "Seventh Night",
  url: null,
};
