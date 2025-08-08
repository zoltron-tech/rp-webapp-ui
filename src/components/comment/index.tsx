"use client";

import { Comment as CommentType } from "@/types";
import { FC } from "react";
import * as S from "./styled";
import { Separator } from "radix-ui";
import { StoreProvider } from "@/context/store/context";
import { CommentSource } from "./comment-source";
import { CommentFooter } from "./comment-footer";
import { CommentContent } from "./comment-content";

type CommentProps = {
  comment: CommentType;
  ["hide-separator"]?: boolean;
};

export const Comment: FC<CommentProps> = ({
  comment,
  ["hide-separator"]: hideSeparator = false,
}) => {
  return (
    <StoreProvider storeId="comment" initial={comment}>
      {!hideSeparator && (
        <Separator.Root className="separator" orientation="horizontal" />
      )}
      <S.CommentRoot>
        <CommentSource />
        <CommentContent />
        <CommentFooter />
      </S.CommentRoot>
    </StoreProvider>
  );
};
