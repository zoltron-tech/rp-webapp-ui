import { Ionicons } from "@expo/vector-icons";
import { getMyBadges, syncMyBadges } from "@nw/api/endpoints/badges";
import { queryKeys, useApi } from "@nw/features";
import type { Badge } from "@nw/types/badge";
import { toFormattedDate } from "@nw/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { BadgeCrest } from "@/components/badges";
import { BadgeShelfSkeleton } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Every badge there is — earned first, then the ones still to come.
 *
 * The native counterpart to `apps/web/src/app/rp/profile/badges`. The endpoint
 * answers the whole catalogue rather than only what has been earned, which is
 * the point of the screen: a shelf of twelve with four filled in tells you what
 * to go and do, and a list of four tells you nothing.
 *
 * ## It is the signed-in novelist's own, always
 *
 * `GET /badge` answers for the caller. There is no endpoint for "somebody
 * else's full catalogue" — a profile carries the badges it carries, and that is
 * what the row on it shows. So opening this from another novelist's profile
 * would answer with *your* shelf under their name, which is why the row there
 * does not link here: see `novelist-profile.tsx`.
 *
 * ## Why opening it is a write
 *
 * The backend re-evaluates the badge rules on this call, throttled. Opening the
 * shelf is normally what notices a badge has just been earned, so the screen is
 * also the refresh — and the pull-to-refresh button forces it past the throttle,
 * for the case where somebody has just done the thing and is watching for the
 * badge.
 */

/** Two across. Three at 375pt leaves each crest too small to be worth drawing. */
const COLUMNS = 2;

/** Big enough to be artwork rather than an icon, and to clear DETAIL_THRESHOLD. */
const CREST = 76;

export const BadgeShelf = () => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: () => getMyBadges(api),
    queryKey: queryKeys.myBadges(),
  });

  const sync = useMutation({
    mutationFn: () => syncMyBadges(api),
    onSuccess: (badges) => {
      // The sync answers with the refreshed catalogue, so the list is written
      // straight back rather than invalidated into a second request.
      queryClient.setQueryData(queryKeys.myBadges(), badges);
    },
  });

  const badges = query.data ?? [];

  const earned = useMemo(
    () => badges.filter((badge) => badge.earned).length,
    [badges],
  );

  const renderItem = useCallback(
    ({ item }: { item: Badge }) => <BadgeTile badge={item} />,
    [],
  );

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  return (
    <View style={styles.fill}>
      <FlatList
        {...tabBarScroll}
        columnWrapperStyle={styles.column}
        contentContainerStyle={contentStyle}
        data={badges}
        keyExtractor={(item) => item.code}
        ListEmptyComponent={
          <ListStatus
            empty="No badges to show."
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
            skeleton={<BadgeShelfSkeleton />}
          />
        }
        ListHeaderComponent={
          badges.length > 0 ? (
            <View style={styles.header}>
              <Text style={[styles.count, { color: theme.text }]}>
                {earned} of {badges.length} earned
              </Text>

              <Pressable
                accessibilityLabel="Check for new badges"
                accessibilityRole="button"
                accessibilityState={{ busy: sync.isPending }}
                disabled={sync.isPending}
                hitSlop={space.sm}
                onPress={() => sync.mutate()}
                style={({ pressed }) => [
                  styles.refresh,
                  {
                    backgroundColor: pressed
                      ? theme.material.fillPressed
                      : theme.material.fill,
                    borderColor: theme.material.edge,
                    opacity: sync.isPending ? 0.6 : 1,
                  },
                ]}
              >
                <Ionicons
                  color={theme.textGray}
                  name="refresh-outline"
                  size={14}
                />
                <Text style={[styles.refreshLabel, { color: theme.textGray }]}>
                  {sync.isPending ? "Checking…" : "Check again"}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        numColumns={COLUMNS}
        renderItem={renderItem}
      />
    </View>
  );
};

/**
 * One badge on the shelf.
 *
 * A locked badge draws the same crest drained of colour rather than a padlock
 * or a gap — `muted` is what the artwork was built for, and the point of it is
 * that the badge you are working towards is recognisably the one you get. Its
 * requirement replaces the description, because "what earns this" is the only
 * question a locked badge raises.
 */
const BadgeTile = ({ badge }: { badge: Badge }) => {
  const theme = useAppTheme();
  const locked = !badge.earned;

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: theme.material.fill,
          borderColor: locked
            ? theme.material.edge
            : theme.accent.surfaceHover,
        },
      ]}
    >
      {/*
        Locked crests hold still. Motion is what says "this is yours" on a
        shelf where most of the tiles are grey, and a locked badge breathing
        alongside an earned one says the opposite.
      */}
      <BadgeCrest
        animated={!locked}
        code={badge.code}
        muted={locked}
        size={CREST}
      />

      <Text
        numberOfLines={2}
        style={[styles.title, { color: locked ? theme.textGray : theme.text }]}
      >
        {badge.title}
      </Text>

      <Text numberOfLines={3} style={[styles.body, { color: theme.textGray }]}>
        {locked ? badge.requirement : badge.description}
      </Text>

      {badge.earned && badge.awardedAt ? (
        <Text style={[styles.awarded, { color: theme.accent.text }]}>
          {toFormattedDate(badge.awardedAt)}
        </Text>
      ) : (
        <Text style={[styles.awarded, { color: theme.textGray }]}>Locked</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  awarded: { fontSize: fontSize.meta, fontWeight: "700" },
  body: { fontSize: fontSize.caption, lineHeight: 16, textAlign: "center" },
  column: { gap: space.ms },
  content: { gap: space.ms, padding: space.md },
  count: { fontSize: fontSize.body, fontWeight: "700" },
  fill: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: space.xs,
  },
  refresh: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    minHeight: 32,
    paddingHorizontal: space.ms,
  },
  refreshLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  tile: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flex: 1,
    gap: space.s,
    padding: space.m,
  },
  title: { fontSize: fontSize.label, fontWeight: "700", textAlign: "center" },
});
