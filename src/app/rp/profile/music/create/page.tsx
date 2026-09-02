"use client";

import { dynamic } from "@/lib/dynamic";
import { useParams } from "@/lib/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicEditMusicCard = dynamic(() => import("@/components/edit-music"), {
  ssr: false,
});

export default function CreateMusicPage({}) {
  const _id = useParams()?.id as string;
  const authState = useGlobalState("authState");

  const { routeToPage } = usePageRouter();

  useEffect(() => {
    Logger.debug("CreateMusicPage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      routeToPage(ROUTES.Novelists);
    }
  }, [authState, routeToPage]);

  return (
    <div>
      <DynamicEditMusicCard />
    </div>
  );
}
