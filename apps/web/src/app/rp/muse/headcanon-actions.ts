import {
  createHeadcanon,
  deleteHeadcanon,
  getHeadcanon,
  getHeadcanonCatalog,
  getHeadcanonSection,
  reorderHeadcanons,
  setHeadcanonHeart,
  setHeadcanonPinned,
  updateHeadcanon,
  updateMuseFacts,
  updateMuseTraits,
} from "@nw/api/endpoints/headcanon";
import type {
  FactsRequest,
  HeadcanonRequest,
  TraitsRequest,
} from "@nw/types/headcanon";
import { api, authedApi } from "@/lib/api";

// Reads follow the muse's own visibility, so they go out with whatever
// credential the viewer has (none for a signed-out visitor).
export const getHeadcanonCatalogAction = () => getHeadcanonCatalog(api);

export const getHeadcanonSectionAction = (museId: string) =>
  getHeadcanonSection(api, museId);

export const getHeadcanonAction = (headcanonId: string) =>
  getHeadcanon(api, headcanonId);

// Writes — always the caller's own muse, except hearts.
export const updateMuseTraitsAction = (
  museId: string,
  request: TraitsRequest,
) => updateMuseTraits(authedApi, museId, request);

export const updateMuseFactsAction = (museId: string, request: FactsRequest) =>
  updateMuseFacts(authedApi, museId, request);

export const createHeadcanonAction = (
  museId: string,
  request: HeadcanonRequest,
) => createHeadcanon(authedApi, museId, request);

export const updateHeadcanonAction = (
  headcanonId: string,
  request: HeadcanonRequest,
) => updateHeadcanon(authedApi, headcanonId, request);

export const deleteHeadcanonAction = (headcanonId: string) =>
  deleteHeadcanon(authedApi, headcanonId);

export const setHeadcanonPinnedAction = (
  headcanonId: string,
  pinned: boolean,
) => setHeadcanonPinned(authedApi, headcanonId, pinned);

export const reorderHeadcanonsAction = (museId: string, ids: string[]) =>
  reorderHeadcanons(authedApi, museId, ids);

export const setHeadcanonHeartAction = (
  headcanonId: string,
  hearted: boolean,
) => setHeadcanonHeart(authedApi, headcanonId, hearted);
