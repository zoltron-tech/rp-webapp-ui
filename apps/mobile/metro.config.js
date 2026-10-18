// Metro, taught about the workspace.
//
// Two things it does not do on its own. It refuses to follow symlinks out of
// the app directory, which is exactly how pnpm links `@nw/*` — so the package
// sources have to be named as watch folders. And it resolves modules only from
// the app's own `node_modules`, while pnpm puts hoisted dependencies at the
// workspace root — so the root has to be on the resolver's path too.
//
// Nothing here is app-specific: it is the standard pnpm-monorepo Metro setup.
// Before anything from Expo is required — see the note on the server root at
// the bottom. The CLI computes the bundle path it hands the dev client from
// `getMetroServerRoot`, which reads this variable lazily from `process.env`;
// this file is loaded by every CLI path (start, run:android, export, and the
// Gradle release bundle through export:embed), so setting it here is what
// makes all of them agree with the pinned root below.
process.env.EXPO_NO_METRO_WORKSPACE_ROOT ??= "1";

const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// pnpm's store contains many copies of the same package. Without this, Metro
// can bundle two Reacts and every hook throws "invalid hook call".
config.resolver.disableHierarchicalLookup = true;

// The spell-check dictionary ships as two plain-text assets (`assets/dict`),
// read at runtime by `src/lib/spell/store.ts`; Metro has to know the
// extensions are assets, not source.
config.resolver.assetExts = [...config.resolver.assetExts, "aff", "dic"];

// Metro's "server root" is the directory a relative entry path is resolved
// against. Expo sets it to the workspace root whenever it finds one
// (@expo/config getMetroServerRoot), but the React Native Gradle plugin makes
// the entry path relative to the *app* directory before handing it over, so a
// release build asks for `../../node_modules/expo-router/entry.js` and Metro
// resolves it two levels above the workspace:
//
//   Unable to resolve module ./../../node_modules/expo-router/entry.js
//
// Debug builds never notice — they fetch the bundle from Metro by URL instead
// of running `createBundleReleaseJsAndAssets`, so this only ever breaks
// release. Pinning the server root to the app directory is what the Gradle
// plugin already assumes, and what Expo did before SDK 51.
//
// The pin has a mirror image. The *dev client* is handed a manifest whose
// bundle URL the CLI computes relative to `getMetroServerRoot` — the
// workspace root, by default — so it asked for `apps/mobile/index.bundle`
// and Metro, rooted here, looked for `apps/mobile/apps/mobile/index` and
// answered 404 on every launch. `EXPO_NO_METRO_WORKSPACE_ROOT` at the top of
// this file is what makes the CLI compute that path from here as well.
config.server = { ...config.server, unstable_serverRoot: projectRoot };

module.exports = config;
