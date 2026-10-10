import { Ionicons } from "@expo/vector-icons";
import { resolveConversationTarget } from "@nw/chat";
import {
  INBOX_FILTERS,
  type InboxFilter,
  inboxSections,
  inboxSummary,
  matchesInboxFilter,
  useConversations,
  useMarkConversationRead,
  usePrefetchConversationMessages,
  useSession,
  useUnreadConversations,
} from "@nw/features";
import type { Conversation, IceBreaker } from "@nw/types";
import { useRouter } from "expo-router";
import {
  type ComponentProps,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { ConversationRow } from "@/components/chat/conversation-row";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { CreateGroupSheet } from "@/components/chat/create-group-sheet";
import { CreateIceBreakerSheet } from "@/components/chat/create-ice-breaker-sheet";
import { IceBreakerRail } from "@/components/chat/ice-breaker-rail";
import { IceBreakerSheet } from "@/components/chat/ice-breaker-sheet";
import { EndOfList } from "@/components/end-of-list";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { useReconcileInbox } from "@/hooks/use-reconcile";
import type { RowPlace } from "@/components/notification-row";
import { useTrackOnline } from "@/context/socket";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import {
  useGroupCount,
  useSupportConversation,
} from "@/hooks/use-inbox-actions";
import { InboxParallax } from "@/context/inbox-reveal";
import { useIceBreakers } from "@/hooks/use-ice-breakers";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";
import { SearchField } from "@/components/search-field";
import { IconButton } from "@/components/icon-button";

/**
 * The inbox.
 *
 * Previews are decrypted by `useConversations` before they reach here — a list
 * of "🔒 could not be decrypted" is the failure this screen would otherwise
 * show for every row.
 *
 * A message body is rich text, so the preview runs it through the shared parser
 * and takes the plain text out. Stripping tags with a regex instead is how a
 * preview ends up reading `<div style="text-align: center;">`.
 *
 * The row's name and face come from `resolveConversationTarget` rather than
 * `conversation.name`: for a direct conversation the server sends the pair, and
 * each person has to be shown the other one.
 *
 * ## The mobile redesign
 *
 * What changed, and why each one:
 *
 *  - **Sections, as panels.** The list reads in the order it is needed: what
 *    is waiting on you, then by how long ago, under the notification list's
 *    own titles. Each section is one panel of ruled rows, and each row wears
 *    its thread's state the way a notification wears its kind — see
 *    `ConversationRow` and `@nw/features`' `inbox-kinds`, which web draws
 *    from too.
 *  - **Swipe to act.** Swipe a row right to mark it read; swipe left to open
 *    its details. Both were previously two taps and a screen away. See
 *    `components/swipeable-row.tsx` for why they snap back rather than latch.
 *  - **Filter, then search.** A row of pills for All / Unread / Groups, because
 *    "what have I not answered" is the question people open an inbox with. The
 *    search box only appears once there are enough conversations for scrolling
 *    to be the slower option.
 *  - **Pull to refresh**, which is where every phone user's hand goes first and
 *    which previously did nothing at all.
 *  - **The sender is named in the preview.** "You: see you then" is the line
 *    that tells you the ball is in their court without opening anything.
 */

/**
 * One cell of the list: a conversation and where it sits in its section.
 * Flattened rather than a `SectionList`, for the reason the notifications
 * screen gives.
 */
type Cell = {
  item: Conversation;
  place: RowPlace;
  /** The section title, on the first row of each section. */
  starts: string | null;
};

/** Below this, scrolling the list is faster than typing a name. */
const SEARCH_THRESHOLD = 8;

const keyExtractor = (cell: Cell) => cell.item.id;

/**
 * Two layers: the parallax host, which never re-renders, and the content,
 * which does. See `InboxParallax` for why they are separate.
 */
export default function InboxScreen() {
  return (
    <InboxParallax>
      <InboxContent />
    </InboxParallax>
  );
}

function InboxContent() {
  const theme = useAppTheme();
  // Deletions and exits since the last look (see `sync-chat.ts`).
  useReconcileInbox();
  const router = useRouter();
  const { novelist } = useSession();
  const { ids: unreadIds } = useUnreadConversations();
  const markRead = useMarkConversationRead();
  const prefetch = usePrefetchConversationMessages();
  const {
    conversations,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useConversations();
  // The pull spinner only for a pull, not for a background refetch.
  const pull = usePullToRefresh(refetch);

  const { count: groupCount } = useGroupCount();
  const support = useSupportConversation();
  const { iceBreakers, isPending: iceBreakersPending } = useIceBreakers();

  const [filter, setFilter] = useState<InboxFilter>("all");
  const [groupOpen, setGroupOpen] = useState(false);
  const [iceBreakerOpen, setIceBreakerOpen] = useState(false);
  const [viewingIceBreaker, setViewingIceBreaker] = useState<IceBreaker | null>(
    null,
  );
  const [search, setSearch] = useState("");

  /*
   * Resolved once per conversation *object*, not once per list change. Every
   * incoming message refetches the list; rebuilding each target then handed
   * every row a new object and re-rendered all of them through their `memo`.
   * The query keeps the object for a conversation that did not change, so its
   * target is found again here and the row is left alone.
   */
  const targetCache = useRef(
    new WeakMap<
      Conversation,
      { target: ReturnType<typeof resolveConversationTarget>; username?: string }
    >(),
  );
  const targets = useMemo(
    () =>
      new Map(
        conversations.map((conversation) => {
          const hit = targetCache.current.get(conversation);
          if (hit && hit.username === novelist?.username) {
            return [conversation.id, hit.target] as const;
          }
          const target = resolveConversationTarget(
            conversation,
            novelist?.username,
          );
          targetCache.current.set(conversation, {
            target,
            username: novelist?.username,
          });
          return [conversation.id, target] as const;
        }),
      ),
    [conversations, novelist?.username],
  );
  const unreadSet = useMemo(() => new Set(unreadIds), [unreadIds]);

  // Everyone visible in the list, so the green rings mean something. The server
  // only answers about usernames it has been asked about.
  useTrackOnline(
    useMemo(
      () => [...targets.values()].map((target) => target.username),
      [targets],
    ),
  );

  /**
   * The filter and the search, applied in that order.
   *
   * Both are client-side and both are honest about it: the list only holds the
   * pages that have been fetched, so a search finds what you can already scroll
   * to and nothing further back. A server-side conversation search would be the
   * right answer and there is no endpoint for one.
   */
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (
        !matchesInboxFilter(conversation, filter, unreadSet.has(conversation.id))
      ) {
        return false;
      }
      if (!query) return true;

      const target = targets.get(conversation.id);
      const name = (target?.name || conversation.name || "").toLowerCase();
      const username = (target?.username ?? "").toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [conversations, filter, search, targets, unreadIds]);

  const cells = useMemo<Cell[]>(
    () =>
      inboxSections(visible, (conversation) =>
        unreadSet.has(conversation.id),
      ).flatMap((section) =>
        section.items.map((item, index) => {
          const first = index === 0;
          const last = index === section.items.length - 1;
          return {
            item,
            place: first ? (last ? "only" : "first") : last ? "last" : "middle",
            starts: first ? section.title : null,
          };
        }),
      ),
    [unreadSet, visible],
  );

  const open = useCallback(
    (conversationId: string) => {
      router.push({
        params: { conversationId },
        pathname: "/(tabs)/(inbox)/[conversationId]",
      });
    },
    [router],
  );

  /**
   * Opens the conversation with the support account.
   *
   * A lookup rather than a create: support is an existing novelist and the
   * thread with them may already have history. If the account cannot be
   * resolved the failure is said out loud — silently doing nothing on a
   * "Contact support" button is the worst possible moment for a dead control.
   */
  const contactSupport = useCallback(async () => {
    const conversation = await support.mutateAsync().catch(() => null);
    if (!conversation) {
      Alert.alert(
        "Support unavailable",
        "We could not open the support conversation. Please try again.",
      );
      return;
    }
    open(conversation.id);
  }, [open, support]);

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  const openDetails = useCallback(
    (conversationId: string) => {
      router.push({
        params: { conversationId },
        pathname: "/(tabs)/(inbox)/[conversationId]/details",
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ index, item: cell }: { index: number; item: Cell }) => (
      <>
        {cell.starts ? (
          <View style={[styles.period, index > 0 && styles.periodNext]}>
            <Text style={[styles.headTitle, { color: theme.textGray }]}>
              {cell.starts}
            </Text>
            <View
              style={[styles.rule, { backgroundColor: theme.material.edge }]}
            />
          </View>
        ) : null}
        <ConversationRow
          conversation={cell.item}
          myUsername={novelist?.username}
          onMarkRead={markRead.mutate}
          onOpen={open}
          onOpenDetails={openDetails}
          onPrefetch={prefetch}
          place={cell.place}
          target={targets.get(cell.item.id)}
          unread={unreadSet.has(cell.item.id)}
        />
      </>
    ),
    [
      markRead.mutate,
      novelist?.username,
      open,
      openDetails,
      prefetch,
      targets,
      theme,
      unreadIds,
    ],
  );

  /*
   * The list's head: ice breakers, then a line that reads the room. The
   * sections title themselves, on their first row.
   *
   * The rail used to be pinned in the toolbar, between the search field and
   * the filters. Pinned, it held about a third of a 667pt screen whether or
   * not it was wanted, and the conversations scrolled in what was left. It is
   * the way to start a conversation, not a control over this list — so it
   * scrolls with the list, under a title that says what it is, and the
   * toolbar keeps only what acts on the rows: search and the filters.
   *
   * Hidden while searching, when the reader is after one conversation.
   */
  const header = useMemo(
    () => (
      <View style={styles.head}>
        {search ? null : (
          <>
            <View style={styles.headRow}>
              <Text style={[styles.headTitle, { color: theme.textGray }]}>
                Ice breakers
                {iceBreakers.length > 0 ? ` · ${iceBreakers.length}` : ""}
              </Text>
              <View
                style={[styles.rule, { backgroundColor: theme.material.edge }]}
              />
            </View>
            <IceBreakerRail
              iceBreakers={iceBreakers}
              isPending={iceBreakersPending}
              onCreate={() => setIceBreakerOpen(true)}
              onOpen={setViewingIceBreaker}
            />
          </>
        )}
        {conversations.length > 0 ? (
          <Text
            style={[
              styles.summary,
              search ? null : styles.headSecond,
              { color: theme.textGray },
            ]}
          >
            {inboxSummary(unreadIds.length, conversations.length)}
          </Text>
        ) : null}
      </View>
    ),
    [
      conversations.length,
      iceBreakers,
      iceBreakersPending,
      search,
      theme,
      unreadIds.length,
    ],
  );

  const showSearch = conversations.length >= SEARCH_THRESHOLD;

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.toolbar,
          {
            // The header's own surface: title, search and filters are one
            // bar with one edge, and the list passes under it.
            backgroundColor: theme.glass.opaque,
            borderBottomColor: theme.glass.edge,
          },
        ]}
      >

        {showSearch ? (
          <SearchField
            onChangeText={setSearch}
            placeholder="Search conversations"
            returnKeyType="search"
            value={search}
          />
        ) : null}

        <View style={styles.controlRow}>
          <View style={styles.filters}>
          {INBOX_FILTERS.map((entry) => {
            const active = entry.id === filter;
            const count =
              entry.id === "unread" ? unreadIds.length : undefined;

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={entry.id}
                onPress={() => setFilter(entry.id)}
                style={[
                  styles.filter,
                  {
                    backgroundColor: active
                      ? theme.accent.tintStrong
                      : theme.material.fill,
                    borderColor: active
                      ? theme.accent.surfaceHover
                      : theme.material.edge,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: active ? theme.accent.text : theme.textGray },
                  ]}
                >
                  {entry.label}
                </Text>
                {count ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.accent.solid },
                    ]}
                  >
                    <Text style={styles.badgeLabel}>{count}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
          </View>

          {/*
            The two things the inbox does besides open a conversation, sharing
            the filter row rather than taking one of their own. Icons, not
            labelled buttons: both are used rarely, and a labelled pair would
            cost the row the list needs on a 667pt screen.
          */}
          <ToolbarButton
            busy={false}
            icon="people-circle-outline"
            label="Create group"
            onPress={() => setGroupOpen(true)}
          />
          <ToolbarButton
            busy={support.isPending}
            icon="help-buoy-outline"
            label="Contact support"
            onPress={() => void contactSupport()}
          />
        </View>
      </View>

      <FlatList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={cells}
        ListHeaderComponent={header}
        // A screen and a half of rows first, not the default ten; each row is
        // a swipeable with a responder of its own.
        initialNumToRender={8}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListEmptyComponent={
          isPending && !error ? (
            // Ghost rows in the rows' own geometry, not a spinner: the
            // conversations land where the ghosts were.
            <ConversationSkeleton />
          ) : (
            <ListStatus
              empty={
                // The empty list means two different things and they need
                // different sentences: nothing here at all, or nothing
                // matching what you asked for.
                conversations.length === 0 ? (
                  <EmptyScene
                    scene="no-conversations"
                    subtitle="Connect with fellow novelists, or find a story to write together."
                    title="No conversations yet"
                  />
                ) : filter === "unread" ? (
                  <EmptyScene
                    scene="no-matches"
                    subtitle="You are all caught up."
                    title="Nothing unread"
                  />
                ) : (
                  <EmptyScene
                    scene="no-matches"
                    subtitle="Try a different name, or check the spelling."
                    title="No conversations match that"
                  />
                )
              }
              error={error}
              onRetry={refetch}
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.primary} size="small" />
            </View>
          ) : /*
               Only when the *unfiltered* list has genuinely run out. A filter
               works on what has already been loaded and deliberately does not
               page (see `onEndReached`), so "you have reached the end" under a
               filtered view would be claiming something nobody checked.
             */
            !hasNextPage && filter === "all" && !search && visible.length > 0 ? (
              <EndOfList />
            ) : null
        }
        onEndReached={() => {
          // Paging while a filter is on would fetch pages the filter then
          // hides, which looks like an infinite spinner. Only the full list
          // pages; a filtered view works on what has already been loaded.
          if (filter !== "all" || search) return;
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            colors={[theme.accent.solid]}
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
        renderItem={renderItem}
      />

      <CreateIceBreakerSheet
        onClose={() => setIceBreakerOpen(false)}
        visible={iceBreakerOpen}
      />

      <IceBreakerSheet
        iceBreaker={viewingIceBreaker}
        onClose={() => setViewingIceBreaker(null)}
        onReplied={open}
      />

      <CreateGroupSheet
        groupCount={groupCount}
        onClose={() => setGroupOpen(false)}
        onCreated={(conversation) => open(conversation.id)}
        visible={groupOpen}
      />
    </View>
  );
}

/** One of the inbox's two corner actions. */
const ToolbarButton = ({
  busy,
  icon,
  label,
  onPress,
}: {
  busy: boolean;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();

  return (
    <IconButton
      accessibilityLabel={label}
      busy={busy}
      color={theme.accent.text}
      hitSlop={space.xs}
      icon={icon}
      onPress={onPress}
      size={34}
      tone="surface"
    />
  );
};

const styles = StyleSheet.create({
  /* The rows carry their own padding; this exists only to be added to. */
  content: { paddingBottom: space.sm },
  controlRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeLabel: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  body: { flex: 1, gap: 3 },
  filter: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.s,
  },
  filterLabel: { fontSize: fontSize.caption, fontWeight: "500" },
  filters: { flex: 1, flexDirection: "row", gap: space.xs },
  footer: { padding: space.md },
  name: { flexShrink: 1, fontSize: fontSize.body },
  preview: { flex: 1, fontSize: fontSize.label },
  previewRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  screen: { flex: 1 },
  time: { fontSize: fontSize.caption },
  titleRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  head: {
    paddingBottom: space.m,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  headRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingBottom: space.m,
  },
  headSecond: { paddingTop: space.md },
  headTitle: type.eyebrow,
  period: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingBottom: space.ms,
    paddingHorizontal: space.md,
  },
  periodNext: { paddingTop: space.lg },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  summary: { fontSize: fontSize.label, lineHeight: 18 },
  toolbar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    paddingBottom: space.ms,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  unreadDot: { borderRadius: radius.xs, height: 8, width: 8 },
});
