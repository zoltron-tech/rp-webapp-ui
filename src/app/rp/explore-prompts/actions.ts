"use server";

import { getExplorePrompts } from "@nw/api/endpoints/feed";
import { api } from "@/lib/server-api";

export const getNewPromptsAction = (pageNumber: number, pageSize: number) =>
  getExplorePrompts(api, pageNumber, pageSize);
