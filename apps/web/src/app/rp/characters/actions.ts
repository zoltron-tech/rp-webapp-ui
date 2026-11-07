import { getMuseDirectory } from "@nw/api/endpoints/muse";
import { api } from "@/lib/api";

/** Session optional: signed out, the directory is PUBLIC characters only. */
export const getMuseDirectoryAction = (args: {
  fandoms: readonly string[];
  pageNumber: number;
  pageSize: number;
  query: string;
}) => getMuseDirectory(api, args);
