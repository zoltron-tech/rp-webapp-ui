"use client";

import { FC, useMemo } from "react";
import * as S from "./styled";
import { useCommentState } from "./comment.store";
import { parseTextContent } from "@/utils/helpers";

export const CommentContent: FC = () => {
  const text = useCommentState("text");
  const textLines = useMemo(() => parseTextContent(text, 200), [text]);
  const media = useCommentState("media");

  return (
    <S.CommentContent.Root>
      {textLines.map((line, index) => (
        <S.CommentContent.TextLine key={index}>
          {line.trim()}
        </S.CommentContent.TextLine>
      ))}
      {media && (
        <S.CommentContent.MediaContainer>
          <S.CommentContent.Image src={media} alt="Comment media" />
        </S.CommentContent.MediaContainer>
      )}
    </S.CommentContent.Root>
  );
};
