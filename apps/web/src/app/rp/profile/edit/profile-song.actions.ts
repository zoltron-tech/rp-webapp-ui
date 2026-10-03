import {
  deleteProfileSong,
  getProfileSong,
  searchSpotifyTracks,
  setProfileSong,
} from "@nw/api/endpoints/profile-song";
import type { ProfileSong } from "@nw/types/music";
import { api, authedApi } from "@/lib/api";

/** Public: the featured song shown on a novelist's profile, or null when none. */
export const getProfileSongAction = (novelistId: string) =>
  getProfileSong(api, novelistId);

/** Sets/replaces the caller's featured song. */
export const setProfileSongAction = (
  payload: Partial<ProfileSong> & {
    source: ProfileSong["source"];
    title: string;
  },
) => setProfileSong(authedApi, payload);

/** Removes the caller's featured song. */
export const deleteProfileSongAction = () => deleteProfileSong(authedApi);

/** Searches the NW Library (Spotify) for tracks. */
export const searchSpotifyTracksAction = (query: string) =>
  searchSpotifyTracks(authedApi, query);
