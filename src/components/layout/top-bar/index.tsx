"use client";
import { Search, ThemeToggle, UserMenu } from "@/components";
import { Button, ShouldRender, Username } from "@/components/common";
import { useAuthContext, useVisibility } from "@/hooks";
import { FC, memo } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { GoArrowRight } from "react-icons/go";
import { SiBookstack } from "react-icons/si";
import * as S from "./styles";

type Props = {
  toggleTheme: () => void;
  theme: "light" | "dark";
};

export const TopBar: FC<Props> = memo(({ theme, toggleTheme }) => {
  const { show } = useVisibility("login-modal");
  const { state } = useAuthContext();
  const { push } = useRouter();

  const onSearchItemClick =
    (record: { id?: string; username?: string }) =>
    (close: () => void) =>
    () => {
      close();
      if (record?.username) {
        push(`/rp/profile/${record.username}`);
      } else if (record?.id) {
        push(`/rp/muse/${record.id}`);
      }
    };

  const onLogoClick = () => {
    push("/rp/novelists");
  };

  const onLoginClick = () => {
    show();
  };

  const onSignupClick = () => {
    show();
  };

  Logger.info("TopBar rendered");

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
                  onClick={onSearchItemClick(result)(close)}
                >
                  <S.AvatarContainer>
                    <S.SearchAvatar
                      size={60}
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
          <ShouldRender if={state === "LOGGED_OUT"}>
            <S.ButtonsContainerDesktop>
              <Button onClick={onLoginClick}>Log in</Button>
              <Button onClick={onSignupClick} variant="secondary">
                Sign up
              </Button>
            </S.ButtonsContainerDesktop>
          </ShouldRender>
          <ShouldRender if={state === "LOGGED_IN" || state === "UNINITIALIZED"}>
            <S.ButtonsContainerLoggedInDesktop>
              <UserMenu />
            </S.ButtonsContainerLoggedInDesktop>
          </ShouldRender>
        </S.ActionsContainer>
      </S.Bar>
    </S.Container>
  );
});
