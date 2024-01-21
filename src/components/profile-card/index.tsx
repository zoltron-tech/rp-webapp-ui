import { FC, useEffect, useRef, useState } from "react";
import type { Novelist, User } from "@/types";
import { Card, Input, UploadAvatar } from "@/components/common";
import {
  getUserNovelist,
  updateUserNovelist,
} from "@/app/rp/novelists/actions";
import { deleteAvatar, uploadAvatar } from "@/app/rp/profile/actions";
import { getUser } from "@/app/actions";

import * as S from "./styles";
import { generateToastError, generateToastSuccess } from "@/utils/helpers";
import { useTheme } from "styled-components";
import { Logger } from "@/utils/services";
import { API_MESSAGE } from "@/utils/constants";

export type ProfileCardProps = {};

export const ProfileCard: FC<ProfileCardProps> = ({}) => {
  const [user, setUser] = useState<User | null>(null);
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialRender, setInitialRender] = useState(true);
  const theme = useTheme();
  const usernameRef = useRef<HTMLInputElement>(null);

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
      return generateToastError(response.message, theme);
    }

    if (novelist?.image) {
      const response1 = await deleteAvatar(novelist.image);
      Logger.log("delete response 1: ", response1);
    }

    updateNovelist({ image: response });
    Logger.log("response", response);

    return response;
  };

  const handleSave = async () => {
    Logger.log("handleSave");

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

    if ("message" in resonse) {
      return generateToastError(API_MESSAGE.Error, theme);
    }

    updateNovelist(resonse);

    generateToastSuccess("Data updated successfully.", theme);
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
          <S.UsernameContainer
            ref={usernameRef}
            onClick={() => {
              const username = usernameRef.current?.innerText;
              if (username) {
                navigator.clipboard.writeText(username);
                generateToastSuccess("Username copied to clipboard", theme);
              }
            }}
          >
            <S.Username>{user?.username}</S.Username>
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
                onClick={() => Logger.log("save")}
              >
                Cancel
              </S.SaveButton>
              <S.SaveButton onClick={handleSave}>Save Changes</S.SaveButton>
            </S.ButtonGroup>
          </S.FormGroup>
        </S.Profile>
      </Card>
    </>
  );
};

export default ProfileCard;
