/**
 * Renders the app icon in every palette.
 *
 *   node apps/mobile/scripts/generate-app-icons.mjs
 *
 * The NW quill from `assets/icon-ios.svg`, lit and lifted: the tile is a
 * diagonal gradient from the palette's bright step (9) through its tile colour
 * to near black, with a soft key light from the top left, a glow behind the
 * mark, a vignette and fine grain; the mark is a
 * gently shaded white with a two-layer drop shadow and three sparkles off the
 * quill's tip. Jade's tile is the brand green (`#0e5f4d`) and is the default
 * icon; every other palette paints from its `surface` — web's `--accent`, the
 * colour the logo tile takes in the app.
 *
 * Out, under `assets/app-icons/`:
 *   <accent>.png             1024² iOS icon, RGB (App Store Connect rejects
 *                            an alpha channel)
 *   <accent>-background.png  Android adaptive background: the lit tile
 *   <accent>-foreground.png  Android adaptive foreground: the mark and its
 *                            shadow, transparent, scaled into the 66dp safe
 *                            circle so no launcher mask clips it
 *   preview/<accent>.png     144² tile for the in-app picker
 *   icons.json               what `plugins/with-app-icons.js` reads
 * and `src/lib/app-icon-previews.ts`, the picker's
 * `require`s (Metro needs them literal, so they are written, not built).
 *
 * The monochrome layer (Android 13 themed icons) stays the flat white
 * `assets/adaptive-icon.png`: the launcher tints it, so depth is lost anyway.
 *
 * Re-run after a palette is added or its colours change, then rebuild the
 * native app — icons live in the binary, so an OTA update cannot add one.
 *
 * Renders through a local Chrome (`CHROME_PATH` to point at a specific one).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const assets = resolve(here, "../assets");
const out = join(assets, "app-icons");
const previewsModule = resolve(
  here,
  "../src/lib/app-icon-previews.ts",
);

/** The brand green: jade's tile, which is not quite jade's `surface`. */
const BRAND_TILE = "#0e5f4d";
const PREVIEW = 144;

const { ACCENT_DEFINITIONS } = await import(
  pathToFileURL(resolve(here, "../../../packages/theme/src/scales.ts")).href
);
const { ACCENT_MAP } = await import(
  pathToFileURL(resolve(here, "../../../packages/types/src/theme.ts")).href
);

const findChrome = () => {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    process.env.LOCALAPPDATA &&
      join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error("No Chrome found. Set CHROME_PATH.");
  return found;
};

// ── Colour ────────────────────────────────────────────────────────────────

const rgb = (hex) => {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16));
};
const toHex = (channels) =>
  `#${channels.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
/** `color-mix(in srgb, a ratio, b)`. */
const mix = (a, ratio, b) => {
  const [x, y] = [rgb(a), rgb(b)];
  return toHex(x.map((c, i) => c * ratio + y[i] * (1 - ratio)));
};
const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// ── Artwork ───────────────────────────────────────────────────────────────

const source = readFileSync(join(assets, "icon-ios.svg"), "utf8");
const markPath = source.match(/<path[^>]*\/>/)?.[0];
if (!markPath) throw new Error("icon-ios.svg has no mark path.");
const markD = markPath.match(/ d="([^"]+)"/)[1];
const markTransform = markPath.match(/transform="([^"]+)"/)[1];

/** The mark's box on the 1024 canvas, measured from the path. */
const MARK_CENTER = [505, 475];
/** Android: the mark scaled into the safe circle (66 of 108dp). */
const SAFE_SCALE = 0.64;

/** A four-point star, `r` from centre to tip. */
const sparkle = (cx, cy, r, opacity) => {
  const w = r * 0.22;
  return `<path fill="#ffffff" opacity="${opacity}" d="M${cx} ${cy - r} C${cx + w * 0.4} ${cy - w} ${cx + w} ${cy - w * 0.4} ${cx + r} ${cy} C${cx + w} ${cy + w * 0.4} ${cx + w * 0.4} ${cy + w} ${cx} ${cy + r} C${cx - w * 0.4} ${cy + w} ${cx - w} ${cy + w * 0.4} ${cx - r} ${cy} C${cx - w} ${cy - w * 0.4} ${cx - w * 0.4} ${cy - w} ${cx} ${cy - r}Z"/>`;
};

const defs = (tile, bright) => {
  // A pale tile (lotus) takes less light and a firmer shadow, or the white
  // mark washes into it.
  const pale = luminance(tile) > 0.25;
  return `<defs>
  <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${mix(bright, pale ? 0.35 : 0.5, tile)}"/>
    <stop offset="0.48" stop-color="${tile}"/>
    <stop offset="1" stop-color="${mix("#000000", 0.42, tile)}"/>
  </linearGradient>
  <radialGradient id="key" cx="0.2" cy="0.1" r="0.8">
    <stop offset="0" stop-color="#ffffff" stop-opacity="${pale ? 0.1 : 0.15}"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow" cx="0.5" cy="0.47" r="0.44">
    <stop offset="0" stop-color="${bright}" stop-opacity="${pale ? 0.25 : 0.38}"/>
    <stop offset="1" stop-color="${tile}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.78">
    <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.34"/>
  </radialGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset="1" stop-color="${mix(tile, 0.12, "#ffffff")}"/>
  </linearGradient>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0"/>
  </filter>
  <filter id="lift" x="-20%" y="-20%" width="140%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="26" result="far"/>
    <feOffset in="far" dy="26" result="farOffset"/>
    <feFlood flood-color="${mix("#000000", 0.75, tile)}" flood-opacity="${pale ? 0.5 : 0.42}"/>
    <feComposite in2="farOffset" operator="in" result="farShadow"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="near"/>
    <feOffset in="near" dy="6" result="nearOffset"/>
    <feFlood flood-color="#000000" flood-opacity="0.24"/>
    <feComposite in2="nearOffset" operator="in" result="nearShadow"/>
    <feMerge>
      <feMergeNode in="farShadow"/>
      <feMergeNode in="nearShadow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>`;
};

const tileLayers = `
  <rect width="1024" height="1024" fill="url(#tile)"/>
  <rect width="1024" height="1024" fill="url(#key)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <rect width="1024" height="1024" fill="url(#vignette)"/>
  <rect width="1024" height="1024" filter="url(#grain)" style="mix-blend-mode:overlay"/>`;

const markLayers = `
  <g filter="url(#lift)">
    <path fill="url(#ink)" fill-rule="evenodd" transform="${markTransform}" d="${markD}"/>
  </g>
  ${sparkle(888, 128, 30, 0.9)}
  ${sparkle(770, 96, 15, 0.65)}
  ${sparkle(936, 232, 11, 0.55)}`;

const svg = (body, tile, bright, size = 1024) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${defs(tile, bright)}${body}</svg>`;

const art = {
  background: (tile, bright) => svg(tileLayers, tile, bright),
  foreground: (tile, bright) =>
    svg(
      `<g transform="translate(512 512) scale(${SAFE_SCALE}) translate(${-MARK_CENTER[0]} ${-MARK_CENTER[1]})">${markLayers}</g>`,
      tile,
      bright,
    ),
  ios: (tile, bright) => svg(tileLayers + markLayers, tile, bright),
  preview: (tile, bright) => svg(tileLayers + markLayers, tile, bright, PREVIEW),
};

// ── Render ────────────────────────────────────────────────────────────────

const chrome = findChrome();
const scratch = join(tmpdir(), "nw-app-icons");
mkdirSync(scratch, { recursive: true });
mkdirSync(join(out, "preview"), { recursive: true });

const render = (markup, target, size, transparent) => {
  const file = join(scratch, "icon.svg");
  writeFileSync(file, markup);
  rmSync(target, { force: true });
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${size},${size}`,
      // Opaque art screenshots as an RGB PNG, which is what an iOS icon must
      // be; the foreground asks for a transparent page instead.
      ...(transparent ? ["--default-background-color=00000000"] : []),
      `--screenshot=${target}`,
      pathToFileURL(file).href,
    ],
    { stdio: "ignore" },
  );
  if (!existsSync(target)) throw new Error(`Chrome did not write ${target}`);
};

const pascal = (name) => name[0].toUpperCase() + name.slice(1);
const icons = [];
const previews = [];

for (const [palette, accent] of Object.entries(ACCENT_MAP)) {
  const definition = ACCENT_DEFINITIONS[accent];
  const tile =
    accent === "jade" ? BRAND_TILE : definition.accent[definition.solid - 1];
  // The palette's own bright step lights the tile; white would grey it.
  const bright = definition.accent[8];

  render(art.ios(tile, bright), join(out, `${accent}.png`), 1024, false);
  render(art.background(tile, bright), join(out, `${accent}-background.png`), 1024, false);
  render(art.foreground(tile, bright), join(out, `${accent}-foreground.png`), 1024, true);
  render(art.preview(tile, bright), join(out, "preview", `${accent}.png`), PREVIEW, false);

  previews.push(
    `  ${palette}: require("../../assets/app-icons/preview/${accent}.png"),`,
  );
  // Jade is the default icon (`app.json`), not an alternate.
  if (accent !== "jade") {
    icons.push({
      android: {
        background: `./assets/app-icons/${accent}-background.png`,
        color: tile,
        foreground: `./assets/app-icons/${accent}-foreground.png`,
      },
      ios: `./assets/app-icons/${accent}.png`,
      name: pascal(accent),
    });
  }
  console.log(`${accent.padEnd(8)} ${tile}`);
}

rmSync(scratch, { force: true, recursive: true });
writeFileSync(join(out, "icons.json"), `${JSON.stringify(icons, null, 2)}\n`);
writeFileSync(
  previewsModule,
  `// Generated by scripts/generate-app-icons.mjs. Do not edit.
import type { Accent } from "@nw/types/theme";

/** Each palette's app icon, small, for the picker. */
export const APP_ICON_PREVIEWS: Record<Accent, number> = {
${previews.join("\n")}
};
`,
);
console.log(`\n${previews.length} palettes → assets/app-icons`);
