"use server";

import {
  createConversationIfNotExist,
  createGroup,
  createIceBreaker,
  deleteIceBreaker,
  getConversationByUsername,
  getConversations,
  getGroupCount,
  getIceBreakers,
  getUnreadConversationIds,
} from "@nw/api/endpoints/conversations";
import { api } from "@/lib/server-api";

export const getConversationsAction = (pageNumber: number, pageSize: number) =>
  getConversations(api, pageNumber, pageSize);

export const getGroupCountAction = () => getGroupCount(api);

export const createGroupAction = (name: string, participantIds: string[]) =>
  createGroup(api, name, participantIds);

export const getUnreadConversationIdsAction = () =>
  getUnreadConversationIds(api);

export const getConversationByUsernameAction = (username: string) =>
  getConversationByUsername(api, username);

export const createConversationIfNotExistAction = (targetNovelistId: string) =>
  createConversationIfNotExist(api, targetNovelistId);

export const getIceBreakersAction = () => getIceBreakers(api);

export const createIceBreakerAction = (
  sourceId: string,
  sourceType: "NOVELIST" | "MUSE",
  message: string,
  color?: string | null,
) => createIceBreaker(api, sourceId, sourceType, message, color);

export const deleteIceBreakerAction = (sourceId: string) =>
  deleteIceBreaker(api, sourceId);
