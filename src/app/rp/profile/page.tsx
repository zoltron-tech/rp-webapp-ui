"use client";

import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

export default function ProfilePage({}) {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { routeToPage } = usePageRouter();

  useEffect(() => {
    Logger.debug("ProfilePage");
    Logger.debug("Auth context: ", authState);

    if (authState === "LOGGED_IN") {
      Logger.debug("rerouteToProfilePage");
      routeToPage(ROUTES.Profile.View(user?.username || "").Index);
    } else {
      routeToPage(ROUTES.Novelists);
    }
  }, [authState]);
}
