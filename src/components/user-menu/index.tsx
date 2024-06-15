"use client";

import { FC, useState } from "react";

import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { Avatar, Button } from "../common";
import * as S from "./styles";

interface UserMenuProps {}

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const { user, novelist, logout } = useAuthContext();
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

  const toUserProfile = () => {
    push(`/rp/profile/${user?.username}`);
  };

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <Avatar
          src={novelist?.image || ""}
          alt="profile-menu"
          size={50}
          hoverable
        />
        <S.Menu className={classNames({ open })}>
          <Button variant="menu-item" onClick={toUserProfile}>
            Your profile
          </Button>
          <hr></hr>
          <Button variant="menu-item" onClick={toEditProfile}>
            Edit profile
          </Button>
          <Button variant="menu-item" onClick={toMusesPage}>
            Your muses
          </Button>
          <hr></hr>
          <Button variant="menu-item">Settings & privacy</Button>
          <Button variant="menu-item">Help & support</Button>
          <Button variant="menu-item">Display & accessibility</Button>
          <hr></hr>
          <Button variant="menu-item" onClick={handleLogout}>
            Log out
          </Button>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
