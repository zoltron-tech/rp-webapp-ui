// Builds upload chunk manifests (path lists) for DesignSync write_files calls.
// Usage: node make-chunks.mjs [batchN.json ...] — with no args, chunks base
// files + the listed component sets from .design-sync/.cache/batch1.json.
import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const B = "ds-bundle";
const walk = (d) =>
  readdirSync(join(B, d), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(d + "/" + e.name) : [d + "/" + e.name],
  );

const batchFile = process.argv[2] ?? ".design-sync/.cache/batch1.json";
const withBase = !process.argv.includes("--no-base");
const batch = JSON.parse(readFileSync(batchFile, "utf8"));

const compFiles = batch.flatMap((c) => {
  const dir = "components/" + c.group + "/" + c.name;
  if (!existsSync(join(B, dir))) { console.error("! missing " + dir); return []; }
  return readdirSync(join(B, dir)).map((f) => dir + "/" + f);
});
// _preview files for these components (compiled authored previews)
const previews = existsSync(B + "/_preview")
  ? readdirSync(B + "/_preview").filter((f) => batch.some((c) => f.startsWith(c.name + "."))).map((f) => "_preview/" + f)
  : [];

let text = [...compFiles, ...previews];
let fonts = [];
if (withBase) {
  const base = ["_ds_bundle.js", "_ds_bundle.css", "styles.css", "README.md"].filter((f) => existsSync(join(B, f)));
  const vendor = walk("_vendor");
  const tokens = existsSync(B + "/tokens") ? walk("tokens") : [];
  const guide = existsSync(B + "/guidelines") ? walk("guidelines") : [];
  fonts = existsSync(B + "/fonts") ? walk("fonts") : [];
  text = [...base, ...vendor, ...tokens, ...guide, ...text];
}

const chunks = [];
for (let i = 0; i < text.length; i += 200) chunks.push(text.slice(i, i + 200));
for (let i = 0; i < fonts.length; i += 12) chunks.push(fonts.slice(i, i + 12));

const outDir = ".design-sync/.cache/upload";
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
chunks.forEach((c, i) =>
  writeFileSync(join(outDir, "chunk-" + String(i + 1).padStart(2, "0") + ".json"), JSON.stringify(c, null, 1)),
);
const mb = (list) => (list.reduce((s, f) => s + statSync(join(B, f)).size, 0) / 1048576).toFixed(1);
console.log("files:", text.length + fonts.length, "chunks:", chunks.length, "sizes:", chunks.map((c) => c.length).join(","));
console.log("text MB:", mb(text), "fonts MB:", fonts.length ? mb(fonts) : 0);
