"use client";

import { useEffect, useRef } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

export default function ProfilePage({}) {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { routeToPage } = usePageRouter();
  const hasSeenLoading = useRef(false);

  useEffect(() => {
    Logger.debug("ProfilePage");
    Logger.debug("Auth context: ", authState);

    if (authState === "LOADING") {
      hasSeenLoading.current = true;
      return;
    }

    // The store initialises with authState="LOGGED_OUT" before AuthProvider has
    // had a chance to check the cookie. Guard against acting on that initial
    // value by waiting until we have seen at least one LOADING transition.
    if (!hasSeenLoading.current) return;

    if (authState === "LOGGED_IN") {
      Logger.debug("rerouteToProfilePage");
      routeToPage(ROUTES.Profile.View(user?.username || "").Index);
    } else {
      routeToPage(ROUTES.Novelists);
    }
  }, [authState]);
}
