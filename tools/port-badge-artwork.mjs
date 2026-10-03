#!/usr/bin/env node
/**
 * One-shot port of the badge crests from `apps/web` into `packages/badges`.
 *
 * Kept in the repo rather than run and deleted so the transformation is
 * reviewable: the crests are ~3,000 lines of hand-tuned coordinates, and
 * "I rewrote them by hand" is not a claim anyone can check. Every change this
 * makes is mechanical and listed below.
 *
 *   1. `"use client"` goes — a package has no framework directive.
 *   2. Lowercase SVG tags become the capitalised components from
 *      `../primitives`, which is the whole point of the exercise: the same
 *      drawing renders through the DOM on web and `react-native-svg` on device.
 *   3. The `<BadgeSvg>` wrapper becomes a fragment. The frame stays in each app
 *      — styled wrapper on web, `<Svg>` on native — because it is the one part
 *      that genuinely differs.
 *   4. Imports are rewritten to `../frame` and `../primitives`, with only the
 *      tags each crest actually uses.
 *
 * Run: node tools/port-badge-artwork.mjs
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const FROM = join(ROOT, "apps/web/src/components/badges/artwork");
const TO = join(ROOT, "packages/badges/src/artwork");

/** Lowercase SVG tag to the primitive that renders it. */
const TAGS = {
  circle: "Circle",
  clipPath: "ClipPath",
  defs: "Defs",
  ellipse: "Ellipse",
  feGaussianBlur: "FeGaussianBlur",
  feMerge: "FeMerge",
  feMergeNode: "FeMergeNode",
  filter: "Filter",
  g: "G",
  image: "SvgImage",
  line: "Line",
  linearGradient: "LinearGradient",
  mask: "Mask",
  path: "Path",
  radialGradient: "RadialGradient",
  rect: "Rect",
  stop: "Stop",
  svg: "Svg",
};

/**
 * Longest tag first.
 *
 * `line` is a prefix of `linearGradient`; replacing the short one first turns
 * every gradient into `<LineearGradient>`. The lookahead below guards the same
 * thing, but ordering makes it impossible rather than merely unlikely.
 */
const ORDERED = Object.keys(TAGS).sort((a, b) => b.length - a.length);

const NOT_ARTWORK = new Set(["frame.tsx", "index.tsx", "styles.ts"]);

const port = (source) => {
  let out = source.replace(/^"use client";\n\n?/, "");

  // The wrapper is the app's job now.
  out = out
    .replace(/<BadgeSvg\s+size=\{size\}\s+animated=\{animated\}>/g, "<>")
    .replace(/<\/BadgeSvg>/g, "</>");

  const used = new Set();
  for (const tag of ORDERED) {
    // `(?=[\s/>])` stops `<g` matching inside `<gradient…`, and the capture
    // keeps opening and closing forms apart.
    const open = new RegExp(`<${tag}(?=[\\s/>])`, "g");
    const close = new RegExp(`</${tag}>`, "g");
    if (open.test(out) || close.test(out)) used.add(TAGS[tag]);
    out = out.replace(open, `<${TAGS[tag]}`).replace(close, `</${TAGS[tag]}>`);
  }

  // The crest imported these from a sibling file; they now come from the
  // package root. `BadgeSvg` is gone along with the wrapper.
  out = out.replace(
    /import \{([^}]*)\} from "\.\/frame";/,
    (_match, names) => {
      const kept = names
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .filter((name) => name !== "BadgeSvg")
        .sort();
      return `import {\n  ${kept.join(",\n  ")},\n} from "../frame";`;
    },
  );

  const primitives = [...used].sort().join(",\n  ");
  out = out.replace(
    /import type \{ FC \} from "react";/,
    `import type { FC } from "react";\nimport {\n  ${primitives},\n} from "../primitives";`,
  );

  return out;
};

let count = 0;
for (const file of readdirSync(FROM)) {
  if (!file.endsWith(".tsx") || NOT_ARTWORK.has(file)) continue;
  const source = readFileSync(join(FROM, file), "utf8");
  writeFileSync(join(TO, file), port(source));
  count += 1;
}

console.log(`ported ${count} crest(s) into packages/badges/src/artwork`);
