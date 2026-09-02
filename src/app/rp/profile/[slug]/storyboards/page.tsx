"use client";

import type { StoryBoard } from "@nw/types";
import { useParams } from "@/lib/navigation";
import { usernameFromHandle } from "@/utils/constants/profile-handle";
import { useEffect, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { getAllStoryboardsByUsernameAction } from "@/app/rp/story/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { ShouldRender } from "@/components/common";
import {
  Button as AddNewButtonStyle,
  Wrapper as AddNewButtonWrapper,
} from "@/components/common/add-new-button/styles";
import { AppAlertDialog } from "@/components/dialog";
import { EditStoryboardOverlay } from "@/components/edit-storyboard/edit-storyboard-overlay";
import StoryCard from "@/components/story-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { Logger } from "@/utils/services";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [storyBoards, setStoryBoards] = useState<StoryBoard[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  // The route param is a handle (`@tokyo`), not a bare username.
  const username = usernameFromHandle(params?.handle as string);
  const isCurrentUser = user?.username === username;
  const { baseDataLoader } = usePageRouter();
  Logger.debug("params are:", params);

  // Limits are the creator's, not the viewing member's — only count boards
  // this profile's user actually created, co-authored ones don't count.
  const ownStoryBoardsCount = useMemo(
    () =>
      storyBoards?.filter((s) => s.createdBy?.username === username).length ??
      0,
    [storyBoards, username],
  );
  const storyBoardLimit = novelist?.tier.storyBoardLimit ?? 0;
  const atStoryBoardLimit = ownStoryBoardsCount >= storyBoardLimit;

  const fetchStoryboards = async () => {
    const _storyboards = await baseDataLoader(() =>
      getAllStoryboardsByUsernameAction(username),
    );
    setStoryBoards(_storyboards);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyBoards) return;

    fetchStoryboards();
  }, [authState]);

  // Add the freshly created story to the top, or replace it if it already exists.
  const handleStorySaved = (saved: StoryBoard) => {
    setStoryBoards((prev) => {
      const list = prev ?? [];
      const exists = list.some((s) => s.id === saved.id);
      return exists
        ? list.map((s) => (s.id === saved.id ? saved : s))
        : [saved, ...list];
    });
  };

  const handleStoryDeleted = (deletedId: string) => {
    setStoryBoards((prev) => prev?.filter((s) => s.id !== deletedId) ?? prev);
  };

  return (
    <S.Container>
      <BreadCrumb
        label={`Stories ${isCurrentUser ? `(${ownStoryBoardsCount} / ${storyBoardLimit})` : ""}`}
        username={username}
      />

      <ShouldRender if={isCurrentUser}>
        <AddNewButtonWrapper>
          <AddNewButtonStyle
            type="button"
            onClick={() => {
              if (atStoryBoardLimit) {
                setLimitDialogOpen(true);
                return;
              }
              setCreateOpen(true);
            }}
          >
            Create story
            <IoMdAdd size={18} />
          </AddNewButtonStyle>
        </AddNewButtonWrapper>
      </ShouldRender>
      <AppAlertDialog
        heading="Story limit reached"
        text={`You've reached your plan's limit of ${storyBoardLimit} stories. Upgrade your tier or remove a story to create a new one.`}
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        showConfirm={false}
        closeButtonText="Close"
      />

      <S.StoryListContainer>
        {storyBoards?.map((storyBoard) => {
          // Determine if this storyBoard is "owned"
          const isOwnBoard = storyBoard.createdBy?.username === user?.username;

          return (
            <StoryCard
              key={storyBoard.id}
              storyBoard={storyBoard}
              className={isOwnBoard ? "own" : ""}
              onDeleted={handleStoryDeleted}
            />
          );
        })}
      </S.StoryListContainer>

      <EditStoryboardOverlay
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={handleStorySaved}
        onDeleted={handleStoryDeleted}
      />
    </S.Container>
  );
}
