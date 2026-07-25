"use client";

import { type FC, useCallback, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { FiSearch } from "react-icons/fi";
import { GoArrowRight } from "react-icons/go";
import { IoCloseOutline } from "react-icons/io5";
import { PiSmileyThin } from "react-icons/pi";
import { searchAction } from "@/app/rp/novelists/actions";
import { Username } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { usePageRouter } from "@/hooks/use-page-router";
import type { SearchResult } from "@/types/common";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./mobile-search-styles";

const SEARCH_DEBOUNCE_MS = 600;

type SearchType = "novelist" | "muse";

const TYPE_LABELS: Record<SearchType, string> = {
  muse: "Character",
  novelist: "Novelist",
};

type TaggedSearchResult = SearchResult & { resultType: SearchType };

/**
 * Standalone, always-visible search bar for the mobile home page — searches
 * novelists and characters together on every query and merges both result
 * sets into a single list (each item tagged with a type chip), independent
 * of the shared topbar Search component (and its global `searchBarExpanded`
 * toggle state).
 */
export const HomeMobileSearch: FC = () => {
  const { routeToPage } = usePageRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaggedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    [wrapRef],
    useCallback(() => setResults([]), []),
  );

  const runSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const [novelistResponse, museResponse] = await Promise.all([
      searchAction(trimmed, "novelist"),
      searchAction(trimmed, "muse"),
    ]);
    setLoading(false);
    setSearched(true);
    const novelists: TaggedSearchResult[] =
      novelistResponse && !("message" in novelistResponse)
        ? novelistResponse.map((r) => ({ ...r, resultType: "novelist" as const }))
        : [];
    const muses: TaggedSearchResult[] =
      museResponse && !("message" in museResponse)
        ? museResponse.map((r) => ({ ...r, resultType: "muse" as const }))
        : [];
    setResults([...novelists, ...muses]);
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(value), SEARCH_DEBOUNCE_MS);
  };

  const onSelectResult = (result: TaggedSearchResult) => () => {
    setResults([]);
    if (result.resultType === "novelist" && result.username) {
      routeToPage(ROUTES.Profile.View(result.username).Index);
    } else if (result.resultType === "muse" && result.id) {
      routeToPage(ROUTES.Muse.View(result.id));
    }
  };

  const onClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  return (
    <S.Row ref={wrapRef}>
      <S.InputWrap>
        <S.SearchIcon>
          <FiSearch size={16} />
        </S.SearchIcon>
        <S.Input
          type="search"
          placeholder="Search novelists & characters…"
          value={query}
          onChange={onChange}
        />
        {loading ? (
          <S.Spinner>
            <CgSpinner size={16} />
          </S.Spinner>
        ) : (
          query.trim() && (
            <S.ClearButton
              type="button"
              onClick={onClear}
              aria-label="Clear search"
            >
              <IoCloseOutline size={17} />
            </S.ClearButton>
          )
        )}
      </S.InputWrap>
      {searched && !loading && (
        <S.Dropdown>
          {results.length === 0 ? (
            <S.EmptyState>
              No results found
              <PiSmileyThin size={18} />
            </S.EmptyState>
          ) : (
            results.map((result) => (
              <S.DropdownItem
                key={`${result.resultType}-${result.id || result.username}`}
                onClick={onSelectResult(result)}
              >
                <S.AvatarNameRow>
                  <AvatarNew src={result.image} alt={result.firstName} />
                  <S.NameCol>
                    {result.firstName && (
                      <div>
                        {result.firstName} {result.lastName}
                      </div>
                    )}
                    {result.username && <Username username={result.username} />}
                  </S.NameCol>
                </S.AvatarNameRow>
                <S.TrailingCol>
                  <S.TypeChip $type={result.resultType}>
                    {TYPE_LABELS[result.resultType]}
                  </S.TypeChip>
                  <GoArrowRight />
                </S.TrailingCol>
              </S.DropdownItem>
            ))
          )}
        </S.Dropdown>
      )}
    </S.Row>
  );
};
