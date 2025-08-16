"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { Logger } from "@/utils/services";

const DynamicCreateStoryBoardEventCard = dynamic(
  () => import("@/components/create-storyboard-event-card"),
  { ssr: false },
);

export default function CreateStoryBoardEventPage({}) {
  const storyboardId = useParams()?.id as string;
  const authState = useGlobalState("authState");

  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("CreateStoryBoardEventPage", authState);
    console.log(authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [authState]);

  return (
    <div>
      <DynamicCreateStoryBoardEventCard storyboardId={storyboardId} />
    </div>
  );
}
