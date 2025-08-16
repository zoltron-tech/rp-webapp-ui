"use client";

import type { FC } from "react";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { MuseAvatar } from "../common/muse-avatar";
import { useCommentState } from "./comment.store";
import * as S from "./styled";

export const CommentSource: FC = () => {
  const source = useCommentState("source");
  const createdOn = useCommentState("createdOn");

  return (
    <S.Source>
      <MuseAvatar
        museId={source.sourceId}
        image={source.image}
        name={source.name}
      />
      <S.Source.Info>
        <S.Source.Name>{source.name}</S.Source.Name>
        <S.Source.Time title={displayDate(createdOn)} dateTime={createdOn}>
          {toFormattedDate(createdOn)}
        </S.Source.Time>
      </S.Source.Info>
    </S.Source>
  );
};
