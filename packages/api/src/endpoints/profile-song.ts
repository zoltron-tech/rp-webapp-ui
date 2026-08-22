import { API_MESSAGE } from "@nw/types";
import type { ProfileSong, SpotifyTrack } from "@nw/types/music";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/profile-song";

/** Public: the featured song shown on a novelist's profile, or null when none. */
export const getProfileSong = async (
  api: ApiClient,
  novelistId: string,
): Promise<ProfileSong | null> => {
  // Deliberately unauthenticated — a profile's song is public, and this is
  // called while rendering pages for signed-out visitors.
  const response = await api.raw(`${BASE}/${novelistId}`, {
    anonymous: true,
    contentType: false,
    label: "getProfileSongAction",
  });
  if (!response.ok) return null;
  return (await response.json()) as ProfileSong;
};

/** Sets/replaces the caller's featured song. */
export const setProfileSong = async (
  api: ApiClient,
  payload: Partial<ProfileSong> & {
    source: ProfileSong["source"];
    title: string;
  },
): Promise<ProfileSong | { message: string }> => {
  const response = await api.raw(BASE, {
    body: payload,
    label: "setProfileSongAction",
    method: "PUT",
  });
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return (await response.json()) as ProfileSong;
};

/** Removes the caller's featured song. */
export const deleteProfileSong = async (
  api: ApiClient,
): Promise<{ message: string }> => {
  const response = await api.raw(BASE, {
    label: "deleteProfileSongAction",
    method: "DELETE",
  });
  return response.ok
    ? { message: API_MESSAGE.Success }
    : { message: API_MESSAGE.UncategorizedError };
};

/** Searches the NW Library (Spotify) for tracks. */
export const searchSpotifyTracks = async (
  api: ApiClient,
  query: string,
): Promise<SpotifyTrack[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const response = await api.raw(
    `${BASE}/spotify/search?q=${encodeURIComponent(trimmed)}`,
    { label: "searchSpotifyTracksAction" },
  );
  if (!response.ok) return [];
  return (await response.json()) as SpotifyTrack[];
};
