/**
 * Fixtures for the prompt-composer reveal.
 *
 * Same rules as `dummy-data.ts`: the shapes are exactly what the app's own
 * fetches return, so the real prompt card, composer and comment render them
 * without knowing they are in a demo, and nothing here touches the network.
 */

import type { Comment, Muse, Novelist, Prompt, PromptSource } from "@nw/types";
import type { GifItem } from "@/types/klipy";
import { gifTile, portrait } from "./art";

export const PROMPT_ID = "promo-prompt";

/** A muse, at the depth the composer's sender picker actually reads.
 *
 *  `Muse` carries a full `pennedBy: Novelist` (which carries `muses` back
 *  again), so a literal of the whole type is not writable by hand. What the
 *  promo exercises — `museToSource` and the picker rows — reads four fields;
 *  the rest never resolves, so this asserts rather than fabricating a cycle. */
const muse = (
  id: string,
  firstName: string,
  lastName: string,
  from: string,
  to: string,
  seed: number,
): Muse =>
  ({
    accent: null,
    avatar: null,
    firstName,
    id,
    image: portrait(firstName.charAt(0), from, to, seed),
    lastName,
    useAccent: false,
  }) as unknown as Muse;

export const MUSES: Muse[] = [
  muse("muse-eyra", "Eyra", "Solberg", "#1f7a5c", "#0d3a2c", 1),
  muse("muse-dorian", "Dorian", "Vale", "#2f6ea8", "#132a44", 2),
  muse("muse-inez", "Inez", "Marchetti", "#8a3f6b", "#331728", 3),
  muse("muse-caspar", "Caspar", "Wilde", "#a85f2f", "#3d2213", 4),
];

/** The signed-in novelist. The composer reads `muses` off this to build the
 *  sender list, and the avatar for the out-of-character option. */
export const NOVELIST: Novelist = {
  about: null,
  avatar: null,
  banner: null,
  connection: null,
  createdAt: "2025-04-02T10:00:00Z",
  firstName: "Wren",
  friends: [],
  friendsCount: 12,
  id: "promo-novelist",
  image: portrait("W", "#3f6b5a", "#16291f", 0),
  isOnboarded: true,
  isVerified: true,
  lastName: "Ashby",
  level: 12,
  museCount: MUSES.length,
  muses: MUSES,
  note: null,
  palette: 0,
  tier: {
    eventLimit: 12,
    groupLimit: 5,
    mediaLimit: 25,
    museLimit: 10,
    musicLimit: 10,
    name: "Storyweaver",
    storyBoardLimit: 5,
  },
  totalPoints: 4200,
  username: "wren",
};

/** Who wrote the prompt being answered. */
const PROMPT_AUTHOR: PromptSource = {
  image: portrait("T", "#5a3f6b", "#251a30", 7),
  name: "Talia Rook",
  sourceId: "muse-talia",
  sourceType: "MUSE",
  urlProp: "muse-talia",
};

export const PROMPT: Prompt = {
  canInteract: true,
  commentCount: 0,
  createdOn: "2026-08-08T18:20:00Z",
  featuredSong: null,
  id: PROMPT_ID,
  media: "",
  privacy: "PUBLIC",
  reacted: false,
  reactions: 47,
  sharedWith: [],
  song: "",
  source: PROMPT_AUTHOR,
  // One line per block, with no stray whitespace between them: the renderer
  // keeps the markup verbatim, so an indented template literal would show up
  // as a gap in the middle of the prompt.
  text: [
    "<div>The lighthouse has been dark for six nights, and on the seventh someone lights it. Your character is the only one who sees who.</div>",
    "<div><br></div>",
    "<div>Open to anyone. Bring the weather with you.</div>",
  ].join(""),
};

/** The muse the scene picks in the sender dialog. */
export const CHOSEN_MUSE_INDEX = 2;

/**
 * The comment the scene posts, minus its body — the text is taken from what
 * the editor actually holds when the send is intercepted, so the thread shows
 * the very markup the toolbar just built.
 */
export const SENT_COMMENT_BASE: Omit<Comment, "text" | "source"> = {
  concluded: false,
  createdOn: new Date().toISOString(),
  id: "promo-comment",
  isPromptOwner: false,
  media: "",
  prompt: null,
  promptId: PROMPT_ID,
  reacted: false,
  reactions: 0,
  replies: [],
  replyCount: 0,
};

// ── What gets typed ────────────────────────────────────────────────────────

export const HEADING_TEXT = "The Seventh Night";
export const BODY_TEXT =
  "She counted the dark nights on her knuckles. On the seventh, light.";

// ── The GIF picker ─────────────────────────────────────────────────────────

/**
 * What the picker is served instead of Klipy.
 *
 * `GifPicker` fetches `/api/klipy-gifs`, which proxies a third party — live
 * results would change between runs, and the images it points at are on hosts
 * the capture blocks. `network-stub.ts` answers that one route with these.
 */
export const GIF_ITEMS: GifItem[] = [
  ["Storm light", "#2f6ea8", "#132a44"],
  ["Slow tide", "#1f7a5c", "#0d3a2c"],
  ["Lantern", "#a8792f", "#3d2a13"],
  ["Long dark", "#5b3f8a", "#231734"],
  ["Gulls", "#3f7a8a", "#16303a"],
  ["Cold shore", "#8a3f5b", "#331723"],
  ["Nightfall", "#43508a", "#1a1f33"],
  ["Salt wind", "#6b8a3f", "#27331a"],
].map(([title, from, to], index) => ({
  gifUrl: gifTile(title, from, to, index),
  id: `promo-gif-${index}`,
  previewUrl: gifTile(title, from, to, index),
  title,
}));

/** The tile the scene picks out of the grid. */
export const CHOSEN_GIF_INDEX = 3;

/** Where the zoom slider starts (the editor's own default) and lands. */
export const GIF_START_PCT = 50;
export const GIF_END_PCT = 88;
