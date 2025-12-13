"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicEditMuseCard = dynamic(() => import("@/components/edit-muse"), {
  ssr: false,
});

export default function EditMusePage({}) {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");

  const { routeToPage } = usePageRouter();

  useEffect(() => {
    Logger.debug("EditMusePage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      routeToPage(ROUTES.Novelists);
    }
  }, [authState]);

  return (
    <div>
      <DynamicEditMuseCard id={id} />
    </div>
  );
}
