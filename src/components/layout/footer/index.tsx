import { FC, memo } from "react";

import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = {};

export const Footer: FC<Props> = memo(({}) => {
  Logger.info("Footer rendered");
  return (
    <S.FooterContainer>
      <span>Copyright © 2024, Zoltron Tech. All Rights Reserved.</span>
    </S.FooterContainer>
  );
});
