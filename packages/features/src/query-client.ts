import { QueryClient } from "@tanstack/react-query";

/**
 * One set of caching defaults for both clients.
 *
 * The numbers are chosen against what the app replaces: `useEffect` +
 * `useState`, which refetched on every mount and cached nothing. Anything is an
 * improvement, so these are deliberately conservative — long enough that
 * navigating back to a screen is instant, short enough that a list nobody has
 * touched for a minute is refreshed on the next visit.
 *
 * `retry: 1` rather than react-query's default 3: the API answers a genuine
 * failure the same way three times, and three round trips of latency on a phone
 * is a visibly stuck screen.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 60 * 1000,
      },
    },
  });
