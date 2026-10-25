"use client";

import type {
  OpenLibraryBook,
  ShelfEntry,
  ShelvedMarker,
  SuggestedRow,
} from "@nw/types/books";
import { useEffect, useState } from "react";
import {
  getSuggestedBooksAction,
  searchBooksAction,
} from "@/app/rp/books/actions";
import { BookDialog } from "@/components/bookshelf/book-dialog";
import { BookCard } from "@/components/bookshelf/book-visuals";
import * as B from "@/components/bookshelf/styles";
import { failed } from "@/components/bookshelf/use-shelf-actions";
import { FilterSearch } from "@/components/filter-search";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useSearchParams } from "@/lib/navigation";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

type SearchMode = "all" | "title" | "author" | "subject";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;
const RECENT_LIMIT = 5;
const RECENT_KEY = "nw.openLibrary.recent";

const readRecent = (): string[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((x): x is string => typeof x === "string")
          .slice(0, RECENT_LIMIT)
      : [];
  } catch {
    return [];
  }
};

const writeRecent = (list: string[]) => {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Private mode / blocked storage: recents are a convenience only.
  }
};

const MODES: { id: SearchMode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "title", label: "Title" },
  { id: "author", label: "Author" },
  { id: "subject", label: "Tag" },
];

const PLACEHOLDER: Record<SearchMode, string> = {
  all: "Search books, authors, tags...",
  author: "Search by author...",
  subject: "Search by tag (e.g. romance, dragons)...",
  title: "Search by title...",
};

/**
 * Open World Library: Open Library search, and the picker for a novelist's
 * bookshelf (BOOKSHELF_PLAN.md §4.3). Search goes through portfolio-service
 * and needs a signed-in novelist; signed-out visitors get a login panel.
 */
export default function OpenLibraryPage() {
  const { stopPageLoading, routeToPage } = usePageRouter();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const searchParams = useSearchParams();
  // Opened from a shelf: the back link returns there.
  const fromShelf = searchParams.get("from") === "shelf";

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [page, setPage] = useState(1);

  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<SuggestedRow[] | null>(null);
  /** What the caller already has on their shelf, keyed by work key. */
  const [shelved, setShelved] = useState<Record<string, ShelvedMarker>>({});
  const [selected, setSelected] = useState<OpenLibraryBook | null>(null);

  const signedIn = authState === "LOGGED_IN";
  const searching = query.trim().length > 0;

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  // Debounce typing; a new query always starts back at the first page.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(input);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [input]);

  // Recent searches live in this browser only (searching.md: offer a way
  // to clear them). Written when a query settles, shown while the box is empty.
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  useEffect(() => {
    const q = query.trim();
    if (!q || !signedIn) return;
    setRecent((prev) => {
      const next = [
        q,
        ...prev.filter((r) => r.toLowerCase() !== q.toLowerCase()),
      ].slice(0, RECENT_LIMIT);
      writeRecent(next);
      return next;
    });
  }, [query, signedIn]);

  // Landing rows before any query.
  useEffect(() => {
    if (!signedIn || suggested) return;
    let cancelled = false;
    getSuggestedBooksAction().then((result) => {
      if (cancelled) return;
      setSuggested(failed(result) ? [] : result);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn, suggested]);

  useEffect(() => {
    if (!signedIn || !searching) {
      setBooks([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchBooksAction(query, mode, page, PAGE_SIZE).then((result) => {
      if (cancelled) return;
      if (failed(result)) {
        setBooks([]);
        setTotal(0);
        setError(
          result?.reason === "UPSTREAM_UNAVAILABLE"
            ? "Open Library is busy. Try again in a moment."
            : "Couldn't reach Open Library. Try again in a moment.",
        );
      } else {
        setBooks(result.docs);
        setTotal(result.numFound);
        setShelved((prev) => ({ ...prev, ...result.shelved }));
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn, searching, query, mode, page]);

  const changeMode = (values: string[]) => {
    const next = values[0] as SearchMode | undefined;
    if (!next || next === mode) return;
    setMode(next);
    setPage(1);
  };

  /** "by Julia Quinn" in the dialog → her books. The box shows the name, so
   *  it is obvious why the results changed. */
  const searchAuthor = (name: string) => {
    setSelected(null);
    setMode("author");
    setInput(name);
    setQuery(name);
    setPage(1);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const goTo = (next: number) => {
    setPage(next);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const onShelfChange = (olKey: string, entry: ShelfEntry | null) => {
    setShelved((prev) => {
      const next = { ...prev };
      if (entry) {
        next[olKey] = {
          favoriteRank: entry.favoriteRank,
          status: entry.status,
        };
      } else {
        delete next[olKey];
      }
      return next;
    });
  };

  const hasPrev = page > 1;
  const hasNext = page * PAGE_SIZE < total;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + books.length - 1;

  const back = () =>
    routeToPage(
      fromShelf && user?.username
        ? ROUTES.Profile.View(user.username).Books
        : ROUTES.Library,
    );

  const renderCard = (doc: OpenLibraryBook) => (
    <BookCard
      key={doc.key}
      doc={doc}
      viewerStatus={shelved[doc.key]?.status ?? null}
      onOpen={() => setSelected(doc)}
    />
  );

  return (
    <S.Container>
      <S.Header>
        <S.BackLink type="button" onClick={back}>
          {fromShelf ? "← Back to shelf" : "← Library"}
        </S.BackLink>
        <S.Title>Open World Library</S.Title>
        <S.Subtitle>
          Search millions of published books, courtesy of Open Library
        </S.Subtitle>
      </S.Header>

      <FilterSearch
        value={input}
        onChange={setInput}
        placeholder={
          signedIn ? PLACEHOLDER[mode] : "Log in to search millions of books"
        }
        filters={signedIn ? MODES : undefined}
        activeFilters={[mode]}
        onFilterChange={signedIn ? changeMode : undefined}
        filterLabel="Search by:"
        single
      />

      {authState === "LOGGED_OUT" && (
        <S.LoginPanel>
          <S.LoginTitle>Log in to search millions of books</S.LoginTitle>
          <S.LoginText>
            Search Open Library, keep a bookshelf of what you've read, and show
            your favorites on your profile.
          </S.LoginText>
          <S.LoginButton
            type="button"
            onClick={() => routeToPage(ROUTES.Login)}
          >
            Log in
          </S.LoginButton>
        </S.LoginPanel>
      )}

      {signedIn && !searching && recent.length > 0 && (
        <S.Recent aria-label="Recent searches">
          <S.RecentLabel>Recent</S.RecentLabel>
          {recent.map((r) => (
            <S.RecentChip key={r} type="button" onClick={() => setInput(r)}>
              {r}
            </S.RecentChip>
          ))}
          <S.RecentClear
            type="button"
            onClick={() => {
              setRecent([]);
              writeRecent([]);
            }}
          >
            Clear
          </S.RecentClear>
        </S.Recent>
      )}

      {signedIn && !searching && (
        <S.Suggested>
          {suggested === null
            ? Array.from({ length: 2 }).map((_, i) => (
                <S.SuggestedRow key={i}>
                  <S.RowLabel>
                    <S.RowLabelShimmer />
                  </S.RowLabel>
                  <S.Rail>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <B.CardShimmer key={j} />
                    ))}
                  </S.Rail>
                </S.SuggestedRow>
              ))
            : suggested.map((row) => (
                <S.SuggestedRow key={row.label}>
                  <S.RowLabel>{row.label}</S.RowLabel>
                  <S.Rail>{row.docs.map(renderCard)}</S.Rail>
                </S.SuggestedRow>
              ))}
          {suggested?.length === 0 && (
            <S.Empty>Type above to search Open Library.</S.Empty>
          )}
        </S.Suggested>
      )}

      {signedIn && searching && (
        <>
          <S.Meta aria-live="polite">
            {loading
              ? "Searching..."
              : total > 0
                ? `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`
                : ""}
          </S.Meta>

          <S.Grid>
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <B.CardShimmer key={i} />
                ))
              : books.map(renderCard)}
          </S.Grid>

          {!loading && error && <S.Empty>{error}</S.Empty>}
          {!loading && !error && books.length === 0 && (
            <S.Empty>
              {mode === "all" ? (
                "No books found."
              ) : (
                <>
                  No {MODES.find((m) => m.id === mode)?.label.toLowerCase()}{" "}
                  matches &ldquo;{query.trim()}&rdquo;.
                  <S.EmptyAction
                    type="button"
                    onClick={() => changeMode(["all"])}
                  >
                    Search everything instead
                  </S.EmptyAction>
                </>
              )}
            </S.Empty>
          )}

          {(hasPrev || hasNext) && (
            <S.Pager>
              <S.PagerCount aria-hidden>
                {`${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`}
              </S.PagerCount>
              <S.PagerButton
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={!hasPrev || loading}
              >
                ← Back
              </S.PagerButton>
              <S.PagerButton
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={!hasNext || loading}
              >
                Next →
              </S.PagerButton>
            </S.Pager>
          )}
        </>
      )}

      <BookDialog
        doc={selected}
        onClose={() => setSelected(null)}
        viewerShelf={selected ? (shelved[selected.key] ?? null) : null}
        onShelfChange={onShelfChange}
        onAuthorClick={searchAuthor}
      />
    </S.Container>
  );
}
