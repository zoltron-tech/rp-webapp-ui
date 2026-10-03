import { useSession } from "@nw/features";
import {
  ListPageSkeleton,
  NovelistRowSkeleton,
} from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { FriendsList } from "@/screens/friends-list";

/** Your own friends, in the Profile tab, so the bar agrees with the screen. */
export default function MyFriendsScreen() {
  const { novelist, status } = useSession();

  if (status === "loading") {
    return (
      <ListPageSkeleton count={8} render={() => <NovelistRowSkeleton />} />
    );
  }
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return <FriendsList username={novelist.username} />;
}
