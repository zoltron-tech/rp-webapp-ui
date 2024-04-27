"use client";

import { updateMuseAction } from "@/app/rp/muse/actions";
import { uploadAvatar } from "@/app/rp/profile/actions";
import { Card, Input, UploadAvatar, Username } from "@/components/common";
import { useAuthContext, useForm, useUIContext } from "@/hooks";
import type { Muse } from "@/types";
import { API_MESSAGE, INITIAL_MUSE } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import * as S from "./styles";

export type CreateMuseCardProps = {};

export const EditMuseCard: FC<CreateMuseCardProps> = () => {
  const { user, state } = useAuthContext();
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { push } = useRouter();

  const { successToast, errorToast } = useUIContext();

  const updateMuseAvatar = async () => {
    if (!avatarFile) return;
    Logger.error("avatarFile", avatarFile);
    const response = await uploadAvatar(avatarFile);

    if (response === API_MESSAGE.MediaError) {
      errorToast(response);
      return response;
    }

    updateValues((prev) => ({ ...prev, image: response }));
    Logger.debug("response", response);

    return response;
  };

  const beforeSubmit = async (muse: Muse) => {
    Logger.debug("handleSave");

    setLoading(true);

    let updatedAvatarUrl = muse?.image;
    if (avatarFile) {
      updatedAvatarUrl = (await updateMuseAvatar()) || muse?.image;
    }

    Logger.debug("updatedAvatar: ", updatedAvatarUrl);

    if (updatedAvatarUrl === API_MESSAGE.MediaError) {
      setLoading(false);
      return { ...muse, abort: true };
    }

    const _muse = {
      ...muse,
      image: updatedAvatarUrl || "",
    };

    return _muse;
  };

  const onSubmit = async (muse: Muse) => {
    if (!muse) {
      setLoading(false);
      errorToast("First name is required.");
      return muse;
    }

    const resonse = await updateMuseAction(muse);

    setLoading(false);

    Logger.debug("resonse", resonse);

    if ("message" in resonse) {
      return errorToast(API_MESSAGE.Error);
    }

    updateValues(muse);
    successToast("Data updated successfully.");
  };

  const { values, update, updateValues, submit } = useForm<Muse>({
    initialValues: INITIAL_MUSE,
    onSubmit,
    beforeSubmit,
  });

  const handleCancel = () => {
    push(`/rp/profile/muses`);
  };

  useEffect(() => {
    if (state !== "LOGGED_IN") return;
  }, [state]);

  useEffect(() => {
    Logger.debug("avatarFile", avatarFile);
  }, [avatarFile]);

  Logger.info("EditMuseCard rendered");

  return (
    <>
      <S.ProfileBackgroundBlurFilter
        banner={
          values?.image ||
          "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
        }
      />
      <Card
        width="80cqw"
        minWidth="100px"
        maxWidth="80cqw"
        minHeight="1000px"
        maxHeight="1000px"
        padding="20px"
        margin="clamp(50px, 20cqw, 200px) auto 100px auto"
        centered
      >
        <UploadAvatar
          image={values?.image}
          onChange={(image) => setAvatarFile(image)}
        />
        <S.Profile>
          <S.Title>
            <span>Your</span> Muse
          </S.Title>
          <S.UsernameContainer>
            <span>PENNED BY: </span>
            <Username username={user?.username} primary />
          </S.UsernameContainer>
          <S.FormGroup>
            <S.Name>
              <Input
                label="First Name"
                name="firstName"
                value={values?.firstName}
                onChange={update}
                onEnter={submit}
                maxLength={50}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={values?.lastName}
                onChange={update}
                onEnter={submit}
                maxLength={50}
              />
            </S.Name>
            <Input
              label="Note"
              name="note"
              value={values?.note}
              onChange={update}
              onEnter={submit}
              maxLength={250}
            />
            <Input
              label="Species"
              name="species"
              value={values?.species}
              onChange={update}
              onEnter={submit}
              maxLength={50}
            />
            <Input
              label="Relationship Status"
              name="relationshipStatus"
              value={values?.relationshipStatus}
              onChange={update}
              onEnter={submit}
              maxLength={50}
            />
            <Input
              label="Fandom"
              name="fandom"
              value={values?.fandom}
              onChange={update}
              onEnter={submit}
              maxLength={50}
            />
            <Input
              label="Hometome"
              name="hometown"
              value={values?.hometown}
              onChange={update}
              onEnter={submit}
              maxLength={50}
            />
            <Input
              label="Story"
              name="story"
              value={values?.story}
              onChange={update}
              onEnter={submit}
              maxLength={20000}
              height={500}
            />
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
      </Card>
    </>
  );
};

export default EditMuseCard;
