import { useSession } from "@nw/features";
import { ListPageSkeleton } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { PromptCardSkeleton } from "@/components/skeleton";
import { PromptFeed } from "@/screens/prompt-feed";
import { space } from "@/theme";

/** Your own out-of-character posts, in the Profile tab. */
export default function MyPostsScreen() {
  const { novelist, status } = useSession();

  if (status === "loading") {
    return (
      <ListPageSkeleton
        count={3}
        gap={space.ms}
        render={() => <PromptCardSkeleton />}
      />
    );
  }
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return (
    <PromptFeed
      kind="posts"
      novelistId={novelist.id}
      username={novelist.username}
    />
  );
}
