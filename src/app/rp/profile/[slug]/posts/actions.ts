import {
  getPostsByNovelist,
  getPromptsByNovelist,
} from "@nw/api/endpoints/posts";
import { api } from "@/lib/api";

export const getPostsByNovelistAction = (
  novelistId: string,
  pageNumber: number,
  pageSize: number,
) => getPostsByNovelist(api, novelistId, pageNumber, pageSize);

export const getPromptsByNovelistAction = (
  novelistId: string,
  pageNumber: number,
  pageSize: number,
) => getPromptsByNovelist(api, novelistId, pageNumber, pageSize);
