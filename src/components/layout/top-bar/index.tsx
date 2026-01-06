"use client";

import { usePathname } from "next/navigation";
import { type FC, memo, useCallback, useMemo } from "react";
import { GoArrowRight } from "react-icons/go";
import { Search, UserMenu } from "@/components";
import { Button, ShouldRender, Username } from "@/components/common";
import { NotificationsMenu } from "@/components/notifications-menu";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import logoText from "../../../assets/images/Logo text.png";
import * as S from "./styles";

type Props = {};

export const TopBar: FC<Props> = memo(({}) => {
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const searchBarExpanded = useGlobalState("searchBarExpanded");
  const pathname = usePathname();
  const isLoginPage = useMemo(() => pathname === ROUTES.Login, [pathname]);
  const { routeToPage } = usePageRouter();

  const onSearchItemClick =
    (record: { id?: string; username?: string; name?: string }) =>
    (close: () => void) =>
    () => {
      close();
      setGlobalState({ searchBarExpanded: false });
      if (record?.username) {
        routeToPage(ROUTES.Profile.View(record.username).Index);
      } else if (record?.name) {
        routeToPage(ROUTES.Story.View(record.id || ""));
      } else if (record?.id) {
        routeToPage(ROUTES.Muse.View(record.id));
      }
    };

  const onLogoClick = () => {
    routeToPage(authState === "LOGGED_IN" ? ROUTES.Home : ROUTES.Novelists);
  };

  const onLoginClick = () => {
    routeToPage(ROUTES.Login);
  };

  return (
    <S.Container>
      <S.Bar>
        <S.LogoContainer onClick={onLogoClick}>
          <S.Logo>
            <S.LogoInner
              className={searchBarExpanded ? "searchBarExpanded" : undefined}
            >
              <S.LogoImage src={logoText.src} alt="" />
            </S.LogoInner>
          </S.Logo>
          <S.LogoText
            className={searchBarExpanded ? "searchBarExpanded" : undefined}
          >
            Novelist{" "}
          </S.LogoText>{" "}
          <S.LogoTextSuffix
            className={searchBarExpanded ? "searchBarExpanded" : undefined}
          >
            World
          </S.LogoTextSuffix>
        </S.LogoContainer>
        <ShouldRender if={!isLoginPage}>
          <S.ActionsContainer
            className={searchBarExpanded ? "searchBarExpanded" : undefined}
          >
            <S.SearchContainer>
              <Search
                placeholder="Search"
                types={["novelist", "muse"]} // "story" not added yet
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
                        {result.firstName && (
                          <div>
                            {result.firstName} {result.lastName}
                          </div>
                        )}
                        {result.name && <div>{result.name}</div>}
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

            <ShouldRender if={authState === "LOGGED_OUT"}>
              <S.ButtonsContainerDesktop
                className={searchBarExpanded ? "searchBarExpanded" : undefined}
              >
                <Button onClick={onLoginClick}>Log In</Button>
              </S.ButtonsContainerDesktop>
            </ShouldRender>
            <ShouldRender
              if={authState === "LOGGED_IN" || authState === "UNINITIALIZED"}
            >
              <S.ButtonsContainerLoggedInDesktop
                className={searchBarExpanded ? "searchBarExpanded" : undefined}
              >
                <NotificationsMenu />
                <UserMenu />
              </S.ButtonsContainerLoggedInDesktop>
            </ShouldRender>
          </S.ActionsContainer>
        </ShouldRender>
      </S.Bar>
    </S.Container>
  );
});
