"use client";

import { FC, useState } from "react";

import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import classNames from "classnames";
import { Button } from "../common";
import * as S from "./styles";

interface UserMenuProps {}

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const { user, novelist, logout } = useAuthContext();
  const [open, setOpen] = useState(false);

  if (!user || !novelist) return <></>;

  const handleLogout = () => {
    logout();
    toggleState(setOpen)();
  };

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <S.UserAvatar
          src={novelist?.image}
          alt="profile-menu"
          size={200}
          hoverable
        />
        <S.Menu className={classNames({ open })}>
          <Button onClick={handleLogout}>Logout</Button>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
