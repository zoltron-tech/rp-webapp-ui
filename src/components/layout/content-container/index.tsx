"use client";
import { ShouldRender } from "@/components/common";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { FC } from "react";
import { PageLoader } from "../page-loader";
import * as S from "./styles";

type Props = {
  children?: React.ReactNode;
};

export const ContentContainer: FC<Props> = ({ children }) => {
  const { state } = useAuthContext();

  Logger.info("ContentContainer rendered");
  return (
    <S.Container>
      <ShouldRender if={state === "LOADING"}>
        <PageLoader />
      </ShouldRender>
      {children}
    </S.Container>
  );
};
