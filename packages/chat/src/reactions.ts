/**
 * What a reaction *is* on the wire.
 *
 * Not an emoji. The stored value is a short key — `heart`, `laugh`, `fire` —
 * and the picture is the client's business: web draws hand-built SVG art for
 * each one (`reaction-emoji-set.tsx`), and the phone draws the system emoji.
 * That is a deliberate split, and it is invisible right up until a client
 * assumes the value is already a glyph and prints `laugh` under someone's
 * message, which is exactly what the native app did.
 *
 * So the vocabulary lives here, with the other things two clients must agree on
 * and cannot check at runtime. Adding a reaction to one client and not the
 * other does not error; it renders as a word.
 *
 * ## Reading is generous, writing is strict
 *
 * `reactionGlyph` accepts anything: a known key, an unknown key, or a raw emoji
 * left in the database by an older build that sent glyphs directly. Only the
 * first can be improved on, and the other two are shown as they are rather than
 * dropped — a reaction nobody recognises is still a reaction somebody sent.
 *
 * Sending, on the other hand, only ever uses a key from this list. A client
 * that sends a glyph makes the other one fall back to its raw text.
 */

export interface ReactionOption {
  /** The value that travels and is stored. */
  key: string;
  /** The system emoji, for clients without their own artwork. */
  emoji: string;
  label: string;
}

/**
 * Every reaction the product offers, in the order web's picker shows them.
 *
 * The order is part of the contract: people learn where "Haha" is by position
 * long before they read the labels, and two clients with the same six leading
 * reactions in different orders is worse than two different sets.
 */
export const REACTION_OPTIONS: ReactionOption[] = [
  // The leading six — the ones a picker shows without being opened.
  { emoji: "❤️", key: "heart", label: "Love" },
  { emoji: "😂", key: "laugh", label: "Haha" },
  { emoji: "😢", key: "sad", label: "Sad" },
  { emoji: "😡", key: "angry", label: "Angry" },
  { emoji: "😮", key: "wow", label: "Wow" },
  { emoji: "👍", key: "like", label: "Like" },

  { emoji: "😭", key: "cry", label: "Cry" },
  { emoji: "💔", key: "broken_heart", label: "Broken" },
  { emoji: "💀", key: "skull", label: "Dead" },
  { emoji: "🤯", key: "mind_blown", label: "Mind blown" },
  { emoji: "👌🏼", key: "ok", label: "OK" },
  { emoji: "🥰", key: "adore", label: "Adore" },
  { emoji: "🤩", key: "amazing", label: "Amazing" },
  { emoji: "🙂", key: "smile", label: "Smile" },
  { emoji: "💯", key: "100", label: "100" },
  { emoji: "🎉", key: "tada", label: "Celebrate" },
  { emoji: "🙏", key: "pray", label: "Pray" },
  { emoji: "👏", key: "clap", label: "Clap" },
  { emoji: "🔥", key: "fire", label: "Fire" },
  { emoji: "🫡", key: "respect", label: "Respect" },
  { emoji: "⭐", key: "star", label: "Star" },
  { emoji: "💎", key: "gem", label: "Diamond" },
  { emoji: "💪", key: "strong", label: "Strong" },
  { emoji: "🎀", key: "ribbon", label: "Ribbon" },
  { emoji: "🫦", key: "biting_lip", label: "Flirty" },
  { emoji: "😘", key: "kiss", label: "Kiss" },
];

/**
 * The aliases web's SVG map understands, folded in.
 *
 * `haha` and `laugh` are the same reaction, and a message stored with either
 * has to render. Web accepts both because its map was written that way; this
 * keeps the phone from being the stricter of the two.
 */
const ALIASES: Record<string, string> = {
  blown_kiss: "kiss",
  blush: "smile",
  bow: "ribbon",
  celebrate: "tada",
  death: "skull",
  flame: "fire",
  haha: "laugh",
  hundred: "100",
  kissing: "kiss",
  lip: "biting_lip",
  lit: "fire",
  lol: "laugh",
  love: "heart",
  love_eyes: "adore",
  mad: "angry",
  mindblown: "mind_blown",
  okay: "ok",
  star_struck: "amazing",
  starstruck: "amazing",
  surprised: "wow",
  thumbs_up: "like",
  thumbsup: "like",
};

const BY_KEY = new Map(
  REACTION_OPTIONS.map((option) => [option.key, option] as const),
);

/** The reaction a key names, following aliases. Null when it names nothing. */
export const reactionOption = (
  value: string | undefined | null,
): ReactionOption | null => {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return BY_KEY.get(ALIASES[key] ?? key) ?? null;
};

/**
 * Whether two stored values are the same reaction.
 *
 * Through the aliases, so tapping "Haha" on a message that holds your `haha`
 * from an older build is recognised as tapping your own reaction again — which
 * is what removes it — rather than as replacing it with itself.
 */
export const isSameReaction = (
  a: string | undefined | null,
  b: string | undefined | null,
): boolean => {
  if (!a || !b) return false;
  const left = reactionOption(a)?.key ?? a.trim().toLowerCase();
  const right = reactionOption(b)?.key ?? b.trim().toLowerCase();
  return left === right;
};

/**
 * What to draw for a stored reaction value.
 *
 * The emoji for a key we know, and otherwise the value itself — which covers
 * both a reaction added to one client first and the raw glyphs an earlier
 * native build wrote straight into the database.
 */
export const reactionGlyph = (value: string): string =>
  reactionOption(value)?.emoji ?? value;

/** The human name, for accessibility labels and the "who reacted" sheet. */
export const reactionLabel = (value: string): string =>
  reactionOption(value)?.label ?? value;
