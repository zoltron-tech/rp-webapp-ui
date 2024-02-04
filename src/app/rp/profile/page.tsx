"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage({}) {
  const { loggedIn, user, loading } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.log("ProfilePage");
    Logger.log("Auth context: ", loading, loggedIn);

    if (loading) return;

    if (loggedIn) {
      Logger.log("rerouteToProfilePage");
      push(`/rp/profile/${user?.username}`);
    } else {
      push("/rp/novelists");
    }
  }, [loggedIn, loading]);
}
