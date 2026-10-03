import { Ionicons } from "@expo/vector-icons";
import { resolveConversationTarget } from "@nw/chat";
import {
  useConversations,
  useMarkConversationRead,
  usePrefetchConversationMessages,
  useSession,
  useUnreadConversations,
} from "@nw/features";
import type { Conversation, IceBreaker } from "@nw/types";
import { useRouter } from "expo-router";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ConversationRow } from "@/components/chat/conversation-row";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { CreateGroupSheet } from "@/components/chat/create-group-sheet";
import { CreateIceBreakerSheet } from "@/components/chat/create-ice-breaker-sheet";
import { IceBreakerRail } from "@/components/chat/ice-breaker-rail";
import { IceBreakerSheet } from "@/components/chat/ice-breaker-sheet";
import { EndOfList } from "@/components/end-of-list";
import { ListStatus } from "@/components/list-status";
import { useTrackOnline } from "@/context/socket";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import {
  useGroupCount,
  useSupportConversation,
} from "@/hooks/use-inbox-actions";
import { InboxParallax } from "@/context/inbox-reveal";
import { useIceBreakers } from "@/hooks/use-ice-breakers";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { fontSize, radius, space, useAppTheme } from "@/theme";

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
 *  - **Rows, not cards.** Every row used to be a bordered card in a padded
 *    list, which is four spacing decisions per conversation and about seven
 *    rows on a 667pt screen. Full-bleed rows with a hairline between them fit
 *    nine and read as a list rather than as a feed.
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

type Filter = "all" | "unread" | "groups";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
];

/** Below this, scrolling the list is faster than typing a name. */
const SEARCH_THRESHOLD = 8;

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

  const [filter, setFilter] = useState<Filter>("all");
  const [groupOpen, setGroupOpen] = useState(false);
  const [iceBreakerOpen, setIceBreakerOpen] = useState(false);
  const [viewingIceBreaker, setViewingIceBreaker] = useState<IceBreaker | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const targets = useMemo(
    () =>
      new Map(
        conversations.map((conversation) => [
          conversation.id,
          resolveConversationTarget(conversation, novelist?.username),
        ]),
      ),
    [conversations, novelist?.username],
  );

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
      if (filter === "unread" && !unreadIds.includes(conversation.id)) {
        return false;
      }
      if (filter === "groups" && !conversation.isGroup) return false;
      if (!query) return true;

      const target = targets.get(conversation.id);
      const name = (target?.name || conversation.name || "").toLowerCase();
      const username = (target?.username ?? "").toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [conversations, filter, search, targets, unreadIds]);

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
    ({ item }: { item: Conversation }) => (
      <ConversationRow
        conversation={item}
        myUsername={novelist?.username}
        onMarkRead={markRead.mutate}
        onOpen={open}
        onOpenDetails={openDetails}
        onPrefetch={prefetch}
        target={targets.get(item.id)}
        unread={unreadIds.includes(item.id)}
      />
    ),
    [
      markRead.mutate,
      novelist?.username,
      open,
      openDetails,
      prefetch,
      targets,
      unreadIds,
    ],
  );

  const showSearch = conversations.length >= SEARCH_THRESHOLD;

  return (
    <View style={styles.screen}>
      <View
        style={[styles.toolbar, { borderBottomColor: theme.material.edge }]}
      >

        {showSearch ? (
          <View
            style={[
              styles.search,
              {
                backgroundColor: theme.glass.field,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color={theme.textGray} name="search" size={16} />
            <TextInput
              autoCorrect={false}
              onChangeText={setSearch}
              placeholder="Search conversations"
              placeholderTextColor={theme.textGray}
              returnKeyType="search"
              style={[styles.searchInput, { color: theme.text }]}
              value={search}
            />
            {search ? (
              <Pressable
                accessibilityLabel="Clear search"
                hitSlop={space.sm}
                onPress={() => setSearch("")}
              >
                <Ionicons
                  color={theme.textGray}
                  name="close-circle"
                  size={16}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/*
          Between the search field and the filters, not below them.

          The pills filter the list underneath; a rail sitting between a filter
          and the thing it filters reads as though "Unread" applies to the
          prompts. Above them it is plainly its own row — and it is the only way
          to start a conversation with someone you had not thought of, so it
          belongs where the eye lands before the familiar names below.
        */}
        <IceBreakerRail
          iceBreakers={iceBreakers}
          isPending={iceBreakersPending}
          onCreate={() => setIceBreakerOpen(true)}
          onOpen={setViewingIceBreaker}
        />

        <View style={styles.controlRow}>
          <View style={styles.filters}>
          {FILTERS.map((entry) => {
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
                      ? theme.accent.surface
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
        data={visible}
        keyExtractor={(item) => item.id}
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
                conversations.length === 0
                  ? "No conversations yet."
                  : filter === "unread"
                    ? "Nothing unread. You are all caught up."
                    : "No conversations match that."
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
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={busy}
      hitSlop={space.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={theme.accent.text} size="small" />
      ) : (
        <Ionicons color={theme.accent.text} name={icon} size={18} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
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
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
  },
  filterLabel: { fontSize: fontSize.caption, fontWeight: "700" },
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
    paddingVertical: space.sm + 2,
  },
  screen: { flex: 1 },
  search: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.body, paddingVertical: space.sm },
  time: { fontSize: fontSize.caption },
  titleRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  toolbar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  unreadDot: { borderRadius: 4, height: 8, width: 8 },
});
