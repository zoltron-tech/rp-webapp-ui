import { BadgeShelf } from "@/screens/badge-shelf";

/**
 * Your badge shelf.
 *
 * Only in the Profile tab, and only your own: `GET /badge` answers for the
 * caller, so there is no such screen for anybody else. See `BadgeShelf`.
 */
export default function MyBadgesScreen() {
  return <BadgeShelf />;
}
