import { register } from "node:module";

/**
 * Lets Node run the package's TypeScript as-is.
 *
 * Node strips types natively (22.18+), but its ESM resolver still wants an
 * extension on every relative import, and the sources import `./parse` the
 * way every bundler expects. Rather than rewrite the package for the test
 * runner — `.ts` specifiers would then need `allowImportingTsExtensions` in
 * three tsconfigs — this hook tries `.ts` and `.tsx` when a bare relative
 * specifier does not resolve.
 */
register(new URL("./resolve-ts.mjs", import.meta.url));
