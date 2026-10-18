import type { BadgeCode, BadgeRarity } from "@nw/types/badge";

/**
 * Every badge Novelist World has, as the client knows it.
 *
 * This is the copy behind the public badges page — "here is everything there is
 * to earn" — and it is deliberately a static list rather than a fetch.
 *
 * Every badge here is wired server-side. The backend sends its own copy of this
 * text on the profile payload, and that is what a novelist's own badges page
 * renders; this list is what a signed-out visitor sees. The two must say the
 * same thing, so changing a title, description or requirement here means
 * changing `BadgeCode` in portfolio-service to match.
 */
export interface CatalogueBadge {
  code: BadgeCode;
  title: string;
  /** What holding the badge says about the novelist. */
  description: string;
  /** What earns it, phrased as an instruction. */
  requirement: string;
  rarity: BadgeRarity;
}

export const BADGE_CATALOGUE: CatalogueBadge[] = [
  {
    code: "DISCORD_GUILD_MEMBER",
    description: "A face in the Novelist World Discord guild.",
    rarity: "COMMON",
    requirement:
      "Link your Discord account, then join the Novelist World server.",
    title: "Guild Member",
  },
  {
    code: "STORY_BOARD_AUTHOR",
    description: "Has a storyboard of their own on the go.",
    rarity: "COMMON",
    requirement:
      "Author or co-author a storyboard — start one, or be added to somebody else's.",
    title: "Storyboard Author",
  },
  {
    code: "SOCIAL_BIRD",
    description: "Never lets a post go unanswered.",
    rarity: "RARE",
    requirement: "Comment on ten out-of-character posts by other Novelists.",
    title: "Social Bird",
  },
  {
    code: "FRIENDLY_NOVELIST",
    description: "Keeps a wide circle, and everyone in it.",
    rarity: "RARE",
    requirement: "Have fifty Novelists on your friends list.",
    title: "Friendly Novelist",
  },
  {
    code: "SPOTIFY_LINKED",
    description: "Brings their own soundtrack.",
    rarity: "COMMON",
    requirement:
      "Link your Spotify account from the account section of your profile.",
    title: "Now Playing",
  },
  {
    code: "MUSICIAN",
    description: "Scores the story as well as writing it.",
    rarity: "COMMON",
    requirement: "Upload a song or a sound effect to your music tab.",
    title: "Musician",
  },
  {
    code: "MUSE_KEEPER",
    description: "Runs a whole cast, not a favourite.",
    rarity: "RARE",
    requirement: "Create fifty Muses.",
    title: "Muse Keeper",
  },
  {
    code: "PROLIFIC_WRITER",
    description: "Always has a scene on the go.",
    rarity: "RARE",
    requirement: "Post fifty public prompts from your Muses.",
    title: "Prolific Writer",
  },
  {
    code: "POSTAHOLIC",
    description: "Cannot leave the feed alone.",
    rarity: "RARE",
    requirement: "Make fifty public out-of-character posts.",
    title: "Post-aholic",
  },
  {
    code: "CO_AUTHOR",
    description: "Turns up in everybody else's threads.",
    rarity: "COMMON",
    requirement: "Comment on ten public prompts by other Novelists.",
    title: "Co-Author",
  },
  {
    code: "DEDICATED",
    description: "Stays with a thread until it is finished.",
    rarity: "RARE",
    requirement:
      "Take fifty turns on a single public thread started by another Novelist.",
    title: "Dedicated",
  },
  {
    code: "CREATIVE",
    description: "Ten Muses, and every one of them a whole person.",
    rarity: "RARE",
    requirement:
      "Give ten Muses a backstory, their information filled in, and a public prompt each.",
    title: "Creative",
  },
  {
    code: "WORLDBUILDER",
    description: "Has built a world big enough to need a map.",
    rarity: "RARE",
    requirement:
      "Grow one story's codex to twenty-five entries, and pin five places on one of its maps.",
    title: "Worldbuilder",
  },
  {
    code: "CHRONICLER",
    description: "Takes a story all the way through.",
    rarity: "RARE",
    requirement: "Reach ten chapters in one of your stories.",
    title: "Chronicler",
  },
  {
    code: "TIMEKEEPER",
    description: "Knows exactly when everything happened.",
    rarity: "RARE",
    requirement:
      "Place twenty chapters of one story on its timeline, across at least three lanes.",
    title: "Timekeeper",
  },
  {
    code: "MATCHMAKER",
    description: "Ties every character to somebody.",
    rarity: "RARE",
    requirement:
      "Draw fifteen relationships on one story's mesh, in at least three different tones.",
    title: "Matchmaker",
  },
  {
    code: "SHAPESHIFTER",
    description: "One Muse, many lives.",
    rarity: "COMMON",
    requirement:
      "Give one Muse three alternate verses, and post a public prompt from each of them.",
    title: "Shapeshifter",
  },
  {
    code: "VETERAN_QUILL",
    description: "A year in, and still writing every month.",
    rarity: "LEGENDARY",
    requirement:
      "Be a Novelist for a year, and post in each of the last six months.",
    title: "Veteran Quill",
  },
  {
    code: "AMBASSADOR",
    description: "Brought five new writers to Novelist World.",
    rarity: "LEGENDARY",
    requirement:
      "Invite five people with your referral link who sign up and finish onboarding.",
    title: "Ambassador",
  },
  {
    code: "CAMPFIRE",
    description: "Starts the conversations everyone joins.",
    rarity: "RARE",
    requirement: "Start a public thread that five other Novelists join.",
    title: "Campfire",
  },
  {
    code: "LOREKEEPER",
    description: "Keeps every secret a world has.",
    rarity: "RARE",
    requirement: "Write a hundred codex entries across your stories.",
    title: "Lorekeeper",
  },
];

/**
 * Commonest first, for lists sorted by rarity: the shelf climbs towards the
 * rare ones. A stable sort keeps the catalogue's own order inside each tier.
 */
export const RARITY_ORDER: Record<BadgeRarity, number> = {
  COMMON: 0,
  LEGENDARY: 2,
  RARE: 1,
};

/** The catalogue, Common first, then Rare, then Legendary. */
export const BADGE_CATALOGUE_BY_RARITY: CatalogueBadge[] = [
  ...BADGE_CATALOGUE,
].sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);

/** Copy for the rarity chip. Rarity drives nothing but how a badge reads. */
export const RARITY_LABEL: Record<BadgeRarity, string> = {
  COMMON: "Common",
  LEGENDARY: "Legendary",
  RARE: "Rare",
};
