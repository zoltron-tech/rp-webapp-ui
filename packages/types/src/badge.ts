/**
 * Badges a novelist can earn.
 *
 * Each code has to have artwork registered against it in the UI's badge
 * catalogue — a badge the server sends and the client has no artwork for
 * renders as nothing.
 *
 * Every code here now has a rule behind it in portfolio-service's own
 * `BadgeCode` enum and `BadgeService`. Keep the two lists in step: a code the
 * server can award and this bundle has no artwork for renders as nothing, and a
 * code only the client knows about is a badge nobody can earn.
 */
export type BadgeCode =
  | "DISCORD_GUILD_MEMBER"
  | "STORY_BOARD_AUTHOR"
  | "SOCIAL_BIRD"
  | "FRIENDLY_NOVELIST"
  | "SPOTIFY_LINKED"
  | "MUSICIAN"
  | "MUSE_KEEPER"
  | "PROLIFIC_WRITER"
  | "POSTAHOLIC"
  | "CO_AUTHOR"
  | "DEDICATED"
  | "CREATIVE"
  | "WORLDBUILDER"
  | "CHRONICLER"
  | "TIMEKEEPER"
  | "MATCHMAKER"
  | "SHAPESHIFTER"
  | "VETERAN_QUILL"
  | "AMBASSADOR"
  | "CAMPFIRE"
  | "LOREKEEPER";

/** Drives the badge frame's colour and glow. No behaviour attached. */
export type BadgeRarity = "COMMON" | "RARE" | "LEGENDARY";

export interface Badge {
  code: BadgeCode;
  title: string;
  description: string;
  /** What earns the badge; shown while it is still locked. */
  requirement: string;
  rarity: BadgeRarity;
  /** Null on a badge the novelist has not earned. */
  awardedAt: string | null;
  earned: boolean;
}
