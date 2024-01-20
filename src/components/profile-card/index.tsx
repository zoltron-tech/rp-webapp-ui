import { FC, useEffect, useState } from "react";
import Image from "next/image";
import type { Novelist, User } from "@/types";
import { Card, Input } from "@/components/common";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { getUser } from "@/app/actions";

import * as S from "./styles";

export type ProfileCardProps = {};

export const ProfileCard: FC<ProfileCardProps> = ({}) => {
  const [user, setUser] = useState<User | null>(null);
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialRender, setInitialRender] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const user = await getUser();
    const novelist = await getUserNovelist();
    setUser(user);
    setNovelist(novelist);
    setLoading(false);
  };

  const updateNovelist = async (novelist: Partial<Novelist>) => {
    setNovelist((current) => {
      const polyfillNull = {
        ...current,
        ...({
          firstName: "",
          lastName: "",
          username: user?.username || "",
          image: "",
          muses: [],
          note: "",
        } as Novelist),
      };

      return {
        ...polyfillNull,
        ...novelist,
      };
    });
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
    if (typeof window === "undefined") return;
  }, [window]);

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
        <S.ProfileImage>
          <Image
            src={
              "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
            }
            alt="avatar"
            height={300}
            width={300}
          />
        </S.ProfileImage>
        <S.Profile>
          <S.Title>
            <span>Your</span> Profile
          </S.Title>
          <S.UsernameContainer>
            <label>Username:</label>
            <S.Username>{user?.username}</S.Username>
          </S.UsernameContainer>

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
          <S.Note>
            <Input
              label="Note"
              value={novelist?.note}
              onChange={(note) => updateNovelist({ note })}
            />
          </S.Note>
        </S.Profile>
      </Card>
    </>
  );
};

export default ProfileCard;
