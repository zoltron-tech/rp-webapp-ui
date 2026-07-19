// Browser-preview stub for next/navigation — components render standalone in
// claude.ai/design cards; router actions are no-ops.
const noop = () => {};

export const useRouter = () => ({
  push: noop,
  replace: noop,
  back: noop,
  forward: noop,
  refresh: noop,
  prefetch: noop,
});

export const usePathname = () => "/rp/home";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({} as Record<string, string>);
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [] as string[];
export const redirect = (_url: string) => {};
export const permanentRedirect = (_url: string) => {};
export const notFound = () => {};
export const ReadonlyURLSearchParams = URLSearchParams;
export const RedirectType = { push: "push", replace: "replace" } as const;
