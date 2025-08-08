"use client";

import { useGlobalState } from "@/context/store/stores";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage({}) {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("ProfilePage");
    Logger.debug("Auth context: ", authState);

    if (authState === "LOGGED_IN") {
      Logger.debug("rerouteToProfilePage");
      push(`/rp/profile/${user?.username}`);
    } else {
      push("/rp/novelists");
    }
  }, [authState]);
}
