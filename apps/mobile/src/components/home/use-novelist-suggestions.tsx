import { getStrangerNovelists } from "@nw/api/endpoints/home";
import { queryKeys, useApi, useNotifications, useSession } from "@nw/features";
import type { Novelist } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import type { NovelistCardPerson } from "@/components/home/novelist-card";
import { ShareProfileSheet } from "@/components/share/share-profile-sheet";
import { type Connection, useConnectionAction } from "@/hooks/use-connection";
import { dedupeById } from "@/lib/feed";
import { alertReportSent } from "@/lib/report";

/**
 * Who you could connect with: what Home's rail and the Fellows page both show.
 *
 * Two sources, in web's order: friend requests waiting on you first, read off
 * the notifications the app already has (`type === "FRIEND_REQUEST"`, drawn
 * with accept and decline), then the strangers the server suggests, paged by
 * eight.
 *
 * ## Requests are not in any list cache
 *
 * A suggestion's button changes through the query cache — `useConnectionAction`
 * patches every friends page and, now, these pages. A request card is built
 * from a notification, which that patch does not reach, so the confirmed
 * connection for those is kept here and the card drawn from it: accept and the
 * card says Message; decline and it goes.
 *
 * ## The ⋯ menu
 *
 * A stranger's card has a `⋯` beside Add Friend that opens the profile's
 * own menu — copy username, share, report, blacklist, block. The menu and
 * the share tray are one of each, keyed on whichever card asked; a sheet per
 * card would be a modal per suggestion. Blacklisting or blocking takes the
 * card out — the server will not suggest them again, and a card that still
 * says Add Friend under somebody just blocked is a lie.
 *
 * `sheets` is that menu and tray, for the caller to mount.
 */

/** Web's `STRANGERS_PAGE_SIZE`. */
const PAGE_SIZE = 8;

/** The suggestions query, on its own so a screen can refresh it by prefix. */
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

export const useNovelistSuggestions = () => {
  const { status } = useSession();
  const signedIn = status === "signed-in";
  const query = useFriendSuggestions(signedIn);
  const { notifications } = useNotifications({ enabled: signedIn });
  const action = useConnectionAction();

  /** The `⋯` menu: whose it is, whether it is up, and the share tray. */
  const [moreFor, setMoreFor] = useState<Novelist | null>(null);
  const [moreVisible, setMoreVisible] = useState(false);
  const [sharing, setSharing] = useState<Novelist | null>(null);
  /** Blocked or blacklisted from here: gone from the list at once. */
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
        if (name === "report") alertReportSent();
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

  const sheets = (
    <>
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
    </>
  );

  return { onChanged, openMore, people, query, sheets, status };
};
