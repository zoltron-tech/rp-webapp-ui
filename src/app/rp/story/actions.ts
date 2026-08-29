"use server";

import {
  deleteCodexCategory,
  deleteCodexEntry,
  deleteCodexGroup,
  deleteCodexRelationship,
  deleteCodexTone,
  deleteSoundCue,
  deleteStoryBoard,
  deleteStoryBoardEvent,
  deleteStoryBoardEventThread,
  deleteStoryboardEventBookmark,
  deleteStoryCharacter,
  deleteStoryMap,
  deleteStoryMapPin,
  deleteStoryNote,
  deleteStoryTimelineLane,
  deleteStoryTimelineMarker,
  getAllGenres,
  getAllStoryboards,
  getAllStoryboardsByUsername,
  getBookmarkedEvents,
  getChapterPageLayout,
  getChapterSoundscape,
  getStoryboard,
  getStoryboardEvent,
  getStoryboardEventBookmark,
  getStoryboardEventThreads,
  getStoryCharacters,
  getStoryCodex,
  getStoryMaps,
  getStoryNotes,
  getStoryTimeline,
  reorderCodexCategories,
  reorderStoryBoardEvents,
  reorderStoryNotes,
  reorderStoryTimelineLanes,
  retractStoryNotePollVote,
  saveChapterPageMetrics,
  saveCodexCategory,
  saveCodexEntry,
  saveCodexGroup,
  saveCodexRelationship,
  saveCodexTone,
  saveSoundCue,
  saveStoryBoardEventThread,
  saveStoryboardEventBookmark,
  saveStoryboardEventTimeline,
  saveStoryCharacter,
  saveStoryMap,
  saveStoryMapPin,
  saveStoryNote,
  saveStoryTimelineLane,
  saveStoryTimelineMarker,
  setStoryNoteFlags,
  updateStoryBoard,
  updateStoryBoardEvent,
  voteOnStoryNotePoll,
} from "@nw/api/endpoints/story";
import type {
  ChapterPageMetricsRequest,
  CodexCategory,
  CodexEntry,
  CodexGroup,
  CodexRelationship,
  CodexTone,
  SoundCue,
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventBookmark,
  StoryBoardEventThreadInput,
  StoryBoardEventTimelineInput,
  StoryCharacter,
  StoryMap,
  StoryMapPin,
  StoryNote,
  StoryNoteFlags,
  StoryTimelineLane,
  StoryTimelineMarker,
} from "@nw/types";
import { api, authedApi } from "@/lib/server-api";

export const getAllGenresAction = () => getAllGenres(api);

export const getAllStoryboardsByUsernameAction = (username: string) =>
  getAllStoryboardsByUsername(api, username);

export const getStoryboardAction = (storyboardId: string) =>
  getStoryboard(api, storyboardId);

export const getAllStoryboardsAction = () => getAllStoryboards(authedApi);

export const updateStoryBoardAction = (_storyboard: StoryBoard) =>
  updateStoryBoard(authedApi, _storyboard);

export const updateStoryBoardEventAction = (
  _storyboardEvent: StoryBoardEvent,
) => updateStoryBoardEvent(authedApi, _storyboardEvent);

export const getStoryboardEventAction = (storyboardEventId: string) =>
  getStoryboardEvent(api, storyboardEventId);

export const deleteStoryBoardAction = (storyboardId: string) =>
  deleteStoryBoard(authedApi, storyboardId);

export const deleteStoryBoardEventAction = (storyboardEventId: string) =>
  deleteStoryBoardEvent(authedApi, storyboardEventId);

export const reorderStoryBoardEventsAction = (
  storyboardId: string,
  orderedEventIds: string[],
) => reorderStoryBoardEvents(authedApi, storyboardId, orderedEventIds);

export const saveStoryBoardEventThreadAction = (
  input: StoryBoardEventThreadInput,
) => saveStoryBoardEventThread(authedApi, input);

export const deleteStoryBoardEventThreadAction = (threadId: string) =>
  deleteStoryBoardEventThread(authedApi, threadId);

export const getStoryboardEventThreadsAction = (
  storyboardEventId: string,
  pageNumber: number,
  pageSize: number,
) => getStoryboardEventThreads(api, storyboardEventId, pageNumber, pageSize);

export const getStoryboardEventBookmarkAction = (storyboardEventId: string) =>
  getStoryboardEventBookmark(authedApi, storyboardEventId);

export const getBookmarkedEventsAction = () => getBookmarkedEvents(authedApi);

export const saveStoryboardEventBookmarkAction = (
  bookmark: StoryBoardEventBookmark,
) => saveStoryboardEventBookmark(authedApi, bookmark);

export const deleteStoryboardEventBookmarkAction = (
  storyboardEventId: string,
) => deleteStoryboardEventBookmark(authedApi, storyboardEventId);

export const getStoryTimelineAction = (storyboardId: string) =>
  getStoryTimeline(api, storyboardId);

export const saveStoryTimelineLaneAction = (
  storyboardId: string,
  lane: StoryTimelineLane,
) => saveStoryTimelineLane(authedApi, storyboardId, lane);

export const reorderStoryTimelineLanesAction = (
  storyboardId: string,
  orderedLaneIds: string[],
) => reorderStoryTimelineLanes(authedApi, storyboardId, orderedLaneIds);

export const deleteStoryTimelineLaneAction = (laneId: string) =>
  deleteStoryTimelineLane(authedApi, laneId);

export const saveStoryTimelineMarkerAction = (
  storyboardId: string,
  marker: StoryTimelineMarker,
) => saveStoryTimelineMarker(authedApi, storyboardId, marker);

export const deleteStoryTimelineMarkerAction = (markerId: string) =>
  deleteStoryTimelineMarker(authedApi, markerId);

export const saveStoryboardEventTimelineAction = (
  storyboardEventId: string,
  placement: StoryBoardEventTimelineInput,
) => saveStoryboardEventTimeline(authedApi, storyboardEventId, placement);

export const getStoryCodexAction = (storyboardId: string) =>
  getStoryCodex(api, storyboardId);

export const saveCodexCategoryAction = (
  storyboardId: string,
  category: CodexCategory,
) => saveCodexCategory(authedApi, storyboardId, category);

export const reorderCodexCategoriesAction = (
  storyboardId: string,
  orderedCategoryIds: string[],
) => reorderCodexCategories(authedApi, storyboardId, orderedCategoryIds);

export const deleteCodexCategoryAction = (categoryId: string) =>
  deleteCodexCategory(authedApi, categoryId);

export const saveCodexEntryAction = (storyboardId: string, entry: CodexEntry) =>
  saveCodexEntry(authedApi, storyboardId, entry);

export const deleteCodexEntryAction = (entryId: string) =>
  deleteCodexEntry(authedApi, entryId);

export const getStoryMapsAction = (storyboardId: string) =>
  getStoryMaps(api, storyboardId);

export const saveStoryMapAction = (storyboardId: string, map: StoryMap) =>
  saveStoryMap(authedApi, storyboardId, map);

export const deleteStoryMapAction = (mapId: string) =>
  deleteStoryMap(authedApi, mapId);

export const saveStoryMapPinAction = (mapId: string, pin: StoryMapPin) =>
  saveStoryMapPin(authedApi, mapId, pin);

export const deleteStoryMapPinAction = (pinId: string) =>
  deleteStoryMapPin(authedApi, pinId);

export const getChapterSoundscapeAction = (storyboardEventId: string) =>
  getChapterSoundscape(api, storyboardEventId);

export const getChapterPageLayoutAction = (
  storyboardEventId: string,
  format: string,
) => getChapterPageLayout(api, storyboardEventId, format);

export const saveChapterPageMetricsAction = (
  storyboardEventId: string,
  request: ChapterPageMetricsRequest,
) => saveChapterPageMetrics(authedApi, storyboardEventId, request);

export const saveSoundCueAction = (storyboardEventId: string, cue: SoundCue) =>
  saveSoundCue(authedApi, storyboardEventId, cue);

export const deleteSoundCueAction = (cueId: string) =>
  deleteSoundCue(authedApi, cueId);

export const saveCodexRelationshipAction = (
  storyboardId: string,
  relationship: CodexRelationship,
) => saveCodexRelationship(authedApi, storyboardId, relationship);

export const deleteCodexRelationshipAction = (relationshipId: string) =>
  deleteCodexRelationship(authedApi, relationshipId);

export const saveCodexToneAction = (storyboardId: string, tone: CodexTone) =>
  saveCodexTone(authedApi, storyboardId, tone);

export const deleteCodexToneAction = (toneId: string) =>
  deleteCodexTone(authedApi, toneId);

export const saveCodexGroupAction = (storyboardId: string, group: CodexGroup) =>
  saveCodexGroup(authedApi, storyboardId, group);

export const deleteCodexGroupAction = (groupId: string) =>
  deleteCodexGroup(authedApi, groupId);

export const getStoryCharactersAction = (storyboardId: string) =>
  getStoryCharacters(authedApi, storyboardId);

export const saveStoryCharacterAction = (
  storyboardId: string,
  character: StoryCharacter,
) => saveStoryCharacter(authedApi, storyboardId, character);

export const deleteStoryCharacterAction = (characterId: string) =>
  deleteStoryCharacter(authedApi, characterId);

export const getStoryNotesAction = (storyboardId: string) =>
  getStoryNotes(authedApi, storyboardId);

export const saveStoryNoteAction = (storyboardId: string, note: StoryNote) =>
  saveStoryNote(authedApi, storyboardId, note);

export const setStoryNoteFlagsAction = (
  noteId: string,
  flags: StoryNoteFlags,
) => setStoryNoteFlags(authedApi, noteId, flags);

export const reorderStoryNotesAction = (
  storyboardId: string,
  orderedNoteIds: string[],
) => reorderStoryNotes(authedApi, storyboardId, orderedNoteIds);

export const voteOnStoryNotePollAction = (noteId: string, optionId: string) =>
  voteOnStoryNotePoll(authedApi, noteId, optionId);

export const retractStoryNotePollVoteAction = (noteId: string) =>
  retractStoryNotePollVote(authedApi, noteId);

export const deleteStoryNoteAction = (noteId: string) =>
  deleteStoryNote(authedApi, noteId);
