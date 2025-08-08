"use client";

import { Search, UserMenu } from "@/components";
import { Button, ShouldRender, Username } from "@/components/common";
import { FC, memo } from "react";

import { NotificationsMenu } from "@/components/notifications-menu";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { GoArrowRight } from "react-icons/go";
import { GiQuillInk } from "react-icons/gi";
import { ChatMenuModal } from "../../chat-menu-modal";
import * as S from "./styles";
import { useGlobalState } from "@/context/store/stores";

const DynamicThemeToggle = dynamic(() => import("@/components/theme-toggle"), {
  ssr: false,
});

type Props = {};

export const TopBar: FC<Props> = memo(({}) => {
  const authState = useGlobalState("authState");
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
    window.location.replace(`${process.env.RP_LOGIN_URL}`);
  };

  return (
    <S.Container>
      <S.Bar>
        <S.LogoContainer onClick={onLogoClick}>
          <S.Logo>
            <S.LogoInner>
              <GiQuillInk />
            </S.LogoInner>
          </S.Logo>
          <S.LogoText>Novelist World</S.LogoText>
        </S.LogoContainer>

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
      </S.Bar>
    </S.Container>
  );
});
