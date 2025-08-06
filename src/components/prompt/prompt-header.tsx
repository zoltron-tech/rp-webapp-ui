import { FC } from "react";
import * as S from "./styled";
import { usePromptState } from "./prompt.store";
import { displayDate, toFormattedDate } from "@/utils/helpers";
import { PrivacyIcon } from "../common/privacy-icon";
import { MuseAvatar } from "../common/muse-avatar";

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
