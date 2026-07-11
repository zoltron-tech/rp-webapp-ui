"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type {
  BookmarkedStoryBoardEvent,
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventBookmark,
  StoryBoardEventThreadInput,
  StoryBoardEventThreadPage,
} from "@/types";
import type { DataType, Genre } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

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
    return { message: API_MESSAGE.Error };
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
    return { message: API_MESSAGE.Error };
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
