"use client";

import { usePathname, useRouter } from "next/navigation";
import { type FC, memo, useMemo } from "react";
import { GoArrowRight } from "react-icons/go";
import { Search, UserMenu } from "@/components";
import { Button, ShouldRender, Username } from "@/components/common";
import { NotificationsMenu } from "@/components/notifications-menu";
import { useGlobalState } from "@/context/store/stores";
import logoText from "../../../assets/images/Logo text.png";
import { ChatMenuModal } from "../../chat-menu-modal";
import * as S from "./styles";

type Props = {};

export const TopBar: FC<Props> = memo(({}) => {
  const authState = useGlobalState("authState");
  const pathname = usePathname();
  const isLoginPage = useMemo(() => pathname === "/rp/login", [pathname]);
  const { push } = useRouter();

  const onSearchItemClick =
    (record: { id?: string; username?: string; name?: string }) =>
    (close: () => void) =>
    () => {
      close();
      if (record?.username) {
        push(`/rp/profile/${record.username}`);
      } else if (record?.name) {
        push(`/rp/story/${record.id}`);
      } else if (record?.id) {
        push(`/rp/muse/${record.id}`);
      }
    };

  const onLogoClick = () => {
    push(authState === "LOGGED_IN" ? `/rp/home` : `/rp/novelists`);
  };

  const onLoginClick = () => {
    push("/rp/login");
  };

  return (
    <S.Container>
      <S.Bar>
        <S.LogoContainer onClick={onLogoClick}>
          <S.Logo>
            <S.LogoInner>
              <S.LogoImage src={logoText.src} alt="" />
            </S.LogoInner>
          </S.Logo>
          <S.LogoText>Novelist </S.LogoText>{" "}
          <S.LogoTextSuffix>World</S.LogoTextSuffix>
        </S.LogoContainer>
        <ShouldRender if={!isLoginPage}>
          <S.ActionsContainer>
            <S.SearchContainer>
              <Search
                placeholder="Search"
                types={["novelist", "muse", "story"]}
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
              <S.ButtonsContainerDesktop>
                <Button onClick={onLoginClick}>Log In</Button>
              </S.ButtonsContainerDesktop>
            </ShouldRender>
            <ShouldRender
              if={authState === "LOGGED_IN" || authState === "UNINITIALIZED"}
            >
              <S.ButtonsContainerLoggedInDesktop>
                <ChatMenuModal />
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
