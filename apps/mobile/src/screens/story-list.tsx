import { useSession } from "@nw/features";
import type { StoryBoard } from "@nw/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { ActionMenu } from "@/components/action-menu";
import { EmptyScene } from "@/components/empty-feed";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { ListStatus } from "@/components/list-status";
import { PillButton } from "@/components/settings";
import { StoryEditor } from "@/components/story/story-editor";
import {
  StoryCoverCard,
  StoryCoverCardShimmer,
} from "@/components/story-cover-card";
import { Text } from "@/components/text";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useNovelistStories, useStoryWrite } from "@/hooks/use-story-edit";
import { useOffline } from "@/lib/connectivity";
import { isStoryMember } from "@/lib/story";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Every story a novelist created or co-writes — web's
 * `/rp/profile/[handle]/storyboards`.
 *
 * A component rather than a screen, as the muse list is: the Profile tab
 * mounts it for your own stories, any other tab for somebody else's, so that
 * opening your own shelf lights Profile rather than Home.
 *
 * The same shelf as the library — two columns of `StoryCoverCard` — with
 * what web's page adds on your own: how much of the plan is used and the
 * way to a new story. Web counts only the stories *you created* against the
 * limit, since a co-authored one is the creator's to pay for, and so does
 * this.
 *
 * A card opens its story. On a story you write, a long press opens the
 * menu — edit, and for its author delete — so a shelf of your own is not
 * two taps from every change. The story page has the same menu under `⋯`.
 */

const COLUMNS = 2;
const GUTTER = space.sm + 4;

type ListedStory = StoryBoard & { id: string };
interface Placeholder {
  id: string;
  placeholder: true;
}
type Item = ListedStory | Placeholder;

const PLACEHOLDERS: Placeholder[] = Array.from({ length: 4 }, (_, index) => ({
  id: `placeholder-${index}`,
  placeholder: true,
}));

const listed = (story: StoryBoard): story is ListedStory => Boolean(story.id);
const keyExtractor = (item: Item) => item.id;

export const StoryList = ({ username }: { username: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const offline = useOffline();
  const { width } = useWindowDimensions();
  const { novelist } = useSession();
  const write = useStoryWrite();
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  const query = useNovelistStories(username);
  const stories = useMemo(
    () => (query.data ?? []).filter(listed),
    [query.data],
  );
  const pull = usePullToRefresh(() => query.refetch());

  const isOwn = novelist?.username === username;
  // Limits are the creator's: co-authored stories are not yours to count.
  const ownCount = stories.filter(
    (story) => story.createdBy?.username === username,
  ).length;
  const limit = novelist?.tier?.storyBoardLimit ?? 0;
  const atLimit = isOwn && ownCount >= limit;

  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );
  const showLikers = useCallback(
    (storyId: string, count: number) => setLikers({ count, id: storyId }),
    [],
  );

  /** The editor: closed, a new story (`story: null`), or an edit. */
  const [editing, setEditing] = useState<{ story: StoryBoard | null } | null>(
    null,
  );
  const [menuFor, setMenuFor] = useState<ListedStory | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const create = () => {
    if (atLimit) {
      Alert.alert(
        "Story limit reached",
        `You've reached your plan's limit of ${limit} stories. Upgrade your tier or remove a story to create a new one.`,
      );
      return;
    }
    setEditing({ story: null });
  };

  const confirmDelete = (story: ListedStory) =>
    Alert.alert(
      `Delete ${story.name}?`,
      "This permanently removes the story, its chapters and all threads. Are you sure?",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const ok = await write.deleteStory(story.id);
            if (!ok) {
              Alert.alert(
                "Could not delete",
                "The story was not deleted. Please try again.",
              );
            }
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );

  const cellWidth = (width - GUTTER * (COLUMNS + 1)) / COLUMNS;
  const me = novelist?.username;

  const renderItem = useCallback(
    ({ item }: { item: Item }) =>
      "placeholder" in item ? (
        <View style={{ width: cellWidth }}>
          <StoryCoverCardShimmer />
        </View>
      ) : (
        <Pressable
          accessibilityHint={
            isStoryMember(item, me) ? "Long press for options" : undefined
          }
          accessibilityLabel={item.name}
          accessibilityRole="link"
          onLongPress={
            isStoryMember(item, me)
              ? () => {
                  setMenuFor(item);
                  setMenuVisible(true);
                }
              : undefined
          }
          onPress={() =>
            router.push({
              params: { storyId: item.id },
              pathname: "/story/[storyId]",
            })
          }
          style={({ pressed }) => [
            { width: cellWidth },
            pressed && styles.pressed,
          ]}
        >
          <StoryCoverCard onShowLikers={showLikers} story={item} />
        </Pressable>
      ),
    [cellWidth, me, router, showLikers],
  );

  const menuIsCreator = menuFor?.createdBy?.username === me;

  return (
    <View style={styles.fill}>
      <FlatList<Item>
        columnWrapperStyle={styles.row}
        contentContainerStyle={contentStyle}
        data={query.isPending && !offline ? PLACEHOLDERS : stories}
        initialNumToRender={6}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              <EmptyScene
                scene="blank-storyboard"
                subtitle={
                  isOwn
                    ? "Start a story and your chapters will show up here."
                    : `@${username} hasn't started any stories yet.`
                }
                title="No stories yet"
              />
            }
            error={query.error}
            loading={query.isPending}
            offlineWhat="generic"
            onRetry={() => void query.refetch()}
          />
        }
        ListHeaderComponent={
          isOwn ? (
            <View style={styles.createBar}>
              <Text style={[styles.createCount, { color: theme.textGray }]}>
                {ownCount} / {limit} stories
              </Text>
              <PillButton
                icon="add"
                label="New story"
                onPress={create}
                tone="accent"
              />
            </View>
          ) : null
        }
        numColumns={COLUMNS}
        {...tabBarScroll}
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
        renderItem={renderItem}
        windowSize={7}
      />

      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />

      <ActionMenu
        items={[
          {
            icon: "create-outline",
            label: "Edit story",
            onSelect: () => {
              if (menuFor) setEditing({ story: menuFor });
            },
          },
          ...(menuIsCreator
            ? [
                { separator: true },
                {
                  icon: "trash-outline" as const,
                  label: "Delete story",
                  onSelect: () => {
                    if (menuFor) confirmDelete(menuFor);
                  },
                  variant: "danger" as const,
                },
              ]
            : []),
        ]}
        onClose={() => setMenuVisible(false)}
        subtitle={menuFor?.name}
        title="Story"
        visible={menuVisible}
      />

      {editing ? (
        <StoryEditor
          onClose={() => setEditing(null)}
          onSaved={() => undefined}
          story={editing.story}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  content: { gap: GUTTER, paddingHorizontal: GUTTER, paddingTop: space.sm },
  createBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.xs,
  },
  createCount: { fontSize: fontSize.body },
  fill: { flex: 1 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  row: { gap: GUTTER },
});
