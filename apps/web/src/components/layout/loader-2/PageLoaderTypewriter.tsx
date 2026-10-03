"use client";

import { type FC, memo } from "react";
import { Logger } from "@/utils/services";
import { LoadingTextVariation } from "./footer-text";
import * as S from "./styles";
import { TypeWriter } from "./typewriter";

type Props = {};

export const PageLoaderTypeWriter: FC<Props> = memo(() => {
  Logger.info("PageLoader rendered");

  return (
    <S.LoadingRoot>
      <S.BackgroundOverlay />
      <TypeWriter />
      <LoadingTextVariation />
    </S.LoadingRoot>
  );
});
