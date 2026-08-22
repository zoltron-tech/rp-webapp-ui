import type { Muse, Novelist, StoryBoard } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import type { DataType } from "@nw/types/common";
import {
  transformActivity,
  transformMuse,
  transformNovelist,
} from "@nw/utils/image";
import type { ApiClient } from "../client";

/** Applies a feed transform in place, passing the error/null shapes through. */
const mapFeed = <T>(
  result: DataType<T[]>,
  transform: (item: T) => void,
): DataType<T[]> => {
  if (Array.isArray(result)) for (const item of result) transform(item);
  return result;
};

export const getStrangerNovelists = async (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Novelist[]>> =>
  mapFeed(
    await api.requestNullable<Novelist[]>(
      `/rp/portfolio/novelist/suggestions?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getStrangerNovelistsAction", notFound: "null" },
    ),
    (n) => transformNovelist(n, "feed"),
  );

export const getMuses = async (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
): Promise<DataType<Muse[]>> =>
  mapFeed(
    await api.requestNullable<Muse[]>(
      `/rp/portfolio/muse/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getMusesAction", notFound: "null" },
    ),
    (m) => transformMuse(m, "feed"),
  );

export const getMusesWithVideos = async (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
): Promise<DataType<Muse[]>> =>
  mapFeed(
    await api.requestNullable<Muse[]>(
      `/rp/portfolio/muse/${type}/videos?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getMusesWithVideosAction", notFound: "null" },
    ),
    (m) => transformMuse(m, "feed"),
  );

/**
 * Auth is optional: with a token the backend marks media activities the viewer
 * has reacted to (`reacted`), so their heart renders filled.
 */
export const getUserActivities = async (
  api: ApiClient,
  username: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Activity[]>> =>
  mapFeed(
    await api.requestNullable<Activity[]>(
      `/rp/portfolio/activity/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getUserActivities", notFound: "null" },
    ),
    (a) => transformActivity(a, "feed"),
  );

export const getFriendActivities = async (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
  type: "friends" | "unknown",
): Promise<DataType<Activity[]>> =>
  mapFeed(
    await api.requestNullable<Activity[]>(
      `/rp/portfolio/activity/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { label: "getFriendActivities", notFound: "null" },
    ),
    (a) => transformActivity(a, "feed"),
  );

/**
 * Auth is optional: without a token only published (public) stories come back;
 * with one, the backend also folds in stories the novelist is a member of
 * (see StoryBoardService.getRandomStoryboards).
 */
export const getRandomStories = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<StoryBoard[]>> =>
  api.requestNullable<StoryBoard[]>(
    `/rp/portfolio/story/random?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getRandomStories", notFound: "empty-array" },
  );
