import type { Tag } from "./common";
import type { Friend } from "./novelist";

export interface Song {
  id: string;
  novelist: Friend;
  name: string;
  description: string | null;
  url: string;
  tags: Tag[];
}

export type ProfileSongSource = "LIBRARY" | "SPOTIFY";

/** A novelist's single featured profile song (mirrors backend ProfileSong). */
export interface ProfileSong {
  source: ProfileSongSource;
  title: string;
  artist: string | null;
  imageUrl: string | null;
  /** Playable audio url for LIBRARY songs. */
  url: string | null;
  /** Spotify track id — drives the embed player for SPOTIFY songs. */
  spotifyTrackId: string | null;
  externalUrl: string | null;
  /** Owned Song id when source === "LIBRARY". */
  songId: string | null;
}

/** A single NW Library (Spotify) search result. */
export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
}
