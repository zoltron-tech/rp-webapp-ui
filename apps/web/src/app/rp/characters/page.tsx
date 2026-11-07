"use client";

import type { Muse } from "@nw/types";
import { useEffect } from "react";
import { BreadCrumb } from "@/components/breadcrumb";
import { useFandomSearch } from "@/components/filter-search/use-fandom-search";
import { LoadMore } from "@/components/load-more/page";
import { MusePreviewCard } from "@/components/muse-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { usePagedSearch } from "@/hooks/use-paged-search";
import { getMuseDirectoryAction } from "./actions";
import * as S from "./styles";

/**
 * The character directory: every character the reader may see, a page at a
 * time, alphabetically (`GET /muse/directory`).
 *
 * One field searches names and fandoms together — "jon" finds Jon Snow,
 * "hp" finds every Harry Potter character — with fandom chips under it
 * (`useFandomSearch`, shared with the prompt search on Explore). The query
 * and the pinned fandoms live in the address (`?q=&fandoms=`).
 */

const PAGE_SIZE = 24;
const GHOST_CARDS = 8;

export default function CharacterDirectoryPage() {
  const { stopPageLoading } = usePageRouter();
  const user = useGlobalState("user");
  const search = useFandomSearch();

  const { failed, hasMore, items, loadMore, loadingMore, retry } =
    usePagedSearch<Muse>({
      fetchPage: (pageNumber) =>
        getMuseDirectoryAction({
          fandoms: search.fandomIds,
          pageNumber,
          pageSize: PAGE_SIZE,
          query: search.term,
        }),
      key: `${search.term}|${search.fandomKey}`,
      pageSize: PAGE_SIZE,
    });

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.Container>
      <BreadCrumb label="Character Directory" username={user?.username ?? ""} />

      <S.Header>
        <S.Title>Character Directory</S.Title>
        <S.Subtitle>
          Every character on Novelist World. Search by name or fandom.
        </S.Subtitle>
      </S.Header>

      <S.Search
        value={search.query}
        onChange={search.setQuery}
        placeholder="Search characters or fandoms…"
        filters={search.chips}
        activeFilters={search.activeChipIds}
        onFilterChange={search.onChipsChange}
        filterLabel="Fandoms:"
      />

      {items === null ? (
        <S.Grid aria-busy="true" aria-label="Loading characters">
          {Array.from({ length: GHOST_CARDS }, (_, index) => (
            <S.CardShimmer key={index} />
          ))}
        </S.Grid>
      ) : failed ? (
        <S.Empty role="alert">
          Couldn&apos;t load the directory.
          <S.RetryButton type="button" onClick={retry}>
            Try again
          </S.RetryButton>
        </S.Empty>
      ) : items.length === 0 ? (
        <S.Empty>
          {search.filtering
            ? "No characters match that search."
            : "No characters to show yet."}
        </S.Empty>
      ) : (
        <>
          <S.Grid>
            {items.map((muse) => (
              <MusePreviewCard key={muse.id} muse={muse} />
            ))}
          </S.Grid>
          <LoadMore
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            endMarker
          />
        </>
      )}
    </S.Container>
  );
}
