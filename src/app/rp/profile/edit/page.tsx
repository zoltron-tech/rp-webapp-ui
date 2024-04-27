"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicEditProfileCard = dynamic(
  () => import("@/components/edit-profile-card"),
  { ssr: false }
);

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
      <DynamicEditProfileCard />
    </div>
  );
}
