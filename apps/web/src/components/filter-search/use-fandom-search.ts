"use client";

import type { Fandom } from "@nw/types";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchFandomsAction } from "@/app/rp/muse/actions";
import { useSearchParams, useSetSearchParams } from "@/lib/navigation";
import type { FilterOption } from "./index";

/**
 * One search field that matches a character's name or a fandom, with fandom
 * chips under it — the character directory's search, shared with the prompt
 * search on Explore so the two behave the same.
 *
 * While something is typed, the fandoms it names are offered as chips;
 * tapping one pins it as a filter and clears the text, so the results become
 * that fandom's. Pinned fandoms combine (any of them), narrow whatever is
 * typed next, and come off with a second tap.
 *
 * The query and the pinned fandoms live in the address (`?q=&fandoms=`), so
 * a search can be shared and survives back/forward. The server does the
 * matching; this only gathers what to send (`term`, `fandomIds`).
 */

const QUERY_DEBOUNCE_MS = 350;
/** Fandom suggestions start where the server's fandom matching does. */
const MIN_SUGGEST_LENGTH = 2;
const MAX_SUGGESTIONS = 6;

export const fandomLabel = (fandom: Fandom) =>
  fandom.name || fandom.id.replaceAll("_", " ");

/** Until its real name is looked up, a fandom from the address shows its id. */
const idLabel = (id: string) => id.replaceAll("_", " ");

const parseFandoms = (raw: string | null): FilterOption[] =>
  (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({ id, label: idLabel(id) }));

export interface FandomSearch {
  /** What is in the field, as typed. */
  query: string;
  setQuery: (value: string) => void;
  /** The query to search with: trimmed, after a typing pause; "" at once. */
  term: string;
  /** Pinned fandom ids, comma-joined — a stable key for effects. */
  fandomKey: string;
  /** Pinned fandom ids. */
  fandomIds: string[];
  /** Pinned first (pressed), then suggestions for the typed text. */
  chips: FilterOption[];
  /** The pressed chips, for `FilterSearch`'s `activeFilters`. */
  activeChipIds: string[];
  /** `FilterSearch`'s `onFilterChange`. */
  onChipsChange: (ids: string[]) => void;
  /** Whether anything narrows the results. */
  filtering: boolean;
}

export const useFandomSearch = (): FandomSearch => {
  const params = useSearchParams();
  const setParams = useSetSearchParams();

  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [pinned, setPinned] = useState<FilterOption[]>(() =>
    parseFandoms(params.get("fandoms")),
  );
  const debounced = useDebounce(query.trim(), QUERY_DEBOUNCE_MS);
  // Typing waits for a pause; clearing does not. Pinning a fandom clears the
  // text, and waiting out the debounce there would fetch the fandom once with
  // the old text and once without.
  const term = query.trim() === "" ? "" : debounced;
  const fandomKey = pinned.map((fandom) => fandom.id).join(",");

  // The address follows the filters. Held in a ref: the setter is a new
  // function every render, and the effect is about the filters changing.
  const setParamsRef = useRef(setParams);
  setParamsRef.current = setParams;
  useEffect(() => {
    setParamsRef.current((next) => {
      if (term) next.set("q", term);
      else next.delete("q");
      if (fandomKey) next.set("fandoms", fandomKey);
      else next.delete("fandoms");
    });
  }, [term, fandomKey]);

  // Fandoms pinned from the address carry only their ids: look the names up
  // once so the chips read "A Song of Ice and Fire" rather than "ASOIAF".
  const initialPinned = useRef(pinned);
  useEffect(() => {
    const unnamed = initialPinned.current;
    if (unnamed.length === 0) return;
    let live = true;
    void Promise.all(
      unnamed.map(async ({ id }) => {
        const result = await searchFandomsAction(id);
        const match = Array.isArray(result)
          ? result.find((fandom) => fandom.id === id)
          : undefined;
        return match ? { id, label: fandomLabel(match) } : null;
      }),
    ).then((named) => {
      if (!live) return;
      const labels = new Map(
        named.flatMap((entry) => (entry ? [[entry.id, entry.label]] : [])),
      );
      if (labels.size === 0) return;
      setPinned((current) =>
        current.map((fandom) => ({
          ...fandom,
          label: labels.get(fandom.id) ?? fandom.label,
        })),
      );
    });
    return () => {
      live = false;
    };
  }, []);

  // Fandoms the typed text names, offered as chips to pin.
  const [suggested, setSuggested] = useState<FilterOption[]>([]);
  useEffect(() => {
    if (term.length < MIN_SUGGEST_LENGTH) {
      setSuggested([]);
      return;
    }
    let live = true;
    void searchFandomsAction(term).then((result) => {
      if (!live) return;
      setSuggested(
        Array.isArray(result)
          ? result
              .slice(0, MAX_SUGGESTIONS)
              .map((fandom) => ({ id: fandom.id, label: fandomLabel(fandom) }))
          : [],
      );
    });
    return () => {
      live = false;
    };
  }, [term]);

  const chips = useMemo(() => {
    const pinnedIds = new Set(pinned.map((fandom) => fandom.id));
    return [
      ...pinned,
      ...suggested.filter((fandom) => !pinnedIds.has(fandom.id)),
    ];
  }, [pinned, suggested]);

  const onChipsChange = (ids: string[]) => {
    const pinnedIds = new Set(pinned.map((fandom) => fandom.id));
    const added = ids.filter((id) => !pinnedIds.has(id));
    setPinned([
      ...pinned.filter((fandom) => ids.includes(fandom.id)),
      ...chips.filter((fandom) => added.includes(fandom.id)),
    ]);
    // The text was how the fandom was found; once it is pinned, the text
    // would only narrow the fandom down to names that happen to match it.
    if (added.length > 0) setQuery("");
  };

  const fandomIds = useMemo(
    () => (fandomKey ? fandomKey.split(",") : []),
    [fandomKey],
  );

  return {
    activeChipIds: fandomIds,
    chips,
    fandomIds,
    fandomKey,
    filtering: term.length > 0 || fandomIds.length > 0,
    onChipsChange,
    query,
    setQuery,
    term,
  };
};
