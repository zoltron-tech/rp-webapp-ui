"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicCreateStoryBoardEventCard = dynamic(
  () => import("@/components/create-storyboard-event-card"),
  { ssr: false }
);

export default function CreateStoryBoardEventPage({}) {
  const storyboardId = useParams()?.id as string;
  const storyboardEventId = useParams()?.storyboardEventId as string;
  const { state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("CreateStoryBoardEventPage", state);
    console.log(state);
    if (state === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [state]);

  return (
    <div>
      <DynamicCreateStoryBoardEventCard
        storyboardId={storyboardId}
        storyboardEventId={storyboardEventId}
      />
    </div>
  );
}
