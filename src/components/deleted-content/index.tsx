"use client";

import { FaTrashCan } from "react-icons/fa6";
import { DeletedThreadArt } from "@/components/book-art";
import * as S from "./styles";

interface DeletedContentProps {
  /** What was deleted, in title case — "Thread", "Prompt". */
  label: string;
}

/** Shown where a thread or prompt used to be: the torn-page scene over a line
 *  saying which piece of writing the novelist took down. */
export const DeletedContent = ({ label }: DeletedContentProps) => (
  <S.Container>
    <S.Animation>
      <DeletedThreadArt />
    </S.Animation>
    <S.Title>
      <FaTrashCan /> {label} Deleted
    </S.Title>
    <S.Message>
      Oops! Looks like the {label.toLowerCase()} has been deleted by the
      Novelist!
    </S.Message>
  </S.Container>
);
