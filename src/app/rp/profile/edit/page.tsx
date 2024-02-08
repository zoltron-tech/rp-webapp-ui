"use client";

import { EditProfileCard } from "@/components";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditProfilePage({}) {
  const { state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("EditProfilePage", state);
    if (state === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [state]);

  Logger.debug("yaha pohanchay hain hum:");

  return (
    <div>
      <EditProfileCard />
    </div>
  );
}
