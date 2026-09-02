# rp-webapp

The Novelist World web app.

> **This repo currently builds twice.** The app is mid-migration from Next.js to
> a Vite SPA plus a small Hono BFF, and both builds work and are kept green. Next
> is still what deploys. See [REACT_MIGRATION_STEPS.md](../REACT_MIGRATION_STEPS.md)
> for where that has got to and what is left.

## Prerequisites

- **Node ≥ 18.16** (22 is what this is developed against)
- **pnpm 10** — `corepack enable && corepack prepare pnpm@10.13.1 --activate`
- **Git Bash** on Windows: the `dev` script uses `rm -rf`

```bash
pnpm install
```

## Running it

Both dev servers listen on **port 3000**, deliberately. Three things outside this
app are wired to that number — the backend's `APP_BASE_URL` and
`OAUTH_REDIRECT_BASE`, and `RP_LOGIN_URL` here — so a different port breaks local
OAuth in a way that looks like a backend fault. Run one at a time.

```bash
pnpm dev          # Next  (the deployed build)
pnpm dev:vite     # Vite  (the migration target)
```

The app needs a backend. Point `RP_SERVICE_URL` at the real API, or run the
services locally — [LOCAL_DEV.md](../LOCAL_DEV.md) covers that end to end,
including Discord OAuth linking.

Copy `.env.example` to `.env` first. The Vite build reads `VITE_`-prefixed names
but **falls back to the legacy unprefixed ones**, so an existing `.env` works
under both builds with no duplication. That fallback is transitional and goes
when Next does.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next dev server on :3000 |
| `pnpm dev:vite` | Vite dev server on :3000 |
| `pnpm build` | `next build` — **this is what deploys** |
| `pnpm build:vite` | `vite build` → `dist/`, including the service worker |
| `pnpm preview:vite` | Serves the built `dist/` on :3000 |
| `pnpm verify` | Type-check (app + packages) + package boundaries + both smoke tests. **Run this on every commit.** |
| `pnpm type-check` | `tsc --noEmit` for the app |
| `pnpm smoke` | Both smoke tests below |
| `pnpm smoke:bff` | Open Graph injection and the BFF's error paths |
| `pnpm smoke:mw` | The `/{username}` short link and reserved paths |
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

`biome check` fails today with pre-existing style errors, and ~500 files are
unformatted. That is the state this repo was already in. **Do not run
`biome format --write` while the migration is in flight** — it would touch more
files than the migration itself and make every diff unreviewable.

## How it is put together

```
src/app/…          page components, one directory per route
                   (directory names still match Next's convention, brackets
                    and all, so migration diffs stay readable)
src/routes.tsx     the explicit route table the Vite build uses
src/components/…   shared components
src/lib/…          app-level plumbing, including the build seams below
packages/          @nw/api, @nw/types, @nw/utils, @nw/config — framework-free,
                   shared with the future mobile app. No build step: they ship
                   TypeScript source.
api/               the Hono BFF (Discord + Klipy proxies, reactions, landing
                   feeds, Open Graph injection) as one Vercel Function
worker/            service worker — handlers.ts is shared, index.ts is the Next
                   custom worker, sw.ts is the whole Vite one
```

### Build seams

A handful of modules exist twice because the two bundlers genuinely cannot share
one implementation. `vite.config.ts` aliases each `@/…` path on the left to its
Vite-specific file; the Next build uses the plain one. This is what lets both
builds stay fully working at the same time.

| Module | Why it differs |
|---|---|
| `@/lib/navigation` | `next/navigation` vs React Router |
| `@/components/link` | `next/link` vs React Router's `<Link>` (`href` is kept either way) |
| `@/lib/env` | webpack inlines `process.env.X`; Vite inlines `import.meta.env.VITE_X` |
| `@/lib/dynamic` | `next/dynamic` vs `React.lazy` |
| `@/lib/server-api` | server-side API client vs browser client |
| `@/app/actions` | `next/headers` cookies vs `document.cookie` |

Adding a new one means adding the alias too. If you find yourself reaching for a
`typeof window` check to tell the builds apart, add a seam instead.

## Deployment

Vercel builds and serves this. `pnpm build` (Next) is what currently ships;
`vercel.json` already carries the Vite-era rewrites and the security response
headers.
