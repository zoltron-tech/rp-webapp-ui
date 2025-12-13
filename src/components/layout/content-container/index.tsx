"use client";
import { type FC, useMemo } from "react";
import { ShouldRender } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import { Logger } from "@/utils/services";
import { PageLoaderTypeWriter } from "../loader-2/PageLoaderTypewriter";
import * as S from "./styles";

type Props = {
  children?: React.ReactNode;
};

export const ContentContainer: FC<Props> = ({ children }) => {
  const authState = useGlobalState("authState");
  const pageLoading = useGlobalState("pageLoading");

  const loading = useMemo(() => {
    return authState === "LOADING" || pageLoading;
  }, [authState, pageLoading]);

  Logger.info("ContentContainer rendered");
  return (
    <S.Container>
      <ShouldRender if={loading}>
        <PageLoaderTypeWriter />
      </ShouldRender>
      {children}
    </S.Container>
  );
};
