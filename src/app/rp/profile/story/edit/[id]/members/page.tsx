"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicStoryBoardMembersList = dynamic(
  () => import("@/components/storyboard-members"),
  { ssr: false }
);

export default function StoryBoardMembersListPage({}) {
  const id = useParams()?.id as string;
  const { state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("StoryBoardMembersListPage", state);
    if (state === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [state]);

  return (
    <div>
      <DynamicStoryBoardMembersList id={id} />
    </div>
  );
}
