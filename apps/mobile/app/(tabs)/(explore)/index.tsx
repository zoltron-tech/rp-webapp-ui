import { ExploreScreen } from "@/screens/explore";

/**
 * Explore, the discovery feed — see `src/screens/explore.tsx`.
 *
 * A route file rather than the screen itself, because the tab also carries
 * `/threads/:id`, and a screen in `src/screens/` is what lets both this tab and
 * Interactions push the same thread screen without either one owning it.
 */
export default ExploreScreen;
