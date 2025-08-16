"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicEditMuseCard = dynamic(
  () => import("@/components/edit-muse-card"),
  { ssr: false },
);

export default function EditMusePage({}) {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");

  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("EditMusePage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push(ROUTES.Novelists);
    }
  }, [authState]);

  return (
    <div>
      <DynamicEditMuseCard id={id} />
    </div>
  );
}
