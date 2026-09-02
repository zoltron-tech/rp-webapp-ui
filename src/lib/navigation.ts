/**
 * The app's navigation seam — the Next implementation.
 *
 * Every component reads route params, the pathname and the query string, and
 * performs imperative navigation, through this module rather than importing a
 * router directly. `vite.config.ts` aliases `@/lib/navigation` to
 * `navigation.vite.ts`, so each build gets its own router and both stay
 * working while they coexist.
 *
 * `usePageRouter` (src/hooks/use-page-router.ts) layers the global
 * `pageLoading` flag on top of `useNavigate` here, and ~126 files use that.
 * Between the two, almost nothing in the app talks to a router by name.
 *
 * See REACT_MIGRATION_STEPS.md A4/B4.
 */

import {
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

export { useParams, usePathname } from "next/navigation";

/** Options accepted by `navigate`. A subset both routers agree on. */
export type NavigateOptions = {
  replace?: boolean;
  scroll?: boolean;
};

/**
 * Imperative navigation.
 *
 * The signature is React Router's — `navigate(to)`, `navigate(to, { replace })`,
 * `navigate(-1)` to go back — because that is the one that survives. Next's
 * `push` / `replace` / `back` are mapped onto it here.
 */
export const useNavigate = () => {
  const router = useRouter();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      // Only -1 (back) is used anywhere in the app; Next has no general
      // "go(n)", so anything else would be a silent no-op rather than a
      // half-working one.
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      else throw new Error(`navigate(${to}) is not supported`);
      return;
    }
    if (options?.replace) router.replace(to, { scroll: options.scroll });
    else router.push(to, { scroll: options?.scroll });
  };
};

/**
 * The current query string.
 *
 * Returns the params object alone, deliberately — Next returns exactly this,
 * while React Router returns a `[params, setParams]` tuple. Keeping the Next
 * shape means call sites are identical across both builds.
 */
export const useSearchParams = () => useNextSearchParams();

/**
 * Writes the query string without triggering a navigation.
 *
 * Takes a mutator so callers never rebuild the URL themselves: pass a function
 * that edits the current params and the seam owns everything else.
 *
 * Under Next this is the raw `history.replaceState` the three call sites
 * already used. Under React Router it becomes
 * `setSearchParams(next, { replace: true, preventScrollReset: true })`, which
 * is mandatory rather than cosmetic: React Router keeps `location` in React
 * state, so a raw `replaceState` leaves `useSearchParams()` disagreeing with
 * the address bar until the next real navigation. One of the three sites —
 * `story/event/[slug]` — writes raw and reads through `useSearchParams()`, so
 * it is the one that actually breaks without this.
 *
 * The try/catch is load-bearing: some mobile in-app browsers restrict history
 * writes, and a failed URL update must never cost the user the action that
 * triggered it.
 */
export const useSetSearchParams = () => {
  return (mutate: (params: URLSearchParams) => void) => {
    try {
      const url = new URL(window.location.href);
      mutate(url.searchParams);
      window.history.replaceState(null, "", url.toString());
    } catch (err) {
      console.error("Failed to update the URL query string", err);
    }
  };
};
