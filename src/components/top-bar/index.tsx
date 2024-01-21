"use client";

import { logout } from "@/app/actions";
import { ThemeToggle } from "@/components";
import { Button, ShouldRender } from "@/components/common";
import { useAuth, useUIContext } from "@/hooks";
import { FC } from "react";

import * as S from "./styles";

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
        <S.LogoContainer href={"/"}>
          <S.Logo>
            <S.LogoInner>NW</S.LogoInner>
          </S.Logo>
          <S.LogoText>Novelist World</S.LogoText>
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
            {/* <S.ButtonsContainerMobile>
              <Button
                variant="link"
                shape="square"
                size="xs"
                onClick={onLoginClick}
              >
                Log in
              </Button>
              <Button
                variant="link"
                shape="square"
                size="xs"
                onClick={onSignupClick}
              >
                Sign up
              </Button>
            </S.ButtonsContainerMobile> */}
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
