import { type ComponentType, lazy, Suspense } from "react";

/**
 * Client-only lazy loading — the Vite implementation.
 *
 * `vite.config.ts` aliases `@/lib/dynamic` to this file. See `dynamic.tsx` for
 * why the two exist.
 *
 * The `{ ssr: false }` option is accepted and ignored: there is no server
 * render to opt out of, and keeping the argument means none of the 14 call
 * sites has to change shape.
 */

/**
 * next/dynamic accepts two loader shapes and the app uses both:
 *
 *   dynamic(() => import("./thing"))                        → { default: C }
 *   dynamic(() => import("./thing").then((m) => m.Named))    → C
 *
 * `React.lazy` accepts only the first. Handing it the second gives
 * "Element type is invalid. Received a promise that resolves to: undefined" at
 * render time — no build error, no type error, just a blank route. Normalising
 * here is what keeps the two builds interchangeable.
 */
type Loaded<P> = ComponentType<P> | { default: ComponentType<P> };

type DynamicOptions = {
  /** Ignored. Kept so call sites stay identical across both builds. */
  ssr?: boolean;
  loading?: ComponentType;
};

export function dynamic<P extends object>(
  load: () => Promise<Loaded<P>>,
  options?: DynamicOptions,
): ComponentType<P> {
  const Lazy = lazy(async () => {
    const resolved = await load();
    return typeof resolved === "function"
      ? { default: resolved }
      : (resolved as { default: ComponentType<P> });
  });
  const Fallback = options?.loading;

  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={Fallback ? <Fallback /> : null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}

export default dynamic;
