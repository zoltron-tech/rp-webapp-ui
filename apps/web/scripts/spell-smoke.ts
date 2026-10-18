/**
 * The spell-check engine, checked against the dictionary the app actually
 * ships. `public/dict/en` is a copy of `dictionary-en`, not an import, so a
 * missing or truncated copy would only show up as "nothing is ever flagged"
 * in the browser — this makes it fail loudly in `pnpm smoke` instead.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import nspell from "nspell";

const dict = (name: string) =>
  readFileSync(
    fileURLToPath(new URL(`../public/dict/en/${name}`, import.meta.url)),
    "utf8",
  );

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) console.log(`PASS  ${name}`);
  else {
    failures += 1;
    console.error(`FAIL  ${name}  ${detail}`);
  }
};

const started = Date.now();
const spell = nspell(dict("index.aff"), dict("index.dic"));
console.log(`dictionary parsed in ${Date.now() - started}ms`);

check("common words are correct", spell.correct("receive") && spell.correct("The"));
check("a typo is flagged", !spell.correct("recieve"));
check(
  "the typo gets its fix suggested first",
  spell.suggest("recieve")[0] === "receive",
  JSON.stringify(spell.suggest("recieve")),
);
check("a fantasy name is flagged before adding", !spell.correct("Elara"));
spell.add("Elara");
check("and accepted after `add`", spell.correct("Elara"));
check("contractions pass", spell.correct("don't"));

// The phonetic layer lives in the worker (spell.worker.ts); the index it builds
// depends on the word list nspell exposes as `data`, so make sure that is
// still there and still large.
const words = Object.keys((spell as unknown as { data: object }).data);
check("nspell exposes the word list", words.length > 100_000, String(words.length));
check("synagogue is in the dictionary", words.includes("synagogue"));

if (failures > 0) {
  // Thrown rather than process.exit, matching the other smoke scripts.
  throw new Error(`${failures} spell smoke check(s) failed`);
}
console.log("\nspell smoke: all checks passed");
