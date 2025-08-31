"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicEditProfileCard = dynamic(
  () => import("@/components/edit-profile-card"),
  { ssr: false },
);

export default function EditProfilePage({}) {
  const authState = useGlobalState("authState");

  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("EditProfilePage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push(ROUTES.Novelists);
    }
  }, [authState]);

  Logger.debug("yaha pohanchay hain hum:");

  return (
    <div>
      <DynamicEditProfileCard />
    </div>
  );
}
