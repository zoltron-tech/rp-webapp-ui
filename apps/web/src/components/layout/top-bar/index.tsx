"use client";

import classNames from "classnames";
import {
  type FC,
  type MouseEvent,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GoArrowRight } from "react-icons/go";
import { PaletteMenu, Search, UserMenu } from "@/components";
import {
  Button,
  NWLogoInner,
  ShouldRender,
  Username,
} from "@/components/common";
import { NotificationsMenu } from "@/components/notifications-menu";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { usePathname } from "@/lib/navigation";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

/**
 * True once the page has scrolled past `offset`.
 *
 * Drives the landing page's transparent-to-glass bar. Reads are coalesced into
 * one rAF per frame so a fast scroll cannot queue a render per scroll event,
 * and the state is a boolean, so React bails out of all but the two flips.
 */
const useScrolledPast = (offset: number) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > offset);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    // Restoring a scroll position (back button, refresh) lands us mid-page
    // with no scroll event of our own.
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset]);

  return scrolled;
};

type Props = {};

export const TopBar: FC<Props> = memo(({}) => {
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const searchBarExpanded = useGlobalState("searchBarExpanded");
  const pathname = usePathname();
  const isLoginPage = useMemo(() => pathname === ROUTES.Login, [pathname]);
  const { routeToPage } = usePageRouter();
  const { width } = useWindowDimensions();
  const accent = useGlobalState("accent");
  // The landing hero is drawn edge to edge, so the bar floats over it instead
  // of capping it with a solid strip.
  const isLandingPage = useMemo(
    () => pathname === ROUTES.Novelists,
    [pathname],
  );
  const scrolled = useScrolledPast(12);
  // The home page renders its own always-expanded search inline on mobile
  // (see app/rp/home/mobile-search.tsx) instead of this icon-triggered one.
  const hideSearch = pathname === ROUTES.Home && width !== null && width < 801;

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

  const homeRoute = authState === "LOGGED_IN" ? ROUTES.Home : ROUTES.Novelists;

  const onLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks keep the browser's own behaviour (new tab, new window);
    // a plain click goes through the page router like every other navigation.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    event.preventDefault();
    routeToPage(homeRoute);
  };

  const onLoginClick = () => {
    routeToPage(ROUTES.Login);
  };

  return (
    <S.Container
      $overlay={isLandingPage}
      $scrolled={scrolled}
      // Over the hero the bar has to read on near-black whatever palette the
      // reader has chosen, so on the landing page it re-declares the dark
      // theme for its own subtree. Both classes are needed: `dark` sets the
      // raw scales and the accent class is what maps them onto --bg-*/--text.
      className={isLandingPage ? classNames("dark", accent) : undefined}
    >
      <S.Bar $overlay={isLandingPage}>
        <S.LogoContainer
          href={homeRoute}
          aria-label="Novelist World home"
          onClick={onLogoClick}
        >
          <S.Logo>
            <NWLogoInner
              className={searchBarExpanded ? "searchBarExpanded" : undefined}
            />
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
            <ShouldRender if={!hideSearch}>
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
                          {result.pennedBy && (
                            <S.PennedBy>
                              Penned by {result.pennedBy.username}
                            </S.PennedBy>
                          )}
                        </S.NameContainer>
                      </S.AvatarContainer>
                      <GoArrowRight />
                    </S.SearchDropdownItem>
                  )}
                />
              </S.SearchContainer>
            </ShouldRender>

            {/* Signed-out readers have no saved palette, so the landing page
                offers one to try on here — see PaletteMenu, it is a preview
                that dies with the visit. */}
            <ShouldRender if={authState === "LOGGED_OUT" && isLandingPage}>
              <PaletteMenu
                className={searchBarExpanded ? "searchBarExpanded" : undefined}
              />
            </ShouldRender>

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
