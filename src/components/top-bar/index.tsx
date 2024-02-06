"use client";
import { logoutAction } from "@/app/actions";
import { Search, ThemeToggle } from "@/components";
import { Button, ShouldRender, Username } from "@/components/common";
import { useAuthContext, useUIContext } from "@/hooks";
import { FC } from "react";

import { useRouter } from "next/navigation";
import { GoArrowRight } from "react-icons/go";
import { SiBookstack } from "react-icons/si";
import * as S from "./styles";

type Props = {
  toggleTheme: () => void;
  theme: "light" | "dark";
};

export const TopBar: FC<Props> = ({ theme, toggleTheme }) => {
  const { setSignupModalOpen, setSignupModal } = useUIContext();
  const { loggedIn } = useAuthContext();
  const { push } = useRouter();

  const onSearchItemClick =
    (username?: string) => (close: () => void) => () => {
      close();
      if (!username) return;
      push(`/rp/profile/${username}`);
    };

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
            <S.LogoInner>
              <SiBookstack />
            </S.LogoInner>
          </S.Logo>
          <S.LogoText>Novelist World</S.LogoText>
        </S.LogoContainer>

        <S.ActionsContainer>
          <S.SearchContainer>
            <Search
              placeholder="Search"
              types={["novelist", "muse"]}
              renderDropdownItem={(result, close) => (
                <S.SearchDropdownItem
                  onClick={onSearchItemClick(result.username)(close)}
                >
                  <S.AvatarContainer>
                    <S.SearchAvatar
                      size={35}
                      src={result.image}
                      alt={result.firstName}
                    />
                    <S.NameContainer>
                      <div>
                        {result.firstName} {result.lastName}
                      </div>
                      {result.username && (
                        <Username username={result.username} />
                      )}
                    </S.NameContainer>
                  </S.AvatarContainer>
                  <GoArrowRight />
                </S.SearchDropdownItem>
              )}
            />
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
