import type { BadgeCode } from "@nw/types/badge";
import type { FC } from "react";
import type { BadgeArtworkProps } from "../frame";
import { AmbassadorBadge } from "./ambassador";
import { BookClubBadge } from "./book-club";
import { BookwormBadge } from "./bookworm";
import { CampfireBadge } from "./campfire";
import { ChroniclerBadge } from "./chronicler";
import { CoAuthorBadge } from "./co-author";
import { CompletionistBadge } from "./completionist";
import { CreativeBadge } from "./creative";
import { DedicatedBadge } from "./dedicated";
import { DiscordGuildMemberBadge } from "./discord-guild-member";
import { EnsembleCastBadge } from "./ensemble-cast";
import { FriendlyNovelistBadge } from "./friendly-novelist";
import { GlobetrotterBadge } from "./globetrotter";
import { LorekeeperBadge } from "./lorekeeper";
import { MatchmakerBadge } from "./matchmaker";
import { MuseKeeperBadge } from "./muse-keeper";
import { MusicianBadge } from "./musician";
import { PageTurnerBadge } from "./page-turner";
import { PostaholicBadge } from "./postaholic";
import { ProlificWriterBadge } from "./prolific-writer";
import { ShapeshifterBadge } from "./shapeshifter";
import { SocialBirdBadge } from "./social-bird";
import { SpotifyLinkedBadge } from "./spotify-linked";
import { StoryboardAuthorBadge } from "./storyboard-author";
import { TimekeeperBadge } from "./timekeeper";
import { VeteranQuillBadge } from "./veteran-quill";
import { WorldbuilderBadge } from "./worldbuilder";

/**
 * Every crest's drawing, keyed by the code the backend sends.
 *
 * A badge with no entry here renders as nothing rather than as a broken box —
 * the right failure when a newer backend knows about a badge this bundle does
 * not.
 *
 * These are the drawings only: no frame, no wrapper, no `<svg>`. Each app
 * supplies that, because it is the one part that cannot be shared.
 */
export const BADGE_ARTWORK: Partial<Record<BadgeCode, FC<BadgeArtworkProps>>> =
  {
    AMBASSADOR: AmbassadorBadge,
    BOOK_CLUB: BookClubBadge,
    BOOKWORM: BookwormBadge,
    CAMPFIRE: CampfireBadge,
    CHRONICLER: ChroniclerBadge,
    CO_AUTHOR: CoAuthorBadge,
    COMPLETIONIST: CompletionistBadge,
    CREATIVE: CreativeBadge,
    DEDICATED: DedicatedBadge,
    DISCORD_GUILD_MEMBER: DiscordGuildMemberBadge,
    ENSEMBLE_CAST: EnsembleCastBadge,
    FRIENDLY_NOVELIST: FriendlyNovelistBadge,
    GLOBETROTTER: GlobetrotterBadge,
    LOREKEEPER: LorekeeperBadge,
    MATCHMAKER: MatchmakerBadge,
    MUSE_KEEPER: MuseKeeperBadge,
    MUSICIAN: MusicianBadge,
    PAGE_TURNER: PageTurnerBadge,
    POSTAHOLIC: PostaholicBadge,
    PROLIFIC_WRITER: ProlificWriterBadge,
    SHAPESHIFTER: ShapeshifterBadge,
    SOCIAL_BIRD: SocialBirdBadge,
    SPOTIFY_LINKED: SpotifyLinkedBadge,
    STORY_BOARD_AUTHOR: StoryboardAuthorBadge,
    TIMEKEEPER: TimekeeperBadge,
    VETERAN_QUILL: VeteranQuillBadge,
    WORLDBUILDER: WorldbuilderBadge,
  };

export const hasBadgeArtwork = (code: BadgeCode): boolean =>
  Boolean(BADGE_ARTWORK[code]);

export { AmbassadorBadge } from "./ambassador";
export { CampfireBadge } from "./campfire";
export { ChroniclerBadge } from "./chronicler";
export { CoAuthorBadge } from "./co-author";
export { CreativeBadge } from "./creative";
export { DedicatedBadge } from "./dedicated";
export { DiscordGuildMemberBadge } from "./discord-guild-member";
export { FriendlyNovelistBadge } from "./friendly-novelist";
export { LorekeeperBadge } from "./lorekeeper";
export { MatchmakerBadge } from "./matchmaker";
export { MuseKeeperBadge } from "./muse-keeper";
export { MusicianBadge } from "./musician";
export { PostaholicBadge } from "./postaholic";
export { ProlificWriterBadge } from "./prolific-writer";
export { ShapeshifterBadge } from "./shapeshifter";
export { SocialBirdBadge } from "./social-bird";
export { SpotifyLinkedBadge } from "./spotify-linked";
export { StoryboardAuthorBadge } from "./storyboard-author";
export { TimekeeperBadge } from "./timekeeper";
export { VeteranQuillBadge } from "./veteran-quill";
export { WorldbuilderBadge } from "./worldbuilder";
