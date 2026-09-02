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

type DynamicOptions = {
  /** Ignored. Kept so call sites stay identical across both builds. */
  ssr?: boolean;
  loading?: ComponentType;
};

export function dynamic<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
  options?: DynamicOptions,
): ComponentType<P> {
  const Lazy = lazy(load);
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
