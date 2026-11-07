import { useGlobalState } from "@nw/store";
import { useNovelistFriends } from "@nw/features";
import type { Friend } from "@nw/types";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { EndOfList } from "@/components/end-of-list";
import { NovelistRowSkeleton, SkeletonRows } from "@/components/list-skeletons";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { NovelistRow, ROW_HEIGHT } from "@/components/novelist-row";
import { SearchField } from "@/components/search-field";
import { useTrackOnline } from "@/context/socket";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { fontSize, space, useAppTheme } from "@/theme";
import { LoadMore, RowSeparator } from "@/components/list-parts";

/**
 * Everyone a novelist is friends with.
 *
 * A component rather than a screen, because it is mounted from two places: the
 * Home tab, for somebody else's friends, and the Profile tab, for your own. The
 * route files are thin; the list is this.
 *
 * Paged through `useNovelistFriends`, which the web friends page now renders
 * from as well — so the page size and the "is there more" rule are decided
 * once. The endpoint returns a bare array with no total, and inferring the end
 * of the list from a short page is exactly the kind of rule that goes subtly
 * wrong when two clients each work it out for themselves.
 *
 * The search box is web's: it filters the pages already loaded, because the
 * endpoint has no search of its own. Load more stays on offer while searching,
 * since the person being looked for may be on a page not fetched yet.
 *
 * Paging is a **button as well as** an `onEndReached`. The scroll trigger alone
 * is unreliable here: a page often does not fill a tall screen, so there is
 * nothing to scroll and the callback never fires — the list simply looks like
 * it ends. Web has always had an explicit "Load more" for the same reason, and
 * the button is the honest control; the scroll trigger is the convenience on
 * top of it.
 *
 * ## Why this list recycles and the leaderboard does not
 *
 * A leaderboard row is four `Text`s and a face. A friend row carries a banner
 * image, a gradient, badge crests, a stack of muse faces and a button wired to
 * the API — an order of magnitude more work per cell.
 *
 * `FlatList` is not a recycler. A cell that scrolls past `windowSize` is
 * *unmounted*, and scrolling back up mounts a new one from nothing: a new
 * native image view, a new gradient, new badge crests, a new set of hooks. That
 * is what made a scroll-back visibly rebuild itself row by row, and no amount
 * of tuning `windowSize` fixes it — a bigger window only moves where the
 * rebuilding starts.
 *
 * `FlashList` keeps a pool of mounted cells and re-binds props into them, which
 * is what `RecyclerView` and `UICollectionView` have always done and what makes
 * a native feed scroll the way it does. A row returning to the viewport is a
 * prop update, not a mount.
 *
 * Recycling has one hard requirement, and it is the reason `NovelistRow` holds
 * no state: a recycled cell keeps whatever state it had and binds it to the
 * next novelist. Every mutable fact on that row lives in the query cache.
 */

/**
 * How far beyond the viewport to keep cells drawn, in dp.
 *
 * The default is 250 — about three rows. Roughly a screen and a half of rows
 * means a fast flick is scrolling over cells that are already bound rather than
 * over blanks, which is the *visible* half of "loaded once". Cells beyond it are
 * recycled, not destroyed, so the cost of a larger distance is bounded.
 */
const DRAW_DISTANCE = ROW_HEIGHT * 8;

/**
 * Fetch the next page a screen and a half early.
 *
 * `onEndReachedThreshold` is measured in screen lengths, so 1.5 puts page N+1
 * in flight while the reader is still somewhere in the middle of page N. The
 * request is the slow part — ten queries and two cross-service hops inside
 * `enrichNovelistOverviews` — so starting it at the *end* of the list is
 * starting it too late to hide.
 */
const END_REACHED_THRESHOLD = 1.5;

export const FriendsList = ({ username }: { username: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const {
    error,
    fetchNextPage,
    friends,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
    trackedUsernames,
  } = useNovelistFriends(username);
  // Whose list this is decides what the empty state says.
  const own = useGlobalState("novelist")?.username === username;

  const [search, setSearch] = useState("");
  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return friends;
    return friends.filter((friend) =>
      `${friend.firstName ?? ""} ${friend.lastName ?? ""} ${friend.username}`
        .toLowerCase()
        .includes(needle),
    );
  }, [friends, search]);

  // The server answers only about usernames it has been asked for, so a face
  // that is not registered here renders offline whether or not it is.
  useTrackOnline(trackedUsernames);

  const openProfile = useCallback(
    (handle: string) =>
      router.push({
        params: { username: handle },
        pathname: "/novelist/[username]",
      }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => (
      <NovelistRow novelist={item} onOpen={openProfile} />
    ),
    [openProfile],
  );

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  return (
    // FlashList v2 does not take a `style`, so the page colour is the wrapper's.
    <View style={styles.fill}>
      <FlashList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={shown}
        drawDistance={DRAW_DISTANCE}
        // `contentContainerStyle` has no `gap` in FlashList — the space between
        // rows is a separator, which is also what keeps `ROW_HEIGHT` the whole
        // truth about a cell.
        ItemSeparatorComponent={RowSeparator}
        keyExtractor={keyExtractor}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          friends.length > 0 ? (
            <View style={styles.search}>
              <SearchField
                onChangeText={setSearch}
                placeholder="Search friends"
                value={search}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          search.trim() ? (
            <Text style={[styles.noMatch, { color: theme.textGray }]}>
              No friend by that name among those loaded.
            </Text>
          ) : (
            <ListStatus
              empty={
                <EmptyScene
                  scene="no-friends"
                  subtitle={
                    own
                      ? "Novelists you connect with will show up here."
                      : `${username} hasn't connected with anyone yet.`
                  }
                  title="No friends yet"
                />
              }
              error={error}
              loading={isPending}
              onRetry={refetch}
              skeleton={
                <SkeletonRows
                  count={8}
                  render={() => <NovelistRowSkeleton />}
                />
              }
            />
          )
        }
        ListFooterComponent={
          hasNextPage ? (
            <LoadMore
              busy={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
            />
          ) : friends.length > 0 ? (
            <EndOfList />
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        renderItem={renderItem}
      />
    </View>
  );
};

const keyExtractor = (item: Friend) => item.id;

const styles = StyleSheet.create({
  noMatch: { fontSize: fontSize.body, padding: space.lg, textAlign: "center" },
  search: { paddingBottom: space.sm },
  content: { padding: space.md },
  fill: { flex: 1 },
});
