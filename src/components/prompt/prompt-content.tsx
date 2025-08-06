import { FC, useMemo } from "react";
import * as S from "./styled";
import { usePromptState } from "./prompt.store";
import { parseTextContent } from "@/utils/helpers";
import { LikeButton } from "../common/like-button";

type PromptContentProps = {};

export const PromptContent: FC<PromptContentProps> = ({}) => {
  const text = usePromptState("text");
  const media = usePromptState("media");
  const promptId = usePromptState("id");
  const reacted = usePromptState("reacted");
  const reactions = usePromptState("reactions");

  const textLines = useMemo(() => parseTextContent(text), [text]);

  return (
    <S.PromptContent.Root>
      {textLines.map((line, index) => (
        <S.TextLine key={index}>{line.trim()}</S.TextLine>
      ))}
      {media && (
        <S.PromptMediaContainer>
          <S.PromptImage src={media} alt="Prompt media" />
        </S.PromptMediaContainer>
      )}
      <S.PromptContent.Footer>
        <LikeButton parentId={promptId} liked={reacted} likes={reactions} />
      </S.PromptContent.Footer>
    </S.PromptContent.Root>
  );
};
