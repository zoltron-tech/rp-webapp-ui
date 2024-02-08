"use client";

import { FC } from "react";

import { CgSpinner } from "react-icons/cg";
import * as S from "./styles";

interface Props {}

export const PageLoader: FC<Props> = ({}) => {
  return (
    <S.Background>
      <S.Spinner>
        <CgSpinner />
      </S.Spinner>
    </S.Background>
  );
};
