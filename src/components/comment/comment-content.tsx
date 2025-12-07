"use client";

import { type FC, useMemo } from "react";
import { parseTextContent } from "@/utils/helpers";
import { useCommentState } from "./comment.store";
import * as S from "./styled";

export const CommentContent: FC = () => {
  const text = useCommentState("text");
  const textLines = useMemo(
    () => parseTextContent(text, { maxChars: 200 }),
    [text],
  );
  const media = useCommentState("media");

  console.log({ text });

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
