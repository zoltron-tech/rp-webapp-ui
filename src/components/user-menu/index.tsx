"use client";

import classNames from "classnames";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useState } from "react";
import { IoIosPeople } from "react-icons/io";
import { LuUser } from "react-icons/lu";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import { TbUserEdit } from "react-icons/tb";
import { logoutAction } from "@/app/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type UserMenuProps = {};

export const UserMenu: FC<UserMenuProps> = ({}) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const [open, setOpen] = useState(false);
  const { push } = useRouter();

  const handleLogout = useCallback(async () => {
    toggleState(setOpen)();
    logoutAction();
    setGlobalState({
      authState: "LOGGED_OUT",
      novelist: null,
      user: null,
    });
  }, [setGlobalState]);

  const toOnboarding = () => {
    push(ROUTES.Onboarding);
  };

  const toEditProfile = () => {
    push(ROUTES.Profile.Edit);
  };

  const toMusesPage = () => {
    push(ROUTES.Profile.View(novelist?.username || "").Muses);
  };

  const toStoryBoardsPage = () => {
    push(ROUTES.Profile.View(novelist?.username || "").Storyboards);
  };

  const toUserProfile = () => {
    push(ROUTES.Profile.View(user?.username || "").Index);
  };

  Logger.info("UserMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <AvatarNew
          className="selectable"
          src={novelist?.image ?? null}
          alt={user?.username || "User Avatar"}
        />
        <S.Menu className={classNames({ open })}>
          <ShouldRender if={authState === "LOGGED_IN"}>
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
          </ShouldRender>
          <ShouldRender if={authState === "UNINITIALIZED"}>
            <S.List onClick={toOnboarding}>
              <S.Element>Onboarding</S.Element>
            </S.List>
          </ShouldRender>

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
