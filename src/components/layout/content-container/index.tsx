"use client";
import { ShouldRender } from "@/components/common";
import { Logger } from "@/utils/services";
import { FC } from "react";
import { PageLoader } from "../page-loader";
import * as S from "./styles";
import { useGlobalState } from "@/context/store/stores";

type Props = {
  children?: React.ReactNode;
};

export const ContentContainer: FC<Props> = ({ children }) => {
  const authState = useGlobalState("authState");

  Logger.info("ContentContainer rendered");
  return (
    <S.Container>
      <ShouldRender if={authState === "LOADING"}>
        <PageLoader />
      </ShouldRender>
      {children}
    </S.Container>
  );
};
