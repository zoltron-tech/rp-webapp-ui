/**
 * Fixtures for the Headcanons reel (promo-social day 11).
 *
 * Halda Orre, verse 1, the same character the muse reel follows, in her real
 * art (`public/promo/halda`). Each state is what GET /headcanon/muse/{id}
 * returns at one point of the story, so the real panel renders it straight
 * from its `seed`; the scene never writes.
 */

import type { Headcanon, HeadcanonSection, Muse } from "@nw/types";
import { VERSE_MUSES } from "./muse-data";

const ART = "/promo/halda/verse-1.png";
const art = (src: string) => {
  const crop = { height: 100, src, width: 100, x: 50, y: 30 };
  return {
    avatar: {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src,
    },
    cardBackground: {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src,
    },
    image: src,
    wallpaper: {
      crop,
      filterValues: { blur: 20, brightness: 50, greyscale: 20 },
      src,
    },
  };
};

/** Halda, verse 1 of 3, penned by Wren. */
export const HALDA: Muse = {
  ...VERSE_MUSES[0],
  ...art(ART),
  verses: VERSE_MUSES[0].verses?.map((v, i) => ({
    ...v,
    ...art(
      [
        "/promo/halda/verse-1.png",
        "/promo/halda/verse-2.png",
        "/promo/halda/verse-3.png",
      ][i] ?? ART,
    ),
  })),
} as Muse;

export const HALDA_ID = HALDA.id as string;

const card = (
  fields: Partial<Headcanon> & Pick<Headcanon, "id" | "body" | "category">,
): Headcanon => ({
  alternateUniverse: false,
  createdAt: "2026-11-04T19:20:00Z",
  heartCount: 0,
  hearted: false,
  modifiedAt: "2026-11-04T19:20:00Z",
  museId: HALDA_ID,
  pinned: false,
  spoiler: false,
  title: null,
  verseId: null,
  visibility: "PUBLIC",
  ...fields,
});

/** The one written on screen: the answer to "How do they say sorry without saying sorry?" */
export const NEW_CARD_ID = "promo-hc-tea";

const TEA = card({
  body: "<div>She never says it. She leaves a cup of tea on your doorstep, still warm, and is gone before you open the door.</div>",
  category: "RELATIONSHIPS",
  createdAt: "2026-11-06T21:05:00Z",
  heartCount: 11,
  id: NEW_CARD_ID,
  modifiedAt: "2026-11-06T21:05:00Z",
  pinned: true,
  title: "Sorry comes as tea",
});

const SHIPS = card({
  body: "<div>Every light on the water, twice. If both counts match, she lets herself sleep.</div>",
  category: "HABITS",
  heartCount: 8,
  id: "promo-hc-ships",
  title: "She counts the ships",
});

const THIRD_DEBT = card({
  body: "<div>It is owed to the sea, and she pays a little of it every night she keeps the light.</div>",
  category: "SECRETS",
  heartCount: 5,
  id: "promo-hc-debt",
  spoiler: true,
  title: "The third debt",
  visibility: "FRIENDS",
});

export const TRAITS = [
  // the order the reel taps them in the picker (Emotional, Social, Mind, Lifestyle, Dark)
  { key: "STOIC", note: "Quiet first. Always quiet first." },
  { key: "LOYAL", note: "Keeps every promise, even to the dead." },
  { key: "STARGAZER", note: "Reads the sky before she reads the sea." },
  { key: "NIGHT_OWL", note: "Eleven winters on the late watch." },
  { key: "SECRETIVE", note: "The third debt has no name." },
];

const FACTS = {
  blocks: [
    { block: "THIS_OR_THAT", items: [] },
    {
      block: "LIKES",
      items: ["Salt wind", "The three o'clock bell", "Ships that come in late"],
    },
    { block: "FEARS", items: ["A lamp gone dark"] },
  ],
  // only the two the reel taps
  thisOrThat: [
    { pairKey: "TEA_COFFEE", pick: "A" as const },
    { pairKey: "RAIN_SUNSHINE", pick: "A" as const },
  ],
};

const section = (fields: Partial<HeadcanonSection>): HeadcanonSection => ({
  canEdit: true,
  facts: { blocks: [], thisOrThat: [] },
  headcanons: [],
  hiddenCount: 0,
  museId: HALDA_ID,
  rootMuseId: HALDA_ID,
  traits: [],
  ...fields,
});

/** One section per beat of the reel, owner's view unless named visitor. */
export const HEADCANON_STATES: Record<string, HeadcanonSection> = {
  /** Canon just opened: nothing yet. */
  empty: section({}),
  /** This or that switched on and nothing picked yet: the sheet the reel fills. */
  pairs: section({
    facts: { ...FACTS, thisOrThat: [] },
    headcanons: [SHIPS, THIRD_DEBT],
    traits: TRAITS,
  }),
  /** Traits and quick facts in, two older cards. */
  full: section({
    facts: FACTS,
    headcanons: [SHIPS, THIRD_DEBT],
    traits: TRAITS,
  }),
  /** The new card saved and pinned. */
  new: section({
    facts: FACTS,
    headcanons: [TEA, SHIPS, THIRD_DEBT],
    traits: TRAITS,
  }),
  /** Traits picked, facts and cards still to come. */
  traits: section({ traits: TRAITS }),
  /** A friend (vesper) reading the same character. */
  visitor: section({
    canEdit: false,
    facts: FACTS,
    headcanons: [TEA, SHIPS, THIRD_DEBT],
    traits: TRAITS,
  }),
  /** The friend has hearted the new card. */
  "visitor-hearted": section({
    canEdit: false,
    facts: FACTS,
    headcanons: [{ ...TEA, heartCount: 12, hearted: true }, SHIPS, THIRD_DEBT],
    traits: TRAITS,
  }),
};
