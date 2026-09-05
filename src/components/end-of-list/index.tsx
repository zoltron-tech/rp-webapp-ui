"use client";

import { DozingBookArt } from "../book-art";
import * as S from "./styles";

interface EndOfListProps {
  /** Copy shown under the mascot. */
  label?: string;
}

/** End-of-list marker — shown in place of a Load more button once every page
 *  has been fetched, so the user knows there's nothing further to load. Draws
 *  the empty-feed book closed and dozing off: the reader has run out of things
 *  to read rather than having nothing to read at all. */
export const EndOfList = ({
  label = "You've made it to the end",
}: EndOfListProps) => (
  <S.Root role="status" aria-label={label}>
    <DozingBookArt />
    <S.Label>{label}</S.Label>
  </S.Root>
);
