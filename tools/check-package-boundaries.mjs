#!/usr/bin/env node
/**
 * Enforces the package dependency rule from DEDUPLICATION_PLAN.md §"Execution".
 *
 * Shared packages are consumed by `apps/web` and (later) `apps/mobile`. A
 * single stray `styled-components` or `document.querySelector` in packages/
 * compiles fine on web and breaks only at runtime on device, months later.
 * This check makes that a build failure instead.
 *
 * Lives in `tools/` rather than the web app because it polices the workspace,
 * not one app. `ROOT` is therefore this directory's parent — the repo root.
 *
 * Note the type system already covers part of this: packages/config's
 * tsconfig.base.json declares `lib: ["ES2022"]` with no DOM, so bare `window`
 * and `document` are compile errors in any package that extends it. This script
 * covers what types cannot — import specifiers, and DOM access reached through
 * `globalThis`.
 *
 * Files ending in `.web.ts`/`.web.tsx` are exempt: they are the deliberate
 * web half of a platform adapter and are never bundled into the native app.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const PACKAGES_DIR = join(ROOT, "packages");

/** Packages allowed to hold web-only code by design. */
const EXEMPT_PACKAGES = new Set(["config"]);

const RULES = [
  {
    id: "next",
    message: "imports from next/* — packages must not depend on the framework",
    test: /\bfrom\s+["']next(\/[^"']*)?["']|\brequire\(["']next(\/[^"']*)?["']\)/,
  },
  {
    id: "styled-components",
    message: "imports styled-components — web-only styling, keep it in the app",
    test: /\bfrom\s+["']styled-components(\/[^"']*)?["']/,
  },
  {
    id: "app-alias",
    message: "imports from the app alias '@/' — packages must not reach into the app",
    test: /\bfrom\s+["']@\/[^"']*["']/,
  },
  {
    id: "escaping-relative-import",
    message: "relative import escapes the package",
    test: /\bfrom\s+["'](?:\.\.\/){3,}[^"']*["']/,
  },
  {
    id: "dom-global",
    message: "touches a DOM global — use a platform adapter, or name the file *.web.ts",
    test: /\bglobalThis\s*\.\s*(?:window|document|navigator|localStorage)\b|(?<![.\w])(?:window|document|navigator|localStorage)\s*\.\s*[a-zA-Z_$]/,
  },
];

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const WEB_ONLY = /\.web\.(ts|tsx|js|jsx)$/;

/** Strips comments and string literals so a rule never fires on prose. */
function stripNonCode(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/`(?:\\.|[^`\\])*`/g, "``");
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) {
      continue;
    }
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else if (SOURCE_EXT.test(entry)) {
      yield full;
    }
  }
}

function packageNameOf(file) {
  return relative(PACKAGES_DIR, file).split(sep)[0];
}

let packageDirs;
try {
  packageDirs = readdirSync(PACKAGES_DIR);
} catch {
  console.log("check-boundaries: no packages/ directory yet — nothing to check.");
  process.exit(0);
}

const violations = [];
let scanned = 0;

for (const pkg of packageDirs) {
  if (EXEMPT_PACKAGES.has(pkg)) continue;
  const srcDir = join(PACKAGES_DIR, pkg, "src");

  for (const file of walk(srcDir)) {
    scanned += 1;
    if (WEB_ONLY.test(file)) continue;

    const raw = readFileSync(file, "utf8");
    const code = stripNonCode(raw);
    const lines = code.split(/\r?\n/);

    for (const rule of RULES) {
      lines.forEach((line, index) => {
        if (rule.test.test(line)) {
          violations.push({
            file: relative(ROOT, file).split(sep).join("/"),
            line: index + 1,
            package: packageNameOf(file),
            message: rule.message,
            snippet: line.trim().slice(0, 100),
          });
        }
      });
    }
  }
}

if (violations.length === 0) {
  console.log(`check-boundaries: ${scanned} file(s) scanned, no violations.`);
  process.exit(0);
}

console.error(
  `check-boundaries: ${violations.length} violation(s) across ${scanned} file(s)\n`,
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.message}`);
  console.error(`    ${v.snippet}\n`);
}
process.exit(1);
