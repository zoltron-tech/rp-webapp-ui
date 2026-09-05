import { getMyBadges, syncMyBadges } from "@nw/api/endpoints/badges";
import { authedApi } from "@/lib/api";

/** The caller's whole catalogue — earned badges plus the ones still locked. */
export const getMyBadgesAction = () => getMyBadges(authedApi);

/** Forces a re-check of every badge rule and returns the refreshed catalogue. */
export const syncMyBadgesAction = () => syncMyBadges(authedApi);
