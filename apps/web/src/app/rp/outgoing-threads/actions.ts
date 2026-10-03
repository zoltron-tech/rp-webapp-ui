import {
  getUnreadReplyCount as fetchUnreadReplyCount,
  getOutgoingThreads,
} from "@nw/api/endpoints/feed";
import { api } from "@/lib/api";

export const getOutgoingThreadsAction = (
  pageNumber: number,
  pageSize: number,
) => getOutgoingThreads(api, pageNumber, pageSize);

export const getUnreadReplyCount = () => fetchUnreadReplyCount(api);
