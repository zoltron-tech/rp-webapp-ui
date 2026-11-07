import {
  isStoredNotification,
  notificationHue,
  notificationKicker,
  useNotificationReadState,
} from "@nw/features";
import type { NovelistWorldNotification } from "@nw/types";
import {
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  useCallback,
  useState,
} from "react";
import { reactToMuseConnectionAction } from "@/app/rp/muse/connection-actions";
import {
  acceptFriendRequest,
  deleteFriendRequest,
} from "@/app/rp/profile/actions";
import { Button } from "@/components/common";
import { useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import { notificationRoute } from "@/utils/notification-route";
import { AvatarNew } from "../common/avatar-new";
import { notificationIcon } from "./kinds";
import * as S from "./row.styles";

type Props = {
  notification: NovelistWorldNotification;
  /** Tighter, for the bell's dropdown. */
  compact?: boolean;
  /** Called before the row navigates, so a dropdown can close. */
  onNavigate?: () => void;
};

/**
 * One notification, in the list and in the bell's dropdown alike.
 *
 * Who did it is the avatar — two of them, overlapped, when a row stands for
 * several people. What they did is the small coloured glyph on its corner and
 * the kicker above the sentence. The sentence is the server's own.
 */
export const NotificationRow: FC<Props> = ({
  notification,
  compact,
  onNavigate,
}) => {
  const { routeToPage } = usePageRouter();
  const { errorToast, successToast } = useUIContext();
  const set = useGlobalStoreSet();
  const [loading, setLoading] = useState(false);
  const { markRead } = useNotificationReadState();

  const Glyph = notificationIcon(notification);
  const unread = !notification.isRead;
  // The latest performer is the row's source; a second face shows it is a crowd.
  const second = (notification.actors ?? []).find(
    (actor) => actor.id !== notification.source.id,
  );

  const removeFromStore = () => {
    set((prev) => ({
      notifications:
        prev.notifications?.filter((n) => n.id !== notification.id) ?? null,
    }));
  };

  /** Runs a request's answer, with the toasts and the row's removal. */
  const answer = async (
    call: () => Promise<{ message?: string } | null | undefined>,
    done: string,
    failed: string,
  ) => {
    if (loading) return;
    setLoading(true);
    const response = await call();
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast(done);
      removeFromStore();
    } else {
      errorToast(failed);
    }
  };

  const answerFriend = (accepted: boolean) => {
    const sourceId = notification.source?.id;
    if (!sourceId) return;
    void answer(
      () =>
        accepted
          ? acceptFriendRequest(sourceId)
          : deleteFriendRequest(sourceId),
      accepted ? "Friend request accepted" : "Friend request declined",
      accepted
        ? "Could not accept friend request. Please try again."
        : "Could not decline friend request. Please try again.",
    );
  };

  const answerMuse = (accepted: boolean) => {
    void answer(
      () => reactToMuseConnectionAction(notification.id, accepted),
      accepted ? "Muse connection accepted" : "Muse connection declined",
      "Could not update the muse connection. Please try again.",
    );
  };

  const open = useCallback(() => {
    onNavigate?.();

    if (!notification.isRead && isStoredNotification(notification.type)) {
      void markRead(notification.id);
      set((prev) => ({
        notifications:
          prev.notifications?.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ) ?? null,
      }));
    }

    // A placeholder's profile is gone; everything else the row opens still exists.
    if (
      notification.source?.isPlaceholder &&
      notification.target?.targetType === "PROFILE"
    )
      return;
    const route = notificationRoute(notification);
    if (route) routeToPage(route);
  }, [notification, routeToPage, markRead, set, onNavigate]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Only the row itself: Enter on a button inside it is that button's.
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
  };

  const isFriendRequest = notification.type === "FRIEND_REQUEST";
  const isMuseRequest = notification.type === "MUSE_CONNECTION_REQUEST";

  return (
    <S.Row
      tabIndex={0}
      onClick={open}
      onKeyDown={onKeyDown}
      data-unread={unread || undefined}
      data-compact={compact || undefined}
      style={{ "--kind": notificationHue(notification) } as CSSProperties}
    >
      <S.Faces data-pair={second ? true : undefined}>
        {second && (
          <AvatarNew
            className="avatar face-back"
            src={second.image || null}
            alt=""
          />
        )}
        <AvatarNew
          className="avatar face-front"
          src={notification.source.image || null}
          alt={notification.source.title || "Avatar"}
        />
        <S.Glyph aria-hidden="true">
          <Glyph />
        </S.Glyph>
      </S.Faces>

      <S.Body>
        <S.Kicker>{notificationKicker(notification)}</S.Kicker>
        <S.Sentence>
          <strong>{notification.source.title}</strong>{" "}
          {notification.notificationText}
        </S.Sentence>
        <S.Time>
          {notification.date ? toFormattedDateFromUnix(notification.date) : ""}
        </S.Time>

        {(isFriendRequest || isMuseRequest) && (
          <S.Actions onClick={(event) => event.stopPropagation()}>
            <Button
              variant="positive"
              className={loading ? "messaging" : undefined}
              onClick={() =>
                isFriendRequest ? answerFriend(true) : answerMuse(true)
              }
            >
              {loading ? "…" : "Accept"}
            </Button>
            <Button
              variant="negative"
              className={loading ? "messaging" : undefined}
              onClick={() =>
                isFriendRequest ? answerFriend(false) : answerMuse(false)
              }
            >
              {loading ? "…" : "Decline"}
            </Button>
          </S.Actions>
        )}
      </S.Body>

      {unread && <S.UnreadDot role="img" aria-label="Unread" />}
    </S.Row>
  );
};
