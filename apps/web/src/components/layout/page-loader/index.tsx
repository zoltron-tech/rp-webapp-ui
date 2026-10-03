"use client";

import { type FC, memo } from "react";
import { CgSpinner } from "react-icons/cg";
import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = {};

export const PageLoader: FC<Props> = memo(({}) => {
  Logger.info("PageLoader rendered");
  return (
    <S.Background>
      <S.Spinner>
        <CgSpinner />
      </S.Spinner>
    </S.Background>
  );
});
