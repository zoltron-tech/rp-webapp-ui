import type { NovelistLeaderboardEntry } from "@nw/types";
import type { ErrorType } from "@nw/types/common";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/leaderboard";

/**
 * The novelists ordered by activity. The only leaderboard call still made: the
 * mobile directory lists people from it, without showing rank or points.
 */
export const getNovelistLeaderboard = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<NovelistLeaderboardEntry[] | ErrorType> =>
  api.request(`${BASE}/novelists?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
    catchErrors: true,
    label: "getNovelistLeaderboardAction",
  });
