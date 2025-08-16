"use client";
import { type FC, useMemo } from "react";
import { ShouldRender } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import { Logger } from "@/utils/services";
import { PageLoader } from "../page-loader";
import * as S from "./styles";

type Props = {
  children?: React.ReactNode;
};

export const ContentContainer: FC<Props> = ({ children }) => {
  const authState = useGlobalState("authState");
  const globalLoading = useGlobalState("globalLoading");

  const loading = useMemo(() => {
    return authState === "LOADING" || globalLoading;
  }, [authState, globalLoading]);

  Logger.info("ContentContainer rendered");
  return (
    <S.Container>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      {children}
    </S.Container>
  );
};
