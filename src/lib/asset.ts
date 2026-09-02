/**
 * Reads a URL off an imported static asset.
 *
 * The two bundlers disagree about what `import logo from "./logo.png"` is.
 * webpack, through `next/image-types/global`, gives a `StaticImageData` object
 * (`{ src, width, height, blurDataURL }`). Vite gives a plain string URL.
 *
 * Reading `.src` therefore works under one build and yields `undefined` under
 * the other — a broken-image icon that no type-checker catches, at 14 call
 * sites. This accepts either shape so both builds stay correct while they
 * coexist.
 *
 * At D7, when next-env.d.ts is deleted and `vite/client` types these imports
 * as strings, every `assetUrl(x)` can become plain `x` and this file goes with
 * it.
 *
 * See REACT_MIGRATION_STEPS.md B8 and finding 10.
 */
export const assetUrl = (asset: string | { src: string }): string =>
  typeof asset === "string" ? asset : asset.src;
