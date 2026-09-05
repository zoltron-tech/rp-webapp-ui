import {
  createMuseConnection,
  deleteMuseConnection,
  getMuseConnectionsByMuse,
  reactToMuseConnection,
  reRequestMuseConnection,
  updateMuseConnection,
} from "@nw/api/endpoints/muse-connection";
import { api, authedApi } from "@/lib/api";

export const createMuseConnectionAction = (
  title: string,
  description: string | null,
  museIds: string[],
) => createMuseConnection(authedApi, title, description, museIds);

export const getMuseConnectionsByMuseAction = (museId: string) =>
  getMuseConnectionsByMuse(api, museId);

export const reactToMuseConnectionAction = (
  connectionId: string,
  accepted: boolean,
) => reactToMuseConnection(authedApi, connectionId, accepted);

export const reRequestMuseConnectionAction = (connectionId: string) =>
  reRequestMuseConnection(authedApi, connectionId);

export const updateMuseConnectionAction = (
  connectionId: string,
  title: string,
  description: string | null,
) => updateMuseConnection(authedApi, connectionId, title, description);

export const deleteMuseConnectionAction = (connectionId: string) =>
  deleteMuseConnection(authedApi, connectionId);
