# rp-webapp

The Novelist World web app.

A **Vite + React Router SPA**. There is no framework server and no backend of
its own: the browser talks to the Kotlin services directly. One function under
`api/` remains, and it is not an API — see [The `api/` function](#the-api-function).

The migration off Next.js is complete; [REACT_MIGRATION_PLAN.md](../REACT_MIGRATION_PLAN.md)
and [REACT_MIGRATION_STEPS.md](../REACT_MIGRATION_STEPS.md) record what changed
and why, including several things worth knowing that were found along the way.

## Prerequisites

- **Node ≥ 18.16** (22 is what this is developed against)
- **pnpm 10** — `corepack enable && corepack prepare pnpm@10.13.1 --activate`
- **Git Bash** on Windows: the `dev` script uses `rm -rf`

```bash
pnpm install
```

## Running it

```bash
pnpm dev
```

The dev server listens on **port 3000**, deliberately. Three things outside this
app are wired to that number — the backend's `APP_BASE_URL` and
`OAUTH_REDIRECT_BASE`, and `VITE_RP_LOGIN_URL` here — so a different port breaks
local OAuth in a way that looks like a backend fault.

The app needs a backend. Point `RP_SERVICE_URL` at the real API, or run the
services locally — [LOCAL_DEV.md](../LOCAL_DEV.md) covers that end to end,
including Discord OAuth linking.

Copy `.env.example` to `.env` first. **Only `VITE_`-prefixed names reach the
browser** — that is what stops a secret being shipped by accident. The unprefixed
names in the same file are read server-side by `api/`; never add a `VITE_` prefix
to one of those to "make it work".

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` | `vite build` → `dist/`, including the service worker |
| `pnpm start` | Serves the built `dist/` on :3000 |
| `pnpm verify` | Type-check (app + packages) + package boundaries + both smoke tests. **Run this on every commit.** |
| `pnpm type-check` | `tsc --noEmit` for the app |
| `pnpm smoke` | Both smoke tests below |
| `pnpm smoke:bff` | Open Graph injection and its fallbacks |
| `pnpm smoke:mw` | The `/{username}` short link and reserved paths |
| `pnpm smoke:routes` | Renders all 66 routes in headless Chrome. Needs a build and a browser, so it is not in `verify` |
| `pnpm lint` | `biome check` — **fails today**, pre-existing, see below |

### On the smoke tests

There is no test suite, and these two scripts are not the start of one. They
exist because two behaviours fail *silently* — no type error, no build failure,
nothing in a log:

- **OG injection.** A wrong or duplicated `og:title` ships a generic card to
  exactly the audience shared story links exist for, and you find out when
  someone posts one in Discord.
- **The `/{username}` short link.** If it stops matching, the app shell renders,
  the client router matches nothing, and `not-found` redirects to Novelists. The
  feature is simply gone, with nothing to notice.

Both stub `fetch`, so they need no network and no credentials.

### On `pnpm lint`

`biome check` fails with pre-existing style errors, and ~500 files are
unformatted. That predates the migration. Formatting the repo is now safe to do
— it was deliberately held off while two builds had to stay diffable — but do it
as its own commit, touching nothing else.

## How it is put together

```
index.html         the document shell, including the site-wide meta tags
src/main.tsx       entry: createRoot, providers, RouterProvider
src/routes.tsx     the route table — 66 entries, written by hand, read top to
                   bottom. Add new routes here.
src/app/…          page components, one directory per route. The directory names
                   still use Next's bracket convention ([slug]) because renaming
                   them is a large mechanical diff that has not been worth doing
                   yet; the brackets carry no meaning now.
src/components/…   shared components
src/lib/…          app-level plumbing: the API client, navigation helpers,
                   cookies, config
packages/          @nw/api, @nw/types, @nw/utils, @nw/config — framework-free,
                   shared with the future mobile app. No build step: they ship
                   TypeScript source.
api/               the Open Graph function (see below)
middleware.ts      edge middleware: tracking-param stripping and the
                   /{username} short link
worker/            service worker — sw.ts is the worker, handlers.ts holds the
                   push/notification/badge logic
```

### The `api/` function

One route, and it is the only server-side code this repo owns:

| Route | Why it exists |
|---|---|
| `/rp/story/:slug`, `/rp/story/event/:slug` | Open Graph injection. Crawlers do not run JS, so a shared story link would otherwise unfurl with the generic site card |

It rewrites the HTML document before a crawler sees it, which has to happen
wherever the document is served — the CDN edge, not the API. That is the whole
reason it cannot live in the Kotlin backend with everything else.

Everything else that used to be here has moved to `rp-webapp-service`:

- **Discord sharing** and **Klipy media search** → the portfolio service, which
  now holds `DISCORD_BOT_TOKEN` and `KLIPY_API_KEY`. The embed building went
  with them: whoever holds the token decides what gets posted with it.
- **Reactions** and the **landing feeds** were deleted rather than moved. They
  proxied the portfolio service to itself, only to turn the JWT cookie into a
  header — which the browser does itself now.

**Do not add routes here.** New server work goes in the Kotlin backend.

## Deployment

Vercel builds and serves this: the CDN serves `dist/` and `vercel.json` rewrites
the two storyboard routes to the function. Same-origin by
construction, which is why the client's relative `fetch("/api/…")` calls need no
CORS.

`vercel.json` also carries the security response headers (nosniff, frame
options, referrer, permissions). They are not in nginx — `rp-webapp-nginx`
fronts `api.novelist.world` only, not this app.
