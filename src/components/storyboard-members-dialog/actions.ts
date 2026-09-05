import {
  addStoryBoardMember as addMember,
  removeStoryBoardMember as removeMember,
  setStoryBoardMemberAdmin as setMemberAdmin,
} from "@nw/api/endpoints/story-members";
import type { StoryBoardMember } from "@nw/types";
import { authedApi } from "@/lib/api";

export const addStoryBoardMember = (member: StoryBoardMember) =>
  addMember(authedApi, member);

export const setStoryBoardMemberAdmin = (member: StoryBoardMember) =>
  setMemberAdmin(authedApi, member);

export const removeStoryBoardMember = (member: StoryBoardMember) =>
  removeMember(authedApi, member);
