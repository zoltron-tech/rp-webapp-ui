import type { NWImage } from "./novelist";

export interface NovelistLeaderboardNovelist {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string;
  image: string | null;
  avatar: NWImage | null;
  isVerified: boolean;
  /** Always 0: the server no longer sends XP for anyone. */
  totalPoints: number;
  level: number;
}

/** One row of `/leaderboard/novelists`, ordered by activity; the points are withheld. */
export interface NovelistLeaderboardEntry {
  rank: number;
  novelist: NovelistLeaderboardNovelist;
  totalPoints: number;
  level: number;
}
