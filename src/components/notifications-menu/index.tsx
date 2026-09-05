"use client";

import type { NovelistWorldNotification } from "@nw/types";
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
import { FriendRequestNotification } from "../friend-request-notification";
import * as S from "./styles";

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

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && isMobile) {
        handleSeeAllClick();
        return;
      }
      setOpen(nextOpen);
    },
    [isMobile, handleSeeAllClick],
  );

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
    setMarkingRead(false);
  }, [authState, markingRead, baseDataLoader, set]);

  const removeFriendRequestNotification = useCallback(
    (novelistToRemove: NovelistWorldNotification) => {
      if (!notifications) return;
      set({
        notifications: notifications.filter(
          (n) => n.id !== novelistToRemove.id,
        ),
      });
    },
    [notifications, set],
  );

  useEffect(() => {
    if (authState === "LOADING" || notifications) return;
    fetchNotifications();
  }, [authState]);

  Logger.info("NotificationsMenu rendered");

  if (!user) return <></>;

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <S.PositionContainer>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <S.TriggerArea>
          {unreadCount > 0 && (
            <S.NotificationBadge>
              {unreadCount > 99 ? "99+" : unreadCount}
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
              {notifications && notifications.length > 0 ? (
                notifications
                  .slice(0, 8)
                  .map((n) => (
                    <FriendRequestNotification
                      key={n.id}
                      notification={n}
                      removeMethod={removeFriendRequestNotification}
                      onClose={() => setOpen(false)}
                    />
                  ))
              ) : (
                <S.EmptyState>
                  <NoNotificationsArt />
                  <span>No notifications yet</span>
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
