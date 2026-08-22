import { API_MESSAGE } from "@nw/types";
import type { DataType, WithMessage } from "@nw/types/common";
import type { Song } from "@nw/types/music";
import type { ApiClient } from "../client";

const SONGS = "/rp/portfolio/songs";

export interface SongInput {
  name: string;
  description: string | null;
  tags: Array<{ label: string; color: string }>;
}

export const getOwnMusic = (api: ApiClient): Promise<DataType<Song[]>> =>
  api.requestNullable<Song[]>(SONGS, {
    label: "getOwnMusicAction",
    notFound: "null",
  });

/** Null on any failure — the player has nothing to show either way. */
export const getSong = async (
  api: ApiClient,
  id: string,
): Promise<Song | null> => {
  const response = await api.raw(`${SONGS}/${id}`, { label: "getSongAction" });
  if (!response.ok) return null;
  return (await response.json()) as Song;
};

export const createSong = async (
  api: ApiClient,
  songData: SongInput & { url: string },
): Promise<Song | typeof API_MESSAGE.UncategorizedError> => {
  const response = await api.raw(SONGS, {
    body: songData,
    label: "createSongAction",
    method: "POST",
  });
  if (!response.ok) return API_MESSAGE.UncategorizedError;
  return (await response.json()) as Song;
};

export const updateSong = async (
  api: ApiClient,
  id: string,
  songData: SongInput,
): Promise<Song | typeof API_MESSAGE.UncategorizedError> => {
  const response = await api.raw(`${SONGS}/${id}`, {
    body: songData,
    label: "updateSongAction",
    method: "PUT",
  });
  if (!response.ok) return API_MESSAGE.UncategorizedError;
  return (await response.json()) as Song;
};

export const deleteSong = async (
  api: ApiClient,
  id: string,
): Promise<WithMessage | null> => {
  const response = await api.raw(`${SONGS}/${id}`, {
    label: "deleteSongAction",
    method: "DELETE",
  });
  if (!response.ok) return null;
  const text = await response.text();
  return text ? (JSON.parse(text) as WithMessage) : null;
};
