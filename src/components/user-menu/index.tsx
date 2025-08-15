"use client";

import { FC, useCallback, useState } from "react";

import { toggleState } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { Avatar, ShouldRender } from "../common";
import * as S from "./styles";
import { TbUserEdit } from "react-icons/tb";
import { LuUser } from "react-icons/lu";
import { IoIosPeople } from "react-icons/io";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { logoutAction } from "@/app/actions";
import { AvatarNew } from "../common/avatar-new";

interface UserMenuProps {}

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const setGlobalState = useGlobalStoreSet();
  const [open, setOpen] = useState(false);
  const { push } = useRouter();

  const handleLogout = useCallback(async () => {
    toggleState(setOpen)();
    logoutAction();
    setGlobalState({
      authState: "LOGGED_OUT",
      user: null,
      novelist: null,
    });
  }, [setGlobalState]);

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

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <AvatarNew
          src={novelist?.image ?? null}
          alt={user?.username || "User Avatar"}
        />
        <S.Menu className={classNames({ open })}>
          <ShouldRender if={Boolean(novelist)}>
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
          </ShouldRender>
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
