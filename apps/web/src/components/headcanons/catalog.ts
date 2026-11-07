import type {
  HeadcanonCatalog,
  HeadcanonCategory,
  TraitDefinition,
} from "@nw/types/headcanon";
import { useEffect, useState } from "react";
import { getHeadcanonCatalogAction } from "@/app/rp/muse/headcanon-actions";

/**
 * The fixed trait / fact / pair lists, fetched once per page load and shared
 * by every Headcanons surface. The promise is cached, not the result, so two
 * sections mounting together share one request; a failure is not cached.
 */
let inflight: Promise<HeadcanonCatalog | null> | null = null;
let loaded: HeadcanonCatalog | null = null;

const isCatalog = (value: unknown): value is HeadcanonCatalog =>
  !!value && typeof value === "object" && "traits" in value;

export const fetchHeadcanonCatalog = (): Promise<HeadcanonCatalog | null> => {
  if (loaded) return Promise.resolve(loaded);
  if (inflight) return inflight;
  inflight = getHeadcanonCatalogAction()
    .then((result) => {
      if (!isCatalog(result)) {
        inflight = null;
        return null;
      }
      loaded = result;
      return result;
    })
    .catch(() => {
      inflight = null;
      return null;
    });
  return inflight;
};

export const useHeadcanonCatalog = (): HeadcanonCatalog | null => {
  const [catalog, setCatalog] = useState<HeadcanonCatalog | null>(loaded);
  useEffect(() => {
    if (catalog) return;
    let active = true;
    fetchHeadcanonCatalog().then((result) => {
      if (active && result) setCatalog(result);
    });
    return () => {
      active = false;
    };
  }, [catalog]);
  return catalog;
};

/** Labels and lookups the components need, derived once per catalogue. */
export const catalogLookups = (catalog: HeadcanonCatalog | null) => {
  const traits = new Map<string, TraitDefinition>(
    (catalog?.traits ?? []).map((t) => [t.key, t]),
  );
  const blocks = new Map<string, string>(
    (catalog?.factBlocks ?? []).map((b) => [b.key, b.label]),
  );
  const categories = new Map<string, string>(
    (catalog?.categories ?? []).map((c) => [c.key, c.label]),
  );
  const pairs = new Map((catalog?.pairs ?? []).map((p) => [p.key, p] as const));
  return {
    blockLabel: (key: string) => blocks.get(key) ?? key,
    categoryLabel: (key: HeadcanonCategory | string) =>
      categories.get(key) ?? key,
    pair: (key: string) => pairs.get(key),
    traitLabel: (key: string) => traits.get(key)?.label ?? key,
    traits,
  };
};

export type CatalogLookups = ReturnType<typeof catalogLookups>;
