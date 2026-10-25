"use client";

import { Flex } from "@novelist-world/ui";
import {
  type OpenLibraryBook,
  type ShelfEntry,
  type ShelfSummary,
  shelfEntryToDoc,
} from "@nw/types/books";
import { useCallback, useEffect, useState } from "react";
import {
  IoBookOutline,
  IoEyeOffOutline,
  IoLibraryOutline,
} from "react-icons/io5";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { getShelfSummaryAction } from "@/app/rp/books/actions";
import * as P from "@/app/rp/profile/[slug]/styles";
import { EmptyShelfArt } from "@/components/book-art";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { BookDialog } from "./book-dialog";
import { FaceOutCover, Spine } from "./book-visuals";
import * as S from "./styles";
import { failed } from "./use-shelf-actions";

/** Only the top two favorites stand face-out; the rest join the spines
 *  with a heart tab, so the row stays a shelf rather than a poster wall. */
const FACE_OUT_LIMIT = 2;

type Props = {
  novelistId: string;
  username: string;
  isCurrentUser: boolean;
};

/**
 * The profile's Bookshelf section (BOOKSHELF_PLAN.md §4.1): favorites
 * face-out, the current read with a ribbon, the rest as spines on a plank,
 * then the link to the Books tab. Renders nothing while loading or when the
 * shelf is hidden from the viewer; an empty shelf is still shown so the
 * feature is discoverable.
 */
export function ShelfTeaser({ novelistId, username, isCurrentUser }: Props) {
  const { routeToPage } = usePageRouter();
  const [summary, setSummary] = useState<ShelfSummary | null | undefined>();
  const [open, setOpen] = useState<ShelfEntry | null>(null);

  const [showSkeleton, setShowSkeleton] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(true), 150);
    return () => clearTimeout(t);
  }, []);

  const load = useCallback(async () => {
    const result = await getShelfSummaryAction(novelistId);
    setSummary(failed(result) ? null : result);
  }, [novelistId]);

  useEffect(() => {
    load();
  }, [load]);

  // Still loading: hold the shelf's height with a shimmer, but only after a
  // beat so a hidden shelf (which resolves to nothing) never flashes one.
  if (summary === undefined) {
    return showSkeleton ? <S.ShelfShimmer aria-hidden /> : null;
  }
  // Hidden by privacy, or failed: nothing, never a "private" marker.
  if (summary === null) return null;
  // Hidden from the profile by its owner. Visitors see nothing; the owner
  // gets one quiet line so the profile doesn't look broken to them.
  if (summary.showOnProfile === false) {
    if (!isCurrentUser) return null;
    return (
      <S.HiddenNote>
        <IoEyeOffOutline size={13} aria-hidden />
        Your bookshelf is hidden from your profile.
        <S.HiddenNoteLink
          type="button"
          onClick={() => routeToPage(ROUTES.Profile.Edit)}
        >
          Change in Profile privacy
        </S.HiddenNoteLink>
      </S.HiddenNote>
    );
  }

  const toBooks = () => routeToPage(ROUTES.Profile.View(username).Books);
  const toPicker = () => routeToPage(ROUTES.OpenLibrary);

  const favorites = summary.favorites.slice(0, FACE_OUT_LIMIT);
  const reading = summary.reading[0];
  const shown = new Set([
    ...favorites.map((b) => b.olKey),
    ...(reading ? [reading.olKey] : []),
  ]);
  // Remaining favorites lead the spine run (they may be older than the
  // `recent` window), then the latest shelved, each book once.
  const spines = [
    ...summary.favorites.slice(FACE_OUT_LIMIT),
    ...summary.recent,
  ].filter((b) => !shown.has(b.olKey) && shown.add(b.olKey));
  const doc: OpenLibraryBook | null = open ? shelfEntryToDoc(open) : null;

  return (
    <Flex style={{ width: "100%" }} direction="column">
      <P.MuseSectionHeader>
        <span>
          {summary.total === 0
            ? "Bookshelf"
            : `Bookshelf · ${summary.total.toLocaleString()} ${summary.total === 1 ? "book" : "books"}`}
        </span>
        <P.MuseSectionRule />
        {isCurrentUser && (
          <P.AddMuseButton type="button" onClick={toPicker}>
            <IoBookOutline />
            Add
          </P.AddMuseButton>
        )}
      </P.MuseSectionHeader>

      {summary.total === 0 ? (
        <S.EmptyShelf>
          <S.EmptyShelfArtWrap aria-hidden>
            <EmptyShelfArt />
          </S.EmptyShelfArtWrap>
          <S.EmptyShelfText>
            <S.EmptyShelfTitle>
              {isCurrentUser ? "Your bookshelf is empty" : "No books yet"}
            </S.EmptyShelfTitle>
            <S.EmptyShelfSubtitle>
              {isCurrentUser
                ? "Shelve the books that made you a writer."
                : `${username}'s bookshelf is waiting for its first story.`}
            </S.EmptyShelfSubtitle>
            {isCurrentUser && (
              <P.AddMuseButton type="button" onClick={toPicker}>
                <IoBookOutline />
                Add books
              </P.AddMuseButton>
            )}
          </S.EmptyShelfText>
        </S.EmptyShelf>
      ) : (
        <>
          <S.Shelf>
            <S.ShelfRow>
              {(favorites.length > 0 || reading) && (
                <S.FaceOutGroup>
                  {favorites.map((book, i) => (
                    <FaceOutCover
                      key={book.olKey}
                      book={book}
                      tilt={i % 2 === 0 ? -1.5 : 1.5}
                      favorite
                      onOpen={() => setOpen(book)}
                    />
                  ))}
                  {reading && (
                    <FaceOutCover
                      book={reading}
                      tilt={0}
                      ribbon="Reading"
                      onOpen={() => setOpen(reading)}
                    />
                  )}
                </S.FaceOutGroup>
              )}
              <S.SpineGroup>
                {spines.map((book) => (
                  <Spine
                    key={book.olKey}
                    book={book}
                    onOpen={() => setOpen(book)}
                  />
                ))}
              </S.SpineGroup>
            </S.ShelfRow>
          </S.Shelf>
          <P.SeeMoreLink onClick={toBooks}>
            <span>
              <IoLibraryOutline />
              See all books
              <MdOutlineKeyboardDoubleArrowRight />
            </span>
          </P.SeeMoreLink>
        </>
      )}

      <BookDialog
        doc={doc}
        onClose={() => setOpen(null)}
        viewerShelf={
          open && isCurrentUser
            ? { favoriteRank: open.favoriteRank, status: open.status }
            : open?.viewerStatus
              ? { favoriteRank: null, status: open.viewerStatus }
              : null
        }
        onShelfChange={() => {
          // Any write changes counts / favorites; re-pull the summary.
          load();
        }}
      />
    </Flex>
  );
}
