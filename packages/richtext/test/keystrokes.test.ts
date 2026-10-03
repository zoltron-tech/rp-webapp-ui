import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyTextChange,
  blockText,
  diffText,
  type RichDocument,
  documentFromHtml,
  documentToHtml,
  insertMention,
  mentionQuery,
  mergeBlocks,
  normalizeDocument,
  replaceBlock,
  splitBlock,
  styleAt,
} from "../src/document.ts";
import type { RichBlock, RichMention } from "../src/types.ts";

/**
 * The editor, keystroke by keystroke, as the field reports it.
 *
 * A native field says "the text was X and is now Y" and nothing else — no key
 * names, no "the user pressed return". `applyTextChange` is how the editor
 * reads intent out of that, and these are the intents: typing, deleting,
 * autocorrect, IME composition, return, paste, and every one of them across a
 * chip. Each case is one thing a thumb does.
 */

const text = (
  value: string,
  extra: Partial<Extract<RichBlock["children"][number], { type: "text" }>> = {},
) => ({ marks: [], text: value, type: "text" as const, ...extra });

const paragraph = (
  children: RichBlock["children"],
  extra: Partial<RichBlock> = {},
): RichBlock => ({ children, type: "paragraph", ...extra });

const ada: RichMention = {
  id: "m1",
  image: "https://i/ada.png",
  kind: "MUSE",
  name: "Ada",
  type: "mention",
};

const bold = { marks: ["bold" as const] };

/** Types `input` into the block one character at a time, as a keyboard does. */
const typeInto = (block: RichBlock, at: number, input: string) => {
  let current = block;
  let caret = at;
  for (const char of input) {
    const before = blockText(current);
    const after = before.slice(0, caret) + char + before.slice(caret);
    const change = applyTextChange(current, before, after);
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") throw new Error("unreachable");
    current = change.block;
    caret = change.caret;
  }
  return { block: current, caret };
};

describe("diffText", () => {
  it("finds an insertion", () => {
    assert.deepEqual(diffText("ab", "aXb"), { end: 1, inserted: "X", start: 1 });
    assert.deepEqual(diffText("", "a"), { end: 0, inserted: "a", start: 0 });
    assert.deepEqual(diffText("ab", "abc"), { end: 2, inserted: "c", start: 2 });
  });

  it("finds a deletion", () => {
    assert.deepEqual(diffText("abc", "ac"), { end: 2, inserted: "", start: 1 });
    assert.deepEqual(diffText("abc", ""), { end: 3, inserted: "", start: 0 });
  });

  it("finds a replacement, as autocorrect makes one", () => {
    assert.deepEqual(diffText("I teh cat", "I the cat"), {
      end: 5,
      inserted: "he",
      start: 3,
    });
  });

  it("does not let the suffix overlap the prefix on repeated characters", () => {
    // "aa" → "aaa": one 'a' inserted, not a zero-length change.
    assert.deepEqual(diffText("aa", "aaa"), { end: 2, inserted: "a", start: 2 });
    assert.deepEqual(diffText("aaa", "aa"), { end: 3, inserted: "", start: 2 });
  });
});

describe("typing", () => {
  it("continues the style of the word being extended", () => {
    const { block, caret } = typeInto(paragraph([text("bol", bold)]), 3, "d!");
    assert.deepEqual(block.children, [text("bold!", bold)]);
    assert.equal(caret, 5);
  });

  it("types plain after a plain word before a bold one", () => {
    const start = paragraph([text("a "), text("b", bold)]);
    const { block } = typeInto(start, 2, "x");
    assert.deepEqual(block.children, [text("a x"), text("b", bold)]);
  });

  it("takes a pinned style for the next character only", () => {
    const start = paragraph([text("ab")]);
    const first = applyTextChange(start, "ab", "aXb", { marks: ["italic"] });
    assert.equal(first.kind, "edit");
    if (first.kind !== "edit") return;
    assert.deepEqual(first.block.children, [
      text("a"),
      text("X", { marks: ["italic"] }),
      text("b"),
    ]);
    // The next keystroke, with nothing pinned, continues from the character
    // before the caret — which is now the italic one.
    const second = applyTextChange(first.block, "aXb", "aXYb");
    assert.equal(second.kind, "edit");
    if (second.kind !== "edit") return;
    assert.deepEqual(second.block.children, [
      text("a"),
      text("XY", { marks: ["italic"] }),
      text("b"),
    ]);
  });

  it("deletes with backspace and forward-delete", () => {
    const start = paragraph([text("hello")]);
    const back = applyTextChange(start, "hello", "hell");
    assert.equal(back.kind, "edit");
    if (back.kind === "edit") {
      assert.equal(blockText(back.block), "hell");
      assert.equal(back.caret, 4);
    }
    const forward = applyTextChange(start, "hello", "ello");
    assert.equal(forward.kind, "edit");
    if (forward.kind === "edit") {
      assert.equal(blockText(forward.block), "ello");
      assert.equal(forward.caret, 0);
    }
  });

  it("applies autocorrect as one replacement, keeping the style", () => {
    const start = paragraph([text("I teh cat", bold)]);
    const change = applyTextChange(start, "I teh cat", "I the cat");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.deepEqual(change.block.children, [text("I the cat", bold)]);
    assert.equal(change.caret, 5);
  });

  it("replaces a selection with what is typed over it", () => {
    const start = paragraph([text("one two three")]);
    const change = applyTextChange(start, "one two three", "one X three");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.equal(blockText(change.block), "one X three");
  });

  it("handles IME composition replacing several characters at once", () => {
    const start = paragraph([text("こんにち")]);
    const change = applyTextChange(start, "こんにち", "こんにちは");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.equal(blockText(change.block), "こんにちは");
    const converted = applyTextChange(change.block, "こんにちは", "今日は");
    assert.equal(converted.kind, "edit");
    if (converted.kind !== "edit") return;
    assert.equal(blockText(converted.block), "今日は");
  });
});

describe("return", () => {
  it("splits the block at the caret", () => {
    const change = applyTextChange(paragraph([text("ab")]), "ab", "a\nb");
    assert.equal(change.kind, "split");
    if (change.kind !== "split") return;
    assert.equal(blockText(change.left), "a");
    assert.equal(blockText(change.right), "b");
  });

  it("at the end of a heading starts a new line in the same size", () => {
    const block = paragraph([text("Title", { fontSize: 43 })], { fontSize: 43 });
    const change = applyTextChange(block, "Title", "Title\n");
    assert.equal(change.kind, "split");
    if (change.kind !== "split") return;
    assert.equal(change.right.fontSize, 43);
    assert.deepEqual(change.right.children, []);
    // And typing on that new line is in the heading size.
    const typed = typeInto(change.right, 0, "x");
    assert.deepEqual(typed.block.children, [text("x", { fontSize: 43 })]);
  });

  it("inside a list item continues the list", () => {
    const item: RichBlock = {
      children: [text("one")],
      list: { ordered: true },
      marker: "1.",
      type: "listItem",
    };
    const change = applyTextChange(item, "one", "one\n");
    assert.equal(change.kind, "split");
    if (change.kind !== "split") return;
    assert.equal(change.right.type, "listItem");
    const doc = normalizeDocument([change.left, change.right]);
    assert.deepEqual(
      doc.map((node) => (node.type === "listItem" ? node.marker : "")),
      ["1.", "2."],
    );
  });

  it("on an empty list item leaves the list", () => {
    const item: RichBlock = {
      children: [],
      list: { ordered: false },
      marker: "•",
      type: "listItem",
    };
    const change = applyTextChange(item, "", "\n");
    assert.equal(change.kind, "split");
    if (change.kind !== "split") return;
    assert.equal(change.left.type, "paragraph");
    assert.equal(change.right.type, "paragraph");
  });

  it("is a line break, not a split, when pasted with other text", () => {
    const change = applyTextChange(paragraph([text("a")]), "a", "a\nb\nc");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.deepEqual(change.block.children, [
      text("a"),
      { type: "break" },
      text("b"),
      { type: "break" },
      text("c"),
    ]);
    assert.equal(change.caret, 5);
  });
});

describe("chips under the keyboard", () => {
  const block = paragraph([text("hi "), ada, text("!")]);
  // "hi @Ada!" — chip at [3, 7)

  it("backspace at the end of a chip removes the whole chip", () => {
    const change = applyTextChange(block, "hi @Ada!", "hi @Ad!");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.equal(blockText(change.block), "hi !");
    assert.equal(change.caret, 3);
    // The field showed "hi @Ad!"; the block says "hi !" — the editor must
    // put the caret where the block says, which is what `caret` is for.
    assert.notEqual(blockText(change.block), "hi @Ad!");
  });

  it("typing in the middle of a chip lands after it", () => {
    const change = applyTextChange(block, "hi @Ada!", "hi @Axda!");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.equal(blockText(change.block), "hi @Adax!");
    assert.equal(change.caret, 8);
    assert.equal(change.block.children[1].type, "mention");
  });

  it("selecting across a chip and typing replaces all of it", () => {
    const change = applyTextChange(block, "hi @Ada!", "hX!");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.equal(blockText(change.block), "hX!");
    assert.ok(change.block.children.every((child) => child.type === "text"));
  });

  it("typing right after a chip continues as plain text", () => {
    const change = applyTextChange(block, "hi @Ada!", "hi @Ada,!");
    assert.equal(change.kind, "edit");
    if (change.kind !== "edit") return;
    assert.equal(blockText(change.block), "hi @Ada,!");
    assert.deepEqual(styleAt(change.block, 8).marks, []);
  });
});

describe("a mention, end to end", () => {
  it("is summoned by @, narrowed by typing, and inserted as a chip", () => {
    let block = paragraph([text("hello ")]);
    let caret = 6;

    ({ block, caret } = typeInto(block, caret, "@"));
    assert.deepEqual(mentionQuery(blockText(block), caret), { at: 6, query: "" });

    ({ block, caret } = typeInto(block, caret, "ad"));
    assert.deepEqual(mentionQuery(blockText(block), caret), { at: 6, query: "ad" });

    const picked = insertMention(block, 6, caret, {
      id: "m1",
      image: "https://i/ada.png",
      kind: "MUSE",
      name: "Ada",
    });
    assert.equal(blockText(picked.block), "hello @Ada ");
    assert.equal(picked.caret, 11);
    assert.equal(mentionQuery(blockText(picked.block), picked.caret), null);

    ({ block, caret } = typeInto(picked.block, picked.caret, "there"));
    assert.equal(blockText(block), "hello @Ada there");

    const html = documentToHtml([block]);
    assert.ok(html.includes('class="mention-tag"'));
    assert.ok(html.includes('data-id="m1"'));
    assert.deepEqual(documentFromHtml(html), [block]);
  });

  it("is dismissed by a space and not reopened by a later @", () => {
    const { block, caret } = typeInto(paragraph([]), 0, "@ada ");
    assert.equal(mentionQuery(blockText(block), caret), null);
    const email = typeInto(block, caret, "me@x");
    assert.deepEqual(mentionQuery(blockText(email.block), email.caret), {
      at: 7,
      query: "x",
    });
  });
});

describe("a post, end to end", () => {
  it("survives being typed, formatted, split, merged and saved", () => {
    let doc: RichDocument = normalizeDocument([]);

    // Type a heading line.
    let typed = typeInto(doc[0] as RichBlock, 0, "Chapter One");
    doc = replaceBlock(doc, 0, typed.block);

    // Return, then type a paragraph on the new line.
    const split = applyTextChange(doc[0] as RichBlock, "Chapter One", "Chapter One\n");
    assert.equal(split.kind, "split");
    if (split.kind !== "split") return;
    doc = normalizeDocument(replaceBlock(doc, 0, split.left, split.right));
    typed = typeInto(doc[1] as RichBlock, 0, "It was dark.");
    doc = replaceBlock(doc, 1, typed.block);

    // Backspace at the start of the second line merges it into the first.
    const merged = mergeBlocks(doc[0] as RichBlock, doc[1] as RichBlock);
    assert.equal(blockText(merged), "Chapter OneIt was dark.");

    // And splitting again at the join puts it back.
    const [left, right] = splitBlock(merged, 11);
    assert.equal(blockText(left), "Chapter One");
    assert.equal(blockText(right), "It was dark.");

    const html = documentToHtml([left, right]);
    assert.equal(html, "<div>Chapter One</div><div>It was dark.</div>");
    assert.deepEqual(documentFromHtml(html), [left, right]);
  });
});
