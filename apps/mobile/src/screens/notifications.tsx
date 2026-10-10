import { patchNotifications } from "@nw/api/endpoints/novelists";
import {
  matchesNotificationFilter,
  NOTIFICATION_FILTERS,
  type NotificationFilter,
  notificationSections,
  notificationSummary,
  queryKeys,
  useApi,
  useNotificationReadState,
  useNotifications,
} from "@nw/features";
import type { NotificationFeed, NovelistWorldNotification } from "@nw/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { EndOfList } from "@/components/end-of-list";
import {
  NotificationRowSkeleton,
  SkeletonRows,
} from "@/components/list-skeletons";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { NotificationRow, type RowPlace } from "@/components/notification-row";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTabTop } from "@/hooks/use-tab-top";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";
import { Button } from "@/components/button";

/**
 * One cell of the list: a row and where it sits.
 *
 * The sections ("Waiting on you", "Fresh ink", …) come from `@nw/features`,
 * the same table the web page draws. They are flattened into one array here
 * rather than handed to a `SectionList`: on Fabric a `SectionList` whose
 * sections change under it has crashed this app before (`addViewAt`), and a
 * flat list with a label drawn by the first row of each section is the same
 * picture without that risk.
 */
type Cell = {
  item: NovelistWorldNotification;
  place: RowPlace;
  /** The section title, on the first row of each section. */
  starts: string | null;
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

const keyExtractor = (cell: Cell) => cell.item.id;

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

  /** Which kinds are shown. Acts on what is loaded; the chips say so when nothing matches. */
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const cells = useMemo<Cell[]>(() => {
    const sections = notificationSections(
      rows.filter((item) => matchesNotificationFilter(item, filter)),
    );
    return sections.flatMap((section) =>
      section.items.map((item, index) => {
        const first = index === 0;
        const last = index === section.items.length - 1;
        return {
          item,
          place: first ? (last ? "only" : "first") : last ? "last" : "middle",
          starts: first ? section.title : null,
        };
      }),
    );
  }, [filter, rows]);

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
  const listRef = useRef<FlatList<Cell>>(null);
  useTabTop(listRef);

  /*
   * The line under the title reads the room — "6 new. You are the talk of the
   * town." — and the chips pick a kind. Both only once there is a list.
   */
  const header = useMemo(() => {
    if (rows.length === 0) return null;
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.summary, { color: theme.textGray }]}>
            {notificationSummary(unread, rows.length)}
          </Text>
          {unread > 0 ? (
            <Button
              accessibilityLabel="Mark all as read"
              busy={markRead.isPending}
              hitSlop={space.sm}
              icon="checkmark-done"
              label="Mark all read"
              onPress={() => markRead.mutate()}
              size="sm"
            />
          ) : null}
        </View>
        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {NOTIFICATION_FILTERS.map(({ id, label }) => {
            const on = filter === id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                key={id}
                onPress={() => setFilter(id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: on
                      ? theme.accent.solid
                      : pressed
                        ? theme.material.fillPressed
                        : theme.material.fill,
                    borderColor: on ? theme.accent.solid : theme.material.edge,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: on ? theme.accent.onSolid : theme.textGray },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }, [filter, markRead, rows.length, theme, unread]);

  const renderItem = useCallback(
    ({ index, item: cell }: { index: number; item: Cell }) => (
      <>
        {cell.starts ? (
          <View style={[styles.period, index > 0 && styles.periodNext]}>
            <Text style={[styles.periodTitle, { color: theme.textGray }]}>
              {cell.starts}
            </Text>
            <View
              style={[styles.rule, { backgroundColor: theme.material.edge }]}
            />
          </View>
        ) : null}
        <NotificationRow
          notification={cell.item}
          onAnswered={onAnswered}
          place={cell.place}
        />
      </>
    ),
    [onAnswered, theme],
  );

  return (
    <FlatList
      {...tabBarScroll}
      contentContainerStyle={contentStyle}
      data={cells}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        // Filtered to nothing is the same silent bell, saying which chip it is
        // under and that only what is loaded was searched.
        rows.length > 0 ? (
          <EmptyScene
            scene="silent-bell"
            subtitle={`None of those in what is loaded so far${
              hasNextPage ? ". Scroll on to look further back." : "."
            }`}
            title={`Nothing under ${
              NOTIFICATION_FILTERS.find(({ id }) => id === filter)?.label ??
              "this filter"
            }`}
          />
        ) : (
          <ListStatus
            empty={
              <EmptyScene
                scene="silent-bell"
                subtitle="Likes, replies, mentions and requests land here. Post something and stir the ink."
                title="Quiet as a blank page"
              />
            }
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
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <NotificationRowSkeleton />
        ) : !hasNextPage && cells.length > 0 ? (
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
  chip: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  chipLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  chips: { gap: space.s, paddingHorizontal: space.md },
  header: { gap: space.ms, paddingBottom: space.m },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    justifyContent: "space-between",
    paddingHorizontal: space.md,
  },
  summary: { flex: 1, fontSize: fontSize.label, lineHeight: 18 },
});
