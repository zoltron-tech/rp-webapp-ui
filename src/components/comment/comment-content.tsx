"use client";

import { type FC, useMemo } from "react";
import { parseTextContent } from "@/utils/helpers";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
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
          {line}
        </S.CommentContent.TextLine>
      ))}
      {media && (
        <S.CommentContent.MediaContainer>
          <AppImageViewer src={media} alt="Comment media">
            <S.CommentContent.Image
              src={media}
              alt="Comment media"
              style={{ cursor: "zoom-in" }}
            />
          </AppImageViewer>
        </S.CommentContent.MediaContainer>
      )}
    </S.CommentContent.Root>
  );
};
