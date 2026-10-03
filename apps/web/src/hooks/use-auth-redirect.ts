import { useEffect, useRef } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";

/**
 * Send the visitor to `redirectTo` once we know they are signed out.
 *
 * The global store is seeded with `authState: "LOGGED_OUT"` before
 * AuthProvider has had a chance to check the cookie, so acting on that value
 * directly bounces a signed-in novelist off any page that guards on it — which
 * is what used to happen on a hard load of the create/edit forms. Wait until
 * auth has actually resolved (a `LOADING` or `LOGGED_IN` observation) before
 * treating `LOGGED_OUT` as real.
 */
export const useRedirectWhenLoggedOut = (redirectTo: string) => {
  const authState = useGlobalState("authState");
  const { routeToPage } = usePageRouter();
  const authResolved = useRef(false);

  useEffect(() => {
    if (authState === "LOADING" || authState === "LOGGED_IN") {
      authResolved.current = true;
      return;
    }

    if (authState === "LOGGED_OUT" && authResolved.current) {
      routeToPage(redirectTo);
    }
  }, [authState, redirectTo, routeToPage]);
};
