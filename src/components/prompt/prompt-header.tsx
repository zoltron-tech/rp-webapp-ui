import type { FC } from "react";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { MuseAvatar } from "../common/muse-avatar";
import { PrivacyIcon } from "../common/privacy-icon";
import { usePromptState } from "./prompt.store";
import * as S from "./styled";

type PromptHeaderProps = {};

export const PromptHeader: FC<PromptHeaderProps> = () => {
  const source = usePromptState("source");
  const createdOn = usePromptState("createdOn");
  const privacy = usePromptState("privacy");

  return (
    <S.PromptHeaderRoot>
      <MuseAvatar
        museId={source.sourceId}
        image={source.image}
        name={source.name}
      />
      <S.SourceInfo>
        <S.SourceName>{source.name}</S.SourceName>
        <S.PromptSubheader title={displayDate(createdOn)} dateTime={createdOn}>
          {toFormattedDate(createdOn)}
          <PrivacyIcon privacy={privacy} />
        </S.PromptSubheader>
      </S.SourceInfo>
    </S.PromptHeaderRoot>
  );
};
