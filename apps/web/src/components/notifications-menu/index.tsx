"use client";

import { useNotificationCounts, useNotificationReadState } from "@nw/features";
import { isCompactViewport } from "@nw/utils/platform";
import classNames from "classnames";
import { usePathname } from "@/lib/navigation";
import { Popover } from "radix-ui";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import { GoArrowRight } from "react-icons/go";
import { IoMdNotifications } from "react-icons/io";
import {
  getNotifications,
  patchNotifications,
} from "@/app/rp/novelists/actions";
import { NoNotificationsArt } from "@/components/book-art";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { NotificationRow } from "../notification/notification-row";
import * as S from "./styles";

/** Rows shown in the dropdown; the page has the rest. */
const MENU_SIZE = 8;

export const NotificationsMenu: FC = () => {
  const authState = useGlobalState("authState");
  const notifications = useGlobalState("notifications");
  const user = useGlobalState("user");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { routeToPage, baseDataLoader } = usePageRouter();
  const [open, setOpen] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const isMobile = useMemo(() => isCompactViewport(), []);
  const pathname = usePathname();
  const set = useGlobalStoreSet();

  const handleSeeAllClick = useCallback(() => {
    setOpen(false);
    if (pathname === ROUTES.Notification) return;
    routeToPage(ROUTES.Notification);
  }, [routeToPage, pathname]);

  const { data: counts } = useNotificationCounts({
    enabled: authState === "LOGGED_IN",
  });
  const { markSeen, refreshCounts } = useNotificationReadState();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && isMobile) {
        handleSeeAllClick();
        return;
      }
      // Opening the list is seeing it: the badge clears, the rows stay
      // highlighted until each is opened or all are marked read.
      if (nextOpen) void markSeen();
      setOpen(nextOpen);
    },
    [isMobile, handleSeeAllClick, markSeen],
  );

  // The list in the store changes when a notification arrives over the socket
  // or a request is answered; either moves the numbers.
  useEffect(() => {
    void refreshCounts();
  }, [notifications, refreshCounts]);

  const fetchNotifications = useCallback(async () => {
    if (authState !== "LOGGED_IN") return;
    const _notifications = await baseDataLoader(() => getNotifications(1, 30));
    set({ notifications: _notifications });
  }, [authState, baseDataLoader, set]);

  const handleMarkAllRead = useCallback(async () => {
    if (authState !== "LOGGED_IN" || markingRead) return;
    setMarkingRead(true);
    await patchNotifications();
    const _notifications = await baseDataLoader(() => getNotifications(1, 30));
    set({ notifications: _notifications });
    void refreshCounts();
    setMarkingRead(false);
  }, [authState, markingRead, baseDataLoader, set, refreshCounts]);

  useEffect(() => {
    if (authState === "LOADING" || notifications) return;
    fetchNotifications();
  }, [authState]);

  Logger.info("NotificationsMenu rendered");

  if (!user) return <></>;

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  // The server's count of what has not been seen. What is loaded here is at
  // most a page, so counting it is only the fallback for an older server.
  const badgeCount = counts?.unseen ?? unreadCount;

  // The feed arrives with every pending request first. Taking the first eight
  // of that let eight requests fill the menu and hide everything else, so the
  // menu shows the eight newest of whatever kind.
  const latest = [...(notifications ?? [])]
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    .slice(0, MENU_SIZE);

  return (
    <S.PositionContainer>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <S.TriggerArea>
          {badgeCount > 0 && (
            <S.NotificationBadge>
              {badgeCount > 99 ? "99+" : badgeCount}
            </S.NotificationBadge>
          )}
          <Popover.Trigger asChild>
            <S.TriggerButton aria-label="Notifications">
              <IoMdNotifications className="menu-icon" />
            </S.TriggerButton>
          </Popover.Trigger>
        </S.TriggerArea>

        <Popover.Portal>
          <S.PopoverContent
            align="end"
            sideOffset={12}
            className={classNames([accent, theme])}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <S.Header>
              <S.Title>Notifications</S.Title>
              {unreadCount > 0 && (
                <S.MarkAllButton
                  onClick={handleMarkAllRead}
                  disabled={markingRead}
                  aria-label="Mark all as read"
                >
                  <BsCheckAll size={14} />
                  Mark all read
                </S.MarkAllButton>
              )}
            </S.Header>

            <S.Divider orientation="horizontal" />

            <S.ScrollArea>
              {latest.length > 0 ? (
                latest.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    compact
                    onNavigate={() => setOpen(false)}
                  />
                ))
              ) : (
                <S.EmptyState>
                  <NoNotificationsArt />
                  <span>Quiet as a blank page</span>
                </S.EmptyState>
              )}
            </S.ScrollArea>

            <S.Divider orientation="horizontal" />

            <S.Footer onClick={handleSeeAllClick}>
              See all notifications
              <GoArrowRight size={13} />
            </S.Footer>
          </S.PopoverContent>
        </Popover.Portal>
      </Popover.Root>
    </S.PositionContainer>
  );
};
