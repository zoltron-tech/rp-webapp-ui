import { ThreadScreen } from "@/screens/thread";

/**
 * A thread opened from a comment on an Explore card, inside the Explore tab.
 *
 * The same component the Interactions tab pushes — Expo Router calls this a
 * shared route: one screen, one route file per group, so the reader stays in
 * the tab they came from and the bar neither moves nor relights. See
 * `src/screens/thread.tsx`.
 */
export default ThreadScreen;
