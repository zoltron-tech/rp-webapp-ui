import { getUser } from "@/app/actions";
import {
  getUserNovelist,
  updateUserNovelist,
} from "@/app/rp/novelists/actions";
import { deleteAvatar, uploadAvatar } from "@/app/rp/profile/actions";
import { Card, Input, UploadAvatar, Username } from "@/components/common";
import { useUIContext } from "@/hooks";
import type { Novelist, User } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { stripS3Url } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FC, useEffect, useState } from "react";

import * as S from "./styles";

export type ProfileCardProps = {};

export const ProfileCard: FC<ProfileCardProps> = ({}) => {
  const [user, setUser] = useState<User | null>(null);
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialRender, setInitialRender] = useState(true);

  const { successToast, errorToast } = useUIContext();

  const fetchData = async () => {
    setLoading(true);
    const user = await getUser();
    const novelist = await getUserNovelist();
    setUser(user);
    setNovelist(novelist);
    setLoading(false);
  };

  const updateNovelist = async (novelist: Partial<Novelist>) => {
    Logger.log("updateNovelist", novelist);
    setNovelist((current) => {
      const polyfillNull = {
        ...({
          firstName: "",
          lastName: "",
          username: user?.username || "",
          image: "",
          muses: [],
          note: "",
        } as Novelist),
        ...current,
      };

      return {
        ...polyfillNull,
        ...novelist,
      };
    });
  };

  const updateUserAvatar = async () => {
    if (!avatarFile) return;
    Logger.log("avatarFile", avatarFile);
    const response = await uploadAvatar(avatarFile);

    if (typeof response !== "string") {
      return errorToast(response.message);
    }

    if (novelist?.image) {
      const response1 = await deleteAvatar(stripS3Url(novelist.image));
      Logger.log("delete response 1: ", response1);
    }

    updateNovelist({ image: response });
    Logger.log("response", response);

    return response;
  };

  const handleSave = async () => {
    Logger.log("handleSave");

    setLoading(true);

    let updatedAvatarUrl = novelist?.image;
    if (avatarFile) {
      updatedAvatarUrl = (await updateUserAvatar()) || novelist?.image;
    }

    Logger.log("updatedAvatar: ", updatedAvatarUrl);

    if (!novelist) return;

    const resonse = await updateUserNovelist({
      ...novelist,
      image: updatedAvatarUrl || "",
    });

    setLoading(false);

    if ("message" in resonse) {
      return errorToast(API_MESSAGE.Error);
    }

    updateNovelist(resonse);

    successToast("Data updated successfully.");
  };

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }
  }, []);

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
          novelist?.image ||
          "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
        }
      />
      <Card
        width="90cqw"
        height="600px"
        padding="20px"
        margin="clamp(50px, 20cqw, 200px) auto 100px auto"
        centered
      >
        <UploadAvatar
          image={novelist?.image}
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
                value={novelist?.firstName}
                onChange={(firstName) => updateNovelist({ firstName })}
              />
              <Input
                label="Last Name"
                value={novelist?.lastName}
                onChange={(lastName) => updateNovelist({ lastName })}
              />
            </S.Name>
            <Input
              label="Note"
              value={novelist?.note}
              onChange={(note) => updateNovelist({ note })}
            />
            <S.ButtonGroup>
              <S.SaveButton
                variant="secondary"
                onClick={() => Logger.log("cancel")}
                loading={loading}
              >
                Cancel
              </S.SaveButton>
              <S.SaveButton onClick={handleSave} loading={loading}>
                Save Changes
              </S.SaveButton>
            </S.ButtonGroup>
          </S.FormGroup>
        </S.Profile>
      </Card>
    </>
  );
};

export default ProfileCard;
