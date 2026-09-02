import { type ComponentType, Suspense } from "react";
import { Navigate, Outlet, type RouteObject, useRouteError } from "react-router";
import ErrorPage from "./app/error";
import PromoLayout from "./app/promo/layout";
import RpLayout from "./app/rp/layout";
import { useAuthCookie } from "./lib/auth-cookie";
import { ROUTES } from "./utils/constants/routes";

/**
 * The app's route table.
 *
 * Generated once from the `src/app/**\/page.tsx` tree and then committed by
 * hand — a route table regenerated at build time is a file-system router with
 * extra steps, and the point of moving off Next is that routes become
 * something you can read. Add new routes here.
 *
 * Directory paths under `app/` are deliberately unchanged from the Next
 * layout, brackets and all, so every diff in this migration is a content
 * change a reviewer can follow. Renaming them to a nicer scheme is a separate,
 * mechanical, later commit.
 *
 * See REACT_MIGRATION_STEPS.md B3.
 */

/**
 * Adapts a page module's `default` export to what React Router's `lazy`
 * wants (`{ Component }`). Each `import()` is a literal so Rollup can split
 * the bundle per route.
 */
const page =
  (load: () => Promise<{ default: ComponentType }>) => async () => ({
    Component: (await load()).default,
  });

/**
 * `/` — read the auth cookie and send the visitor somewhere real.
 *
 * Next did this on the server; there is no server here, and the cookie is
 * readable from JS (it is `httpOnly: false`). Rendering nothing while the
 * cookie is read is correct: this route has no UI of its own.
 */
const IndexRedirect = () => {
  const jwt = useAuthCookie();
  return (
    <Navigate replace to={jwt ? ROUTES.Profile.Index : ROUTES.Novelists} />
  );
};

/**
 * React Router hands the thrown error to `useRouteError()` rather than to
 * props, so the existing error page is wrapped rather than rewritten. There is
 * no `reset()` equivalent — a full reload is the honest fallback, and it is
 * what the page's second button already did.
 */
const RouteErrorBoundary = () => {
  const error = useRouteError();
  return (
    <ErrorPage
      error={error instanceof Error ? error : new Error(String(error))}
      reset={() => window.location.reload()}
    />
  );
};

/** Layouts take `children`; route elements render an `<Outlet/>`. */
const withOutlet = (Layout: ComponentType<{ children: React.ReactNode }>) => (
  <Layout>
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  </Layout>
);

export const routes: RouteObject[] = [
  { element: <IndexRedirect />, path: "/" },

  {
    children: [
      { path: "bookmarks", lazy: page(() => import("./app/rp/bookmarks/page")) },
      { path: "compose", lazy: page(() => import("./app/rp/compose/page")) },
      { path: "conversations", lazy: page(() => import("./app/rp/conversations/page")) },
      { path: "conversations/:conversationId", lazy: page(() => import("./app/rp/conversations/[conversationId]/page")) },
      { path: "conversations/:conversationId/details", lazy: page(() => import("./app/rp/conversations/[conversationId]/details/page")) },
      { path: "explore", lazy: page(() => import("./app/rp/explore/page")) },
      { path: "explore-prompts", lazy: page(() => import("./app/rp/explore-prompts/page")) },
      { path: "faqs", lazy: page(() => import("./app/rp/faqs/page")) },
      { path: "fellows", lazy: page(() => import("./app/rp/fellows/page")) },
      { path: "forgot-password", lazy: page(() => import("./app/rp/forgot-password/page")) },
      { path: "home", lazy: page(() => import("./app/rp/home/page")) },
      { path: "install-app", lazy: page(() => import("./app/rp/install-app/page")) },
      { path: "leaderboard/muses", lazy: page(() => import("./app/rp/leaderboard/muses/page")) },
      { path: "leaderboard/novelists", lazy: page(() => import("./app/rp/leaderboard/novelists/page")) },
      { path: "levels", lazy: page(() => import("./app/rp/levels/page")) },
      { path: "library", lazy: page(() => import("./app/rp/library/page")) },
      { path: "login", lazy: page(() => import("./app/rp/login/page")) },
      { path: "msgtoexport", lazy: page(() => import("./app/rp/msgtoexport/page")) },
      { path: "muse", lazy: page(() => import("./app/rp/muse/page")) },
      { path: "muse/:slug", lazy: page(() => import("./app/rp/muse/[slug]/page")) },
      { path: "news-feed", lazy: page(() => import("./app/rp/news-feed/page")) },
      { path: "notifications", lazy: page(() => import("./app/rp/notifications/page")) },
      { path: "novelist/:slug", lazy: page(() => import("./app/rp/novelist/[slug]/page")) },
      { path: "novelists", lazy: page(() => import("./app/rp/novelists/page")) },
      { path: "oauth/callback", lazy: page(() => import("./app/rp/oauth/callback/page")) },
      { path: "oauth/failed", lazy: page(() => import("./app/rp/oauth/failed/page")) },
      { path: "onboarding", lazy: page(() => import("./app/rp/onboarding/page")) },
      { path: "outgoing-threads", lazy: page(() => import("./app/rp/outgoing-threads/page")) },
      { path: "post-prompt", lazy: page(() => import("./app/rp/post-prompt/page")) },
      { path: "privacy-policy", lazy: page(() => import("./app/rp/privacy-policy/page")) },
      { path: "profile", lazy: page(() => import("./app/rp/profile/page")) },
      { path: "profile/:slug", lazy: page(() => import("./app/rp/profile/[slug]/page")) },
      { path: "profile/:slug/friends", lazy: page(() => import("./app/rp/profile/[slug]/friends/page")) },
      { path: "profile/:slug/muses", lazy: page(() => import("./app/rp/profile/[slug]/muses/page")) },
      { path: "profile/:slug/music", lazy: page(() => import("./app/rp/profile/[slug]/music/page")) },
      { path: "profile/:slug/posts", lazy: page(() => import("./app/rp/profile/[slug]/posts/page")) },
      { path: "profile/:slug/storyboards", lazy: page(() => import("./app/rp/profile/[slug]/storyboards/page")) },
      { path: "profile/edit", lazy: page(() => import("./app/rp/profile/edit/page")) },
      { path: "profile/muses/create", lazy: page(() => import("./app/rp/profile/muses/create/page")) },
      { path: "profile/muses/edit/:id", lazy: page(() => import("./app/rp/profile/muses/edit/[id]/page")) },
      { path: "profile/muses/edit/:id/about", lazy: page(() => import("./app/rp/profile/muses/edit/[id]/about/page")) },
      { path: "profile/muses/edit/:id/about/create", lazy: page(() => import("./app/rp/profile/muses/edit/[id]/about/create/page")) },
      { path: "profile/muses/edit/:id/about/edit/:sectionId", lazy: page(() => import("./app/rp/profile/muses/edit/[id]/about/edit/[sectionId]/page")) },
      { path: "profile/muses/edit/:id/extra-attributes", lazy: page(() => import("./app/rp/profile/muses/edit/[id]/extra-attributes/page")) },
      { path: "profile/music/create", lazy: page(() => import("./app/rp/profile/music/create/page")) },
      { path: "profile/referrals", lazy: page(() => import("./app/rp/profile/referrals/page")) },
      { path: "profile/story/create", lazy: page(() => import("./app/rp/profile/story/create/page")) },
      { path: "profile/story/edit/:id", lazy: page(() => import("./app/rp/profile/story/edit/[id]/page")) },
      { path: "profile/story/edit/:id/event/create", lazy: page(() => import("./app/rp/profile/story/edit/[id]/event/create/page")) },
      { path: "profile/story/edit/:id/event/edit/:storyboardEventId", lazy: page(() => import("./app/rp/profile/story/edit/[id]/event/edit/[storyboardEventId]/page")) },
      { path: "prompt/:slug", lazy: page(() => import("./app/rp/prompt/[slug]/page")) },
      { path: "prompt/:slug/comment", lazy: page(() => import("./app/rp/prompt/[slug]/comment/page")) },
      { path: "reset-password", lazy: page(() => import("./app/rp/reset-password/page")) },
      { path: "story", lazy: page(() => import("./app/rp/story/page")) },
      { path: "story/:slug", lazy: page(() => import("./app/rp/story/[slug]/page")) },
      { path: "story/event/:slug", lazy: page(() => import("./app/rp/story/event/[slug]/page")) },
      { path: "terms", lazy: page(() => import("./app/rp/terms/page")) },
      { path: "thread-generator", lazy: page(() => import("./app/rp/thread-generator/page")) },
      { path: "thread/:slug", lazy: page(() => import("./app/rp/thread/[slug]/page")) },
      { path: "tiers", lazy: page(() => import("./app/rp/tiers/page")) },
      { path: "verify-email", lazy: page(() => import("./app/rp/verify-email/page")) },
      { path: "welcome", lazy: page(() => import("./app/rp/welcome/page")) },    ],
    element: withOutlet(RpLayout),
    errorElement: <RouteErrorBoundary />,
    path: "/rp",
  },

  {
    children: [
      { path: "muse", lazy: page(() => import("./app/promo/muse/page")) },
      { path: "prompt", lazy: page(() => import("./app/promo/prompt/page")) },
      { path: "storyboard", lazy: page(() => import("./app/promo/storyboard/page")) },    ],
    element: withOutlet(PromoLayout),
    errorElement: <RouteErrorBoundary />,
    path: "/promo",
  },

  // Next's app/not-found.tsx was a bare redirect to Novelists; this is the
  // same behaviour with no page in between.
  { element: <Navigate replace to={ROUTES.Novelists} />, path: "*" },
];
