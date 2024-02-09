"use client";

import { FC, memo } from "react";

import { Logger } from "@/utils/services";
import { CgSpinner } from "react-icons/cg";
import * as S from "./styles";

interface Props {}

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
