import { useSession } from "@nw/features";
import { ListPageSkeleton } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { StoryCoverCardShimmer } from "@/components/story-cover-card";
import { StoryList } from "@/screens/story-list";

/** Your own stories, in the Profile tab — web's `/rp/profile/@you/storyboards`. */
export default function MyStoriesScreen() {
  const { novelist, status } = useSession();

  if (status === "loading") {
    return (
      <ListPageSkeleton count={4} render={() => <StoryCoverCardShimmer />} />
    );
  }
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return <StoryList username={novelist.username} />;
}
