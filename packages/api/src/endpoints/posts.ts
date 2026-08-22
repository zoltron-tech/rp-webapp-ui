import type { Prompt } from "@nw/types";
import type { DataType } from "@nw/types/common";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/prompt/posts";

export const getPostsByNovelist = (
  api: ApiClient,
  novelistId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Prompt[]>> =>
  api.requestNullable<Prompt[]>(
    `${BASE}/by/${novelistId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getPostsByNovelistAction", notFound: "null" },
  );

export const getPromptsByNovelist = (
  api: ApiClient,
  novelistId: string,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<Prompt[]>> =>
  api.requestNullable<Prompt[]>(
    `${BASE}/muses/by/${novelistId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getPromptsByNovelistAction", notFound: "null" },
  );
