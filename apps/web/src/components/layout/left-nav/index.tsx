"use client";

import { usePathname } from "@/lib/navigation";
import type { FC, ReactNode } from "react";
import { EmailVerifiedBadge } from "@/components/common";
import {
  BookmarksIcon,
  CharactersIcon,
  EditProfileIcon,
  ExploreIcon,
  FriendsIcon,
  HomeIcon,
  InboxIcon,
  InteractionsIcon,
  LibraryIcon,
  MusicIcon,
  StoriesIcon,
} from "@/components/user-menu/user-menu-icons";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

type NavItemDef = {
  icon: ReactNode;
  label: string;
  route: string;
  badge?: number | null;
};

type Props = {
  /** Whether the sidebar should be slid into view. Stays mounted either way
   * so the show/hide transitions instead of an instant mount/unmount. */
  visible: boolean;
};

/** Left sidebar — a subset of the real UserMenu destinations plus a few
 * public/self-service pages that need no backend changes, shown on every
 * page (not just home) so desktop visitors don't have to open the avatar
 * menu for the links they use most. Grouped into sections with separators
 * so the growing list stays scannable. */
export const LeftNav: FC<Props> = ({ visible }) => {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const unreadReplyCount = useGlobalState("unreadReplyCount");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const { routeToPage } = usePageRouter();
  const pathname = usePathname();

  if (!novelist) return null;

  const profileRoute = ROUTES.Profile.View(novelist.username).Index;
  const displayName =
    [novelist.firstName, novelist.lastName].filter(Boolean).join(" ").trim() ||
    novelist.username;

  const sections: { label: string; items: NavItemDef[] }[] = [
    {
      items: [
        { icon: <HomeIcon size={18} />, label: "Home", route: ROUTES.Home },
        { icon: <ExploreIcon size={18} />, label: "Explore Posts", route: ROUTES.explore },
        { icon: <LibraryIcon size={18} />, label: "Library", route: ROUTES.Library },
      ],
      label: "Main",
    },
    {
      items: [
        {
          badge: unreadConversationIds?.length,
          icon: <InboxIcon size={18} />,
          label: "Inbox",
          route: ROUTES.conversations,
        },
        {
          badge: unreadReplyCount,
          icon: <InteractionsIcon size={18} />,
          label: "Threads",
          route: ROUTES.outgoingThreads,
        },
      ],
      label: "Activity",
    },
    {
      items: [
        {
          icon: <EditProfileIcon size={18} />,
          label: "Edit Profile",
          route: ROUTES.Profile.Edit,
        },
        {
          icon: <CharactersIcon size={18} />,
          label: "Characters",
          route: ROUTES.Profile.View(novelist.username).Muses,
        },
        {
          icon: <StoriesIcon size={18} />,
          label: "Stories",
          route: ROUTES.Profile.View(novelist.username).Storyboards,
        },
        {
          icon: <FriendsIcon size={18} />,
          label: "Friends",
          route: ROUTES.Profile.View(novelist.username).Friends,
        },
        { icon: <BookmarksIcon size={18} />, label: "Bookmarks", route: ROUTES.Bookmarks },
        {
          icon: <MusicIcon size={18} />,
          label: "Music",
          route: ROUTES.Profile.View(novelist.username).Music,
        },
      ],
      label: "Your space",
    },
  ];

  return (
    <S.LeftNavWrap $visible={visible}>
      {sections.map((section, index) => (
        <div key={section.label}>
          {index > 0 && <S.NavSeparator />}
          <S.NavSection>
            <S.NavSectionLabel>{section.label}</S.NavSectionLabel>
            {section.label === "Your space" && (
              <S.ProfileItem
                onClick={() => routeToPage(profileRoute)}
                $active={pathname === profileRoute}
                aria-current={pathname === profileRoute ? "page" : undefined}
              >
                <S.ProfileAvatar
                  src={novelist.image ?? null}
                  alt={user?.username || "User Avatar"}
                  username={user?.username}
                  nwImage={novelist.avatar}
                />
                <S.ProfileInfo>
                  <S.ProfileName>
                    {displayName}
                    {novelist.isVerified && <EmailVerifiedBadge size={13} />}
                  </S.ProfileName>
                  <S.ProfileHandle>@{novelist.username}</S.ProfileHandle>
                  <S.ProfileLevel>
                    {novelist.totalPoints.toLocaleString()} XP
                  </S.ProfileLevel>
                </S.ProfileInfo>
              </S.ProfileItem>
            )}
            <S.NavList>
              {section.items.map((item) => (
                <S.NavItem
                  key={item.label}
                  onClick={() => routeToPage(item.route)}
                  $active={pathname === item.route}
                  aria-current={pathname === item.route ? "page" : undefined}
                >
                  {item.icon}
                  <S.NavLabel>{item.label}</S.NavLabel>
                  {Boolean(item.badge) && (
                    <S.NavBadge>
                      {(item.badge ?? 0) > 9 ? "9+" : item.badge}
                    </S.NavBadge>
                  )}
                </S.NavItem>
              ))}
            </S.NavList>
          </S.NavSection>
        </div>
      ))}
    </S.LeftNavWrap>
  );
};
