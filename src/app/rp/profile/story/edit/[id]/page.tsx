"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicCreateStoryBoardCard = dynamic(
  () => import("@/components/create-storyboard-card"),
  { ssr: false }
);

export default function CreateStoryBoardPage({}) {
  const id = useParams()?.id as string;
  const { state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("CreateStoryBoardPage", state);
    if (state === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [state]);

  return (
    <div>
      <DynamicCreateStoryBoardCard id={id} />
    </div>
  );
}
