"use client";

import { ShouldRender } from "@novelist-world/ui";
import { forwardRef, useEffect, useState } from "react";
import { getStoryboardEventAction } from "@/app/rp/story/actions";
import { DEFAULT_ASTERISM_STYLE } from "@/components/asterism-styles";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { StoryBoardEvent } from "@/types";
import EditStoryboardEventDataCard, {
  type EditStoryboardEventDataCardHandle,
} from "./edit-storyboard-event-data-card";
import type { StoryboardEventState } from "./storyboard-event.store";
import * as S from "./styled";

export type EditStoryboardEventCardProps = {
  storyboardId: string;
  storyboardEventId?: string;
  /** When true, the form renders inside an overlay instead of a full page. */
  embedded?: boolean;
  /** Called to dismiss the overlay once it is safe to leave. */
  onClose?: () => void;
  /** Called after a successful save with the persisted event. */
  onSaved?: (event: StoryBoardEvent) => void;
};

export const EditStoryboardEventForm = forwardRef<
  EditStoryboardEventDataCardHandle,
  EditStoryboardEventCardProps
>(function EditStoryboardEventForm(
  { storyboardId, storyboardEventId, embedded, onClose, onSaved },
  ref,
) {
  const authState = useGlobalState("authState");
  const [storyboardEvent, setStoryboardEvent] = useState<StoryBoardEvent>();
  const { baseDataLoader, stopPageLoading } = usePageRouter();

  const fetchData = async () => {
    if (!storyboardEventId) {
      stopPageLoading();
      return;
    }

    const response = await baseDataLoader(() =>
      getStoryboardEventAction(storyboardEventId),
    );
    if (response && !("message" in response)) setStoryboardEvent(response);
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  const isReady = Boolean(storyboardEventId == null || storyboardEvent);

  return (
    <S.EditStoryboardEventPageRoot>
      <ShouldRender if={Boolean(!isReady && embedded)}>
        <S.EmbeddedLoading>
          <S.EmbeddedSpinner />
        </S.EmbeddedLoading>
      </ShouldRender>
      <ShouldRender if={isReady}>
        <StoreProvider<StoryboardEventState>
          storeId="storyboard-event"
          initial={{
            avatar: storyboardEvent?.avatar ?? null,
            description: storyboardEvent?.description ?? "",
            eventTime: storyboardEvent?.eventTime ?? null,
            id: storyboardEvent?.id ?? null,
            image: storyboardEvent?.image ?? null,
            location: storyboardEvent?.location ?? null,
            name: storyboardEvent?.name ?? "",
            ordinal: storyboardEvent?.ordinal ?? 1,
            overtureAsterism:
              storyboardEvent?.overtureAsterism ?? DEFAULT_ASTERISM_STYLE,
            passageAsterism:
              storyboardEvent?.passageAsterism ?? DEFAULT_ASTERISM_STYLE,
            storyBoardId: storyboardId,
          }}
        >
          <EditStoryboardEventDataCard
            ref={ref}
            embedded={embedded}
            onClose={onClose}
            onSaved={onSaved}
          />
        </StoreProvider>
      </ShouldRender>
    </S.EditStoryboardEventPageRoot>
  );
});

export default EditStoryboardEventForm;
