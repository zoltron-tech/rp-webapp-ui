import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCheckable,
  namesToWords,
  normalizeText,
  splitHyphenated,
  tokenize,
} from "@nw/spell/tokenizer";

const words = (text: string) => tokenize(text).map((t) => t.word);

const checkable = (text: string, ignore: string[] = []) => {
  const ctx = { ignore: new Set(ignore), text: normalizeText(text) };
  return tokenize(text)
    .filter((t) => isCheckable(t, ctx))
    .map((t) => t.word);
};

describe("tokenize", () => {
  it("splits on whitespace and punctuation, keeps offsets", () => {
    const t = tokenize("Hello, world!");
    assert.deepEqual(t, [
      { end: 5, start: 0, word: "Hello" },
      { end: 12, start: 7, word: "world" },
    ]);
  });

  it("normalises curly apostrophes and keeps contractions whole", () => {
    assert.deepEqual(words("don’t can't"), ["don't", "can't"]);
  });

  it("trims quotes and dashes hugging a word", () => {
    assert.deepEqual(words("'hello' -world- — ok"), ["hello", "world", "ok"]);
  });

  it("drops a possessive 's", () => {
    const [t] = tokenize("Elara's sword");
    assert.equal(t.word, "Elara");
    assert.equal(t.end, 5);
  });

  it("treats zero-width and non-breaking spaces as separators", () => {
    assert.deepEqual(words("one​two three"), ["one", "two", "three"]);
  });

  it("never forms a word out of digits", () => {
    assert.deepEqual(words("in 1990s H2O"), ["in", "s", "H", "O"]);
  });
});

describe("isCheckable", () => {
  it("skips single letters and all-caps acronyms", () => {
    assert.deepEqual(checkable("a NASA probe"), ["probe"]);
  });

  it("skips @handles and #tags", () => {
    assert.deepEqual(checkable("ping @elara about #worldbuilding now"), [
      "ping",
      "about",
      "now",
    ]);
  });

  it("skips URLs, bare domains and emails", () => {
    assert.deepEqual(
      checkable(
        "see https://novelist.world/rp/home or novelist.world and me@x.io ok",
      ),
      ["see", "or", "and", "ok"],
    );
  });

  it("skips letters glued to digits", () => {
    assert.deepEqual(checkable("mk2 and 1990s but fine"), ["and", "but", "fine"]);
  });

  it("honours the ignore set case-insensitively", () => {
    assert.deepEqual(checkable("Elara met ELARA's friend", ["elara"]), [
      "met",
      "friend",
    ]);
  });
});

describe("splitHyphenated", () => {
  it("checks each part with its own offsets", () => {
    const [t] = tokenize("an ice-cold drink");
    assert.equal(t.word, "an");
    const hy = tokenize("an ice-cold drink")[1];
    assert.deepEqual(splitHyphenated(hy), [
      { end: 6, start: 3, word: "ice" },
      { end: 11, start: 7, word: "cold" },
    ]);
  });
});

describe("namesToWords", () => {
  it("lower-cases every piece of every name and skips blanks", () => {
    const set = namesToWords(["Elara Vance", null, "O'Neil", ""]);
    assert.deepEqual([...set].sort(), ["elara", "o'neil", "vance"]);
  });
});
