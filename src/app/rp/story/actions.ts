"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type {
  BookmarkedStoryBoardEvent,
  ChapterPageLayout,
  ChapterPageMetricsRequest,
  ChapterSoundscape,
  Codex,
  CodexCategory,
  CodexEntry,
  CodexRelationship,
  SoundCue,
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventBookmark,
  StoryBoardEventThreadInput,
  StoryBoardEventThreadPage,
  StoryBoardEventTimelineInput,
  StoryMap,
  StoryMapPin,
  StoryMaps,
  StoryTimeline,
  StoryTimelineLane,
  StoryTimelineMarker,
} from "@/types";
import type { DataType, Genre } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

/** Backend validation errors (e.g. tier limit reached) come back as `{ message: string }`. */
const parseErrorReason = (rawText: string): string | undefined => {
  try {
    const parsed = JSON.parse(rawText);
    return typeof parsed?.message === "string" ? parsed.message : undefined;
  } catch {
    return undefined;
  }
};

/** The curated genre catalogue users pick from (they can't create new ones). */
export const getAllGenresAction = async (): Promise<DataType<Genre[]>> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/genre`;

  const response = await fetch(URL, {
    cache: "force-cache",
    headers: { "Content-Type": "application/json" },
  });

  Logger.debug("getAllGenresAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const genres: Genre[] = await response.json();

  return genres;
};

export const getAllStoryboardsByUsernameAction = async (
  username: string,
): Promise<DataType<StoryBoard[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/by/${username}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getAllStoryboardsByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard[] = await response.json();

  return storyBoard;
};

export const getStoryboardAction = async (
  storyboardId: string,
): Promise<DataType<StoryBoard>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getStoryboardAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard = await response.json();

  return storyBoard;
};

export const getAllStoryboardsAction = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getAllStoriesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const storyBoard: StoryBoard[] = await response.json();

  return storyBoard;
};

export const updateStoryBoardAction = async (_storyboard: StoryBoard) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story`;

  console.log(
    "updateStoryBoardAction request body:",
    JSON.stringify(_storyboard),
  );

  const response = await fetch(URL, {
    body: JSON.stringify(_storyboard),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  const rawText = await response.text();
  console.log(
    "updateStoryBoardAction response:",
    response.status,
    response.statusText,
    rawText,
  );

  if (!response.ok) {
    return { message: API_MESSAGE.Error, reason: parseErrorReason(rawText) };
  }

  let result: StoryBoard;
  try {
    result = JSON.parse(rawText);
  } catch (err) {
    console.error("updateStoryBoardAction: failed to parse response JSON", err);
    return { message: API_MESSAGE.Error };
  }

  return result;
};

export const updateStoryBoardEventAction = async (
  _storyboardEvent: StoryBoardEvent,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event`;

  console.log(
    "updateStoryBoardEventAction request body:",
    JSON.stringify(_storyboardEvent),
  );

  const response = await fetch(URL, {
    body: JSON.stringify(_storyboardEvent),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  const rawText = await response.text();
  console.log(
    "updateStoryBoardEventAction response:",
    response.status,
    response.statusText,
    rawText,
  );

  if (!response.ok) {
    return { message: API_MESSAGE.Error, reason: parseErrorReason(rawText) };
  }

  let result: StoryBoardEvent;
  try {
    result = JSON.parse(rawText);
  } catch (err) {
    console.error(
      "updateStoryBoardEventAction: failed to parse response JSON",
      err,
    );
    return { message: API_MESSAGE.Error };
  }

  return result;
};

export const getStoryboardEventAction = async (
  storyboardEventId: string,
): Promise<DataType<StoryBoardEvent>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getStoryboardEventAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  console.log(response);

  const storyBoardEvent: StoryBoardEvent = await response.json();

  return storyBoardEvent;
};

export const deleteStoryBoardAction = async (storyboardId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryBoardAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const deleteStoryBoardEventAction = async (
  storyboardEventId: string,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryBoardEventAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const reorderStoryBoardEventsAction = async (
  storyboardId: string,
  orderedEventIds: string[],
): Promise<DataType<StoryBoardEvent[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/events/reorder`;

  const response = await fetch(URL, {
    body: JSON.stringify({ orderedEventIds }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  const rawText = await response.text();
  Logger.debug(
    "reorderStoryBoardEventsAction",
    response.status,
    response.statusText,
    rawText,
  );

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  let events: StoryBoardEvent[];
  try {
    events = JSON.parse(rawText);
  } catch (err) {
    console.error(
      "reorderStoryBoardEventsAction: failed to parse response JSON",
      err,
    );
    return { message: API_MESSAGE.Error };
  }

  return events;
};

export const saveStoryBoardEventThreadAction = async (
  input: StoryBoardEventThreadInput,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/thread`;

  const response = await fetch(URL, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryBoardEventThreadAction", response.status);

  switch (response.status) {
    case 400:
      return { message: API_MESSAGE.BadPayload };
    case 401:
      return { message: API_MESSAGE.Unauthorized };
    case 403:
      return { message: API_MESSAGE.NotAllowed };
  }

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const deleteStoryBoardEventThreadAction = async (threadId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/thread/${threadId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryBoardEventThreadAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const getStoryboardEventThreadsAction = async (
  storyboardEventId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<StoryBoardEventThreadPage>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL =
    `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/threads` +
    `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getStoryboardEventThreadsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const threadPage: StoryBoardEventThreadPage = await response.json();

  return threadPage;
};

export const getStoryboardEventBookmarkAction = async (
  storyboardEventId: string,
): Promise<StoryBoardEventBookmark | null> => {
  const jwt = await getJWTIfExists();
  // Bookmarks only exist for logged-in readers.
  if (!jwt) return null;

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/bookmark`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getStoryboardEventBookmarkAction", response.status);

  if (!response.ok) {
    return null;
  }

  const bookmark: StoryBoardEventBookmark = await response.json();

  return bookmark;
};

export const getBookmarkedEventsAction = async (): Promise<
  DataType<BookmarkedStoryBoardEvent[]>
> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/bookmarks`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getBookmarkedEventsAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const bookmarks: BookmarkedStoryBoardEvent[] = await response.json();

  return bookmarks;
};

export const saveStoryboardEventBookmarkAction = async (
  bookmark: StoryBoardEventBookmark,
): Promise<DataType<StoryBoardEventBookmark>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/bookmark`;

  const response = await fetch(URL, {
    body: JSON.stringify(bookmark),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryboardEventBookmarkAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: StoryBoardEventBookmark = await response.json();

  return saved;
};

export const deleteStoryboardEventBookmarkAction = async (
  storyboardEventId: string,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/bookmark`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryboardEventBookmarkAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

// ── Timeline ───────────────────────────────────────────────────────────────
// When chapters *happen*, as opposed to the order they are read in. Readable
// by anyone who can view the story; editable by any member.

export const getStoryTimelineAction = async (
  storyboardId: string,
): Promise<DataType<StoryTimeline>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/timeline`;

  const response = await fetch(URL, { cache: "no-store", headers });

  Logger.debug("getStoryTimelineAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const timeline: StoryTimeline = await response.json();

  return timeline;
};

/** Creates a lane when `lane.id` is null, otherwise renames/recolors it. */
export const saveStoryTimelineLaneAction = async (
  storyboardId: string,
  lane: StoryTimelineLane,
): Promise<DataType<StoryTimelineLane>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/timeline/lane`;

  const response = await fetch(URL, {
    body: JSON.stringify(lane),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryTimelineLaneAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: StoryTimelineLane = await response.json();

  return saved;
};

export const reorderStoryTimelineLanesAction = async (
  storyboardId: string,
  orderedLaneIds: string[],
): Promise<DataType<StoryTimelineLane[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/timeline/lanes/reorder`;

  const response = await fetch(URL, {
    body: JSON.stringify({ orderedLaneIds }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("reorderStoryTimelineLanesAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const lanes: StoryTimelineLane[] = await response.json();

  return lanes;
};

/** Removing a lane unplaces its chapters' lane; the chapters themselves stay. */
export const deleteStoryTimelineLaneAction = async (laneId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/timeline/lane/${laneId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryTimelineLaneAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

/** Creates a marker when `marker.id` is null, otherwise moves/renames it. */
export const saveStoryTimelineMarkerAction = async (
  storyboardId: string,
  marker: StoryTimelineMarker,
): Promise<DataType<StoryTimelineMarker>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/timeline/marker`;

  const response = await fetch(URL, {
    body: JSON.stringify(marker),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryTimelineMarkerAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: StoryTimelineMarker = await response.json();

  return saved;
};

export const deleteStoryTimelineMarkerAction = async (markerId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/timeline/marker/${markerId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryTimelineMarkerAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

/**
 * Places (or, with null edges, unplaces) one chapter on the axis. Deliberately
 * narrow — a drag fires this on every pointer-up and must not resend the
 * chapter's prose, cover or song.
 */
export const saveStoryboardEventTimelineAction = async (
  storyboardEventId: string,
  placement: StoryBoardEventTimelineInput,
): Promise<DataType<StoryBoardEvent>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/timeline`;

  const response = await fetch(URL, {
    body: JSON.stringify(placement),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryboardEventTimelineAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: StoryBoardEvent = await response.json();

  return saved;
};

// ── Codex ──────────────────────────────────────────────────────────────────
// The story's world bible. Readable by anyone who can view the story; written
// by any member. The first read of a story's codex seeds Places/Items/Lore.

export const getStoryCodexAction = async (
  storyboardId: string,
): Promise<DataType<Codex>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/codex`;

  const response = await fetch(URL, { cache: "no-store", headers });

  Logger.debug("getStoryCodexAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const codex: Codex = await response.json();

  return codex;
};

/** Creates a category when `category.id` is null, otherwise renames it. */
export const saveCodexCategoryAction = async (
  storyboardId: string,
  category: CodexCategory,
): Promise<DataType<CodexCategory>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/codex/category`;

  const response = await fetch(URL, {
    body: JSON.stringify(category),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveCodexCategoryAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: CodexCategory = await response.json();

  return saved;
};

export const reorderCodexCategoriesAction = async (
  storyboardId: string,
  orderedCategoryIds: string[],
): Promise<DataType<CodexCategory[]>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/codex/categories/reorder`;

  const response = await fetch(URL, {
    body: JSON.stringify({ orderedCategoryIds }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("reorderCodexCategoriesAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const categories: CodexCategory[] = await response.json();

  return categories;
};

/** Only succeeds once the category is empty — entries must be moved first. */
export const deleteCodexCategoryAction = async (categoryId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/codex/category/${categoryId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteCodexCategoryAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

/** Creates an entry when `entry.id` is null, otherwise updates it. */
export const saveCodexEntryAction = async (
  storyboardId: string,
  entry: CodexEntry,
): Promise<DataType<CodexEntry>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/codex/entry`;

  const response = await fetch(URL, {
    body: JSON.stringify(entry),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveCodexEntryAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: CodexEntry = await response.json();

  return saved;
};

export const deleteCodexEntryAction = async (entryId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/codex/entry/${entryId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteCodexEntryAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

// ── Maps ───────────────────────────────────────────────────────────────────
// The authors' own map image with codex entries pinned onto it. The image is
// uploaded through the existing S3 flow; only the resulting src is sent here.

export const getStoryMapsAction = async (
  storyboardId: string,
): Promise<DataType<StoryMaps>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/maps`;

  const response = await fetch(URL, { cache: "no-store", headers });

  Logger.debug("getStoryMapsAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const maps: StoryMaps = await response.json();

  return maps;
};

/** Creates a map when `map.id` is null; a null `image` on an update keeps it. */
export const saveStoryMapAction = async (
  storyboardId: string,
  map: StoryMap,
): Promise<DataType<StoryMap>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/map`;

  const response = await fetch(URL, {
    body: JSON.stringify(map),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryMapAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: StoryMap = await response.json();

  return saved;
};

/** Deleting a map takes its pins with it. */
export const deleteStoryMapAction = async (mapId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/map/${mapId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryMapAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

/** Creates a pin when `pin.id` is null; moving one is the same call. */
export const saveStoryMapPinAction = async (
  mapId: string,
  pin: StoryMapPin,
): Promise<DataType<StoryMapPin>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/map/${mapId}/pin`;

  const response = await fetch(URL, {
    body: JSON.stringify(pin),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveStoryMapPinAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: StoryMapPin = await response.json();

  return saved;
};

export const deleteStoryMapPinAction = async (pinId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/map/pin/${pinId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteStoryMapPinAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

// ── Soundscape ─────────────────────────────────────────────────────────────
// Audio cues mounted to a range of a chapter's passages. Anyone who can read
// the chapter hears them; any member edits them.

export const getChapterSoundscapeAction = async (
  storyboardEventId: string,
): Promise<DataType<ChapterSoundscape>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/sound`;

  const response = await fetch(URL, { cache: "no-store", headers });

  Logger.debug("getChapterSoundscapeAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const soundscape: ChapterSoundscape = await response.json();

  return soundscape;
};

/**
 * The chapter's frozen page geometry: every passage in reading order, plus the
 * heights measured so far. Readable by anyone who can read the chapter.
 */
export const getChapterPageLayoutAction = async (
  storyboardEventId: string,
  format: string,
): Promise<DataType<ChapterPageLayout>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers[AUTH_HEADER_NAME] = jwt;

  const URL =
    `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/page-metrics` +
    `?format=${encodeURIComponent(format)}`;

  const response = await fetch(URL, { cache: "no-store", headers });

  Logger.debug("getChapterPageLayoutAction", response.status);

  if (response.status === 404) return null;
  if (!response.ok) return { message: API_MESSAGE.Error };

  const layout: ChapterPageLayout = await response.json();

  return layout;
};

/**
 * Reports what this client measured. Members only, and merged server-side — a
 * client only ever has part of the chapter loaded, so each report fills in the
 * passages it could see and leaves the rest alone.
 */
export const saveChapterPageMetricsAction = async (
  storyboardEventId: string,
  request: ChapterPageMetricsRequest,
): Promise<DataType<ChapterPageLayout>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/page-metrics`;

  const response = await fetch(URL, {
    body: JSON.stringify(request),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveChapterPageMetricsAction", response.status);

  if (!response.ok) return { message: API_MESSAGE.Error };

  const layout: ChapterPageLayout = await response.json();

  return layout;
};

/** Creates a cue when `cue.id` is null; moving or resizing one is the same call. */
export const saveSoundCueAction = async (
  storyboardEventId: string,
  cue: SoundCue,
): Promise<DataType<SoundCue>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/event/${storyboardEventId}/sound`;

  const response = await fetch(URL, {
    body: JSON.stringify(cue),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveSoundCueAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: SoundCue = await response.json();

  return saved;
};

export const deleteSoundCueAction = async (cueId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/sound/${cueId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteSoundCueAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

/**
 * Records how two of the story's cast stand toward each other. Both ends must
 * already be in the cast; relationships come back with the codex itself, so
 * there is no separate read.
 */
export const saveCodexRelationshipAction = async (
  storyboardId: string,
  relationship: CodexRelationship,
): Promise<DataType<CodexRelationship>> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/${storyboardId}/codex/relationship`;

  const response = await fetch(URL, {
    body: JSON.stringify(relationship),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("saveCodexRelationshipAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const saved: CodexRelationship = await response.json();

  return saved;
};

export const deleteCodexRelationshipAction = async (relationshipId: string) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/story/codex/relationship/${relationshipId}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteCodexRelationshipAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};
