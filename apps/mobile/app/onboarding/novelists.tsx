import type { Friend, Novelist } from "@nw/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/button";
import { useFriendSuggestions } from "@/components/home/novelist-rail";
import { NovelistRowSkeleton, SkeletonRows } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { NovelistRow } from "@/components/novelist-row";
import { Text } from "@/components/text";
import { dedupeById } from "@/lib/feed";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * The last step: people.
 *
 * Web's welcome page sends a skip to "Fellows", the page of novelists to
 * befriend. The same list — the server's suggestions, paged — as the rows
 * the friends list is made of, each with its Add button, so a first friend
 * request is one tap and the row says "Requested" without a refetch. Done
 * opens the app; so does Skip, in the corner where every onboarding puts it,
 * which is the same move with a different number of requests behind it.
 *
 * Not the `AuthScreen` shell: a list needs the whole height, and a scroll
 * view inside a scroll view is the one layout that cannot work. The heading
 * is drawn in the list's header instead.
 */

/** The row wants a `Friend`; a suggestion is a `Novelist` with one count missing. */
const asFriend = (novelist: Novelist): Friend => ({
  ...novelist,
  mutualFriendCount: 0,
});

export default function OnboardingNovelistsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useFriendSuggestions();

  const people = useMemo(
    () => dedupeById(query.data?.pages ?? []).map(asFriend),
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const done = () => router.replace("/(tabs)/(home)");
  const openProfile = useCallback(
    (username: string) =>
      router.push({ params: { username }, pathname: "/novelist/[username]" }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => (
      <NovelistRow novelist={item} onOpen={openProfile} />
    ),
    [openProfile],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.lg },
        ]}
        data={people}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          query.isPending ? (
            <SkeletonRows count={6} render={() => <NovelistRowSkeleton />} />
          ) : (
            <ListStatus
              empty="Nobody to suggest just yet. You'll find novelists on the Explore tab."
              error={query.error}
              loading={false}
              onRetry={() => void query.refetch()}
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={theme.accent.text}
              style={styles.footer}
            />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.intro}>
            <Pressable
              accessibilityRole="button"
              hitSlop={space.sm}
              onPress={done}
              style={styles.skip}
            >
              <Text style={[styles.skipLabel, { color: theme.accent.text }]}>
                Skip
              </Text>
            </Pressable>
            <Text style={[styles.title, { color: theme.text }]}>
              Find your people
            </Text>
            <Text style={[styles.subtitle, { color: theme.textGray }]}>
              Novelists you might like to write with. Add a few now, or find
              them later on Explore.
            </Text>
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        renderItem={renderItem}
      />

      <View
        style={[
          styles.foot,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.material.edge,
            paddingBottom: insets.bottom + space.md,
          },
        ]}
      >
        <Button
          label="Done — take me in"
          onPress={done}
          size="lg"
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.lg, paddingHorizontal: space.md },
  foot: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  footer: { paddingVertical: space.md },
  intro: { gap: space.xs, paddingBottom: space.md, paddingHorizontal: space.sm },
  root: { flex: 1 },
  skip: { alignSelf: "flex-end", paddingVertical: space.xs },
  skipLabel: { fontSize: fontSize.label, fontWeight: "700" },
  subtitle: { fontSize: fontSize.label, lineHeight: 19 },
  title: { fontSize: fontSize.display, fontWeight: "700", lineHeight: 34 },
});
