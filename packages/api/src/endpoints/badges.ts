import type { Badge } from "@nw/types/badge";
import type { ApiClient } from "../client";

const PORTFOLIO = "/rp/portfolio";

/**
 * The caller's full badge catalogue — earned badges first, then the locked ones
 * with `earned: false`.
 *
 * The backend re-evaluates the badge rules on this call (throttled), so opening
 * the badges page is normally what notices a badge has just been earned.
 */
export const getMyBadges = async (api: ApiClient): Promise<Badge[]> => {
  const response = await api.raw(`${PORTFOLIO}/badge`, {
    label: "getMyBadges",
  });
  if (!response.ok) return [];
  return (await response.json()) as Badge[];
};

/**
 * Forces a re-evaluation and returns the refreshed catalogue.
 *
 * Used by the page's refresh button and right after a Discord link returns —
 * both cases where the novelist has just done the thing and is waiting to see
 * the badge, so the throttle would only be in the way.
 */
export const syncMyBadges = async (api: ApiClient): Promise<Badge[]> => {
  const response = await api.raw(`${PORTFOLIO}/badge/sync`, {
    label: "syncMyBadges",
    method: "POST",
  });
  if (!response.ok) return [];
  return (await response.json()) as Badge[];
};
