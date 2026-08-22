"use server";

import {
  addGroupMembers,
  deleteGroup,
  getConversationById,
  getConversationMembers,
  getConversationMessages,
  getConversationMuses,
  leaveGroup,
  markConversationRead,
  removeGroupMember,
  reportMessage,
  sendConversationMessage,
  updateGroup,
} from "@nw/api/endpoints/conversation-detail";
import { authedApi } from "@/lib/server-api";

export const getConversationByIdAction = (conversationId: string) =>
  getConversationById(authedApi, conversationId);

export const getConversationMembersAction = (
  conversationId: string,
  page = 1,
  pageSize = 20,
) => getConversationMembers(authedApi, conversationId, page, pageSize);

export const updateGroupAction = (
  groupId: string,
  payload: { name?: string; image?: string },
) => updateGroup(authedApi, groupId, payload);

export const addGroupMembersAction = (
  groupId: string,
  participantIds: string[],
) => addGroupMembers(authedApi, groupId, participantIds);

export const removeGroupMemberAction = (groupId: string, novelistId: string) =>
  removeGroupMember(authedApi, groupId, novelistId);

export const leaveGroupAction = (groupId: string) =>
  leaveGroup(authedApi, groupId);

export const deleteGroupAction = (groupId: string) =>
  deleteGroup(authedApi, groupId);

export const getConversationMessagesAction = (
  conversationId: string,
  page = 1,
  pageSize = 20,
) => getConversationMessages(authedApi, conversationId, page, pageSize);

export const sendConversationMessageAction = (input: {
  conversationId: string;
  message: string;
}) => sendConversationMessage(authedApi, input);

export const getConversationMusesAction = (
  conversationId: string,
  prefix = "",
) => getConversationMuses(authedApi, conversationId, prefix);

export const reportMessageAction = (messageId: string) =>
  reportMessage(authedApi, messageId);

export const markConversationReadAction = (conversationId: string) =>
  markConversationRead(authedApi, conversationId);
