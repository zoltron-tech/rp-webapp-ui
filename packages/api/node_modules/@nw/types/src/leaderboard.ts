import type { Fandom, NWImage } from "./novelist";

export interface NovelistLeaderboardNovelist {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string;
  image: string | null;
  avatar: NWImage | null;
  isVerified: boolean;
  totalPoints: number;
  level: number;
}

export interface NovelistLeaderboardEntry {
  rank: number;
  novelist: NovelistLeaderboardNovelist;
  totalPoints: number;
  level: number;
}

export interface MuseLeaderboardMuse {
  id: string | null;
  firstName: string;
  lastName: string | null;
  pennedBy: NovelistLeaderboardNovelist | null;
  image: string | null;
  avatar: NWImage | null;
  fandom: Fandom;
  useAccent: boolean;
  accent: string | null;
  privacy: string;
  totalPoints: number;
  level: number;
}

export interface MuseLeaderboardEntry {
  rank: number;
  muse: MuseLeaderboardMuse;
  totalPoints: number;
  level: number;
}
