import { useSession } from "@nw/features";
import { ListStatus } from "@/components/list-status";
import { BookShelf } from "@/screens/book-shelf";

/** Your own bookshelf, in the Profile tab. */
export default function MyBooksScreen() {
  const { novelist, status } = useSession();

  if (status === "loading") return <ListStatus loading />;
  if (!novelist) return <ListStatus empty="No profile to show." />;

  return (
    <BookShelf novelistId={novelist.id} own username={novelist.username} />
  );
}
