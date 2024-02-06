import {
  getUserNovelist,
  updateUserNovelist,
} from "@/app/rp/novelists/actions";
import { deleteAvatar, uploadAvatar } from "@/app/rp/profile/actions";
import { Card, Input, UploadAvatar, Username } from "@/components/common";
import { useAuthContext, useForm, useUIContext } from "@/hooks";
import type { Novelist } from "@/types";
import { API_MESSAGE, INITIAL_NOVELIST } from "@/utils/constants";
import { stripS3Url } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FC, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import * as S from "./styles";

export type EditProfileCardProps = {};

export const EditProfileCard: FC<EditProfileCardProps> = ({}) => {
  const { user } = useAuthContext();
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { push } = useRouter();

  const { successToast, errorToast } = useUIContext();

  const updateUserAvatar = async () => {
    if (!avatarFile) return;
    Logger.log("avatarFile", avatarFile);
    const response = await uploadAvatar(avatarFile);

    if (response === API_MESSAGE.MediaError) {
      errorToast(response);
      return response;
    }

    if (values?.image) {
      const response1 = await deleteAvatar(stripS3Url(values.image));
      Logger.log("delete response 1: ", response1);
    }

    updateValues((prev) => ({ ...prev, image: response }));
    Logger.log("response", response);

    return response;
  };

  const beforeSubmit = async (novelist: Novelist) => {
    Logger.log("handleSave");

    setLoading(true);

    let updatedAvatarUrl = novelist?.image;
    if (avatarFile) {
      updatedAvatarUrl = (await updateUserAvatar()) || novelist?.image;
    }

    Logger.log("updatedAvatar: ", updatedAvatarUrl);

    if (updatedAvatarUrl === API_MESSAGE.MediaError) {
      setLoading(false);
      return { ...novelist, abort: true };
    }

    const _novelist = {
      ...novelist,
      image: updatedAvatarUrl || "",
    };

    return _novelist;
  };

  const onSubmit = async (novelist: Novelist) => {
    if (!novelist) {
      setLoading(false);
      errorToast("First name is required.");
      return novelist;
    }

    const resonse = await updateUserNovelist(novelist);

    setLoading(false);

    Logger.log("resonse", resonse);

    if ("message" in resonse) {
      return errorToast(API_MESSAGE.Error);
    }

    updateValues(novelist);

    successToast("Data updated successfully.");
  };

  const { values, update, updateValues, submit } = useForm<Novelist>({
    initialValues: INITIAL_NOVELIST,
    onSubmit,
    beforeSubmit,
  });

  const fetchData = async () => {
    setLoading(true);
    const novelist = await getUserNovelist();
    if (novelist) updateValues(novelist);
    setLoading(false);
  };

  const handleCancel = () => {
    push(`/rp/profile/${user?.username}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    Logger.log("avatarFile", avatarFile);
  }, [avatarFile]);

  return (
    <>
      <S.ProfileBackgroundBlurFilter
        banner={
          values?.image ||
          "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
        }
      />
      <Card
        width="70cqw"
        minWidth="300px"
        maxWidth="90cqw"
        minHeight="520px"
        maxHeight="520px"
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
            <span>Your</span> Profile
          </S.Title>
          <S.UsernameContainer>
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

export default EditProfileCard;
