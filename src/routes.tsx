import { type ComponentType, Suspense } from "react";
import {
  Navigate,
  Outlet,
  type RouteObject,
  useLocation,
  useParams,
  useRouteError,
} from "react-router";
import ErrorPage from "./app/error";
import PromoLayout from "./app/promo/layout";
import RpLayout from "./app/rp/layout";
import { useAuthCookie } from "./lib/auth-cookie";
import { isProfileHandle } from "./utils/constants/profile-handle";
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

/**
 * `/rp/profile/{username}` and its tabs → `/@{username}`.
 *
 * A component rather than a path rewrite so the redirect only ever fires for
 * routes that actually reached it; see the note at the call sites.
 */
const LegacyProfileRedirect = ({ tab }: { tab?: string }) => {
  const { slug = "" } = useParams();
  const { search } = useLocation();
  return <Navigate replace to={`/@${slug}${tab ? `/${tab}` : ""}${search}`} />;
};

/**
 * The `/@username` branch, which sits at the root of the domain alongside the
 * app's own paths.
 *
 * `/:handle` matches any single root segment, so this decides what the segment
 * actually is. A handle renders the profile; anything else is a **legacy bare
 * short link** (`/tokyo`, the form this app handed out before the `@`) and is
 * redirected onto the handle, tabs and query string intact.
 *
 * Note what that redirect does *not* do: no backend lookup, no reserved-word
 * list. Static files are served before the SPA fallback ever runs, and React
 * Router ranks a static path above a dynamic one — so `/rp/...`, `/promo/...`
 * and every file in `public/` are all matched before this route is considered.
 * The old `/{username}` rule needed both a list and a lookup precisely because
 * it had no `@` to tell a username from a path.
 *
 * A bare segment that is *not* a username lands on the profile page's
 * not-found rather than the catch-all's redirect to Novelists. That is the one
 * behaviour change here, and it is the better of the two: a mistyped profile
 * link now says so.
 */
const ProfileHandleBranch = () => {
  const { handle } = useParams();
  const { pathname, search } = useLocation();

  // No layout of its own: `RpLayout` is mounted by the shared parent route, so
  // moving between `/@username` and `/rp/...` reconciles instead of remounting.
  // See the note on that route below.
  return isProfileHandle(handle) ? (
    <Outlet />
  ) : (
    <Navigate replace to={`/@${pathname.slice(1)}${search}`} />
  );
};

export const routes: RouteObject[] = [
  { element: <IndexRedirect />, path: "/" },

  // Everything the signed-in app renders lives under one **pathless** layout
  // route, so `RpLayout` — and with it the global store, AuthProvider and the
  // socket — is a single mounted instance shared by `/rp/...` and `/@username`.
  //
  // These used to be two sibling branches that each rendered their own
  // `RpLayout`. Crossing between them (profile -> "add character", say) swapped
  // one branch's element for the other's, which remounted the layout: the store
  // went back to its seed (`authState: "LOGGED_OUT"`), AuthProvider started a
  // fresh verify, and any page that redirects on a logged-out state fired
  // before that verify resolved — sending the novelist to /rp/novelists.
  {
    children: [
      {
        children: [
      { path: "bookmarks", lazy: page(() => import("./app/rp/bookmarks/page")) },
      { path: "compose", lazy: page(() => import("./app/rp/compose/page")) },
      { path: "conversations", lazy: page(() => import("./app/rp/conversations/page")) },
      { path: "conversations/:conversationId", lazy: page(() => import("./app/rp/conversations/[conversationId]/page")) },
      { path: "conversations/:conversationId/details", lazy: page(() => import("./app/rp/conversations/[conversationId]/details/page")) },
      { path: "explore", lazy: page(() => import("./app/rp/explore/page")) },
      // Both of these were one-line files re-exporting explore's page. In a
      // route table that is just a second entry pointing at the same import,
      // which is clearer than the indirection — and it means the two
      // `export { default } from "../explore/page"` files can be deleted with
      // the rest of Next without touching this table. The URLs stay live.
      { path: "explore-prompts", lazy: page(() => import("./app/rp/explore/page")) },
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
      { path: "news-feed", lazy: page(() => import("./app/rp/explore/page")) },
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

      // Legacy profile paths. These are redirects rather than pages now — the
      // profile lives at `/@username`. They stay because they are in already
      // posted Discord embeds, in notification payloads and in the privacy
      // policy, and a shared link should not rot.
      //
      // Expressing them as routes rather than as a rule at the HTTP layer is
      // deliberate: a regex over `/rp/profile/([^/]+)` would also rewrite
      // `edit`, `muses`, `music`, `story` and `referrals`, which are real
      // pages. React Router ranks a static path above a dynamic one, so those
      // five match their own routes and never reach this.
      { element: <LegacyProfileRedirect />, path: "profile/:slug" },
      { element: <LegacyProfileRedirect tab="friends" />, path: "profile/:slug/friends" },
      { element: <LegacyProfileRedirect tab="muses" />, path: "profile/:slug/muses" },
      { element: <LegacyProfileRedirect tab="music" />, path: "profile/:slug/music" },
      { element: <LegacyProfileRedirect tab="posts" />, path: "profile/:slug/posts" },
      { element: <LegacyProfileRedirect tab="storyboards" />, path: "profile/:slug/storyboards" },
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
        path: "rp",
      },

      // Profiles, at the root of the domain. Last of the real branches: it
      // matches any single root segment, so every static path above must be
      // tried first.
      {
        children: [
          { index: true, lazy: page(() => import("./app/rp/profile/[slug]/page")) },
          { path: "friends", lazy: page(() => import("./app/rp/profile/[slug]/friends/page")) },
          { path: "muses", lazy: page(() => import("./app/rp/profile/[slug]/muses/page")) },
          { path: "music", lazy: page(() => import("./app/rp/profile/[slug]/music/page")) },
          { path: "posts", lazy: page(() => import("./app/rp/profile/[slug]/posts/page")) },
          { path: "storyboards", lazy: page(() => import("./app/rp/profile/[slug]/storyboards/page")) },
        ],
        element: <ProfileHandleBranch />,
        path: ":handle",
      },
    ],
    element: withOutlet(RpLayout),
    errorElement: <RouteErrorBoundary />,
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
