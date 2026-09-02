import {
  addNote,
  getNotifications as apiGetNotifications,
  getNovelists as apiGetNovelists,
  getUserNovelist as apiGetUserNovelist,
  patchNotifications as apiPatchNotifications,
  updateUserNovelist as apiUpdateUserNovelist,
  deleteBanner,
  deleteNote,
  getChatMessages,
  getFriendsByUsername,
  getNovelist,
  getNovelistById,
  getReactionLikers,
  getViewedGuides,
  markGuideViewed,
  search,
} from "@nw/api/endpoints/novelists";
import type { UpdateNovelistPayload } from "@nw/types";
import { api, authedApi, cookieApi } from "@/lib/api";

export const getNovelists = () => apiGetNovelists(api);

export const getNovelistByIdAction = (novelistId: string) =>
  getNovelistById(api, novelistId);

export const getNovelistAction = (username: string) =>
  getNovelist(api, username);

export const getUserNovelist = () => apiGetUserNovelist(authedApi);

export const getNotifications = (pageNumber: number, pageSize: number) =>
  apiGetNotifications(authedApi, pageNumber, pageSize);

export const patchNotifications = () => apiPatchNotifications(authedApi);

export const updateUserNovelist = (
  _novelist: UpdateNovelistPayload,
  create = false,
) => apiUpdateUserNovelist(authedApi, _novelist, create);

export const searchAction = (searchTerm: string, type = "novelist") =>
  search(api, searchTerm, type);

export const chatAction = async (targetUserName: string | null) => {
  if (targetUserName === null) return;
  return getChatMessages(authedApi, targetUserName);
};

export const addNoteAction = (
  text: string,
  color: string | null,
  emoji: string | null,
) => addNote(authedApi, text, color, emoji);

export const deleteBannerAction = () => deleteBanner(authedApi);

export const deleteNoteAction = () => deleteNote(authedApi);

export const getFriendsByUsernameAction = (
  username: string,
  pageNumber: number,
  pageSize: number,
) => getFriendsByUsername(api, username, pageNumber, pageSize);

export const getReactionLikersAction = (
  targetId: string,
  pageNumber: number,
  pageSize: number,
) => getReactionLikers(authedApi, targetId, pageNumber, pageSize);

/** Read-only on the cookie — see `cookieApi`. */
export const getViewedGuidesAction = () => getViewedGuides(cookieApi);

export const markGuideViewedAction = (guideId: string) =>
  markGuideViewed(cookieApi, guideId);
