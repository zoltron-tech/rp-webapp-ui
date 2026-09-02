import {
  getMuseLeaderboard,
  getMuseRank,
  getNovelistLeaderboard,
  getNovelistRankById,
} from "@nw/api/endpoints/leaderboard";
import { api } from "@/lib/api";

export const getNovelistLeaderboardAction = (
  pageNumber: number,
  pageSize: number,
) => getNovelistLeaderboard(api, pageNumber, pageSize);

export const getNovelistRankByIdAction = (novelistId: string) =>
  getNovelistRankById(api, novelistId);

export const getMuseLeaderboardAction = (
  pageNumber: number,
  pageSize: number,
) => getMuseLeaderboard(api, pageNumber, pageSize);

export const getMuseRankAction = (museId: string) => getMuseRank(api, museId);
