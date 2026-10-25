"use client";

import {
  type Book,
  type BookStatus,
  bookCoverUrl,
  type OpenLibraryBook,
} from "@nw/types/books";
import { useState } from "react";
import { FaHeart } from "react-icons/fa6";
import { IoBookOutline, IoCheckmark } from "react-icons/io5";
import { spineColorOf } from "./spine-color";
import * as S from "./styles";
import { STATUS_LABEL } from "./use-shelf-actions";

/* The three ways a book is drawn: a spine on the shelf, a cover face-out,
 * and the grid card the picker and the Books tab share. */

/** 22 / 28 / 34 px by page count so a run of spines has some rhythm. */
export const spineWidth = (pagesMedian: number | null) => {
  if (!pagesMedian) return 28;
  if (pagesMedian < 220) return 22;
  if (pagesMedian > 480) return 34;
  return 28;
};

export function Spine({
  book,
  onOpen,
}: {
  book: Book & { favoriteRank?: number | null };
  onOpen: () => void;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const width = spineWidth(book.pagesMedian);
  const color = spineColorOf(book);
  const favorite = book.favoriteRank != null;
  return (
    <S.Spine
      type="button"
      $color={color}
      $width={width}
      title={favorite ? `${book.title} (favorite)` : book.title}
      aria-label={favorite ? `${book.title}, favorite` : book.title}
      onClick={onOpen}
    >
      {book.coverId && !coverFailed && (
        <S.SpineCover
          src={bookCoverUrl(book.coverId, "M")}
          alt=""
          loading="lazy"
          onError={() => setCoverFailed(true)}
        />
      )}
      <S.SpineBand $color={color} aria-hidden />
      <S.SpineLabel $narrow={width < 28}>{book.title}</S.SpineLabel>
      {favorite && (
        <S.SpineHeart aria-hidden>
          <FaHeart size={8} />
        </S.SpineHeart>
      )}
    </S.Spine>
  );
}

export function FaceOutCover({
  book,
  tilt,
  ribbon,
  favorite,
  onOpen,
}: {
  book: Book;
  tilt: number;
  ribbon?: string;
  favorite?: boolean;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  // The ribbon is drawn, not read; the label says what it says.
  const label = [
    book.title,
    favorite && "favorite",
    ribbon && `currently ${ribbon.toLowerCase()}`,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <S.FaceOut
      type="button"
      $tilt={tilt}
      title={book.title}
      aria-label={label}
      onClick={onOpen}
    >
      {book.coverId && !failed ? (
        <img
          src={bookCoverUrl(book.coverId, "M")}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <S.PaperCover $color={spineColorOf(book)}>
          <strong>{book.title}</strong>
          {book.authors[0] && <small>{book.authors[0]}</small>}
        </S.PaperCover>
      )}
      {ribbon && <S.RibbonChip>{ribbon}</S.RibbonChip>}
    </S.FaceOut>
  );
}

type CardProps = {
  doc: OpenLibraryBook;
  onOpen: () => void;
  /** The signed-in viewer's own status for this book, if any. */
  viewerStatus?: BookStatus | null;
  /** Shown as a corner heart; the owner's favorite on the Books tab. */
  favorite?: boolean;
  /** Visitor quick-add (BOOKSHELF_PLAN.md §4.2). Omit to hide the chip. */
  onQuickAdd?: () => void;
  quickAdding?: boolean;
  /** Multi-select mode: the face toggles selection instead of opening. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

export function BookCard({
  doc,
  onOpen,
  viewerStatus,
  favorite,
  onQuickAdd,
  quickAdding,
  selectable = false,
  selected = false,
  onToggleSelect,
}: CardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const authors = doc.authorName?.slice(0, 2).join(", ");
  const tags = doc.subject?.slice(0, 2) ?? [];

  return (
    <S.Card $selected={selectable && selected}>
      <S.CardButton
        type="button"
        aria-pressed={selectable ? selected : undefined}
        aria-label={
          selectable
            ? `${selected ? "Deselect" : "Select"} ${doc.title}`
            : undefined
        }
        onClick={selectable ? onToggleSelect : onOpen}
      >
        <S.Cover>
          {selectable && (
            <S.SelectMark $selected={selected} aria-hidden>
              {selected && <IoCheckmark size={14} />}
            </S.SelectMark>
          )}
          {viewerStatus && !selectable && (
            <S.CornerChip $tone="accent">
              <IoBookOutline size={11} />
              {STATUS_LABEL[viewerStatus]}
            </S.CornerChip>
          )}
          {favorite && (
            <S.FavoriteCorner role="img" aria-label="Favorite">
              <FaHeart size={11} aria-hidden />
            </S.FavoriteCorner>
          )}
          {doc.coverI && !coverFailed ? (
            <img
              src={bookCoverUrl(doc.coverI)}
              alt=""
              loading="lazy"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <S.CoverFallback>{doc.title}</S.CoverFallback>
          )}
        </S.Cover>
        <S.CardBody>
          <S.BookTitle title={doc.title}>{doc.title}</S.BookTitle>
          {authors && <S.Author title={authors}>{authors}</S.Author>}
          {doc.firstPublishYear && <S.Year>{doc.firstPublishYear}</S.Year>}
          {tags.length > 0 && (
            <S.Tags>
              {tags.map((tag) => (
                <S.Tag key={tag} title={tag}>
                  {tag}
                </S.Tag>
              ))}
            </S.Tags>
          )}
        </S.CardBody>
      </S.CardButton>
      {onQuickAdd && !viewerStatus && (
        <S.QuickAdd type="button" disabled={quickAdding} onClick={onQuickAdd}>
          <IoBookOutline size={12} />
          {quickAdding ? "Adding…" : "Add to shelf"}
        </S.QuickAdd>
      )}
    </S.Card>
  );
}
