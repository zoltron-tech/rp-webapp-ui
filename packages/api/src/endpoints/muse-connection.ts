import type { MuseConnectionGroup } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { DataType, WithMessage } from "@nw/types/common";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/muse/connection";

/** Success here means "it worked", not a payload — the callers only read `message`. */
const ackOnly = async (
  api: ApiClient,
  path: string,
  label: string,
  init: { method: "POST" | "DELETE"; body?: unknown },
): Promise<WithMessage> => {
  try {
    const response = await api.raw(path, { ...init, label });
    return {
      message: response.ok ? API_MESSAGE.Success : API_MESSAGE.Error,
    };
  } catch {
    return { message: API_MESSAGE.Error };
  }
};

export const createMuseConnection = (
  api: ApiClient,
  title: string,
  description: string | null,
  museIds: string[],
): Promise<MuseConnectionGroup | WithMessage> =>
  api.request<MuseConnectionGroup>(BASE, {
    body: { description, museIds, title },
    catchErrors: true,
    label: "createMuseConnectionAction",
    method: "POST",
  });

export const getMuseConnectionsByMuse = (
  api: ApiClient,
  museId: string,
): Promise<DataType<MuseConnectionGroup[]>> =>
  api.requestNullable<MuseConnectionGroup[]>(`${BASE}/by/${museId}`, {
    label: "getMuseConnectionsByMuseAction",
    notFound: "null",
  });

export const reactToMuseConnection = (
  api: ApiClient,
  connectionId: string,
  accepted: boolean,
): Promise<WithMessage> =>
  ackOnly(api, `${BASE}/${connectionId}/react`, "reactToMuseConnectionAction", {
    body: { accepted },
    method: "POST",
  });

export const reRequestMuseConnection = (
  api: ApiClient,
  connectionId: string,
): Promise<MuseConnectionGroup | WithMessage> =>
  api.request<MuseConnectionGroup>(`${BASE}/${connectionId}/rerequest`, {
    catchErrors: true,
    label: "reRequestMuseConnectionAction",
    method: "POST",
  });

export const updateMuseConnection = (
  api: ApiClient,
  connectionId: string,
  title: string,
  description: string | null,
): Promise<MuseConnectionGroup | WithMessage> =>
  api.request<MuseConnectionGroup>(`${BASE}/${connectionId}`, {
    body: { description, title },
    catchErrors: true,
    label: "updateMuseConnectionAction",
    method: "PUT",
  });

export const deleteMuseConnection = (
  api: ApiClient,
  connectionId: string,
): Promise<WithMessage> =>
  ackOnly(api, `${BASE}/${connectionId}`, "deleteMuseConnectionAction", {
    method: "DELETE",
  });
