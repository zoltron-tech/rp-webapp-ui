"use client";

import { FC, useState } from "react";

import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { Avatar, Button } from "../common";
import * as S from "./styles";
import { TbUserEdit } from "react-icons/tb";
import { LuUser } from "react-icons/lu";
import { IoIosPeople } from "react-icons/io";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import { useGlobalState } from "@/context/store/stores";

interface UserMenuProps {}

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { logout } = useAuthContext();
  const [open, setOpen] = useState(false);
  const { push } = useRouter();

  const handleLogout = () => {
    logout();
    toggleState(setOpen)();
  };

  const toEditProfile = () => {
    push(`/rp/profile/edit`);
  };

  const toMusesPage = () => {
    push(`/rp/profile/${user?.username}/muses`);
  };

  const toStoryBoardsPage = () => {
    push(`/rp/profile/${user?.username}/storyboards`);
  };

  const toUserProfile = () => {
    push(`/rp/profile/${user?.username}`);
  };

  const toHome = () => {
    push(`/rp/home`);
  };

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <Avatar
          src={novelist?.image || ""}
          alt="profile-menu"
          size={45}
          hoverable
        />
        <S.Menu className={classNames({ open })}>
          <S.List>
            <S.Element onClick={toUserProfile}>
              <LuUser />
              Your profile
            </S.Element>
            <S.Element onClick={toMusesPage}>
              <IoIosPeople />
              Your muses
            </S.Element>
            <S.Element onClick={toStoryBoardsPage}>
              <PiBookOpenUserDuotone />
              Your stories
            </S.Element>
          </S.List>
          <S.Separator />
          <S.List>
            <S.Element onClick={toEditProfile}>
              <TbUserEdit />
              Edit profile
            </S.Element>
          </S.List>
          <S.Separator />
          <S.List>
            <S.DisabledElement>Settings & privacy</S.DisabledElement>
            <S.DisabledElement>Help & support</S.DisabledElement>
            <S.DisabledElement>Display & accessibility</S.DisabledElement>
          </S.List>
          <S.Separator />
          <S.List>
            <S.DeleteElement onClick={handleLogout}>Log out</S.DeleteElement>
          </S.List>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
