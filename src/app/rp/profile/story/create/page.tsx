"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicCreateStoryBoardCard = dynamic(
  () => import("@/components/create-storyboard-card"),
  { ssr: false },
);

export default function CreateStoryBoardPage({}) {
  const _id = useParams()?.id as string;
  const authState = useGlobalState("authState");
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("CreateStoryBoardPage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push(ROUTES.Novelists);
    }
  }, [authState]);

  return (
    <div>
      <DynamicCreateStoryBoardCard />
    </div>
  );
}
