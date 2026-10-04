import { patchNotifications } from "@nw/api/endpoints/novelists";
import {
  queryKeys,
  useApi,
  useNotificationReadState,
  useNotifications,
} from "@nw/features";
import type { NotificationFeed, NovelistWorldNotification } from "@nw/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { EndOfList } from "@/components/end-of-list";
import {
  NotificationRowSkeleton,
  SkeletonRows,
} from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { NotificationRow } from "@/components/notification-row";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTabTop } from "@/hooks/use-tab-top";
import { fontSize, space, type, useAppTheme } from "@/theme";
import { Button } from "@/components/button";

/** Which stretch of time a notification belongs to, newest first. */
const DAY = 24 * 60 * 60;
const periodOf = (epochSeconds: number): string => {
  const age = Date.now() / 1000 - epochSeconds;
  if (age < DAY) return "Today";
  if (age < 7 * DAY) return "This week";
  if (age < 30 * DAY) return "This month";
  return "Earlier";
};

/**
 * Notifications, from the same `useNotifications` the web page renders.
 *
 * Worth stating plainly because it is the argument for the whole arrangement:
 * this screen and `apps/web/src/app/rp/notifications/page.tsx` share every
 * decision that could differ between them — page size, when there is more to
 * fetch, and what an empty first page means — and share none of their markup.
 *
 * What this screen owns is the three things a list of notifications needs and
 * a query does not provide:
 *
 *  - **a way to clear the unread state**, which is one `PATCH` for all of them
 *    (the endpoint has no per-row form, and web's header does the same);
 *  - **the rows answered in place**: a friend request accepted or declined here
 *    is gone from the list at once, because the notification itself stays on
 *    the server and a refetch would put it back;
 *  - **where each row leads**, which is `lib/notification-target`.
 *
 * Push is not here. It is Phase 10, and it needs `expo-notifications` plus
 * per-device transport routing in the backend; this list is what the app knows
 * when it is open.
 */

const keyExtractor = (item: NovelistWorldNotification) => item.id;

export const NotificationsScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const {
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    notifications,
    refetch,
  } = useNotifications();
  // The pull spinner is for pulls. Opening this tab over a list Home's rail
  // fetched a minute ago refetches it — silently, under the rows.
  const pull = usePullToRefresh(refetch);

  // Opening the tab is seeing the list: the tab's badge clears, and the rows
  // stay highlighted until each is opened or all are marked read.
  const { markSeen, refreshCounts } = useNotificationReadState();
  useFocusEffect(
    useCallback(() => {
      void markSeen();
    }, [markSeen]),
  );

  /** Friend requests answered on this screen; their rows are gone. */
  const [answered, setAnswered] = useState<string[]>([]);
  const onAnswered = useCallback((id: string) => {
    setAnswered((current) => [...current, id]);
  }, []);

  const rows = useMemo(
    () => notifications.filter((item) => !answered.includes(item.id)),
    [answered, notifications],
  );
  const unread = useMemo(
    () => rows.filter((item) => !item.isRead).length,
    [rows],
  );

  /*
   * Mark every notification read.
   *
   * Optimistic on the cache rather than on a local flag: the same query feeds
   * the friend-request cards in the home rail, and a second copy of "which of
   * these are read" is a second thing to keep in step. The refetch afterwards
   * is what confirms it; a failure puts the pages back as they were.
   */
  const markRead = useMutation({
    mutationFn: async () => {
      const result = await patchNotifications(api);
      if (result === null) throw new Error("Notifications could not be read.");
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications(), context.previous);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications() });
      const previous = queryClient.getQueryData(queryKeys.notifications());
      queryClient.setQueryData<{
        pageParams: unknown[];
        pages: NotificationFeed[];
      }>(queryKeys.notifications(), (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) => ({ ...item, isRead: true })),
              })),
            }
          : data,
      );
      return { previous };
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(),
      });
      void refreshCounts();
    },
  });

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  /** Tapping Notifications while on Notifications takes it back to the top. */
  const listRef = useRef<FlatList<NovelistWorldNotification>>(null);
  useTabTop(listRef);

  const header = useMemo(() => {
    if (unread === 0) return null;
    return (
      <View style={styles.header}>
        <Text style={[styles.count, { color: theme.text }]}>
          {unread} unread
        </Text>
        <Button
          accessibilityLabel="Mark all as read"
          busy={markRead.isPending}
          hitSlop={space.sm}
          icon="checkmark-done"
          label="Mark all read"
          onPress={() => markRead.mutate()}
          size="sm"
        />
      </View>
    );
  }, [markRead, theme, unread]);

  /*
   * Rows under the date they belong to: "Today", "This week", "This month",
   * "Earlier". The list is already newest first, so a label is drawn wherever
   * a row's period differs from the one above it — nothing is reordered, and a
   * page arriving later simply continues the last group.
   */
  const renderItem = useCallback(
    ({ index, item }: { index: number; item: NovelistWorldNotification }) => {
      const period = periodOf(item.date);
      const previous = index > 0 ? rows[index - 1] : undefined;
      const next = rows[index + 1];
      const starts = !previous || periodOf(previous.date) !== period;
      const ends = !next || periodOf(next.date) !== period;
      const place = starts ? (ends ? "only" : "first") : ends ? "last" : "middle";

      return (
        <>
          {starts ? (
            <View style={[styles.period, index > 0 && styles.periodNext]}>
              <Text style={[styles.periodTitle, { color: theme.textGray }]}>
                {period}
              </Text>
              <View
                style={[styles.rule, { backgroundColor: theme.material.edge }]}
              />
            </View>
          ) : null}
          <NotificationRow
            notification={item}
            onAnswered={onAnswered}
            place={place}
          />
        </>
      );
    },
    [onAnswered, rows, theme],
  );

  return (
    <FlatList
      {...tabBarScroll}
      contentContainerStyle={contentStyle}
      data={rows}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        <ListStatus
          empty="Nothing new."
          error={error}
          loading={isPending}
          onRetry={refetch}
          skeleton={
            <SkeletonRows
              count={8}
              render={() => <NotificationRowSkeleton />}
            />
          }
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <NotificationRowSkeleton />
        ) : !hasNextPage && rows.length > 0 ? (
          <EndOfList />
        ) : null
      }
      ListHeaderComponent={header}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      onRefresh={pull.onRefresh}
      ref={listRef}
      refreshing={pull.refreshing}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  // Rows run edge to edge and carry their own gutters; see `NotificationRow`.
  content: { paddingBottom: space.md, paddingTop: space.m },
  period: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingBottom: space.ms,
    paddingHorizontal: space.md,
  },
  periodNext: { paddingTop: space.lg },
  periodTitle: type.eyebrow,
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  count: { fontSize: fontSize.label, fontWeight: "600" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: space.m,
    paddingHorizontal: space.md,
  },
});
