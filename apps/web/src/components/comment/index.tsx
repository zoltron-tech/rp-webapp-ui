"use client";

import type { Comment as CommentType } from "@nw/types";
import { stubHandle } from "@nw/types";
import { Separator } from "radix-ui";
import type { FC } from "react";
import { StoreProvider } from "@/context/store/context";
import { HiddenItem } from "../common/hidden-item";
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
      {/* Someone the viewer blacklisted: a stub with "Show" until asked
          (BLOCK_BLACKLIST_PLAN.md B11, B12). Blocked authors never arrive. */}
      <HiddenItem
        reason={comment.hiddenReason}
        kind="comment"
        handle={stubHandle(comment.source)}
      >
        <S.CommentRoot>
          <CommentSource />
          <CommentContent />
          <CommentFooter />
        </S.CommentRoot>
      </HiddenItem>
    </StoreProvider>
  );
};
