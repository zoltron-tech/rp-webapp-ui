import { FC, memo } from "react";

import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = {};

export const Footer: FC<Props> = memo(({}) => {
  Logger.info("Footer rendered");
  return (
    <S.FooterContainer>
      <span>© 2025, Zoltron Tech.</span>
    </S.FooterContainer>
  );
});
