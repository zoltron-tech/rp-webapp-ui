"use client";

import { END_OF_LIST_LABEL } from "@nw/animations";
import { DozingBookArt } from "../book-art";
import * as S from "./styles";

interface EndOfListProps {
  /** Copy shown under the mascot. */
  label?: string;
}

/**
 * End-of-list marker — shown in place of a Load more button once every page has
 * been fetched, so the reader knows there is nothing further to load.
 *
 * The book is the empty-feed book closed and dozing off: the reader has run out
 * of things to read rather than having nothing to read at all. Its drawing lives
 * in `@nw/animations` now, so the phone shows the same one at the foot of the
 * same lists; `DozingBookArt` is this app's frame round it, and the label is
 * shared so neither client invents its own wording.
 */
export const EndOfList = ({ label = END_OF_LIST_LABEL }: EndOfListProps) => (
  <S.Root role="status" aria-label={label}>
    <DozingBookArt />
    <S.Label>{label}</S.Label>
  </S.Root>
);
