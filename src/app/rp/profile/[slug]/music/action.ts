import {
  createSong,
  deleteSong,
  getOwnMusic,
  getSong,
  type SongInput,
  updateSong,
} from "@nw/api/endpoints/songs";
import { authedApi } from "@/lib/api";

export const getOwnMusicAction = () => getOwnMusic(authedApi);

export const getSongAction = (id: string) => getSong(authedApi, id);

export const createSongAction = (songData: SongInput & { url: string }) =>
  createSong(authedApi, songData);

export const updateSongAction = (id: string, songData: SongInput) =>
  updateSong(authedApi, id, songData);

export const deleteSongAction = (id: string) => deleteSong(authedApi, id);
