import type { DataType } from "@nw/types/common";
import type {
  FactsRequest,
  Headcanon,
  HeadcanonCatalog,
  HeadcanonDetail,
  HeadcanonRequest,
  HeadcanonSection,
  HeartState,
  MuseFacts,
  MuseTrait,
  TraitsRequest,
} from "@nw/types/headcanon";
import type { ApiClient } from "../client";

const BASE = "/rp/portfolio/headcanon";

export const getHeadcanonCatalog = (
  api: ApiClient,
): Promise<DataType<HeadcanonCatalog>> =>
  api.request<HeadcanonCatalog>(`${BASE}/catalog`, {
    catchErrors: true,
    label: "getHeadcanonCatalogAction",
  });

/** Null when the viewer may not see the muse (404). */
export const getHeadcanonSection = (
  api: ApiClient,
  museId: string,
): Promise<DataType<HeadcanonSection>> =>
  api.requestNullable<HeadcanonSection>(`${BASE}/muse/${museId}`, {
    catchErrors: true,
    label: "getHeadcanonSectionAction",
    notFound: "null",
  });

/**
 * Null when the card is gone or hidden. A friends-only card a non-friend
 * asks for comes back as an error whose `reason` is HEADCANON_FRIENDS_ONLY.
 */
export const getHeadcanon = (
  api: ApiClient,
  headcanonId: string,
): Promise<DataType<HeadcanonDetail>> =>
  api.requestNullable<HeadcanonDetail>(`${BASE}/${headcanonId}`, {
    catchErrors: true,
    label: "getHeadcanonAction",
    notFound: "null",
    withReason: true,
  });

// ── Owner writes ───────────────────────────────────────────────────────────

export const updateMuseTraits = (
  api: ApiClient,
  museId: string,
  request: TraitsRequest,
): Promise<DataType<MuseTrait[]>> =>
  api.request<MuseTrait[]>(`${BASE}/muse/${museId}/traits`, {
    body: request,
    catchErrors: true,
    label: "updateMuseTraitsAction",
    method: "PUT",
    withReason: true,
  });

export const updateMuseFacts = (
  api: ApiClient,
  museId: string,
  request: FactsRequest,
): Promise<DataType<MuseFacts>> =>
  api.request<MuseFacts>(`${BASE}/muse/${museId}/facts`, {
    body: request,
    catchErrors: true,
    label: "updateMuseFactsAction",
    method: "PUT",
    withReason: true,
  });

export const createHeadcanon = (
  api: ApiClient,
  museId: string,
  request: HeadcanonRequest,
): Promise<DataType<Headcanon>> =>
  api.request<Headcanon>(`${BASE}/muse/${museId}`, {
    body: request,
    catchErrors: true,
    label: "createHeadcanonAction",
    method: "POST",
    withReason: true,
  });

export const updateHeadcanon = (
  api: ApiClient,
  headcanonId: string,
  request: HeadcanonRequest,
): Promise<DataType<Headcanon>> =>
  api.request<Headcanon>(`${BASE}/${headcanonId}`, {
    body: request,
    catchErrors: true,
    label: "updateHeadcanonAction",
    method: "PUT",
    withReason: true,
  });

export const deleteHeadcanon = (
  api: ApiClient,
  headcanonId: string,
): Promise<DataType<{ message: string }>> =>
  api.request<{ message: string }>(`${BASE}/${headcanonId}`, {
    catchErrors: true,
    label: "deleteHeadcanonAction",
    method: "DELETE",
  });

export const setHeadcanonPinned = (
  api: ApiClient,
  headcanonId: string,
  pinned: boolean,
): Promise<DataType<Headcanon>> =>
  api.request<Headcanon>(`${BASE}/${headcanonId}/pin`, {
    catchErrors: true,
    label: "setHeadcanonPinnedAction",
    method: pinned ? "PUT" : "DELETE",
    withReason: true,
  });

/** `ids` = exactly the cards on that muse's hub, in the new order. */
export const reorderHeadcanons = (
  api: ApiClient,
  museId: string,
  ids: string[],
): Promise<DataType<Headcanon[]>> =>
  api.request<Headcanon[]>(`${BASE}/muse/${museId}/order`, {
    body: { ids },
    catchErrors: true,
    label: "reorderHeadcanonsAction",
    method: "PUT",
    withReason: true,
  });

// ── Hearts ─────────────────────────────────────────────────────────────────

export const setHeadcanonHeart = (
  api: ApiClient,
  headcanonId: string,
  hearted: boolean,
): Promise<DataType<HeartState>> =>
  api.request<HeartState>(`${BASE}/${headcanonId}/heart`, {
    catchErrors: true,
    label: "setHeadcanonHeartAction",
    method: hearted ? "PUT" : "DELETE",
  });
