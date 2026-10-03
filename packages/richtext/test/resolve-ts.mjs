import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The resolver half of `register.mjs`. */
export const resolve = async (specifier, context, next) => {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  const bare = relative && !/\.[a-z]+$/i.test(specifier);
  if (bare && context.parentURL) {
    for (const extension of [".ts", ".tsx"]) {
      const candidate = new URL(`${specifier}${extension}`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return next(candidate.href, context);
      }
    }
  }
  return next(specifier, context);
};
