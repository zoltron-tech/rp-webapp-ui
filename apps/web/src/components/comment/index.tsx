"use client";

import type { Comment as CommentType } from "@nw/types";
import { Separator } from "radix-ui";
import type { FC } from "react";
import { StoreProvider } from "@/context/store/context";
import { CommentContent } from "./comment-content";
import { CommentFooter } from "./comment-footer";
import { CommentSource } from "./comment-source";
import * as S from "./styled";

type CommentProps = {
  comment: CommentType;
  "hide-separator"?: boolean;
};

export const Comment: FC<CommentProps> = ({
  comment,
  "hide-separator": hideSeparator = false,
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
