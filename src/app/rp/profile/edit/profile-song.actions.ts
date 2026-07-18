"use server";

import getConfig from "next/config";
import { authenticateAndGetJWT } from "@/app/actions";
import type { ProfileSong, SpotifyTrack } from "@/types/music";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

/** Public: the featured song shown on a novelist's profile, or null when none. */
export const getProfileSongAction = async (
  novelistId: string,
): Promise<ProfileSong | null> => {
  const response = await fetch(
    `${RP_SERVICE_URL}/rp/portfolio/profile-song/${novelistId}`,
    { cache: "no-store" },
  );
  if (!response.ok) return null;
  return (await response.json()) as ProfileSong;
};

/** Sets/replaces the caller's featured song. */
export const setProfileSongAction = async (
  payload: Partial<ProfileSong> & { source: ProfileSong["source"]; title: string },
): Promise<ProfileSong | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const response = await fetch(
    `${RP_SERVICE_URL}/rp/portfolio/profile-song`,
    {
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "PUT",
    },
  );
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as ProfileSong;
};

/** Removes the caller's featured song. */
export const deleteProfileSongAction = async (): Promise<{ message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const response = await fetch(
    `${RP_SERVICE_URL}/rp/portfolio/profile-song`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method: "DELETE",
    },
  );
  return response.ok
    ? { message: API_MESSAGE.Success }
    : { message: API_MESSAGE.UncategorizedError };
};

/** Searches the NW Library (Spotify) for tracks. */
export const searchSpotifyTracksAction = async (
  query: string,
): Promise<SpotifyTrack[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const jwt = await authenticateAndGetJWT();
  const response = await fetch(
    `${RP_SERVICE_URL}/rp/portfolio/profile-song/spotify/search?q=${encodeURIComponent(trimmed)}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
    },
  );
  if (!response.ok) return [];
  return (await response.json()) as SpotifyTrack[];
};
