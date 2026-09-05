"use client";

import type { BadgeCode } from "@nw/types/badge";
import type { FC } from "react";
import { DiscordGuildMemberBadge } from "./discord-guild-member";
import type { BadgeArtworkProps } from "./frame";
import { FriendlyNovelistBadge } from "./friendly-novelist";
import { MuseKeeperBadge } from "./muse-keeper";
import { MusicianBadge } from "./musician";
import { PostaholicBadge } from "./postaholic";
import { ProlificWriterBadge } from "./prolific-writer";
import { SocialBirdBadge } from "./social-bird";
import { SpotifyLinkedBadge } from "./spotify-linked";
import { StoryboardAuthorBadge } from "./storyboard-author";

/**
 * Every badge's artwork, keyed by the code the backend sends.
 *
 * A badge with no entry here renders as nothing rather than as a broken box —
 * which is the right failure when a newer backend knows about a badge this
 * bundle does not.
 */
const BADGE_ARTWORK: Partial<Record<BadgeCode, FC<BadgeArtworkProps>>> = {
  DISCORD_GUILD_MEMBER: DiscordGuildMemberBadge,
  FRIENDLY_NOVELIST: FriendlyNovelistBadge,
  MUSE_KEEPER: MuseKeeperBadge,
  MUSICIAN: MusicianBadge,
  POSTAHOLIC: PostaholicBadge,
  PROLIFIC_WRITER: ProlificWriterBadge,
  SOCIAL_BIRD: SocialBirdBadge,
  SPOTIFY_LINKED: SpotifyLinkedBadge,
  STORY_BOARD_AUTHOR: StoryboardAuthorBadge,
};

export const hasBadgeArtwork = (code: BadgeCode): boolean =>
  Boolean(BADGE_ARTWORK[code]);

interface Props extends BadgeArtworkProps {
  code: BadgeCode;
}

export const BadgeArtwork: FC<Props> = ({
  code,
  size,
  animated,
  muted = false,
}) => {
  const Artwork = BADGE_ARTWORK[code];
  if (!Artwork) return null;
  return <Artwork size={size} animated={animated} muted={muted} />;
};

export { DiscordGuildMemberBadge } from "./discord-guild-member";
export type { BadgeArtworkProps } from "./frame";
export { FriendlyNovelistBadge } from "./friendly-novelist";
export { MuseKeeperBadge } from "./muse-keeper";
export { MusicianBadge } from "./musician";
export { PostaholicBadge } from "./postaholic";
export { ProlificWriterBadge } from "./prolific-writer";
export { SocialBirdBadge } from "./social-bird";
export { SpotifyLinkedBadge } from "./spotify-linked";
export { StoryboardAuthorBadge } from "./storyboard-author";
