"use client";

import { useGlobalState } from "@/context/store/stores";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicEditMuseCard = dynamic(
  () => import("@/components/edit-muse-card"),
  { ssr: false }
);

export default function CreateMusePage({}) {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");

  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("CreateMusePage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [authState]);

  return (
    <div>
      <DynamicEditMuseCard />
    </div>
  );
}
