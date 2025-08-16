"use client";

import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { uploadMedia } from "@/app/rp/profile/actions";
import {
  getStoryboardEventAction,
  updateStoryBoardEventAction,
} from "@/app/rp/story/actions";
import { Input, UploadAvatar } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import { useForm, useUIContext } from "@/hooks";
import type { StoryBoardEvent } from "@/types";
import { API_MESSAGE, INITIAL_STORY_BOARD_EVENT } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import * as S from "./styles";

export type CreateStoryBoardEventCardProps = {
  storyboardId: string;
  storyboardEventId?: string;
};

export const CreateStoryBoardEventCard: FC<CreateStoryBoardEventCardProps> = ({
  storyboardId,
  storyboardEventId,
}) => {
  const authState = useGlobalState("authState");
  const [_storyBoardEvent, setStoryBoardEvent] = useState<StoryBoardEvent>();
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { push } = useRouter();

  const { successToast, errorToast } = useUIContext();

  const updateStoryBoardEventAvatar = async () => {
    if (!avatarFile) return;
    Logger.error("avatarFile", avatarFile);
    const response = await uploadMedia(avatarFile);

    if (response === API_MESSAGE.MediaError) {
      errorToast(response);
      return response;
    }

    updateValues((prev) => ({ ...prev, image: response }));
    Logger.debug("response", response);

    return response;
  };

  const beforeSubmit = async (sotryboardEvent: StoryBoardEvent) => {
    Logger.debug("handleSave");

    setLoading(true);

    let updatedAvatarUrl = sotryboardEvent?.image;
    if (avatarFile) {
      updatedAvatarUrl =
        (await updateStoryBoardEventAvatar()) || sotryboardEvent?.image;
    }

    Logger.debug("updatedAvatar: ", updatedAvatarUrl);

    if (updatedAvatarUrl === API_MESSAGE.MediaError) {
      setLoading(false);
      return { ...sotryboardEvent, abort: true };
    }

    const _sotryboardEvent = {
      ...sotryboardEvent,
      image: updatedAvatarUrl || "",
      storyBoardId: storyboardId,
    };

    return _sotryboardEvent;
  };

  const onSubmit = async (storyboardEvent: StoryBoardEvent) => {
    if (!storyboardEvent) {
      setLoading(false);
      errorToast("Name is required.");
      return storyboardEvent;
    }

    const resonse = await updateStoryBoardEventAction(storyboardEvent);

    setLoading(false);

    Logger.debug("resonse", resonse);

    if ("message" in resonse) {
      return errorToast(API_MESSAGE.Error);
    }

    updateValues(storyboardEvent);
    successToast("Data updated successfully.");
  };

  const fetchData = async () => {
    if (!storyboardEventId) return;

    const response = await getStoryboardEventAction(storyboardEventId);

    if (response && !("message" in response)) {
      setStoryBoardEvent(response);
      updateValues(response);
    }
  };

  const { values, update, updateValues, submit } = useForm<StoryBoardEvent>({
    beforeSubmit,
    initialValues: INITIAL_STORY_BOARD_EVENT,
    onSubmit,
  });

  const handleCancel = () => {
    push(ROUTES.Story.View(storyboardId));
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN" || !storyboardEventId) return;
    fetchData();
  }, [authState]);

  useEffect(() => {
    Logger.debug("avatarFile", avatarFile);
  }, [avatarFile]);

  Logger.info("CreateStoryBoardCard rendered");

  return (
    <>
      <S.ProfileBackgroundBlurFilter
        banner={
          values?.image ||
          "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
        }
      />
      <S.LocalContainer className={storyboardEventId == null ? "new" : ""}>
        <UploadAvatar
          image={values?.image || ""}
          onChange={(image) => setAvatarFile(image)}
        />
        <S.Profile>
          <S.Title>{storyboardEventId ? "EDIT" : "Create"} Story Event</S.Title>
          <S.FormGroup className={storyboardEventId == null ? "new" : ""}>
            <S.Name>
              <Input
                label="Name"
                name="name"
                value={values?.name}
                onChange={update}
                onEnter={submit}
                maxLength={50}
              />
            </S.Name>
            <S.Name>
              <Input
                label="Description"
                name="description"
                value={values?.description}
                onChange={update}
                onEnter={submit}
                maxLength={1000}
              />
            </S.Name>
            <S.ButtonGroup>
              <S.SaveButton
                variant="secondary"
                onClick={handleCancel}
                loading={loading}
              >
                Cancel
              </S.SaveButton>
              <S.SaveButton onClick={() => submit()} loading={loading}>
                Save <div className="sm-hide">Changes</div>
              </S.SaveButton>
            </S.ButtonGroup>
          </S.FormGroup>
        </S.Profile>
      </S.LocalContainer>
    </>
  );
};

export default CreateStoryBoardEventCard;
