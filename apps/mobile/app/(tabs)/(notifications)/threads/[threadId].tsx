import { ThreadScreen } from "@/screens/thread";

/**
 * A thread opened from a notification — a reply to you, a comment on your
 * prompt, or a reaction to either — inside the Notifications tab.
 *
 * The screen is `src/screens/thread.tsx`, the same component the other tabs
 * mount; what this file buys is that the reader comes back to the list they
 * tapped from rather than to another tab's stack.
 */
export default ThreadScreen;
