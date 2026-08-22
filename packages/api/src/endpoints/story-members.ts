import type { StoryBoardMember } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { WithMessage } from "@nw/types/common";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/story/member";

/**
 * These three answer with `{ message }` rather than the response body, so they
 * use `raw` — `request` would try to parse a payload the callers never read.
 */

export const addStoryBoardMember = async (
  api: ApiClient,
  member: StoryBoardMember,
): Promise<WithMessage | null> => {
  const response = await api.raw(BASE, {
    body: member,
    label: "addStoryBoardMember",
    method: "POST",
  });

  if (response.status === 404) return null;
  if (!response.ok) return { message: API_MESSAGE.Error };
  return { message: API_MESSAGE.Success };
};

export const setStoryBoardMemberAdmin = async (
  api: ApiClient,
  member: StoryBoardMember,
): Promise<WithMessage> => {
  const response = await api.raw(`${BASE}/admin`, {
    body: member,
    label: "setStoryBoardMemberAdmin",
    method: "POST",
  });

  return {
    message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error,
  };
};

export const removeStoryBoardMember = async (
  api: ApiClient,
  member: StoryBoardMember,
): Promise<WithMessage | null> => {
  const response = await api.raw(BASE, {
    body: member,
    label: "removeStoryBoardMember",
    method: "DELETE",
  });

  if (response.status === 404) return null;
  if (!response.ok) return { message: API_MESSAGE.Error };
  return (await response.json()) as WithMessage;
};
