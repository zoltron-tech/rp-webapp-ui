import { getReactionLikers } from "@nw/api/endpoints/novelists";
import { queryKeys, useApi } from "@nw/features";
import type { Friend } from "@nw/types";
import { pluralize } from "@nw/utils";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { NovelistRowSkeleton, SkeletonRows } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { NovelistRow } from "@/components/novelist-row";
import { BottomSheet } from "@/components/sheet";
import { space } from "@/theme";

/**
 * Who liked this — web's `ReactionLikersDialog`, as a tray.
 *
 * The same endpoint (`GET /react/:id/likers`, twelve a page) and the same
 * rows: each novelist with the button their connection to you calls for —
 * Add, Pending, accept/decline, or Message. Web draws those rows itself;
 * here they are `NovelistRow`, the row the friends list is already made of,
 * so a person looks the same whether you found them under a post or in a
 * list of friends. Its button writes through `useConnectionAction`, which
 * patches this list's cache entry as it does every friends page — so an
 * "Add" tapped here becomes "Pending" without a refetch, and stays that way
 * when the same person is opened from somewhere else.
 *
 * ## One sheet per screen
 *
 * Owned by the feed and given a target, rather than mounted inside every
 * card: a modal inside every cell of a recycling list is a modal mounted
 * forty times. `targetId` null is closed; the query is keyed on it and only
 * runs while it is set.
 *
 * ## Why the count comes in as a prop
 *
 * Web's dialog shows the count in its header before the list has loaded,
 * from the heart it was opened from. Same here: the subtitle is right on the
 * first frame, and the list catches up.
 */

/** Web's `PAGE_SIZE` in `ReactionLikersDialog`. */
const PAGE_SIZE = 12;

const keyExtractor = (item: Friend) => item.id;

const Separator = () => <View style={styles.separator} />;

export const LikersSheet = ({
  count,
  onClose,
  targetId,
}: {
  /** The count already on the heart, for the header. */
  count: number;
  onClose: () => void;
  /** The reaction target. `null` keeps the sheet closed. */
  targetId: string | null;
}) => {
  const api = useApi();
  const router = useRouter();

  const query = useInfiniteQuery({
    enabled: targetId !== null,
    getNextPageParam: (
      lastPage: Friend[],
      _all: Friend[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getReactionLikers(api, targetId ?? "", pageParam, PAGE_SIZE),
    queryKey: queryKeys.reactionLikers(targetId ?? ""),
  });

  const likers = useMemo(() => (query.data?.pages ?? []).flat(), [query.data]);

  // Off the sheet and onto the profile: the sheet closes first so the profile
  // is not pushed behind a modal that would still be covering it.
  const openProfile = useCallback(
    (username: string) => {
      onClose();
      router.push({
        params: { username },
        pathname: "/novelist/[username]",
      });
    },
    [onClose, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => (
      <NovelistRow novelist={item} onOpen={openProfile} />
    ),
    [openProfile],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.8}
      onClose={onClose}
      subtitle={
        count > 0
          ? `${count} ${pluralize("novelist", count)} ${count === 1 ? "likes" : "like"} this`
          : undefined
      }
      title="Likes"
      visible={targetId !== null}
    >
      <FlashList
        contentContainerStyle={styles.content}
        data={likers}
        ItemSeparatorComponent={Separator}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty="Nobody yet."
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
            skeleton={
              <SkeletonRows count={6} render={() => <NovelistRowSkeleton />} />
            }
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerGhost}>
              <NovelistRowSkeleton />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: { paddingBottom: space.lg, paddingHorizontal: space.md },
  footerGhost: { paddingTop: space.sm },
  separator: { height: space.sm },
});
