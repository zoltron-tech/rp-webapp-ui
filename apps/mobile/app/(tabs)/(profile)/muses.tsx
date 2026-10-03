import { useSession } from "@nw/features";
import {
  ListPageSkeleton,
  MuseListRowSkeleton,
} from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { MuseList } from "@/screens/muse-list";

/** Your own characters, in the Profile tab. */
export default function MyMusesScreen() {
  const { novelist, status } = useSession();

  if (status === "loading") {
    return (
      <ListPageSkeleton count={6} render={() => <MuseListRowSkeleton />} />
    );
  }
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return <MuseList username={novelist.username} />;
}
