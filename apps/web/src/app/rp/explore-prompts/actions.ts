import {
  getExplorePrompts,
  searchExplorePrompts,
} from "@nw/api/endpoints/feed";
import { api } from "@/lib/api";

export const getNewPromptsAction = (pageNumber: number, pageSize: number) =>
  getExplorePrompts(api, pageNumber, pageSize);

/** The prompt search on Explore; signed in only, as the feed is. */
export const searchExplorePromptsAction = (args: {
  fandoms: readonly string[];
  pageNumber: number;
  pageSize: number;
  query: string;
}) => searchExplorePrompts(api, args);
