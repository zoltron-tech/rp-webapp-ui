"use client";

import {
  authorPhotoUrl,
  type BookDetails,
  type BookStatus,
  bookCoverUrl,
  isFavoritable,
  type OpenLibraryBook,
  type ShelfEntry,
} from "@nw/types/books";
import classNames from "classnames";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsX } from "react-icons/bs";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import {
  IoBookmarkOutline,
  IoBookOutline,
  IoCheckmarkCircleOutline,
  IoLibraryOutline,
  IoOpenOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { getBookDetailsAction } from "@/app/rp/books/actions";
import { IceBreakerTrayHeader } from "@/app/rp/conversations/ice-breaker-tray-header";
import * as C from "@/app/rp/conversations/styles";
import { AppAlertDialog } from "@/components/dialog";
import { Spinner } from "@/components/mention-dropdown/styled";
import * as SheetS from "@/components/profile-more-dropdown/styled";
import { useGlobalState } from "@/context/store/stores";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import * as S from "./dialog-styles";
import {
  failed,
  STATUS_LABEL,
  useShelfActions,
  type ViewerShelfState,
} from "./use-shelf-actions";

/** Long chip lists (The Hobbit has 60+ subjects) show this many, then "+N". */
const CHIP_LIMIT = 8;
const LIST_LIMIT = 4;
const DESCRIPTION_LINES = 5;
const BIO_LINES = 3;
const STATUSES: BookStatus[] = ["WANT_TO_READ", "READING", "READ"];

const STATUS_ICON: Record<BookStatus, ReactNode> = {
  READ: <IoCheckmarkCircleOutline size={16} />,
  READING: <IoBookOutline size={16} />,
  WANT_TO_READ: <IoBookmarkOutline size={16} />,
};

const EBOOK_LABEL: Record<
  NonNullable<OpenLibraryBook["ebookAccess"]>,
  string | null
> = {
  borrowable: "Borrowable ebook",
  no_ebook: null,
  printdisabled: "Ebook for print-disabled readers",
  public: "Free ebook",
};

const languageNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" });
  } catch {
    return undefined;
  }
})();

const languageName = (code: string) => {
  try {
    return languageNames?.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
};

/** "A · B · C +3 more" */
const joinSome = (items: string[], limit: number) =>
  items.slice(0, limit).join(" · ") +
  (items.length > limit ? ` +${items.length - limit} more` : "");

type BookDialogProps = {
  doc: OpenLibraryBook | null;
  onClose: () => void;
  /** The signed-in viewer's own shelf row for this book, when known. */
  viewerShelf?: ViewerShelfState;
  /**
   * Fired after any shelf write so the page can patch its list: the new row,
   * or null once the book is removed from the viewer's shelf.
   */
  onShelfChange?: (olKey: string, entry: ShelfEntry | null) => void;
  /**
   * When given, author names are links that run an author search — the
   * picker passes this so "by Julia Quinn" leads to her other books.
   */
  onAuthorClick?: (name: string) => void;
};

/**
 * Book detail. The header facts come with the search doc; the long text is
 * fetched on open. The shelf control always describes the *viewer's* shelf,
 * whoever's card the book came from (BOOKSHELF_PLAN.md §4.2).
 *
 * Desktop: the shared centered dialog. Phone: the app's bottom sheet, like
 * every other detail tray here — a long scrolling detail doesn't belong in a
 * 300px centered box, and the sheet's swipe-down is the dismissal people
 * already know.
 */
export function BookDialog({
  doc,
  onClose,
  viewerShelf = null,
  onShelfChange,
  onAuthorClick,
}: BookDialogProps) {
  const authState = useGlobalState("authState");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const [details, setDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!doc || authState !== "LOGGED_IN") return;
    let cancelled = false;
    setDetails(null);
    setError(false);
    setLoading(true);
    getBookDetailsAction(doc.key).then((result) => {
      if (cancelled) return;
      if (failed(result)) setError(true);
      else setDetails(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [doc, authState]);

  // ── Phone sheet open/close animation (same choreography as the ice-breaker tray) ──
  const open = !!doc;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ y: number; atTop: boolean } | null>(null);

  useEffect(() => {
    if (!isMobile) return;
    if (open) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setVisible(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setSheetOpen(true)),
      );
    } else {
      setSheetOpen(false);
      closeTimer.current = setTimeout(() => setVisible(false), 300);
    }
  }, [open, isMobile]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const body = doc && (
    <BookBody
      doc={doc}
      details={details}
      loading={loading}
      error={error}
      viewerShelf={viewerShelf}
      canAct={authState === "LOGGED_IN"}
      onShelfChange={onShelfChange}
      onAuthorClick={onAuthorClick}
      onRemoved={onClose}
    />
  );

  if (!isMobile) {
    return (
      <AppAlertDialog
        open={open}
        onOpenChange={(next) => !next && onClose()}
        heading={doc?.title ?? ""}
        text=""
        body={body}
        size="lg"
        showConfirm={false}
        closeButtonText="Close"
      />
    );
  }

  if (!visible || typeof document === "undefined" || !doc) return null;

  return createPortal(
    <SheetS.MobilePortalRoot className={classNames([accent, theme])}>
      <SheetS.MobileBackdrop
        $open={sheetOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <SheetS.MobileSheet
        $open={sheetOpen}
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        // The shared sheet disables touch panning for its short trays; this
        // one scrolls, so panning is allowed and the swipe-down only counts
        // when the content is already at the top.
        style={{ touchAction: "pan-y" }}
        onTouchStart={(e) => {
          touchStart.current = {
            atTop: (scrollRef.current?.scrollTop ?? 0) <= 0,
            y: e.touches[0].clientY,
          };
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start?.atTop) return;
          if (e.changedTouches[0].clientY - start.y > 60) onClose();
        }}
      >
        <SheetS.DragHandle />
        <SheetS.MobileContent>
          <IceBreakerTrayHeader title={doc.title}>
            <C.IceBreakerTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Close"
              onClick={onClose}
            >
              <BsX size={18} />
            </C.IceBreakerTrayActionButton>
          </IceBreakerTrayHeader>
          <S.SheetScroll ref={scrollRef}>{body}</S.SheetScroll>
        </SheetS.MobileContent>
      </SheetS.MobileSheet>
    </SheetS.MobilePortalRoot>,
    document.body,
  );
}

function BookBody({
  doc,
  details,
  loading,
  error,
  viewerShelf,
  canAct,
  onShelfChange,
  onAuthorClick,
  onRemoved,
}: {
  doc: OpenLibraryBook;
  details: BookDetails | null;
  loading: boolean;
  error: boolean;
  viewerShelf: ViewerShelfState;
  canAct: boolean;
  onShelfChange?: (olKey: string, entry: ShelfEntry | null) => void;
  onAuthorClick?: (name: string) => void;
  /** The book left the viewer's shelf; the dialog has nothing left to show for it. */
  onRemoved?: () => void;
}) {
  const [coverFailed, setCoverFailed] = useState(false);

  const meta = [
    details?.firstPublishDate ?? doc.firstPublishYear?.toString(),
    doc.editionCount && `${doc.editionCount.toLocaleString()} editions`,
    doc.numberOfPagesMedian &&
      `~${doc.numberOfPagesMedian.toLocaleString()} pages`,
    doc.ebookAccess && EBOOK_LABEL[doc.ebookAccess],
  ].filter(Boolean) as string[];

  const readers = [
    [doc.wantToReadCount, "want to read"],
    [doc.currentlyReadingCount, "reading"],
    [doc.alreadyReadCount, "read"],
  ].filter(([n]) => n) as [number, string][];

  const languages = (doc.language ?? []).map(languageName);

  return (
    <S.Body>
      <S.Top>
        <S.Cover>
          {doc.coverI && !coverFailed ? (
            <img
              src={bookCoverUrl(doc.coverI, "L")}
              alt={`Cover of ${doc.title}`}
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <S.CoverFallback>{doc.title}</S.CoverFallback>
          )}
        </S.Cover>

        <S.Summary>
          {doc.subtitle && <S.Subtitle>{doc.subtitle}</S.Subtitle>}
          {doc.authorName && (
            <S.Authors>
              by{" "}
              {doc.authorName.map((name, i) => (
                <span key={name}>
                  {i > 0 && ", "}
                  {onAuthorClick ? (
                    <S.AuthorLink
                      type="button"
                      title={`More books by ${name}`}
                      onClick={() => onAuthorClick(name)}
                    >
                      {name}
                    </S.AuthorLink>
                  ) : (
                    name
                  )}
                </span>
              ))}
            </S.Authors>
          )}
          {!!doc.ratingsCount && doc.ratingsAverage && (
            <S.Rating
              aria-label={`Rated ${doc.ratingsAverage.toFixed(1)} out of 5`}
            >
              <S.Stars $value={doc.ratingsAverage} aria-hidden />
              <span>
                {doc.ratingsAverage.toFixed(1)} ·{" "}
                {doc.ratingsCount.toLocaleString()} ratings
              </span>
            </S.Rating>
          )}
          {meta.length > 0 && <S.MetaLine>{meta.join(" · ")}</S.MetaLine>}
          {readers.length > 0 && (
            <S.OpenLibraryReaders title="How Open Library's own readers have shelved this book">
              <IoLibraryOutline size={12} aria-hidden />
              <S.ReadersSource>On Open Library</S.ReadersSource>
              <span>
                {readers.map(([n, label], i) => (
                  <span key={label}>
                    {i > 0 && " · "}
                    <b>{n.toLocaleString()}</b> {label}
                  </span>
                ))}
              </span>
            </S.OpenLibraryReaders>
          )}
        </S.Summary>
      </S.Top>

      {canAct && (
        <ShelfControl
          doc={doc}
          viewerShelf={viewerShelf}
          onShelfChange={onShelfChange}
          onRemoved={onRemoved}
        />
      )}

      {loading && (
        <S.Loading aria-live="polite">
          <S.Line />
          <S.Line />
          <S.Line $short />
        </S.Loading>
      )}
      {error && (
        <S.Muted>Couldn't load the full description right now.</S.Muted>
      )}

      {details?.description && (
        <Section title="About this book">
          <ClampedProse text={details.description} lines={DESCRIPTION_LINES} />
        </Section>
      )}

      {details?.firstSentence && (
        <Section title="First sentence">
          <S.Quote>{details.firstSentence}</S.Quote>
        </Section>
      )}

      <Chips title="Tags" items={details?.subjects ?? doc.subject} />
      <Chips title="Characters" items={details?.people ?? doc.person} />
      <Chips title="Places" items={details?.places ?? doc.place} />
      <Chips title="Time periods" items={details?.times ?? doc.time} />

      {(!!doc.publisher?.length || languages.length > 0) && (
        <Section title="Editions">
          {!!doc.publisher?.length && (
            <S.Muted>
              <b>Publishers</b> {joinSome(doc.publisher, LIST_LIMIT)}
            </S.Muted>
          )}
          {languages.length > 0 && (
            <S.Muted>
              <b>Languages</b> {joinSome(languages, CHIP_LIMIT)}
            </S.Muted>
          )}
        </Section>
      )}

      {details?.author?.name && (
        <Section title="About the author">
          <S.AuthorRow>
            {details.author.photoId && (
              <S.AuthorPhoto
                src={authorPhotoUrl(details.author.photoId)}
                alt=""
                loading="lazy"
              />
            )}
            <div>
              <S.AuthorName>{details.author.name}</S.AuthorName>
              {(details.author.birthDate || details.author.deathDate) && (
                <S.Muted>
                  {details.author.birthDate ?? "?"}
                  {details.author.deathDate && ` – ${details.author.deathDate}`}
                </S.Muted>
              )}
            </div>
          </S.AuthorRow>
          {details.author.bio && (
            <ClampedProse text={details.author.bio} lines={BIO_LINES} />
          )}
        </Section>
      )}

      {!!details?.links?.length && (
        <Section title="Links">
          <S.Links>
            {details.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title}
                  <S.SrOnly> (opens in a new tab)</S.SrOnly>
                </a>
              </li>
            ))}
          </S.Links>
        </Section>
      )}

      {/* The link is the credit: it names the source and takes you there. */}
      <S.Footer>
        <S.ExternalLink
          href={`https://openlibrary.org${doc.key}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Data from Open Library"
        >
          Open on Open Library
          <IoOpenOutline size={13} aria-hidden />
          <S.SrOnly> (opens in a new tab)</S.SrOnly>
        </S.ExternalLink>
      </S.Footer>
    </S.Body>
  );
}

type Busy = BookStatus | "favorite" | "remove" | null;
type Confirm = "remove" | "unfavorite-move" | null;

/**
 * The viewer's shelf for this book: a three-way status choice, the heart,
 * and Remove. Each button shows its own spinner while its write is in
 * flight. Favorites are READ / READING only, and the two destructive moves
 * confirm first — in place, inside this box, so no second modal ever stacks
 * on the dialog (plan §1.5, §4.2).
 */
function ShelfControl({
  doc,
  viewerShelf,
  onShelfChange,
  onRemoved,
}: {
  doc: OpenLibraryBook;
  viewerShelf: ViewerShelfState;
  onShelfChange?: (olKey: string, entry: ShelfEntry | null) => void;
  onRemoved?: () => void;
}) {
  const { shelve, unshelve, favorite, unfavorite } = useShelfActions();
  // Local mirror so the control answers immediately even when the page
  // doesn't feed `viewerShelf` back (the picker, for one).
  const [shelf, setShelf] = useState<ViewerShelfState>(viewerShelf);
  const [busy, setBusy] = useState<Busy>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  useEffect(() => setShelf(viewerShelf), [viewerShelf]);

  const isFavorite = shelf?.favoriteRank != null;

  const apply = (entry: ShelfEntry | null) => {
    setShelf(
      entry ? { favoriteRank: entry.favoriteRank, status: entry.status } : null,
    );
    onShelfChange?.(doc.key, entry);
  };

  const run = async (key: Busy, task: () => Promise<void>) => {
    if (busy) return;
    setBusy(key);
    try {
      await task();
    } finally {
      setBusy(null);
    }
  };

  const moveTo = (status: BookStatus) =>
    run(status, async () => {
      const entry = await shelve(doc, status);
      if (entry) apply(entry);
    });

  const setStatus = (status: BookStatus) => {
    if (busy || shelf?.status === status) return;
    if (isFavorite && !isFavoritable(status)) {
      setConfirm("unfavorite-move");
      return;
    }
    moveTo(status);
  };

  const toggleFavorite = () =>
    run("favorite", async () => {
      if (!shelf) return;
      const result = isFavorite
        ? await unfavorite(doc.key)
        : await favorite(doc.key);
      if (result) apply(result);
    });

  const remove = () =>
    run("remove", async () => {
      if (await unshelve(doc.key)) {
        apply(null);
        // Removing is the end of this book's story here; close rather than
        // leave a dialog open for a book that is no longer on the shelf.
        onRemoved?.();
      }
    });

  return (
    <S.ShelfBox aria-label="Your bookshelf">
      <S.ShelfHeading>
        <S.ShelfTitle>Your bookshelf</S.ShelfTitle>
        <S.ShelfState>
          {shelf
            ? `On your shelf · ${STATUS_LABEL[shelf.status]}${isFavorite ? " · Favorite" : ""}`
            : "Not on your shelf yet — pick one"}
        </S.ShelfState>
      </S.ShelfHeading>

      {confirm === "remove" ? (
        <S.ConfirmRow>
          <S.ConfirmText>
            Remove this favorite from your shelf? It leaves your favorites too.
          </S.ConfirmText>
          <S.ConfirmActions>
            <S.ConfirmButton
              type="button"
              $tone="neutral"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </S.ConfirmButton>
            <S.ConfirmButton
              type="button"
              $tone="negative"
              disabled={!!busy}
              onClick={() => {
                setConfirm(null);
                remove();
              }}
            >
              Remove
            </S.ConfirmButton>
          </S.ConfirmActions>
        </S.ConfirmRow>
      ) : confirm === "unfavorite-move" ? (
        <S.ConfirmRow>
          <S.ConfirmText>
            Move to Want to read? Only books you've read or are reading can be
            favorites, so it leaves your favorites.
          </S.ConfirmText>
          <S.ConfirmActions>
            <S.ConfirmButton
              type="button"
              $tone="neutral"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </S.ConfirmButton>
            <S.ConfirmButton
              type="button"
              $tone="accent"
              disabled={!!busy}
              onClick={() => {
                setConfirm(null);
                moveTo("WANT_TO_READ");
              }}
            >
              Move
            </S.ConfirmButton>
          </S.ConfirmActions>
        </S.ConfirmRow>
      ) : (
        <>
          <S.StatusTrack>
            {STATUSES.map((status) => {
              const active = shelf?.status === status;
              return (
                <S.StatusButton
                  key={status}
                  type="button"
                  $active={active}
                  aria-pressed={active}
                  aria-busy={busy === status}
                  disabled={!!busy}
                  onClick={() => setStatus(status)}
                >
                  {busy === status ? (
                    <Spinner size={14} />
                  ) : (
                    STATUS_ICON[status]
                  )}
                  {STATUS_LABEL[status]}
                </S.StatusButton>
              );
            })}
          </S.StatusTrack>

          {shelf && (
            <S.ShelfRow>
              {isFavoritable(shelf.status) && (
                <S.HeartButton
                  type="button"
                  $active={isFavorite}
                  aria-pressed={isFavorite}
                  aria-busy={busy === "favorite"}
                  disabled={!!busy}
                  onClick={toggleFavorite}
                >
                  {busy === "favorite" ? (
                    <Spinner size={13} />
                  ) : isFavorite ? (
                    <FaHeart size={13} />
                  ) : (
                    <FaRegHeart size={13} />
                  )}
                  {isFavorite ? "Favorited" : "Add to favorites"}
                </S.HeartButton>
              )}
              <S.RemoveButton
                type="button"
                aria-busy={busy === "remove"}
                disabled={!!busy}
                onClick={() => (isFavorite ? setConfirm("remove") : remove())}
              >
                {busy === "remove" ? (
                  <Spinner size={13} />
                ) : (
                  <IoTrashOutline size={14} />
                )}
                Remove from shelf
              </S.RemoveButton>
            </S.ShelfRow>
          )}
        </>
      )}
    </S.ShelfBox>
  );
}

/** Long prose clamped to a few lines with a "Read more" toggle. */
function ClampedProse({ text, lines }: { text: string; lines: number }) {
  const [open, setOpen] = useState(false);
  // Rough: anything under ~90 chars a line can't need the toggle.
  const long = text.length > lines * 90 || text.split("\n").length > lines;
  return (
    <>
      <S.Prose $clamp={open || !long ? undefined : lines}>{text}</S.Prose>
      {long && (
        <S.MoreButton type="button" onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Read more"}
        </S.MoreButton>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <S.Section>
      <S.SectionTitle>{title}</S.SectionTitle>
      {children}
    </S.Section>
  );
}

function Chips({ title, items }: { title: string; items?: string[] | null }) {
  if (!items?.length) return null;
  const shown = items.slice(0, CHIP_LIMIT);
  return (
    <Section title={title}>
      <S.Chips>
        {shown.map((item) => (
          <S.Chip key={item} title={item}>
            {item}
          </S.Chip>
        ))}
        {items.length > CHIP_LIMIT && (
          <S.Chip $more>+{items.length - CHIP_LIMIT}</S.Chip>
        )}
      </S.Chips>
    </Section>
  );
}
