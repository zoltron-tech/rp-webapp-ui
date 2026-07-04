"use client";

import { type FC, useCallback } from "react";
import * as L from "@/components/install-app-prompt/styled";
import { DiscordCommunityDialog } from "@/components/user-menu/discord-community-dialog";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";

export const JoinDiscordPrompt: FC = () => {
  const showJoinDiscordPrompt = useGlobalState("showJoinDiscordPrompt");
  const setGlobalState = useGlobalStoreSet();

  const handleSkip = useCallback(() => {
    setGlobalState({ showJoinDiscordPrompt: false });
  }, [setGlobalState]);

  return (
    <DiscordCommunityDialog
      open={!!showJoinDiscordPrompt}
      onClose={handleSkip}
      footer={
        <L.SkipButton type="button" onClick={handleSkip}>
          Skip for now
        </L.SkipButton>
      }
    />
  );
};
