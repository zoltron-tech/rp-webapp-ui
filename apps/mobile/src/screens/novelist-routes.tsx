/**
 * Another novelist's pages — profile, friends, characters, activity, prompts,
 * posts — as screens rather than as route files.
 *
 * They started life as the six files under `(home)/novelist/[username]/` and
 * were only reachable inside the Home tab. Pushing `/novelist/:username` from
 * anywhere else resolved to *that* stack: the tab switched, the screen landed
 * as the stack's first entry with no back button, and the hardware back left
 * the app. Every tab that has a face on a card — Explore, Interactions,
 * Profile — now registers these same routes, so a name tapped on a feed opens
 * the person inside the tab the reader is in. The route files are one line
 * each and point here.
 */

import { usePrefetchNovelistFriends, useSession } from "@nw/features";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { AmbientBackground } from "@/components/ambient-background";
import { ListStatus } from "@/components/list-status";
import { NovelistHeader } from "@/components/novelist-header";
import { NovelistProfile } from "@/components/novelist-profile";
import {
  findCachedNovelist,
  NovelistProfileSkeleton,
} from "@/components/novelist-profile-skeleton";
import { useNovelist } from "@/hooks/use-novelist";
import { ActivityList } from "@/screens/activity-list";
import { FriendsList } from "@/screens/friends-list";
import { MuseList } from "@/screens/muse-list";
import { PromptFeed } from "@/screens/prompt-feed";
import { AccentProvider } from "@/theme";

/**
 * Somebody else's profile, reached from the novelist list.
 *
 * The fetch is `useNovelist`, local to this app rather than in `@nw/features`,
 * for the reason that hook sets out: every hook in that package has a consumer
 * on both clients, and web's profile page does far more than fetch a novelist.
 * It started here and moved out one level when the screens *under* this one
 * needed the same answer for their accent.
 *
 * The query key is `queryKeys.profile`, which already existed unused, so the
 * cache entry is the one web will share when it gets there.
 */
export function NovelistProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const session = useSession();

  // The fetch itself is `useNovelist`, so the screens pushed from this one can
  // ask the same question and land on the same cache entry — which is how they
  // get this novelist's accent without it being threaded through every route.
  const query = useNovelist(username);

  /*
   * Whatever the row that opened this profile already knew: name, face, banner
   * and palette, so the header, the bar's colour and the top of the page are
   * right on the first frame. See `novelist-profile-skeleton.tsx`.
   */
  const queryClient = useQueryClient();
  const seed = useMemo(
    () => (username ? findCachedNovelist(queryClient, username) : null),
    [queryClient, username],
  );

  /*
   * Warm their friends list while this screen is being read.
   *
   * The friends pill below is one tap away and its endpoint is the slowest in
   * the profile — ten queries and two cross-service hops per page. Spending
   * that round trip now, against a screen the reader is still looking at, is
   * what makes the tap feel instant instead of the request being what the tap
   * starts. `prefetchInfiniteQuery` no-ops when the page is already fresh.
   */
  const prefetchFriends = usePrefetchNovelistFriends();
  useEffect(() => {
    prefetchFriends(username);
  }, [prefetchFriends, username]);

  // Their own handle resolves to the tab, which already has the novelist from
  // the session and needs no second request for it.
  if (username && session.novelist?.username === username) {
    return <Redirect href="/(tabs)/(profile)" />;
  }

  return (
    /*
     * Their palette, not yours — the same rule web applies by rendering the
     * profile inside `<div className={profileAccent}>`. A profile, and
     * everything reached from it, belongs to the person being looked at rather
     * than the person looking.
     *
     * The provider wraps the header as well as the page now. It used to sit
     * inside, which left the bar above a crimson profile painted in the
     * viewer's olive — and in dark mode the accent picks the whole neutral
     * scale, so that was two different families of grey stacked on each other.
     */
    <AccentProvider palette={query.data?.palette ?? seed?.palette}>
      {/* Their light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader
        title={
          query.data || seed
            ? [(query.data ?? seed)?.firstName, (query.data ?? seed)?.lastName]
                .filter(Boolean)
                .join(" ")
            : `@${username ?? ""}`
        }
      />

      {query.isPending ? (
        <NovelistProfileSkeleton seed={seed} />
      ) : query.error ? (
        <ListStatus error={query.error} onRetry={() => void query.refetch()} />
      ) : query.data ? (
        <NovelistProfile novelist={query.data} />
      ) : (
        <ListStatus empty={`No novelist called @${username}.`} />
      )}
    </AccentProvider>
  );
}

/**
 * Somebody else's friends, inside the Home tab where their profile was opened,
 * in their accent — see `activity.tsx`.
 *
 * The rows are other novelists, each with their own accent, and they are *not*
 * repainted: a list where every row carried its own colour would be a list with
 * no colour of its own. The screen belongs to whose friends these are.
 */
export function NovelistFriendsScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { data: novelist } = useNovelist(username);

  return (
    <AccentProvider palette={novelist?.palette}>
      {/* Their light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader title={`@${username ?? ""} · Friends`} />
      <FriendsList username={username ?? ""} />
    </AccentProvider>
  );
}

/**
 * Somebody else's characters, inside the Home tab, in their accent.
 *
 * Their characters are as much theirs as their activity is — see
 * `activity.tsx`. Leaving this one screen in the viewer's colour would mean the
 * accent changed depending on which row of the profile you tapped.
 */
export function NovelistMusesScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { data: novelist } = useNovelist(username);

  return (
    <AccentProvider palette={novelist?.palette}>
      {/* Their light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader title={`@${username ?? ""} · Characters`} />
      <MuseList username={username ?? ""} />
    </AccentProvider>
  );
}

/**
 * Somebody else's activity, inside the Home tab where their profile was opened.
 *
 * Painted in *their* accent, not the viewer's — the same rule the profile one
 * screen back applies, and the same rule web applies by rendering a profile
 * inside `<div className={profileAccent}>`. Without it the colour changed
 * halfway through reading somebody, which reads as having navigated away from
 * them.
 *
 * The novelist comes from `useNovelist`, which shares the profile's cache
 * entry — so arriving from a profile costs no request and the accent is right
 * on the first frame. A cold deep link fetches it, and until it lands the
 * screen simply keeps the viewer's accent rather than flashing a wrong one.
 */
export function NovelistActivityScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { data: novelist } = useNovelist(username);

  return (
    <AccentProvider palette={novelist?.palette}>
      {/* Their light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader title={`@${username ?? ""} · Activity`} />
      <ActivityList username={username ?? ""} />
    </AccentProvider>
  );
}

/**
 * Somebody else's characters' prompts, inside the Home tab where their profile
 * was opened, and painted in their accent — see `activity.tsx` for why.
 *
 * `novelistId` rides along with the handle because the endpoint is keyed by id
 * and the profile that pushed this route already had it. The palette does not:
 * it comes from the cached novelist instead, so it stays right if they change
 * their accent while this screen is open, and it survives a deep link that
 * carried no params at all.
 */
export function NovelistPromptsScreen() {
  const { novelistId, username } = useLocalSearchParams<{
    novelistId?: string;
    username: string;
  }>();
  const { data: novelist } = useNovelist(username);

  return (
    <AccentProvider palette={novelist?.palette}>
      {/* Their light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader title={`@${username ?? ""} · Prompts`} />
      <PromptFeed
        kind="prompts"
        novelistId={novelistId ?? novelist?.id ?? ""}
      />
    </AccentProvider>
  );
}

/**
 * Somebody else's out-of-character posts, inside the Home tab, painted in their
 * accent — see `activity.tsx` for why.
 */
export function NovelistPostsScreen() {
  const { novelistId, username } = useLocalSearchParams<{
    novelistId?: string;
    username: string;
  }>();
  const { data: novelist } = useNovelist(username);

  return (
    <AccentProvider palette={novelist?.palette}>
      {/* Their light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader title={`@${username ?? ""} · Posts`} />
      <PromptFeed kind="posts" novelistId={novelistId ?? novelist?.id ?? ""} />
    </AccentProvider>
  );
}
