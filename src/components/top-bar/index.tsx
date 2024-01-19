"use client";

import { FC } from "react";
import { Button, ShouldRender } from "@/components";

import * as S from "./styles";
import { ThemeToggle } from "../theme-toggle";
import { useAuth, useUIContext } from "@/hooks";
import { logout } from "@/app/actions";

type Props = {
  toggleTheme: () => void;
  theme: "light" | "dark";
};

export const TopBar: FC<Props> = ({ theme, toggleTheme }) => {
  const { setSignupModalOpen, setSignupModal } = useUIContext();
  const { isLoggedIn } = useAuth();

  const onLoginClick = () => {
    setSignupModal(false);
    setSignupModalOpen(true);
  };

  const onSignupClick = () => {
    setSignupModal(true);
    setSignupModalOpen(true);
  };

  const onLogoutClick = async () => {
    logout();
  };

  return (
    <>
      <S.Bar>
        <S.LogoContainer>
          <S.Logo>RP</S.Logo>
          <S.LogoText>Novelists&apos; Corner</S.LogoText>
        </S.LogoContainer>
        <S.ActionsContainer>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <ShouldRender if={!isLoggedIn}>
            <S.ButtonsContainerDesktop>
              <Button onClick={onLoginClick}>Log in</Button>
              <Button onClick={onSignupClick} variant="secondary">
                Sign up
              </Button>
            </S.ButtonsContainerDesktop>
            <S.ButtonsContainerMobile>
              <Button variant="link" onClick={onLoginClick}>
                Log in
              </Button>
              <Button variant="link" onClick={onSignupClick}>
                Sign up
              </Button>
            </S.ButtonsContainerMobile>
          </ShouldRender>
          <ShouldRender if={isLoggedIn}>
            <S.ButtonsContainerDesktop>
              <Button onClick={onLogoutClick}>Log out</Button>
            </S.ButtonsContainerDesktop>
          </ShouldRender>
        </S.ActionsContainer>
      </S.Bar>
    </>
  );
};
