import type {
  MuseLeaderboardEntry,
  NovelistLeaderboardEntry,
} from "@nw/types";
import type { ErrorType } from "@nw/types/common";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/leaderboard";

export const getNovelistLeaderboard = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<NovelistLeaderboardEntry[] | ErrorType> =>
  api.request(`${BASE}/novelists?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
    catchErrors: true,
    label: "getNovelistLeaderboardAction",
  });

export const getNovelistRankById = (
  api: ApiClient,
  novelistId: string,
): Promise<NovelistLeaderboardEntry | ErrorType> =>
  api.request(`${BASE}/novelists/${novelistId}/rank`, {
    catchErrors: true,
    label: "getNovelistRankByIdAction",
  });

export const getMuseLeaderboard = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<MuseLeaderboardEntry[] | ErrorType> =>
  api.request(`${BASE}/muses?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
    catchErrors: true,
    label: "getMuseLeaderboardAction",
  });

export const getMuseRank = (
  api: ApiClient,
  museId: string,
): Promise<MuseLeaderboardEntry | ErrorType> =>
  api.request(`${BASE}/muses/${museId}/rank`, {
    catchErrors: true,
    label: "getMuseRankAction",
  });
