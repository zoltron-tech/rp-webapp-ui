/**
 * The app's navigation seam — the React Router implementation.
 *
 * `vite.config.ts` aliases `@/lib/navigation` to this file. See `navigation.ts`
 * for what the seam is for.
 *
 * Two shape differences with Next are absorbed here rather than at the ~57 call
 * sites: React Router returns `useSearchParams()` as a tuple, and types
 * `useParams` values as `string | undefined` rather than `string | string[]`.
 */

import {
  useLocation,
  useNavigate as useRouterNavigate,
  useSearchParams as useRouterSearchParams,
} from "react-router";

export { useParams } from "react-router";

export type NavigateOptions = {
  replace?: boolean;
  scroll?: boolean;
};

export const usePathname = () => useLocation().pathname;

export const useNavigate = () => {
  const navigate = useRouterNavigate();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      navigate(to);
      return;
    }
    navigate(to, {
      preventScrollReset: options?.scroll === false,
      replace: options?.replace,
    });
  };
};

/** Params only, matching Next's shape — see navigation.ts. */
export const useSearchParams = () => {
  const [params] = useRouterSearchParams();
  return params;
};

/**
 * Writes the query string without triggering a navigation.
 *
 * This is the half that a raw `history.replaceState` gets wrong under React
 * Router: `location` lives in React state, so writing the address bar directly
 * leaves `useSearchParams()` stale until the next real navigation.
 * `preventScrollReset` keeps the reader where they were, which is the whole
 * point at the bookmark call site.
 */
export const useSetSearchParams = () => {
  const [params, setParams] = useRouterSearchParams();
  return (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { preventScrollReset: true, replace: true });
  };
};
