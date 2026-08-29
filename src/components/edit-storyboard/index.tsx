"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { StoryBoard } from "@nw/types";
import { forwardRef, useEffect, useState } from "react";
import { getStoryboardAction } from "@/app/rp/story/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import EditStoryboardDataCard, {
  type EditStoryboardDataCardHandle,
} from "./edit-storyboard-data-card";
import type { StoryboardState } from "./storyboard.store";
import * as S from "./styled";

export type EditStoryboardCardProps = {
  id?: string;
  /** When true, the form renders inside an overlay instead of a full page. */
  embedded?: boolean;
  /** Called to dismiss the overlay once it is safe to leave. */
  onClose?: () => void;
  /** Called after a successful save with the persisted storyboard. */
  onSaved?: (storyBoard: StoryBoard) => void;
  /** Called after the storyboard is deleted from within the form. */
  onDeleted?: (storyBoardId: string) => void;
};

export const EditStoryboardForm = forwardRef<
  EditStoryboardDataCardHandle,
  EditStoryboardCardProps
>(function EditStoryboardForm(
  { id, embedded, onClose, onSaved, onDeleted },
  ref,
) {
  const authState = useGlobalState("authState");
  const [storyboard, setStoryboard] = useState<StoryBoard>();
  const { baseDataLoader, stopPageLoading } = usePageRouter();

  const fetchData = async () => {
    if (!id) {
      stopPageLoading();
      return;
    }

    const response = await baseDataLoader(() => getStoryboardAction(id));
    if (response && !("message" in response)) setStoryboard(response);
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  const isReady = Boolean(id == null || storyboard);

  return (
    <S.EditStoryboardPageRoot>
      <ShouldRender if={Boolean(!isReady && embedded)}>
        <S.EmbeddedLoading>
          <S.EmbeddedSpinner />
        </S.EmbeddedLoading>
      </ShouldRender>
      <ShouldRender if={isReady}>
        <StoreProvider<StoryboardState>
          storeId="storyboard"
          initial={{
            avatar: storyboard?.avatar ?? null,
            createdByUsername: storyboard?.createdBy?.username ?? null,
            description: storyboard?.description ?? "",
            fandom: storyboard?.fandom ?? null,
            genres: storyboard?.genres ?? [],
            id: storyboard?.id ?? null,
            image: storyboard?.image ?? null,
            isPublic: storyboard?.isPublic ?? false,
            members: storyboard?.members ?? [],
            name: storyboard?.name ?? "",
            pageFormat: storyboard?.pageFormat ?? null,
            tags: storyboard?.tags ?? [],
          }}
        >
          <EditStoryboardDataCard
            ref={ref}
            embedded={embedded}
            onClose={onClose}
            onSaved={onSaved}
            onDeleted={onDeleted}
          />
        </StoreProvider>
      </ShouldRender>
    </S.EditStoryboardPageRoot>
  );
});

export default EditStoryboardForm;
