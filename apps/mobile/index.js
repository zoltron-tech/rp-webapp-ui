/**
 * The app's entry, as a file this directory owns.
 *
 * `package.json` used to say `"main": "expo-router/entry"`. That works only
 * while `expo-router` lives in *this* directory's `node_modules`: the dev
 * server turns the entry into a path relative to Metro's server root and
 * asks Metro for `./node_modules/expo-router/entry` — and `metro.config.js`
 * pins the server root to this directory so release builds resolve (see the
 * note there). With `node-linker=hoisted` the package is at the workspace
 * root instead, so the request 404s and the dev client hangs on its splash
 * screen with nothing on screen to say why.
 *
 * A local file sidesteps the whole question. `./index` is here whatever the
 * server root is, and `expo-router/entry` inside it is an ordinary module
 * import, which Metro resolves through `nodeModulesPaths` — the workspace
 * root included. Dev, `expo export` and the Gradle release path all take the
 * same route.
 */
import "expo-router/entry";
