// Flattens the app's CSS surface into .design-sync/flattened.css for
// design-sync's cfg.cssEntry (which appends the file raw — bare package
// @imports would never resolve there). Inlines @import chains recursively
// and rewrites relative url() refs to be relative to the output file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)); // .design-sync/tools
const ROOT = resolve(HERE, "..", "..");               // rp-webapp-ui
const OUT = resolve(HERE, "..", "flattened.css");

const ENTRIES = [
  join(ROOT, "node_modules/toastify-js/src/toastify.css"),
  join(ROOT, "node_modules/@novelist-world/ui/dist/styles.css"),
  join(ROOT, "src/app/globals.css"),
];

const seen = new Set();
const slash = (p) => p.replace(/\\/g, "/");

function resolveImport(spec, fromFile) {
  if (spec.startsWith(".")) {
    const p = resolve(dirname(fromFile), spec);
    return existsSync(p) ? p : null;
  }
  const p = join(ROOT, "node_modules", spec);
  return existsSync(p) ? p : null;
}

function rewriteUrls(css, fromFile) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) => {
    if (/^(data:|https?:|\/\/|#)/.test(ref)) return m;
    const abs = resolve(dirname(fromFile), ref);
    if (!existsSync(abs)) return m;
    return `url("${slash(relative(dirname(OUT), abs))}")`;
  });
}

function inline(file, depth = 0) {
  const key = slash(file).toLowerCase();
  if (seen.has(key)) return "";
  seen.add(key);
  if (depth > 10) throw new Error(`import depth exceeded at ${file}`);
  let css = readFileSync(file, "utf8");
  css = css.replace(
    /@import\s+(?:url\(\s*)?(['"])([^'"]+)\1\s*\)?\s*;/g,
    (m, _q, spec) => {
      const target = resolveImport(spec, file);
      if (!target) {
        console.error(`! unresolved @import "${spec}" in ${slash(relative(ROOT, file))} — kept as-is`);
        return m;
      }
      return `/* inlined: ${spec} */\n` + inline(target, depth + 1);
    },
  );
  return rewriteUrls(css, file);
}

const out = ENTRIES.filter((e) => {
  if (!existsSync(e)) {
    console.error(`! entry missing: ${slash(relative(ROOT, e))}`);
    return false;
  }
  return true;
})
  .map((e) => `/* ── source: ${slash(relative(ROOT, e))} ── */\n` + inline(e))
  .join("\n\n");

writeFileSync(OUT, out);
console.error(`flattened.css written (${(out.length / 1024).toFixed(0)} KB, ${seen.size} files inlined)`);
