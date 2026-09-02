"use client";

import { dynamic } from "@/lib/dynamic";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicEditStoryboardForm = dynamic(
  () => import("@/components/edit-storyboard"),
  { ssr: false },
);

export default function CreateStoryBoardPage({}) {
  const authState = useGlobalState("authState");
  const { routeToPage } = usePageRouter();

  useEffect(() => {
    Logger.debug("CreateStoryBoardPage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      routeToPage(ROUTES.Novelists);
    }
  }, [authState]);

  return (
    <div>
      <DynamicEditStoryboardForm />
    </div>
  );
}
