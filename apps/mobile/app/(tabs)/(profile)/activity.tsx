import { useSession } from "@nw/features";
import { ListPageSkeleton } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { ActivityCardSkeleton } from "@/components/skeleton";
import { ActivityList } from "@/screens/activity-list";
import { space } from "@/theme";

/** Your own activity, in the Profile tab, so the bar agrees with the screen. */
export default function MyActivityScreen() {
  const { novelist, status } = useSession();

  if (status === "loading") {
    return (
      <ListPageSkeleton
        count={3}
        gap={space.ms}
        render={() => <ActivityCardSkeleton />}
      />
    );
  }
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return <ActivityList username={novelist.username} />;
}
