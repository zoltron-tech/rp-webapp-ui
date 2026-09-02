"use client";

import { useNavigate } from "@/lib/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

export default function ProfilePage({}) {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const push = useNavigate();

  useEffect(() => {
    Logger.debug("ProfilePage");
    Logger.debug("Auth context: ", authState);

    if (authState === "LOGGED_IN") {
      Logger.debug("rerouteToProfilePage");
      push(ROUTES.Profile.View(user?.username || "").Index);
    } else {
      push(ROUTES.Novelists);
    }
  }, [authState]);

  // Renders nothing: this route exists only to redirect. Explicit rather
  // than implicit so the component satisfies ComponentType in routes.tsx.
  return null;
}
