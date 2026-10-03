import { usePrefetchNovelistFriends, useSession } from "@nw/features";
import { useEffect } from "react";
import { ListStatus } from "@/components/list-status";
import { NovelistProfile } from "@/components/novelist-profile";
import { NovelistProfileSkeleton } from "@/components/novelist-profile-skeleton";

/**
 * The signed-in person's own profile.
 *
 * Everything comes from the novelist `useSession` already fetched, so the
 * screen costs no extra request, and the layout is `NovelistProfile` — the same
 * component that renders anyone else's. Editing, the avatar picker and the five
 * tabs (posts, muses, music, friends, storyboards) are Phase 4: that phase
 * brings the first write path and the first media upload, and neither belongs
 * in a beachhead.
 */
export default function ProfileTab() {
  const { novelist, status } = useSession();

  /*
   * Warm your own friends list, as the other profile screen does for theirs.
   * Your own is the one most likely to be opened, and the tab is where the
   * round trip is free.
   */
  const prefetchFriends = usePrefetchNovelistFriends();
  useEffect(() => {
    prefetchFriends(novelist?.username);
  }, [novelist?.username, prefetchFriends]);

  // A cold start opens the tabs before the session answers (`app/index.tsx`);
  // the profile's shape holds the page until it does.
  if (status === "loading") return <NovelistProfileSkeleton seed={null} />;
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return <NovelistProfile novelist={novelist} />;
}
