"use server";

import { getNewsFeed as fetchNewsFeed, getNewsFeedPage } from "@nw/api/endpoints/feed";
import { api } from "@/lib/server-api";

export const getNewsFeedPageAction = (pageNumber: number, pageSize: number) =>
  getNewsFeedPage(api, pageNumber, pageSize);

export const getNewsFeed = () => fetchNewsFeed(api);
