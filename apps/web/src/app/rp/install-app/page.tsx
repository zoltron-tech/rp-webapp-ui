"use client";

import { useEffect } from "react";
import PWAInstallButton from "@/components/PWAInstall/page";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./styles";

export default function InstallAppPage() {
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.PageContainer>
      <PWAInstallButton />
    </S.PageContainer>
  );
}
