import type {
  BookmarkedStoryBoardEvent,
  ChapterPageLayout,
  ChapterPageMetricsRequest,
  ChapterSoundscape,
  Codex,
  CodexCategory,
  CodexEntry,
  CodexRelationship,
  CodexTone,
  SoundCue,
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventBookmark,
  StoryBoardEventThreadInput,
  StoryBoardEventThreadPage,
  StoryBoardEventTimelineInput,
  StoryCharacter,
  StoryMap,
  StoryMapPin,
  StoryMaps,
  StoryNote,
  StoryNoteFlags,
  StoryTimeline,
  StoryTimelineLane,
  StoryTimelineMarker,
} from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { DataType, ErrorType, Genre } from "@nw/types/common";
import type { ApiClient } from "../client";

const STORY = "/rp/portfolio/story";

/** A GET whose payload is the answer, and where failure is just an error. */
const get = <T>(api: ApiClient, path: string, label: string) =>
  api.request<T>(path, { label });

/** A GET where a 404 means "nothing here yet", distinct from failure. */
const getOrNull = <T>(api: ApiClient, path: string, label: string) =>
  api.requestNullable<T>(path, { label, notFound: "null" });

/** A write whose payload is the saved entity. */
const save = <T>(
  api: ApiClient,
  path: string,
  label: string,
  body: unknown,
  method: "POST" | "PUT" = "POST",
) => api.request<T>(path, { body, label, method });

/**
 * The acknowledgement shape.
 *
 * Deliberately `API_MESSAGE` rather than `WithMessage` (whose `message` is a
 * bare `string`): callers compare against `API_MESSAGE.Success` directly, which
 * only type-checks against the enum.
 */
export interface AckResult {
  message: API_MESSAGE;
}

/** A delete that reports success or failure and nothing else. */
const remove = async (
  api: ApiClient,
  path: string,
  label: string,
): Promise<AckResult> => {
  const response = await api.raw(path, { label, method: "DELETE" });
  return { message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};

// ─── Storyboards ─────────────────────────────────────────────────────────────

/** Public: the curated genre catalogue users pick from (they can't create new ones). */
export const getAllGenres = (api: ApiClient): Promise<Genre[] | ErrorType> =>
  api.request<Genre[]>("/rp/portfolio/genre", {
    anonymous: true,
    contentType: false,
    label: "getAllGenresAction",
  });

export const getAllStoryboardsByUsername = (
  api: ApiClient,
  username: string,
): Promise<DataType<StoryBoard[]>> =>
  getOrNull<StoryBoard[]>(
    api,
    `${STORY}/by/${username}`,
    "getAllStoryboardsByUsernameAction",
  );

export const getStoryboard = (
  api: ApiClient,
  storyboardId: string,
): Promise<DataType<StoryBoard>> =>
  getOrNull<StoryBoard>(api, `${STORY}/${storyboardId}`, "getStoryboardAction");

export const getAllStoryboards = (
  api: ApiClient,
): Promise<DataType<StoryBoard[]>> =>
  getOrNull<StoryBoard[]>(api, STORY, "getAllStoryboardsAction");

/** Surfaces backend validation messages (e.g. tier limits) as `reason`. */
export const updateStoryBoard = (
  api: ApiClient,
  storyboard: StoryBoard,
): Promise<StoryBoard | ErrorType> =>
  api.request<StoryBoard>(STORY, {
    body: storyboard,
    label: "updateStoryBoardAction",
    method: "POST",
    withReason: true,
  });

export const updateStoryBoardEvent = (
  api: ApiClient,
  storyboardEvent: StoryBoardEvent,
): Promise<StoryBoardEvent | ErrorType> =>
  api.request<StoryBoardEvent>(`${STORY}/event`, {
    body: storyboardEvent,
    label: "updateStoryBoardEventAction",
    method: "POST",
    withReason: true,
  });

export const getStoryboardEvent = (
  api: ApiClient,
  storyboardEventId: string,
): Promise<DataType<StoryBoardEvent>> =>
  getOrNull<StoryBoardEvent>(
    api,
    `${STORY}/event/${storyboardEventId}`,
    "getStoryboardEventAction",
  );

export const deleteStoryBoard = (api: ApiClient, storyboardId: string) =>
  remove(api, `${STORY}/${storyboardId}`, "deleteStoryBoardAction");

export const deleteStoryBoardEvent = (
  api: ApiClient,
  storyboardEventId: string,
) =>
  remove(
    api,
    `${STORY}/event/${storyboardEventId}`,
    "deleteStoryBoardEventAction",
  );

export const reorderStoryBoardEvents = (
  api: ApiClient,
  storyboardId: string,
  orderedEventIds: string[],
): Promise<StoryBoardEvent[] | ErrorType> =>
  api.request<StoryBoardEvent[]>(`${STORY}/${storyboardId}/events/reorder`, {
    body: { orderedEventIds },
    label: "reorderStoryBoardEventsAction",
    method: "POST",
    withReason: true,
  });

// ─── Threads ─────────────────────────────────────────────────────────────────

export const saveStoryBoardEventThread = async (
  api: ApiClient,
  input: StoryBoardEventThreadInput,
): Promise<AckResult> => {
  const response = await api.raw(`${STORY}/event/thread`, {
    body: input,
    label: "saveStoryBoardEventThreadAction",
    method: "POST",
  });
  return { message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};

export const deleteStoryBoardEventThread = (
  api: ApiClient,
  threadId: string,
) =>
  remove(
    api,
    `${STORY}/event/thread/${threadId}`,
    "deleteStoryBoardEventThreadAction",
  );

export const getStoryboardEventThreads = (
  api: ApiClient,
  storyboardEventId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<StoryBoardEventThreadPage>> =>
  getOrNull<StoryBoardEventThreadPage>(
    api,
    `${STORY}/event/${storyboardEventId}/threads?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    "getStoryboardEventThreadsAction",
  );

// ─── Bookmarks ───────────────────────────────────────────────────────────────

/** Null when signed out or on any failure — a bookmark is per-viewer. */
export const getStoryboardEventBookmark = async (
  api: ApiClient,
  storyboardEventId: string,
): Promise<StoryBoardEventBookmark | null> => {
  const response = await api.raw(
    `${STORY}/event/${storyboardEventId}/bookmark`,
    { label: "getStoryboardEventBookmarkAction" },
  );
  if (!response.ok) return null;
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as StoryBoardEventBookmark;
};

export const getBookmarkedEvents = (
  api: ApiClient,
): Promise<BookmarkedStoryBoardEvent[] | ErrorType> =>
  get<BookmarkedStoryBoardEvent[]>(
    api,
    `${STORY}/event/bookmarks`,
    "getBookmarkedEventsAction",
  );

export const saveStoryboardEventBookmark = (
  api: ApiClient,
  bookmark: StoryBoardEventBookmark,
): Promise<StoryBoardEventBookmark | ErrorType> =>
  save<StoryBoardEventBookmark>(
    api,
    `${STORY}/event/bookmark`,
    "saveStoryboardEventBookmarkAction",
    bookmark,
  );

export const deleteStoryboardEventBookmark = (
  api: ApiClient,
  storyboardEventId: string,
) =>
  remove(
    api,
    `${STORY}/event/${storyboardEventId}/bookmark`,
    "deleteStoryboardEventBookmarkAction",
  );

// ─── Timeline ────────────────────────────────────────────────────────────────

export const getStoryTimeline = (api: ApiClient, storyboardId: string) =>
  get<StoryTimeline>(
    api,
    `${STORY}/${storyboardId}/timeline`,
    "getStoryTimelineAction",
  );

export const saveStoryTimelineLane = (
  api: ApiClient,
  storyboardId: string,
  lane: StoryTimelineLane,
) =>
  save<StoryTimelineLane>(
    api,
    `${STORY}/${storyboardId}/timeline/lane`,
    "saveStoryTimelineLaneAction",
    lane,
  );

export const reorderStoryTimelineLanes = (
  api: ApiClient,
  storyboardId: string,
  orderedLaneIds: string[],
) =>
  save<StoryTimelineLane[]>(
    api,
    `${STORY}/${storyboardId}/timeline/lanes/reorder`,
    "reorderStoryTimelineLanesAction",
    { orderedLaneIds },
  );

export const deleteStoryTimelineLane = (api: ApiClient, laneId: string) =>
  remove(
    api,
    `${STORY}/timeline/lane/${laneId}`,
    "deleteStoryTimelineLaneAction",
  );

export const saveStoryTimelineMarker = (
  api: ApiClient,
  storyboardId: string,
  marker: StoryTimelineMarker,
) =>
  save<StoryTimelineMarker>(
    api,
    `${STORY}/${storyboardId}/timeline/marker`,
    "saveStoryTimelineMarkerAction",
    marker,
  );

export const deleteStoryTimelineMarker = (api: ApiClient, markerId: string) =>
  remove(
    api,
    `${STORY}/timeline/marker/${markerId}`,
    "deleteStoryTimelineMarkerAction",
  );

export const saveStoryboardEventTimeline = (
  api: ApiClient,
  storyboardEventId: string,
  placement: StoryBoardEventTimelineInput,
) =>
  save<StoryBoardEvent>(
    api,
    `${STORY}/event/${storyboardEventId}/timeline`,
    "saveStoryboardEventTimelineAction",
    placement,
  );

// ─── Codex ───────────────────────────────────────────────────────────────────

export const getStoryCodex = (api: ApiClient, storyboardId: string) =>
  get<Codex>(api, `${STORY}/${storyboardId}/codex`, "getStoryCodexAction");

export const saveCodexCategory = (
  api: ApiClient,
  storyboardId: string,
  category: CodexCategory,
) =>
  save<CodexCategory>(
    api,
    `${STORY}/${storyboardId}/codex/category`,
    "saveCodexCategoryAction",
    category,
  );

export const reorderCodexCategories = (
  api: ApiClient,
  storyboardId: string,
  orderedCategoryIds: string[],
) =>
  save<CodexCategory[]>(
    api,
    `${STORY}/${storyboardId}/codex/categories/reorder`,
    "reorderCodexCategoriesAction",
    { orderedCategoryIds },
  );

export const deleteCodexCategory = (api: ApiClient, categoryId: string) =>
  remove(
    api,
    `${STORY}/codex/category/${categoryId}`,
    "deleteCodexCategoryAction",
  );

export const saveCodexEntry = (
  api: ApiClient,
  storyboardId: string,
  entry: CodexEntry,
) =>
  save<CodexEntry>(
    api,
    `${STORY}/${storyboardId}/codex/entry`,
    "saveCodexEntryAction",
    entry,
  );

export const deleteCodexEntry = (api: ApiClient, entryId: string) =>
  remove(api, `${STORY}/codex/entry/${entryId}`, "deleteCodexEntryAction");

export const saveCodexRelationship = (
  api: ApiClient,
  storyboardId: string,
  relationship: CodexRelationship,
) =>
  save<CodexRelationship>(
    api,
    `${STORY}/${storyboardId}/codex/relationship`,
    "saveCodexRelationshipAction",
    relationship,
  );

export const deleteCodexRelationship = (
  api: ApiClient,
  relationshipId: string,
) =>
  remove(
    api,
    `${STORY}/codex/relationship/${relationshipId}`,
    "deleteCodexRelationshipAction",
  );

export const saveCodexTone = (
  api: ApiClient,
  storyboardId: string,
  tone: CodexTone,
) =>
  save<CodexTone>(
    api,
    `${STORY}/${storyboardId}/codex/tone`,
    "saveCodexToneAction",
    tone,
  );

export const deleteCodexTone = (api: ApiClient, toneId: string) =>
  remove(api, `${STORY}/codex/tone/${toneId}`, "deleteCodexToneAction");

// ─── Maps ────────────────────────────────────────────────────────────────────

export const getStoryMaps = (api: ApiClient, storyboardId: string) =>
  get<StoryMaps>(api, `${STORY}/${storyboardId}/maps`, "getStoryMapsAction");

export const saveStoryMap = (
  api: ApiClient,
  storyboardId: string,
  map: StoryMap,
) =>
  save<StoryMap>(
    api,
    `${STORY}/${storyboardId}/map`,
    "saveStoryMapAction",
    map,
  );

export const deleteStoryMap = (api: ApiClient, mapId: string) =>
  remove(api, `${STORY}/map/${mapId}`, "deleteStoryMapAction");

export const saveStoryMapPin = (
  api: ApiClient,
  mapId: string,
  pin: StoryMapPin,
) =>
  save<StoryMapPin>(
    api,
    `${STORY}/map/${mapId}/pin`,
    "saveStoryMapPinAction",
    pin,
  );

export const deleteStoryMapPin = (api: ApiClient, pinId: string) =>
  remove(api, `${STORY}/map/pin/${pinId}`, "deleteStoryMapPinAction");

// ─── Sound & pagination ──────────────────────────────────────────────────────

export const getChapterSoundscape = (
  api: ApiClient,
  storyboardEventId: string,
) =>
  get<ChapterSoundscape>(
    api,
    `${STORY}/event/${storyboardEventId}/sound`,
    "getChapterSoundscapeAction",
  );

export const getChapterPageLayout = (
  api: ApiClient,
  storyboardEventId: string,
  format: string,
) =>
  getOrNull<ChapterPageLayout>(
    api,
    `${STORY}/event/${storyboardEventId}/page-metrics?format=${encodeURIComponent(format)}`,
    "getChapterPageLayoutAction",
  );

export const saveChapterPageMetrics = (
  api: ApiClient,
  storyboardEventId: string,
  request: ChapterPageMetricsRequest,
) =>
  save<ChapterPageLayout>(
    api,
    `${STORY}/event/${storyboardEventId}/page-metrics`,
    "saveChapterPageMetricsAction",
    request,
  );

export const saveSoundCue = (
  api: ApiClient,
  storyboardEventId: string,
  cue: SoundCue,
) =>
  save<SoundCue>(
    api,
    `${STORY}/event/${storyboardEventId}/sound`,
    "saveSoundCueAction",
    cue,
  );

export const deleteSoundCue = (api: ApiClient, cueId: string) =>
  remove(api, `${STORY}/sound/${cueId}`, "deleteSoundCueAction");

// ─── Characters ──────────────────────────────────────────────────────────────

export const getStoryCharacters = (api: ApiClient, storyboardId: string) =>
  get<StoryCharacter[]>(
    api,
    `${STORY}/${storyboardId}/characters`,
    "getStoryCharactersAction",
  );

export const saveStoryCharacter = (
  api: ApiClient,
  storyboardId: string,
  character: StoryCharacter,
) =>
  save<StoryCharacter>(
    api,
    `${STORY}/${storyboardId}/character`,
    "saveStoryCharacterAction",
    character,
  );

export const deleteStoryCharacter = (api: ApiClient, characterId: string) =>
  remove(api, `${STORY}/character/${characterId}`, "deleteStoryCharacterAction");

// ─── Notes ───────────────────────────────────────────────────────────────────

export const getStoryNotes = (api: ApiClient, storyboardId: string) =>
  get<StoryNote[]>(
    api,
    `${STORY}/${storyboardId}/notes`,
    "getStoryNotesAction",
  );

export const saveStoryNote = (
  api: ApiClient,
  storyboardId: string,
  note: StoryNote,
) =>
  save<StoryNote>(
    api,
    `${STORY}/${storyboardId}/note`,
    "saveStoryNoteAction",
    note,
  );

export const setStoryNoteFlags = (
  api: ApiClient,
  noteId: string,
  flags: StoryNoteFlags,
) =>
  save<StoryNote>(
    api,
    `${STORY}/note/${noteId}/flags`,
    "setStoryNoteFlagsAction",
    flags,
  );

export const reorderStoryNotes = (
  api: ApiClient,
  storyboardId: string,
  orderedNoteIds: string[],
) =>
  save<StoryNote[]>(
    api,
    `${STORY}/${storyboardId}/notes/reorder`,
    "reorderStoryNotesAction",
    { orderedNoteIds },
  );

export const voteOnStoryNotePoll = (
  api: ApiClient,
  noteId: string,
  optionId: string,
) =>
  save<StoryNote>(api, `${STORY}/note/${noteId}/vote`, "voteOnStoryNotePollAction", {
    optionId,
  });

export const retractStoryNotePollVote = (api: ApiClient, noteId: string) =>
  api.request<StoryNote>(`${STORY}/note/${noteId}/vote`, {
    label: "retractStoryNotePollVoteAction",
    method: "DELETE",
  });

export const deleteStoryNote = (api: ApiClient, noteId: string) =>
  remove(api, `${STORY}/note/${noteId}`, "deleteStoryNoteAction");
