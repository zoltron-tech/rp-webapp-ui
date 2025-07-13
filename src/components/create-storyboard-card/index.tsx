"use client";

import { uploadMedia } from "@/app/rp/profile/actions";
import {
  Input,
  ShouldRender,
  UploadAvatar,
  Username,
} from "@/components/common";
import { useAuthContext, useForm, useUIContext } from "@/hooks";
import type { StoryBoard } from "@/types";
import { API_MESSAGE, INITIAL_STORY_BOARD } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import * as S from "./styles";
import {
  getStoryboardAction,
  updateStoryBoardAction,
} from "@/app/rp/story/actions";
import { MusesPill } from "../muses-pill";
import { GrEdit } from "react-icons/gr";
import { Flex } from "@novelist-world/ui";

export type CreateStoryBoardCardProps = {
  id?: string;
};

export const CreateStoryBoardCard: FC<CreateStoryBoardCardProps> = ({ id }) => {
  const { user, state } = useAuthContext();
  const [storyBoard, setStoryBoard] = useState<StoryBoard>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { push } = useRouter();

  const { successToast, errorToast } = useUIContext();

  const onEditMembersClick = () => {
    if (!storyBoard) return;
    push(`/rp/profile/story/edit/${storyBoard.id}/members`);
  };

  const handlePrivacySelect = (privacyValue: string) => {
    update({
      target: {
        name: "privacy",
        value: privacyValue,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const updateStoryBoardAvatar = async () => {
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

  const beforeSubmit = async (sotryboard: StoryBoard) => {
    Logger.debug("handleSave");

    setLoading(true);

    let updatedAvatarUrl = sotryboard?.image;
    if (avatarFile) {
      updatedAvatarUrl = (await updateStoryBoardAvatar()) || sotryboard?.image;
    }

    Logger.debug("updatedAvatar: ", updatedAvatarUrl);

    if (updatedAvatarUrl === API_MESSAGE.MediaError) {
      setLoading(false);
      return { ...sotryboard, abort: true };
    }

    const _sotryboard = {
      ...sotryboard,
      image: updatedAvatarUrl || "",
    };

    return _sotryboard;
  };

  const onSubmit = async (storyboard: StoryBoard) => {
    if (!storyboard) {
      setLoading(false);
      errorToast("Name is required.");
      return storyboard;
    }

    const resonse = await updateStoryBoardAction(storyboard);

    setLoading(false);

    Logger.debug("resonse", resonse);

    if ("message" in resonse) {
      return errorToast(API_MESSAGE.Error);
    }

    updateValues(storyboard);
    successToast("Data updated successfully.");
  };

  const fetchData = async () => {
    if (!id) return;

    const response = await getStoryboardAction(id);

    if (response && !("message" in response)) {
      setStoryBoard(response);
      updateValues(response);
    }
  };

  const { values, update, updateValues, submit } = useForm<StoryBoard>({
    initialValues: INITIAL_STORY_BOARD,
    onSubmit,
    beforeSubmit,
  });

  const handleCancel = () => {
    push(`/rp/profile/${user?.username}/storyboards`);
  };

  useEffect(() => {
    if (state !== "LOGGED_IN") return;
    fetchData();
  }, [state]);

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
      <S.LocalContainer className={id == null ? "new" : ""}>
        <UploadAvatar
          image={values?.image || ""}
          onChange={(image) => setAvatarFile(image)}
        />
        <S.Profile>
          <S.Title>{id ? "EDIT" : "Create"} Story</S.Title>
          <ShouldRender if={id != undefined}>
            <S.UsernameContainer>
              <span>Author: </span>
              <Username username={storyBoard?.createdBy.username} primary />
            </S.UsernameContainer>
          </ShouldRender>
          <S.FormGroup className={id == null ? "new" : ""}>
            <S.PasteButton onClick={() => setIsDropdownOpen((prev) => !prev)}>
              <S.DropDownButton className={isDropdownOpen ? "open" : ""}>
                {values.privacy.replaceAll("_", " ")} &nbsp; ▼
              </S.DropDownButton>

              {isDropdownOpen && (
                <S.DropdownContent>
                  <button
                    type="button"
                    onClick={() => {
                      handlePrivacySelect("ONLY_ME");
                      setIsDropdownOpen(false);
                    }}
                  >
                    ONLY ME
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePrivacySelect("FRIENDS");
                      setIsDropdownOpen(false);
                    }}
                  >
                    FRIENDS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePrivacySelect("PUBLIC");
                      setIsDropdownOpen(false);
                    }}
                  >
                    PUBLIC
                  </button>
                </S.DropdownContent>
              )}
            </S.PasteButton>

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
            <ShouldRender if={id != null}>
              <Flex
                style={{ width: "100%", paddingInline: "20px" }}
                direction="row"
                justify="space-between"
              >
                <span>Members: </span>
                <Flex
                  style={{ width: "20%" }}
                  direction="row"
                  justify="flex-end"
                >
                  <S.Button className="button" onClick={onEditMembersClick}>
                    <GrEdit />
                  </S.Button>
                </Flex>
              </Flex>
              <S.PillContainer>
                <MusesPill
                  title="WRITERS"
                  pillType="MEMBERS"
                  storyboard={storyBoard}
                  expandable={false}
                />
              </S.PillContainer>
            </ShouldRender>
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

export default CreateStoryBoardCard;
