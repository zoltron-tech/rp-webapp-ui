import { getStrangerNovelists } from "@nw/api/endpoints/home";
import { queryKeys, useApi, useNotifications, useSession } from "@nw/features";
import type { Novelist } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import {
  NovelistCard,
  type NovelistCardPerson,
  NovelistCardShimmer,
} from "@/components/home/novelist-card";
import { RAIL_GAP, RAIL_PAD, useRailSnap } from "@/components/home/rail-snap";
import { SectionHeader } from "@/components/home/section-header";
import { OfflineNotice } from "@/components/offline";
import { ShareProfileSheet } from "@/components/share/share-profile-sheet";
import { type Connection, useConnectionAction } from "@/hooks/use-connection";
import { useOffline } from "@/lib/connectivity";
import { dedupeById } from "@/lib/feed";
import { space, useAppTheme } from "@/theme";

/**
 * Web's "Friend suggestions" rail.
 *
 * Two sources, in web's order: friend requests waiting on you first, read off
 * the notifications the app already has (`type === "FRIEND_REQUEST"`, drawn
 * with accept and decline), then the strangers the server suggests, paged by
 * eight as the rail is flicked. "See all" opens the novelist directory, which
 * is where the whole list of who else is here lives.
 *
 * ## Requests are not in any list cache
 *
 * A suggestion's button changes through the query cache — `useConnectionAction`
 * patches every friends page and, now, this rail's own pages. A request card is
 * built from a notification, which that patch does not reach, so the rail keeps
 * the confirmed connection for those in its own state and draws the card from
 * it: accept and the card says Message; decline and it goes.
 *
 * ## One at a time
 *
 * Facebook's suggestions rail, not web's row of three: a card takes most of
 * the screen and sits in the middle, with the one before and the one after
 * peeking in at the sides, so there is always exactly one person being
 * considered. The geometry is `rail-snap.ts`, shared with the character
 * and story rails; this card is landscape, so it takes the larger share.
 *
 * Pressing any of a card's buttons moves the rail to the next card. The
 * decision on that person has been made — the request is sent, accepted,
 * declined — and the next one is what the thumb is looking for; leaving the
 * answered card in the middle would be a rail that has to be flicked after
 * every tap. The card itself keeps its new state (Requested, Message) in
 * case the reader scrolls back.
 *
 * ## The ⋯ menu
 *
 * A stranger's card has a `⋯` beside Add Friend that opens the profile's
 * own menu — copy username, share, report, blacklist, block. The menu and
 * the share tray are the rail's, one of each, keyed on whichever card asked;
 * a sheet per card would be a modal per suggestion. Blacklisting or blocking
 * takes the card out of the rail — the server will not suggest them again,
 * and a card that still says Add Friend under somebody just blocked is a
 * lie — and the next card slides into its place.
 */

/** Web's `STRANGERS_PAGE_SIZE`. */
const PAGE_SIZE = 8;
/**
 * How much of the screen a card takes. What is left, split in two, is the
 * peek of each neighbour: 14% a side, about 45pt on a 375pt phone — enough
 * to read as a card and not enough to read.
 */
const CARD_SHARE = 0.72;
const SHIMMER = [0, 1];

const keyExtractor = (person: NovelistCardPerson) => person.id;
const Separator = () => <View style={styles.separator} />;

/** The rail's query, on its own so the screen can refresh it by prefix. */
export const useFriendSuggestions = (enabled = true) => {
  const api = useApi();

  return useInfiniteQuery({
    enabled,
    getNextPageParam: (
      lastPage: Novelist[],
      _all: Novelist[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Novelist[]> => {
      const result = await getStrangerNovelists(api, pageParam, PAGE_SIZE);
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.friendSuggestions(),
    staleTime: 5 * 60 * 1000,
  });
};

const NovelistRailView = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === "signed-in";
  const query = useFriendSuggestions(signedIn);
  const { notifications } = useNotifications({ enabled: signedIn });
  const offline = useOffline();
  const list = useRef<FlatList<NovelistCardPerson>>(null);
  const action = useConnectionAction();

  /** The `⋯` menu: whose it is, whether it is up, and the share tray. */
  const [moreFor, setMoreFor] = useState<Novelist | null>(null);
  const [moreVisible, setMoreVisible] = useState(false);
  const [sharing, setSharing] = useState<Novelist | null>(null);
  /** Blocked or blacklisted from here: gone from the rail at once. */
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  /** Connections the server has confirmed for people not in a list cache. */
  const [resolved, setResolved] = useState<Record<string, Connection>>({});
  const onChanged = useCallback((id: string, connection: Connection) => {
    setResolved((current) => ({ ...current, [id]: connection }));
  }, []);

  // Web's `friendRequestCards`: a card per FRIEND_REQUEST notification.
  const requests = useMemo<NovelistCardPerson[]>(() => {
    const out: NovelistCardPerson[] = [];
    const seen = new Set<string>();
    for (const n of notifications) {
      if (n.type !== "FRIEND_REQUEST" || !n.source?.id) continue;
      if (seen.has(n.source.id)) continue;
      seen.add(n.source.id);
      const connection = resolved[n.source.id] ?? "FRIEND_REQUEST_RECEIVED";
      // Declined: nothing left to do with this person here.
      if (connection === null) continue;
      const parts = (n.source.title ?? "").trim().split(" ");
      out.push({
        avatar: n.source.avatar,
        connection,
        firstName: parts[0] ?? "",
        id: n.source.id,
        image: n.source.image,
        lastName: parts.slice(1).join(" ") || null,
        username: n.source.urlProp,
      });
    }
    return out;
  }, [notifications, resolved]);

  const strangers = useMemo<Novelist[]>(() => {
    const requested = new Set(requests.map((r) => r.id));
    return dedupeById(query.data?.pages ?? []).filter(
      (n) => !requested.has(n.id) && !hidden.has(n.id),
    );
  }, [hidden, query.data, requests]);

  const people = useMemo<NovelistCardPerson[]>(
    () => [...requests, ...strangers],
    [requests, strangers],
  );

  // Only a stranger has the `⋯`, and a stranger is a whole `Novelist` from
  // the suggestions endpoint — which is what the share tray needs.
  const openMore = useCallback(
    (id: string) => {
      const person = strangers.find((n) => n.id === id);
      if (!person) return;
      setMoreFor(person);
      setMoreVisible(true);
    },
    [strangers],
  );
  const closeMore = useCallback(() => setMoreVisible(false), []);

  const confirmThen = (
    title: string,
    message: string,
    verb: string,
    run: () => void,
  ) =>
    Alert.alert(
      title,
      message,
      [
        { style: "cancel", text: "Cancel" },
        { onPress: run, style: "destructive", text: verb },
      ],
      { cancelable: true },
    );

  /** One of the menu's writes, against the card the menu is for. */
  const moreAction = (
    name: "report" | "blacklist" | "block",
    what: string,
    hides: boolean,
  ) => {
    const person = moreFor;
    if (!person) return;
    closeMore();
    action
      .mutateAsync({ action: name, novelist: person })
      .then(() => {
        if (hides) {
          setHidden((current) => new Set(current).add(person.id));
        }
      })
      .catch(() =>
        Alert.alert("Not saved", `${what} could not be completed. Try again.`),
      );
  };

  // The profile's `⋯` for a stranger (`profile-actions.tsx`), row for row.
  const moreMenu: ActionItem[] = !moreFor
    ? []
    : [
        {
          icon: "at-outline",
          label: "Copy username",
          onPress: () => {
            closeMore();
            void Clipboard.setStringAsync(moreFor.username);
          },
        },
        {
          icon: "share-social-outline",
          label: "Share profile",
          onSelect: () => setSharing(moreFor),
        },
        { separator: true },
        {
          icon: "flag-outline",
          label: `Report ${moreFor.username}`,
          onPress: () =>
            confirmThen(
              `Report ${moreFor.username}?`,
              "A moderator will review this profile.",
              "Report",
              () => moreAction("report", "The report", false),
            ),
          variant: "danger",
        },
        {
          icon: "eye-off-outline",
          label: `Blacklist ${moreFor.username}`,
          onPress: () =>
            confirmThen(
              `Blacklist ${moreFor.username}?`,
              "You will stop seeing them across the app.",
              "Blacklist",
              () => moreAction("blacklist", "Blacklisting", true),
            ),
          variant: "danger",
        },
        {
          icon: "ban-outline",
          label: `Block ${moreFor.username}`,
          onPress: () =>
            confirmThen(
              `Block ${moreFor.username}?`,
              "Neither of you will be able to reach the other.",
              "Block",
              () => moreAction("block", "Blocking", true),
            ),
          variant: "danger",
        },
      ];

  const snap = useRailSnap({ count: people.length, share: CARD_SHARE });
  const { cardWidth, offsets } = snap;

  /** A card's button was pressed: bring the next card into the middle. */
  const advance = useCallback(
    (id: string) => {
      const next = people.findIndex((person) => person.id === id) + 1;
      if (next <= 0 || next >= offsets.length) return;
      list.current?.scrollToOffset({ animated: true, offset: offsets[next] });
    },
    [offsets, people],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: NovelistCardPerson }) => (
      <NovelistCard
        onAction={advance}
        onChanged={onChanged}
        onMore={openMore}
        person={item}
        width={cardWidth}
      />
    ),
    [advance, cardWidth, onChanged, openMore],
  );

  // Hidden only once the session says there is no one to suggest to. While it
  // is still being asked for — a cold start opens the tabs on a stored token —
  // the query waits disabled, reads as pending, and the shimmer holds the
  // rail's place instead of the rail popping into the feed a moment later.
  if (status !== "signed-in" && status !== "loading") return null;
  if (!query.isPending && people.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        action={{
          label: "See all",
          onPress: () => router.push("/directory"),
        }}
        title="Friend suggestions"
      />
      {query.isPending && people.length === 0 && offline ? (
        <OfflineNotice compact what="rail" />
      ) : query.isPending && people.length === 0 ? (
        <View style={styles.shimmerRow}>
          {SHIMMER.map((i) => (
            <NovelistCardShimmer key={i} width={cardWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          {...snap.listProps}
          contentContainerStyle={snap.contentContainerStyle}
          data={people}
          horizontal
          // A screen's worth of cards up front, not the default ten.
          initialNumToRender={3}
          ItemSeparatorComponent={Separator}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={3}
          windowSize={3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={theme.accent.text} size="small" />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ref={list}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <ActionMenu
        items={moreMenu}
        onClose={closeMore}
        subtitle={moreFor ? `@${moreFor.username}` : undefined}
        title={moreFor?.firstName ?? "Novelist"}
        visible={moreVisible}
      />

      {sharing ? (
        <ShareProfileSheet
          novelist={sharing}
          onClose={() => setSharing(null)}
          visible
        />
      ) : null}
    </View>
  );
};

export const NovelistRail = memo(NovelistRailView);

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  section: { paddingBottom: space.md },
  separator: { width: RAIL_GAP },
  shimmerRow: {
    flexDirection: "row",
    gap: RAIL_GAP,
    overflow: "hidden",
    paddingHorizontal: RAIL_PAD,
  },
});
