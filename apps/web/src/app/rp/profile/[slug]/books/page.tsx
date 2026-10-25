"use client";

import type { Novelist } from "@nw/types";
import {
  type BookStatus,
  type OpenLibraryBook,
  type ShelfEntry,
  type ShelfPage,
  type ShelfSort,
  type ShelfSummary,
  shelfEntryToDoc,
} from "@nw/types/books";
import classNames from "classnames";
import { DropdownMenu } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaHeart } from "react-icons/fa6";
import {
  IoBookOutline,
  IoCheckmark,
  IoCheckmarkDoneOutline,
  IoChevronDown,
  IoTrashOutline,
} from "react-icons/io5";
import { TbArrowsSort } from "react-icons/tb";
import {
  getShelfAction,
  getShelfSummaryAction,
  reorderFavoritesAction,
  unshelveBooksAction,
} from "@/app/rp/books/actions";
import { getNovelistAction } from "@/app/rp/novelists/actions";
import { EmptyShelfArt } from "@/components/book-art";
import { BookDialog } from "@/components/bookshelf/book-dialog";
import { BookCard, FaceOutCover } from "@/components/bookshelf/book-visuals";
import * as B from "@/components/bookshelf/styles";
import {
  failed,
  useShelfActions,
} from "@/components/bookshelf/use-shelf-actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { AddNewButton, FilterSearch, SegmentedTabs } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import { LoadMore } from "@/components/load-more/page";
import * as DD from "@/components/profile-more-dropdown/styled";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useParams } from "@/lib/navigation";
import { usernameFromHandle } from "@/utils/constants/profile-handle";
import { ROUTES } from "@/utils/constants/routes";
import * as P from "../styles";
import * as S from "./styles";

const PAGE_SIZE = 24;

type ShelfTab = BookStatus | "ALL";

const STATUS_TABS: { value: ShelfTab; label: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Read", value: "READ" },
  { label: "Reading", value: "READING" },
  { label: "Want to read", value: "WANT_TO_READ" },
];

const SORTS: { value: ShelfSort; label: string }[] = [
  { label: "Recent", value: "shelved" },
  { label: "Title", value: "title" },
  { label: "Author", value: "author" },
  { label: "Year", value: "year" },
];

const EMPTY_COPY: Record<ShelfTab, { owner: string; visitor: string }> = {
  ALL: {
    owner: "Your bookshelf is empty — add books from the Open World Library.",
    visitor: "hasn't shelved any books yet.",
  },
  READ: {
    owner: "Nothing here yet — mark a book as Read from its card.",
    visitor: "hasn't read anything yet.",
  },
  READING: {
    owner: "Nothing here yet — mark a book as Reading from its card.",
    visitor: "isn't reading anything right now.",
  },
  WANT_TO_READ: {
    owner: "Nothing here yet — add a book you want to read from its card.",
    visitor: "has nothing on the wish list yet.",
  },
};

/**
 * `/@username/books` — the Books tab (BOOKSHELF_PLAN.md §4.2): favorites
 * face-out and reorderable, then Read / Reading / Want to read grids.
 */
export default function BooksPage() {
  const params = useParams();
  const username = usernameFromHandle(params?.handle as string);
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  // The sort menu portals to <body>, outside the theme classes' reach.
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const isCurrentUser = user?.username === username;
  const { baseDataLoader, routeToPage } = usePageRouter();
  const { errorToast, successToast } = useUIContext();
  const { shelve } = useShelfActions();

  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [summary, setSummary] = useState<ShelfSummary | null | undefined>();
  const [status, setStatus] = useState<ShelfTab>("ALL");
  const [sort, setSort] = useState<ShelfSort>("shelved");
  const [pages, setPages] = useState<ShelfPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<ShelfEntry | null>(null);
  const [quickAdding, setQuickAdding] = useState<string | null>(null);
  // Multi-select (owner only): keys of the chosen books in the current tab.
  const [selectMode, setSelectMode] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);

  // Resolve the profile once; everything else keys off its id.
  useEffect(() => {
    if (authState === "LOADING" || novelist) return;
    baseDataLoader(() => getNovelistAction(username)).then((result) => {
      if (result) setNovelist(result as Novelist);
    });
  }, [authState, novelist, username, baseDataLoader]);

  const novelistId = novelist?.id;

  const loadSummary = useCallback(async () => {
    if (!novelistId) return;
    const result = await getShelfSummaryAction(novelistId);
    setSummary(failed(result) ? null : result);
  }, [novelistId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const requestId = useRef(0);
  const loadPage = useCallback(
    async (pageIndex: number) => {
      if (!novelistId) return null;
      const result = await getShelfAction(
        novelistId,
        status,
        sort,
        pageIndex,
        PAGE_SIZE,
      );
      return failed(result) ? null : result;
    },
    [novelistId, status, sort],
  );

  // First page whenever the tab or sort changes.
  useEffect(() => {
    if (!novelistId) return;
    setPicked(new Set());
    const id = ++requestId.current;
    setLoading(true);
    loadPage(0).then((page) => {
      if (id !== requestId.current) return;
      setPages(page ? [page] : []);
      setLoading(false);
    });
  }, [novelistId, loadPage]);

  const items = useMemo(() => pages.flatMap((p) => p.items), [pages]);
  const total = pages[0]?.total ?? 0;
  const hasMore = items.length < total;

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const page = await loadPage(pages.length);
    if (page) setPages((prev) => [...prev, page]);
    setLoadingMore(false);
  };

  // A filter must see the whole tab, not just the pages scrolled so far: keep
  // loading (at the max page size) until the tab is complete or the filter is
  // cleared. Shelves are capped at 1 000, so this is at most 17 calls.
  const filling = useRef(false);
  useEffect(() => {
    if (!filter.trim() || !hasMore || filling.current || !novelistId) return;
    filling.current = true;
    (async () => {
      let index = pages.length;
      let more = true;
      while (more) {
        const page = await getShelfAction(novelistId, status, sort, index, 60);
        if (failed(page)) break;
        setPages((prev) => [...prev, page]);
        index += 1;
        more = index * 60 < page.total && page.items.length > 0;
      }
      filling.current = false;
    })();
  }, [filter, hasMore, novelistId, status, sort, pages.length]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.authors.some((a) => a.toLowerCase().includes(q)),
    );
  }, [items, filter]);

  /** Patch the list after a dialog write without a reload. */
  const onShelfChange = (olKey: string, entry: ShelfEntry | null) => {
    if (isCurrentUser) {
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          items: p.items
            .map((b) => (b.olKey === olKey && entry ? entry : b))
            // Moved to another status, or removed: it leaves this tab.
            .filter(
              (b) =>
                b.olKey !== olKey ||
                (entry && (status === "ALL" || entry.status === status)),
            ),
          total:
            entry && entry.status === status
              ? p.total
              : Math.max(0, p.total - 1),
        })),
      );
      setSelected((prev) =>
        prev && prev.olKey === olKey && entry ? entry : prev,
      );
    } else {
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          items: p.items.map((b) =>
            b.olKey === olKey
              ? { ...b, viewerStatus: entry?.status ?? null }
              : b,
          ),
        })),
      );
    }
    loadSummary();
  };

  const quickAdd = async (book: ShelfEntry) => {
    setQuickAdding(book.olKey);
    const entry = await shelve(shelfEntryToDoc(book), "WANT_TO_READ");
    if (entry) onShelfChange(book.olKey, entry);
    setQuickAdding(null);
  };

  // ── Favorites order ─────────────────────────────────────────────────────

  const favorites = summary?.favorites ?? [];

  const commitOrder = async (next: ShelfEntry[]) => {
    const before = summary;
    setSummary((prev) => (prev ? { ...prev, favorites: next } : prev));
    const result = await reorderFavoritesAction(next.map((b) => b.olKey));
    if (failed(result)) {
      errorToast("Couldn't save the new order.");
      setSummary(before);
    }
  };

  const moveFavorite = (from: number, to: number) => {
    if (to < 0 || to >= favorites.length || from === to) return;
    const next = [...favorites];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commitOrder(next);
  };

  // ── Multi-select ────────────────────────────────────────────────────────

  const togglePicked = (olKey: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(olKey)) next.delete(olKey);
      else next.add(olKey);
      return next;
    });

  const exitSelect = () => {
    setSelectMode(false);
    setPicked(new Set());
  };

  /** Select every book in this tab — pulling the rest of it in first. */
  const selectAll = async () => {
    if (!novelistId || selectingAll) return;
    setSelectingAll(true);
    let all = items;
    let index = pages.length;
    let more = hasMore;
    while (more) {
      const page = await getShelfAction(novelistId, status, sort, index, 60);
      if (failed(page)) break;
      setPages((prev) => [...prev, page]);
      all = [...all, ...page.items];
      index += 1;
      more = index * 60 < page.total && page.items.length > 0;
    }
    setPicked(new Set(all.map((b) => b.olKey)));
    setSelectingAll(false);
  };

  const removePicked = async () => {
    if (removing || picked.size === 0) return;
    setRemoving(true);
    const keys = [...picked];
    const result = await unshelveBooksAction(keys);
    setRemoving(false);
    if (failed(result)) {
      errorToast("Couldn't remove those books. Try again.");
      return;
    }
    const gone = new Set(keys);
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        items: p.items.filter((b) => !gone.has(b.olKey)),
        total: Math.max(0, p.total - result.removed),
      })),
    );
    setConfirmBulk(false);
    exitSelect();
    loadSummary();
    successToast(
      result.removed === 1
        ? "Removed 1 book from your bookshelf"
        : `Removed ${result.removed} books from your bookshelf`,
    );
  };

  const doc: OpenLibraryBook | null = selected
    ? shelfEntryToDoc(selected)
    : null;
  const canQuickAdd = authState === "LOGGED_IN" && !isCurrentUser;

  if (novelist && summary === null) {
    return (
      <S.Container>
        <BreadCrumb label="Bookshelf" username={username} />
        <P.EmptyFeedContainer>
          <EmptyShelfArt />
          <P.EmptyFeedTitle>Nothing to see here</P.EmptyFeedTitle>
          <P.EmptyFeedSubtitle>
            {`${username}'s bookshelf isn't shared with you.`}
          </P.EmptyFeedSubtitle>
        </P.EmptyFeedContainer>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <BreadCrumb
        label={`Bookshelf${summary ? ` (${summary.total.toLocaleString()})` : ""}`}
        username={username}
      />

      {isCurrentUser && (
        <AddNewButton
          label="Add books"
          icon={<IoBookOutline size={18} />}
          onClick={() => routeToPage(`${ROUTES.OpenLibrary}?from=shelf`)}
        />
      )}

      {favorites.length > 0 && (
        <S.Favorites>
          <S.FavoritesHeader>
            <FaHeart size={11} />
            Favorites
            <S.FavoritesHint>
              {isCurrentUser && favorites.length > 1
                ? "Drag or use the arrows to reorder"
                : ""}
            </S.FavoritesHint>
          </S.FavoritesHeader>
          <FavoritesShelf
            favorites={favorites}
            editable={isCurrentUser}
            onOpen={setSelected}
            onMove={moveFavorite}
            onReorder={commitOrder}
          />
        </S.Favorites>
      )}

      <S.Controls>
        <SegmentedTabs
          ariaLabel="Shelf"
          options={STATUS_TABS.map((t) => ({
            ...t,
            label: summary
              ? t.value === "ALL"
                ? `${t.label} · ${summary.total.toLocaleString()}`
                : `${t.label} · ${summary.counts[
                    t.value === "READ"
                      ? "read"
                      : t.value === "READING"
                        ? "reading"
                        : "wantToRead"
                  ].toLocaleString()}`
              : t.label,
          }))}
          value={status}
          onChange={(next) => {
            setStatus(next);
            setFilter("");
          }}
        />
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <S.SortTrigger
              type="button"
              aria-label={`Sort: ${SORTS.find((o) => o.value === sort)?.label}`}
            >
              <TbArrowsSort size={14} aria-hidden />
              <span>Sort</span>
              <b>{SORTS.find((o) => o.value === sort)?.label}</b>
              <IoChevronDown size={12} aria-hidden />
            </S.SortTrigger>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DD.Content
              className={classNames([accent, theme])}
              align="end"
              sideOffset={6}
            >
              <DropdownMenu.RadioGroup
                value={sort}
                onValueChange={(next) => setSort(next as ShelfSort)}
              >
                {SORTS.map((o) => (
                  <S.SortItem key={o.value} value={o.value}>
                    <span>{o.label}</span>
                    <DropdownMenu.ItemIndicator>
                      <IoCheckmark size={15} />
                    </DropdownMenu.ItemIndicator>
                  </S.SortItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DD.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {isCurrentUser && items.length > 0 && (
          <S.SelectToggle
            type="button"
            aria-pressed={selectMode}
            onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
          >
            <IoCheckmarkDoneOutline size={15} aria-hidden />
            {selectMode ? "Done" : "Select"}
          </S.SelectToggle>
        )}
      </S.Controls>

      {items.length > 0 && (
        <FilterSearch
          value={filter}
          onChange={setFilter}
          placeholder="Filter by title or author..."
        />
      )}

      <S.Grid>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <B.CardShimmer key={i} />)
          : visible.map((book) => (
              <BookCard
                key={book.olKey}
                doc={shelfEntryToDoc(book)}
                favorite={book.favoriteRank != null}
                viewerStatus={
                  isCurrentUser
                    ? // Under All the tab no longer says it; the card must.
                      status === "ALL"
                      ? book.status
                      : null
                    : (book.viewerStatus ?? null)
                }
                onOpen={() => setSelected(book)}
                onQuickAdd={canQuickAdd ? () => quickAdd(book) : undefined}
                quickAdding={quickAdding === book.olKey}
                selectable={selectMode}
                selected={picked.has(book.olKey)}
                onToggleSelect={() => togglePicked(book.olKey)}
              />
            ))}
      </S.Grid>

      {!loading && items.length === 0 && (
        <P.EmptyFeedContainer>
          <EmptyShelfArt />
          <P.EmptyFeedTitle>
            {isCurrentUser ? "Nothing here yet" : "No books here"}
          </P.EmptyFeedTitle>
          <P.EmptyFeedSubtitle>
            {isCurrentUser
              ? EMPTY_COPY[status].owner
              : `${username} ${EMPTY_COPY[status].visitor}`}
          </P.EmptyFeedSubtitle>
        </P.EmptyFeedContainer>
      )}

      {!loading && items.length > 0 && visible.length === 0 && (
        <S.Empty>
          {hasMore
            ? "Searching the rest of the shelf…"
            : "No books match that filter."}
        </S.Empty>
      )}

      {!loading && items.length > 0 && !filter && (
        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          endMarker
        />
      )}

      {selectMode && (
        <S.BulkBar role="toolbar" aria-label="Selected books">
          <S.BulkCount>
            {picked.size === 0
              ? "Select books"
              : `${picked.size.toLocaleString()} selected`}
          </S.BulkCount>
          <S.BulkButton
            type="button"
            disabled={selectingAll}
            onClick={selectAll}
          >
            {selectingAll ? "Selecting…" : "Select all"}
          </S.BulkButton>
          <S.BulkButton
            type="button"
            disabled={picked.size === 0}
            onClick={() => setPicked(new Set())}
          >
            Clear
          </S.BulkButton>
          <S.BulkButton
            type="button"
            $tone="negative"
            disabled={picked.size === 0 || removing}
            onClick={() => setConfirmBulk(true)}
          >
            <IoTrashOutline size={14} aria-hidden />
            Remove
          </S.BulkButton>
        </S.BulkBar>
      )}

      <AppAlertDialog
        open={confirmBulk}
        onOpenChange={(open) => !open && !removing && setConfirmBulk(false)}
        heading={
          picked.size === 1
            ? "Remove this book?"
            : `Remove ${picked.size.toLocaleString()} books?`
        }
        text="They leave your bookshelf and your favorites. You can shelve them again any time from the Open World Library."
        actionButtonLabel={removing ? "Removing…" : "Remove"}
        isConfirmDisabled={removing}
        onConfirm={removePicked}
      />

      <BookDialog
        doc={doc}
        onClose={() => setSelected(null)}
        viewerShelf={
          selected && isCurrentUser
            ? { favoriteRank: selected.favoriteRank, status: selected.status }
            : selected?.viewerStatus
              ? { favoriteRank: null, status: selected.viewerStatus }
              : null
        }
        onShelfChange={onShelfChange}
      />
    </S.Container>
  );
}

/**
 * Favorites face-out, reorderable by pointer drag and by ▲▼ (plan §1.5).
 * Drag is plain pointer events: the pressed cover follows the pointer and
 * the drop slot is whichever sibling's midpoint it has passed.
 */
function FavoritesShelf({
  favorites,
  editable,
  onOpen,
  onMove,
  onReorder,
}: {
  favorites: ShelfEntry[];
  editable: boolean;
  onOpen: (book: ShelfEntry) => void;
  onMove: (from: number, to: number) => void;
  onReorder: (next: ShelfEntry[]) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    from: number;
    over: number;
    dx: number;
    dy: number;
  } | null>(null);
  const start = useRef<{
    x: number;
    y: number;
    from: number;
    el: HTMLElement;
    pointerId: number;
  } | null>(null);
  const moved = useRef(false);

  const slotAt = (x: number, y: number) => {
    const row = rowRef.current;
    if (!row) return 0;
    const slots = Array.from(row.querySelectorAll<HTMLElement>("[data-slot]"));
    let index = slots.length - 1;
    for (let i = 0; i < slots.length; i++) {
      const r = slots[i].getBoundingClientRect();
      const sameLine = y >= r.top - 8 && y <= r.bottom + 8;
      if (sameLine && x < r.left + r.width / 2) {
        index = i;
        break;
      }
      if (y < r.top - 8) {
        index = i;
        break;
      }
    }
    return index;
  };

  const onPointerDown = (e: React.PointerEvent, from: number) => {
    if (!editable || e.button !== 0) return;
    // The ◀ ▶ buttons are not drag handles.
    if ((e.target as HTMLElement).closest("[data-move]")) return;
    start.current = {
      el: e.currentTarget as HTMLElement,
      from,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
    };
    moved.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!moved.current && Math.hypot(dx, dy) < 6) return;
    if (!moved.current) {
      moved.current = true;
      // Capture only once this is a drag. Capturing on pointerdown re-targets
      // the eventual click to the slot, which silently ate every mouse click
      // on the covers and the arrows (keyboard still worked — no pointer).
      try {
        s.el.setPointerCapture(s.pointerId);
      } catch {
        // Already released (e.g. the pointer left the window); drag on anyway.
      }
    }
    setDrag({ dx, dy, from: s.from, over: slotAt(e.clientX, e.clientY) });
  };

  const onPointerUp = () => {
    const s = start.current;
    start.current = null;
    if (!s || !drag) {
      setDrag(null);
      return;
    }
    const { from, over } = drag;
    setDrag(null);
    if (from === over) return;
    const next = [...favorites];
    const [movedBook] = next.splice(from, 1);
    next.splice(over, 0, movedBook);
    onReorder(next);
  };

  return (
    <S.FavoritesRow ref={rowRef}>
      {favorites.map((book, i) => {
        const dragging = drag?.from === i;
        const isTarget = drag && !dragging && drag.over === i;
        return (
          <S.FavoriteSlot
            key={book.olKey}
            data-slot
            $dragging={dragging}
            $target={!!isTarget}
            style={
              dragging && drag
                ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` }
                : undefined
            }
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <FaceOutCover
              book={book}
              tilt={i % 2 === 0 ? -1.5 : 1.5}
              onOpen={() => {
                // A drag that moved must not also open the dialog.
                if (!moved.current) onOpen(book);
              }}
            />
            {editable && (
              <S.MoveButtons>
                <S.MoveButton
                  type="button"
                  data-move
                  aria-label={`Move ${book.title} earlier`}
                  disabled={i === 0}
                  onClick={() => onMove(i, i - 1)}
                >
                  ◀
                </S.MoveButton>
                <S.MoveButton
                  type="button"
                  data-move
                  aria-label={`Move ${book.title} later`}
                  disabled={i === favorites.length - 1}
                  onClick={() => onMove(i, i + 1)}
                >
                  ▶
                </S.MoveButton>
              </S.MoveButtons>
            )}
          </S.FavoriteSlot>
        );
      })}
    </S.FavoritesRow>
  );
}
