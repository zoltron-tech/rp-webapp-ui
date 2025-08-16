"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";

const DynamicStoryBoardMembersList = dynamic(
  () => import("@/components/storyboard-members"),
  { ssr: false },
);

export default function StoryBoardMembersListPage({}) {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");

  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("StoryBoardMembersListPage", authState);
    if (authState === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push(ROUTES.Novelists);
    }
  }, [authState]);

  return (
    <div>
      <DynamicStoryBoardMembersList id={id} />
    </div>
  );
}
