"use client";
import { usePathname } from "@/lib/navigation";
import { type FC, useMemo } from "react";
import { ShouldRender } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { PageLoaderTypeWriter } from "../loader-2/PageLoaderTypewriter";
import * as S from "./styles";

type Props = {
  children?: React.ReactNode;
};

/* Public routes that render immediately (with their own shimmers/placeholders)
   and must never be blanked by the full-page loader — e.g. the marketing
   landing page, which needs no auth or data before painting. */
const NO_LOADER_ROUTES: string[] = [ROUTES.Novelists];

export const ContentContainer: FC<Props> = ({ children }) => {
  const authState = useGlobalState("authState");
  const pageLoading = useGlobalState("pageLoading");
  const pathname = usePathname();

  const loading = useMemo(() => {
    if (NO_LOADER_ROUTES.includes(pathname || '')) return false;
    return authState === "LOADING" || pageLoading;
  }, [authState, pageLoading, pathname]);

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
