"use client";

import { EditProfileCard } from "@/components";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditProfilePage({}) {
  const { loggedIn, loading } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.log("EditProfilePage", loading, loggedIn);
    if (!loading && !loggedIn) {
      Logger.log("pushing to home");
      push("/rp/novelists");
    }
  }, [loading]);

  Logger.log("yaha pohanchay hain hum:");

  return (
    <div>
      <EditProfileCard />
    </div>
  );
}
