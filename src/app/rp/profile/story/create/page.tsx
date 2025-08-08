"use client";

import { useGlobalState } from "@/context/store/stores";
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
  const authState = useGlobalState("authState");
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("CreateStoryBoardPage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [authState]);

  return (
    <div>
      <DynamicCreateStoryBoardCard />
    </div>
  );
}
