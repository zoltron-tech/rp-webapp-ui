"use client";

import { FC, useState } from "react";

import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { Button } from "../common";
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

  const toUserProfile = () => {
    push(`/rp/profile/${user?.username}`);
  };

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <S.UserAvatar
          src={novelist?.image || ""}
          alt="profile-menu"
          size={200}
          hoverable
        />
        <S.Menu className={classNames({ open })}>
          <Button onClick={toUserProfile}>View Profile</Button>
          <Button onClick={toEditProfile}>Edit Profile</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
