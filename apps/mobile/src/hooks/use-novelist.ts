import { getNovelist } from "@nw/api/endpoints/novelists";
import { queryKeys, useApi } from "@nw/features";
import type { Novelist } from "@nw/types";
import { useQuery } from "@tanstack/react-query";

/**
 * One novelist, by handle.
 *
 * Extracted from the profile screen so the screens *under* it can ask the same
 * question and get the same answer — the cache entry is `queryKeys.profile`,
 * which the profile populated on the way in, so a tap from a profile into their
 * activity resolves from memory rather than over the network.
 *
 * ## What the sub-screens actually want from it
 *
 * The palette. A novelist's profile is drawn in *their* accent rather than the
 * viewer's, and until now that stopped at the profile: opening their activity,
 * their prompts or their posts swapped straight back to your own colour
 * halfway through reading them. Those screens wrap themselves in
 * `AccentProvider` now, and this is where the number comes from.
 *
 * Passing the palette down as a route param was the other option and is worse:
 * it is one more thing every `router.push` has to remember, it is wrong the
 * moment the novelist changes their accent while you are two screens deep, and
 * it does nothing for a cold deep link. A query answers all three.
 *
 * ## Why it is local rather than in `@nw/features`
 *
 * The rule that makes that package a contract rather than a guess: every hook
 * in it has a consumer on both clients. Web's profile page does far more than
 * fetch a novelist — posts, prompts, activities, friend state and storyboards
 * all hang off the same screen — so lifting this now would be inventing an
 * interface for one caller. The query *key* is already shared, so the cache
 * entry is the one web will join when its page migrates.
 */
export const useNovelist = (username: string | undefined) => {
  const api = useApi();

  return useQuery({
    enabled: Boolean(username),
    queryFn: async (): Promise<Novelist | null> => {
      const result = await getNovelist(api, username ?? "");
      // `null` is a 404 — no such novelist. A `message` is a real failure, and
      // the two must not collapse: one is an empty state, the other a retry.
      if (result === null) return null;
      if ("message" in result) throw new Error(result.message);
      return result;
    },
    queryKey: queryKeys.profile(username ?? ""),
    // Somebody else's profile, hydrated from the local store with the time it
    // was fetched: inside this window it is shown without a request, outside
    // it is shown and refetched behind the paint (LOCAL_DATA_PLAN.md 4.1).
    staleTime: 60 * 60 * 1000,
  });
};
