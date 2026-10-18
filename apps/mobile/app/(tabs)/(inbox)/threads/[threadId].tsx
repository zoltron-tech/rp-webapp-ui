import { ThreadScreen } from "@/screens/thread";

/**
 * A thread opened from a Inbox card, inside the Inbox tab.
 *
 * The screen itself is `src/screens/thread.tsx` — Explore has a route file of
 * its own pointing at the same component, so a thread opened from a comment on
 * a feed card stays in the tab it was opened from. See that file for why.
 */
export default ThreadScreen;
