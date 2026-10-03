# novelist-world-app

The Novelist World client workspace. One repository, one dependency graph, two
clients — the web app today, a React Native app next.

```
apps/
  web/        the Vite + React Router PWA        → apps/web/README.md
  mobile/     the Expo app, iOS + Android        → apps/mobile/README.md
packages/
  types/      shared domain types (imports nothing)
  theme/      design tokens — colours, geometry. No styling engine
  utils/      formatters, validation, platform adapters, portable hooks
  api/        the HTTP client and every endpoint, transport injected per app
  store/      the global client-state store
  features/   screen hooks: fetching, pagination, mutations. No views, no DOM
  config/     shared biome + tsconfig bases
tools/        workspace scripts: the boundary check, the Chrome finder
```

The backend services are **separate repositories** — `rp-webapp-service`
(Kotlin), `chat-server`, and `rp-webapp-nginx`. Nothing here builds or deploys
them. `MONOREPO_MIGRATION_PLAN.md` §5 explains why they stayed out.

## The rule that keeps this working

Arrows point inward. `types` imports nothing; `theme` and `utils` import
`types`; `api` imports `types` and `utils`; `store` imports those; `features` imports all
of them. **Apps import anything; nothing in `packages/` imports from an app.** No `styled-components`
and no `window`/`document` inside `packages/` outside a `*.web.ts` file.

`pnpm check:boundaries` enforces it, and CI runs it on every push. The rule is
not bureaucracy: a stray DOM reference in a shared package compiles fine on web
and fails at runtime on a device, months later.

### One React, pinned

`react` and `react-dom` are pinned to **19.1.0** in both apps and forced through
`pnpm.overrides` in the root `package.json`. This is not tidiness — it is load-bearing.

Expo SDK 54 pins react to an exact version. When the web app asked for a different one
(`^19.1.1`), pnpm resolved `@tanstack/react-query`'s React peer against the *other* app and
gave it a nested `node_modules/react`. Under `node-linker=hoisted` the web app then loaded
react-query from the root — with its own React inside — and every hook in the tree threw
`Invalid hook call`, pointing at react-query rather than at the version split that caused it.

Nothing in a diff makes that visible: both apps type-check, both build, and the failure only
appears in a browser after an unrelated reinstall reshuffles which peer copy wins. Whenever
Expo's React version changes, change it in **both** apps and in the override together.

## Commands

Run these from the repository root.

| Script | What it does |
|---|---|
| `pnpm dev` | Web dev server on :3000 |
| `pnpm dev:mobile` | Metro for the Expo app (needs a dev build installed) |
| `pnpm build` | Production build of the web app |
| `pnpm verify` | Type-check (app + packages) + boundaries + smoke tests. **Run on every commit** |
| `pnpm check:boundaries` | The package dependency rule above |
| `pnpm type-check` / `type-check:packages` | `tsc --noEmit`, both apps / every package |
| `pnpm smoke` | The two silent-failure smoke tests (OG injection, short links) |
| `pnpm smoke:routes` | Renders all 70 routes in headless Chrome |
| `pnpm lint` | `biome check` — **fails today** on pre-existing CRLF formatting, see `apps/web/README.md` |

Anything web-specific — env vars, the `api/` function, routing, the service worker — is in
[apps/web/README.md](apps/web/README.md). The native session, the dev-build requirement and
what is not built yet are in [apps/mobile/README.md](apps/mobile/README.md).

## One screen, two views, one hook

Views are written twice on purpose — 37% of the web app is styled-components and none of it
runs on a phone. What is **not** written twice is everything that could differ by mistake:
fetching, pagination, the end-of-list rule, mutations. That lives in `packages/features`,
and the rule is that every hook there has a real consumer in both apps. A hook with one
consumer is a guess; a hook both apps render is a contract.

## Deploying

The web app deploys to Vercel from `apps/web`. Because the build reads
`packages/`, the project settings must be:

- **Root Directory:** `apps/web`
- **Include source files outside of the Root Directory in the Build Step:** on
- **Install Command:** `pnpm install --frozen-lockfile` (pnpm walks up to
  `pnpm-workspace.yaml` and installs the whole workspace)

`apps/web/vercel.json` holds the rewrites and the security headers;
`apps/web/middleware.ts` is the edge middleware and `apps/web/api/` the one
function. All three are resolved relative to the Root Directory, so they need no
change — but **verify them on a preview deployment**, because none of them is
exercised by a local build.

## Adding a package

`packages/<name>/` with a `package.json` (`@nw/<name>`, `"main": "./src/index.ts"`,
a `type-check` script) and a `tsconfig.json` extending `@nw/config/tsconfig.base.json`
— or `tsconfig.react.json` if it has hooks. Then add the alias in three places:
`apps/web/tsconfig.json` paths, `apps/web/vite.config.ts` resolve.alias, and the
app's `package.json` dependencies as `workspace:*`.
