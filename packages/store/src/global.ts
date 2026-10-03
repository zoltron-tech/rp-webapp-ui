import type { StoreState } from "@nw/types/state";
import { createStoreContext } from "./context";
import { createGetFunction, useStoreSet, useStoreState } from "./hooks";

/**
 * The one store every client has: session user, theme, accent, unread counts —
 * whatever `StoreState` says.
 *
 * It lives here rather than in a per-app registry because its shape is already
 * shared (`@nw/types/state`) and mobile needs exactly the same hooks. The web
 * app's registry maps its `"global-store"` id onto this context, so
 * `<StoreProvider storeId="global-store">` keeps working there unchanged.
 */
export const GlobalStoreContext = createStoreContext<StoreState>(
  "global-store",
);

export const useGlobalState = <K extends keyof StoreState>(key: K) =>
  useStoreState<StoreState, K>(
    GlobalStoreContext,
    createGetFunction<StoreState, K>(key),
  );

export const useGlobalStoreSet = () => useStoreSet<StoreState>(GlobalStoreContext);
