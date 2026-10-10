"use client";

import {
  matchesNotificationFilter,
  NOTIFICATION_FILTERS,
  type NotificationFilter,
  notificationSections,
} from "@nw/features";
import { useEffect, useMemo, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { NoNotificationsArt } from "../book-art";
import { LoadMore } from "../load-more/page";
import { NotificationHeader } from "./notification-header";
import { NotificationRow } from "./notification-row";
import * as S from "./styled";

interface Props {
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}

export const NotificcationsList = ({
  hasMore,
  loadingMore,
  loadMore,
}: Props) => {
  const { stopPageLoading } = usePageRouter();
  const notifications = useGlobalState("notifications");
  const [filter, setFilter] = useState<NotificationFilter>("all");

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  const sections = useMemo(
    () =>
      notificationSections(
        (notifications ?? []).filter((item) =>
          matchesNotificationFilter(item, filter),
        ),
      ),
    [notifications, filter],
  );

  const total = notifications?.length ?? 0;
  const unread = notifications?.filter((item) => !item.isRead).length ?? 0;

  return (
    <S.ListRoot>
      <NotificationHeader unread={unread} total={total} />

      {total > 0 && (
        <S.Filters role="toolbar" aria-label="Filter notifications">
          {NOTIFICATION_FILTERS.map(({ id, label }) => (
            <S.FilterChip
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </S.FilterChip>
          ))}
        </S.Filters>
      )}

      {sections.map((section) => (
        <S.Section key={section.title} aria-label={section.title}>
          <S.SectionTitle>{section.title}</S.SectionTitle>
          {section.items.map((item) => (
            <NotificationRow key={item.id} notification={item} />
          ))}
        </S.Section>
      ))}

      {notifications?.length === 0 && (
        <S.EmptyState>
          <NoNotificationsArt />
          <S.EmptyStateTitle>Quiet as a blank page</S.EmptyStateTitle>
          <S.EmptyStateBody>
            Likes, replies, mentions and requests land here. Post something and
            stir the ink.
          </S.EmptyStateBody>
        </S.EmptyState>
      )}

      {total > 0 && sections.length === 0 && (
        <S.FilterEmpty>
          None of those in what is loaded so far
          {hasMore ? ". Load more to look further back." : "."}
        </S.FilterEmpty>
      )}

      <LoadMore
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </S.ListRoot>
  );
};
