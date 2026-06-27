"use server";

import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import type { Fandom, NWImage } from "@/types";
import type { WithMessage } from "@/types/common";
import {
  API_MESSAGE,
  AUTH_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
  MEDIA_JSON_HEADER_VALUE,
} from "@/utils/constants";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

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

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    [CONTENT_TYPE_HEADER_NAME]: MEDIA_JSON_HEADER_VALUE,
  };
  const jwt = await getJWTIfExists();
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;
  return headers;
}

export const getNovelistLeaderboardAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<NovelistLeaderboardEntry[] | WithMessage> => {
  try {
    const url = `${RP_SERVICE_URL}/rp/portfolio/leaderboard/novelists?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: await buildHeaders(),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return (await response.json()) as NovelistLeaderboardEntry[];
  } catch {
    return { message: API_MESSAGE.Error };
  }
};

export const getNovelistRankByIdAction = async (
  novelistId: string,
): Promise<NovelistLeaderboardEntry | WithMessage> => {
  try {
    const url = `${RP_SERVICE_URL}/rp/portfolio/leaderboard/novelists/${novelistId}/rank`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: await buildHeaders(),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return (await response.json()) as NovelistLeaderboardEntry;
  } catch {
    return { message: API_MESSAGE.Error };
  }
};

export const getMuseLeaderboardAction = async (
  pageNumber: number,
  pageSize: number,
): Promise<MuseLeaderboardEntry[] | WithMessage> => {
  try {
    const url = `${RP_SERVICE_URL}/rp/portfolio/leaderboard/muses?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: await buildHeaders(),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return (await response.json()) as MuseLeaderboardEntry[];
  } catch {
    return { message: API_MESSAGE.Error };
  }
};

export const getMuseRankAction = async (
  museId: string,
): Promise<MuseLeaderboardEntry | WithMessage> => {
  try {
    const url = `${RP_SERVICE_URL}/rp/portfolio/leaderboard/muses/${museId}/rank`;
    const response = await fetch(url, {
      cache: "no-store",
      headers: await buildHeaders(),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return (await response.json()) as MuseLeaderboardEntry;
  } catch {
    return { message: API_MESSAGE.Error };
  }
};
