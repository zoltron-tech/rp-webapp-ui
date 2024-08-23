"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage({}) {
  const { user, state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("ProfilePage");
    Logger.debug("Auth context: ", state);

    if (state === "LOGGED_IN") {
      Logger.debug("rerouteToProfilePage");
      push(`/rp/profile/${user?.username}`);
    } else {
      push("/rp/novelists");
    }
  }, [state]);
}
