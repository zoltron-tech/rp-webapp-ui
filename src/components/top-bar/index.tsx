"use client";

import { logoutAction } from "@/app/actions";
import { Search, ThemeToggle } from "@/components";
import { Button, ShouldRender } from "@/components/common";
import { useAuthContext, useUIContext } from "@/hooks";
import { FC } from "react";

import { useRouter } from "next/navigation";
import * as S from "./styles";

type Props = {
  toggleTheme: () => void;
  theme: "light" | "dark";
};

export const TopBar: FC<Props> = ({ theme, toggleTheme }) => {
  const { setSignupModalOpen, setSignupModal } = useUIContext();
  const { loggedIn } = useAuthContext();
  const { push } = useRouter();

  const onLogoClick = () => {
    push("/rp/novelists");
  };

  const onLoginClick = () => {
    setSignupModal(false);
    setSignupModalOpen(true);
  };

  const onSignupClick = () => {
    setSignupModal(true);
    setSignupModalOpen(true);
  };

  const onLogoutClick = async () => {
    logoutAction();
  };

  return (
    <S.Container>
      <S.Bar>
        <S.LogoContainer onClick={onLogoClick}>
          <S.Logo>
            <S.LogoInner>NW</S.LogoInner>
          </S.Logo>
          <S.LogoText>Novelist World</S.LogoText>
        </S.LogoContainer>

        <S.ActionsContainer>
          <S.SearchContainer>
            <Search placeholder="Search" />
          </S.SearchContainer>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <ShouldRender if={!loggedIn}>
            <S.ButtonsContainerDesktop>
              <Button onClick={onLoginClick}>Log in</Button>
              <Button onClick={onSignupClick} variant="secondary">
                Sign up
              </Button>
            </S.ButtonsContainerDesktop>
          </ShouldRender>
          <ShouldRender if={loggedIn}>
            <S.ButtonsContainerDesktop>
              <Button onClick={onLogoutClick}>Log out</Button>
            </S.ButtonsContainerDesktop>
          </ShouldRender>
        </S.ActionsContainer>
      </S.Bar>
    </S.Container>
  );
};
