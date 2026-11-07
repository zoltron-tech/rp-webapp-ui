import { Ionicons } from "@expo/vector-icons";
import { getReferredNovelists } from "@nw/api/endpoints/profile";
import { useApi, useSession } from "@nw/features";
import type { Friend } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { LoadMore } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { SearchField } from "@/components/search-field";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { WEB_URL } from "@/lib/links";
import { fullName } from "@/lib/names";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Your Circle — web's `/rp/profile/referrals`: the novelists who joined with
 * your link, and the link itself.
 */

/** Web's `PAGE_SIZE`. */
const PAGE_SIZE = 8;

const keyExtractor = (item: Friend) => item.id;

export default function ReferralsScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { novelist } = useSession();
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState(false);

  const query = useInfiniteQuery({
    getNextPageParam: (
      lastPage: Friend[],
      _all: Friend[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: ({ pageParam }): Promise<Friend[]> =>
      getReferredNovelists(api, pageParam, PAGE_SIZE) as Promise<Friend[]>,
    queryKey: ["referrals"],
  });

  const referrals = useMemo(
    () => (query.data?.pages ?? []).flat(),
    [query.data],
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return referrals;
    return referrals.filter((friend) =>
      `${fullName(friend)} ${friend.username}`.toLowerCase().includes(term),
    );
  }, [referrals, search]);

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => (
      <Pressable
        accessibilityRole="link"
        onPress={() =>
          router.dismissTo(
            {
              params: { username: item.username },
              pathname: "/(tabs)/(profile)/novelist/[username]",
            },
            { withAnchor: true },
          )
        }
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed
              ? theme.material.fillPressed
              : theme.material.fill,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Avatar
          image={item.avatar}
          name={item.firstName}
          size={44}
          uri={item.avatar?.src ?? item.image}
          username={item.username}
        />
        <View style={styles.names}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
              {fullName(item)}
            </Text>
            {item.isVerified ? (
              <Ionicons
                color={theme.accent.text}
                name="checkmark-circle"
                size={14}
              />
            ) : null}
          </View>
          <Text
            numberOfLines={1}
            style={[styles.handle, { color: theme.textGray }]}
          >
            @{item.username}
          </Text>
        </View>
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      </Pressable>
    ),
    [router, theme],
  );

  return (
    <View style={styles.fill}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.lg },
        ]}
        data={shown}
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          search.trim() ? (
            <Text style={[styles.empty, { color: theme.textGray }]}>
              No referrals match your search.
            </Text>
          ) : (
            <ListStatus
              empty="No one has joined with your referral link yet. Share it to grow your circle!"
              error={query.error}
              loading={query.isPending}
              onRetry={() => void query.refetch()}
            />
          )
        }
        ListFooterComponent={
          hasNextPage && !search.trim() ? (
            <LoadMore
              busy={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
            />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View
              style={[
                styles.info,
                {
                  backgroundColor: theme.accent.tint,
                  borderColor: theme.accent.surfaceHover,
                },
              ]}
            >
              <Ionicons color={theme.accent.text} name="people" size={22} />
              <View style={styles.infoText}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>
                  Grow your circle
                </Text>
                <Text style={[styles.infoBody, { color: theme.textGray }]}>
                  Novelists who join using your referral link show up here.
                  Invite more to grow your circle.
                </Text>
              </View>
              {referrals.length > 0 ? (
                <View style={styles.count}>
                  <Text style={[styles.countValue, { color: theme.text }]}>
                    {referrals.length}
                    {hasNextPage ? "+" : ""}
                  </Text>
                  <Text style={[styles.countLabel, { color: theme.textGray }]}>
                    Recruited
                  </Text>
                </View>
              ) : null}
            </View>
            <Button
              icon="person-add-outline"
              label="Invite Friends"
              onPress={() => setInviting(true)}
              variant="primary"
            />
            {referrals.length > 0 ? (
              <SearchField
                onChangeText={setSearch}
                placeholder="Search referrals..."
                value={search}
              />
            ) : null}
          </View>
        }
        renderItem={renderItem}
      />

      <InviteSheet
        onClose={() => setInviting(false)}
        username={novelist?.username}
        visible={inviting}
      />
    </View>
  );
}

/** Web's `InviteFriendsDialog`: your link, to copy or send. */
const InviteSheet = ({
  onClose,
  username,
  visible,
}: {
  onClose: () => void;
  username: string | undefined;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url = username
    ? `${WEB_URL}/rp/login?referralUser=${encodeURIComponent(username)}&register=1`
    : "";

  const copy = async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BottomSheet
      ignoreKeyboard
      onClose={onClose}
      subtitle="Anyone who signs up with this link joins your circle."
      title="Invite Friends"
      visible={visible}
    >
      <View style={styles.sheet}>
        <View
          style={[
            styles.linkBox,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text numberOfLines={1} style={[styles.link, { color: theme.text }]}>
            {url.replace(/^https?:\/\//, "")}
          </Text>
        </View>
        <View style={styles.sheetActions}>
          <Button
            icon={copied ? "checkmark" : "copy-outline"}
            label={copied ? "Copied" : "Copy link"}
            onPress={() => void copy()}
            stretch
          />
          <Button
            icon="share-outline"
            label="Share"
            onPress={() => void Share.share({ message: url })}
            stretch
            variant="primary"
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: { gap: space.sm, padding: space.md },
  count: { alignItems: "center" },
  countLabel: { fontSize: fontSize.meta },
  countValue: { fontSize: fontSize.title, fontWeight: "700" },
  empty: { fontSize: fontSize.body, padding: space.md, textAlign: "center" },
  fill: { flex: 1 },
  handle: { fontSize: fontSize.caption },
  header: { gap: space.m, marginBottom: space.sm },
  info: {
    alignItems: "center",
    borderRadius: radius.card,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    padding: space.m,
  },
  infoBody: { fontSize: fontSize.caption, lineHeight: 17 },
  infoText: { flex: 1, gap: space.xxs },
  infoTitle: { fontSize: fontSize.body, fontWeight: "700" },
  link: { fontSize: fontSize.label },
  linkBox: {
    borderRadius: radius.field,
    borderWidth: border.edge,
    padding: space.m,
  },
  name: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "600" },
  nameRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  names: { flex: 1, minWidth: 0 },
  row: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    padding: space.sm,
  },
  sheet: { gap: space.m, paddingBottom: space.lg, paddingHorizontal: space.md },
  sheetActions: { flexDirection: "row", gap: space.sm },
});
