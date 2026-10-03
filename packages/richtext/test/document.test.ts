import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  backgroundIn,
  blockLength,
  blockText,
  documentFromHtml,
  documentIsEmpty,
  documentToHtml,
  EMPTY_STYLE,
  fontFamilyIn,
  emptyParagraph,
  imageSources,
  insertImageAfter,
  insertMention,
  marksIn,
  mentionQuery,
  mergeBlocks,
  normalizeDocument,
  removeBlock,
  replaceRange,
  type RichDocument,
  setBlockAlign,
  setBlockFontSize,
  setBlockType,
  setFontFamily,
  setHighlight,
  setListStyle,
  setMark,
  splitBlock,
  styleAt,
  toggleList,
  toggleMark,
  updateImage,
} from "../src/document.ts";
import type { RichBlock, RichMention } from "../src/types.ts";

/**
 * The editing model, keystroke by keystroke.
 *
 * Every case here is something a thumb does: type at the end of a bold word,
 * select half a word and press B, backspace into a chip, press return in a
 * list, insert a picture. The native editor is a thin caller of these, so
 * what these do is what the editor does.
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

describe("plain text of a block", () => {
  it("reads runs, breaks and mentions as the field would show them", () => {
    const block = paragraph([text("hi "), ada, { type: "break" }, text("x")]);
    assert.equal(blockText(block), "hi @Ada\nx");
    assert.equal(blockLength(block), 9);
  });
});

describe("replaceRange — typing", () => {
  it("inserts at the caret in the given style", () => {
    const { block, caret } = replaceRange(
      paragraph([text("ab")]),
      { end: 1, start: 1 },
      "X",
      bold,
    );
    assert.deepEqual(block.children, [text("a"), text("X", bold), text("b")]);
    assert.equal(caret, 2);
  });

  it("joins with the run it continues", () => {
    const { block } = replaceRange(
      paragraph([text("ab", bold)]),
      { end: 2, start: 2 },
      "c",
      bold,
    );
    assert.deepEqual(block.children, [text("abc", bold)]);
  });

  it("replaces a selection, across runs", () => {
    const { block, caret } = replaceRange(
      paragraph([text("one "), text("two", bold), text(" three")]),
      { end: 9, start: 2 },
      "X",
      EMPTY_STYLE,
    );
    assert.equal(blockText(block), "onXhree");
    assert.equal(caret, 3);
  });

  it("deletes when given nothing", () => {
    const { block, caret } = replaceRange(
      paragraph([text("hello")]),
      { end: 5, start: 4 },
      "",
      EMPTY_STYLE,
    );
    assert.equal(blockText(block), "hell");
    assert.equal(caret, 4);
  });

  it("accepts a reversed range", () => {
    const { block } = replaceRange(
      paragraph([text("hello")]),
      { end: 1, start: 4 },
      "",
      EMPTY_STYLE,
    );
    assert.equal(blockText(block), "ho");
  });

  it("turns a newline into a line break, not a new block", () => {
    const { block, caret } = replaceRange(
      paragraph([text("ab")]),
      { end: 1, start: 1 },
      "\n",
      EMPTY_STYLE,
    );
    assert.deepEqual(block.children, [text("a"), { type: "break" }, text("b")]);
    assert.equal(caret, 2);
  });

  it("recomputes the block's size from its runs", () => {
    const { block } = replaceRange(
      paragraph([text("a", { fontSize: 43 })], { fontSize: 43 }),
      { end: 1, start: 0 },
      "b",
      EMPTY_STYLE,
    );
    assert.equal(block.fontSize, undefined);
  });
});

describe("replaceRange — mentions are atomic", () => {
  const block = paragraph([text("hi "), ada, text(" there")]);
  // "hi @Ada there": chip spans [3, 7)

  it("backspacing the last character of a chip removes the chip", () => {
    const { block: next, caret } = replaceRange(
      block,
      { end: 7, start: 6 },
      "",
      EMPTY_STYLE,
    );
    assert.equal(blockText(next), "hi  there");
    assert.equal(caret, 3);
  });

  it("a selection that cuts into a chip takes the whole chip", () => {
    const { block: next } = replaceRange(
      block,
      { end: 5, start: 1 },
      "",
      EMPTY_STYLE,
    );
    assert.equal(blockText(next), "h there");
  });

  it("a caret inside a chip types after it", () => {
    const { block: next, caret } = replaceRange(
      block,
      { end: 5, start: 5 },
      "!",
      EMPTY_STYLE,
    );
    assert.equal(blockText(next), "hi @Ada! there");
    assert.equal(caret, 8);
  });

  it("a caret at a chip's edge types beside it, not into it", () => {
    const before = replaceRange(block, { end: 3, start: 3 }, "x", EMPTY_STYLE);
    assert.equal(blockText(before.block), "hi x@Ada there");
    const after = replaceRange(block, { end: 7, start: 7 }, "x", EMPTY_STYLE);
    assert.equal(blockText(after.block), "hi @Adax there");
  });

  it("selecting exactly a chip and typing replaces it", () => {
    const { block: next } = replaceRange(
      block,
      { end: 7, start: 3 },
      "Bob",
      EMPTY_STYLE,
    );
    assert.equal(blockText(next), "hi Bob there");
    assert.ok(next.children.every((child) => child.type === "text"));
  });
});

describe("styleAt and marksIn", () => {
  const block = paragraph([text("ab", bold), text("cd"), ada, text("e")]);
  // "abcd@Adae": bold [0,2), plain [2,4), chip [4,8), plain [8,9)

  it("continues the style of the character before the caret", () => {
    assert.deepEqual(styleAt(block, 2).marks, ["bold"]);
    assert.deepEqual(styleAt(block, 1).marks, ["bold"]);
    assert.deepEqual(styleAt(block, 3).marks, []);
  });

  it("takes the first run's style at the start of the block", () => {
    assert.deepEqual(styleAt(block, 0).marks, ["bold"]);
    assert.deepEqual(styleAt(paragraph([]), 0), EMPTY_STYLE);
  });

  it("takes nothing from a chip", () => {
    assert.deepEqual(styleAt(block, 8).marks, []);
    assert.deepEqual(styleAt(paragraph([ada]), 4).marks, []);
  });

  it("reports a mark only when every run in the range has it", () => {
    assert.deepEqual(marksIn(block, { end: 2, start: 0 }), ["bold"]);
    assert.deepEqual(marksIn(block, { end: 3, start: 0 }), []);
    assert.deepEqual(marksIn(block, { end: 1, start: 1 }), ["bold"]);
    assert.deepEqual(marksIn(block, { end: 8, start: 4 }), []);
  });
});

describe("toggleMark and setMark", () => {
  it("adds a mark to a partly-marked range, then removes it", () => {
    const block = paragraph([text("ab", bold), text("cd")]);
    const on = toggleMark(block, { end: 4, start: 0 }, "bold");
    assert.deepEqual(on.children, [text("abcd", bold)]);
    const off = toggleMark(on, { end: 4, start: 0 }, "bold");
    assert.deepEqual(off.children, [text("abcd")]);
  });

  it("splits a run at the range edges", () => {
    const block = paragraph([text("hello world")]);
    const next = toggleMark(block, { end: 5, start: 2 }, "italic");
    assert.deepEqual(next.children, [
      text("he"),
      text("llo", { marks: ["italic"] }),
      text(" world"),
    ]);
  });

  it("leaves a chip inside the range alone", () => {
    const block = paragraph([text("a"), ada, text("b")]);
    const next = toggleMark(block, { end: 6, start: 0 }, "bold");
    assert.deepEqual(next.children, [text("a", bold), ada, text("b", bold)]);
  });

  it("does nothing for a collapsed range", () => {
    const block = paragraph([text("ab")]);
    assert.equal(toggleMark(block, { end: 1, start: 1 }, "bold"), block);
  });

  it("setMark is absolute", () => {
    const block = paragraph([text("ab", bold), text("cd")]);
    assert.deepEqual(setMark(block, { end: 4, start: 0 }, "bold", false).children, [
      text("abcd"),
    ]);
    assert.deepEqual(setMark(block, { end: 4, start: 0 }, "bold", true).children, [
      text("abcd", bold),
    ]);
  });
});

describe("setHighlight and backgroundIn", () => {
  const swatch = { background: "#eab308", color: "#f6e39c" };

  it("paints a range and reads it back", () => {
    const block = setHighlight(
      paragraph([text("hello")]),
      { end: 4, start: 1 },
      swatch,
    );
    assert.deepEqual(block.children, [
      text("h"),
      text("ell", swatch),
      text("o"),
    ]);
    assert.equal(backgroundIn(block, { end: 4, start: 1 }), "#eab308");
    assert.equal(backgroundIn(block, { end: 5, start: 0 }), null);
    assert.equal(backgroundIn(block, { end: 2, start: 2 }), "#eab308");
  });

  it("clears with null", () => {
    const painted = paragraph([text("x", swatch)]);
    assert.deepEqual(
      setHighlight(painted, { end: 1, start: 0 }, null).children,
      [text("x")],
    );
  });
});

describe("block-level styles", () => {
  it("applies a size to every run and records it on the block", () => {
    const block = setBlockFontSize(
      paragraph([text("a", bold), ada, text("b")]),
      43,
    );
    assert.deepEqual(block.children, [
      text("a", { ...bold, fontSize: 43 }),
      ada,
      text("b", { fontSize: 43 }),
    ]);
    assert.equal(block.fontSize, 43);
    assert.equal(setBlockFontSize(block, undefined).fontSize, undefined);
  });

  it("stores alignment and treats left as none", () => {
    const block = paragraph([text("x")]);
    assert.equal(setBlockAlign(block, "center").align, "center");
    assert.equal("align" in setBlockAlign(block, "left"), false);
    assert.equal(
      "align" in setBlockAlign(setBlockAlign(block, "right"), undefined),
      false,
    );
  });
});

describe("splitBlock and mergeBlocks", () => {
  it("splits in the middle and keeps the block's properties on both", () => {
    const block = paragraph([text("hello world", bold)], { align: "center" });
    const [left, right] = splitBlock(block, 5);
    assert.equal(blockText(left), "hello");
    assert.equal(blockText(right), " world");
    assert.equal(left.align, "center");
    assert.equal(right.align, "center");
    assert.deepEqual(right.children, [text(" world", bold)]);
  });

  it("splits at either end", () => {
    const block = paragraph([text("ab")]);
    assert.deepEqual(
      splitBlock(block, 0).map(blockText),
      ["", "ab"],
    );
    assert.deepEqual(
      splitBlock(block, 2).map(blockText),
      ["ab", ""],
    );
  });

  it("carries the size onto an empty new line", () => {
    const block = paragraph([text("Title", { fontSize: 43 })], { fontSize: 43 });
    const [, right] = splitBlock(block, 5);
    assert.equal(right.fontSize, 43);
  });

  it("keeps a list item in its list", () => {
    const item: RichBlock = {
      children: [text("ab")],
      list: { ordered: true },
      marker: "1.",
      type: "listItem",
    };
    const [left, right] = splitBlock(item, 1);
    assert.equal(left.type, "listItem");
    assert.equal(right.type, "listItem");
    assert.deepEqual(right.list, { ordered: true });
  });

  it("leaves the list from an empty item", () => {
    const item: RichBlock = {
      children: [],
      list: { ordered: false },
      marker: "•",
      type: "listItem",
    };
    const [left, right] = splitBlock(item, 0);
    assert.equal(left.type, "paragraph");
    assert.equal(left.list, undefined);
    assert.equal(right.type, "paragraph");
  });

  it("merges and joins like runs", () => {
    const merged = mergeBlocks(paragraph([text("ab")]), paragraph([text("cd")]));
    assert.deepEqual(merged.children, [text("abcd")]);
    const mixed = mergeBlocks(
      paragraph([text("a", bold)]),
      paragraph([text("b")], { align: "right" }),
    );
    assert.deepEqual(mixed.children, [text("a", bold), text("b")]);
    assert.equal(mixed.align, undefined);
  });
});

describe("mentions", () => {
  it("finds the query the caret is at the end of", () => {
    assert.deepEqual(mentionQuery("@ada", 4), { at: 0, query: "ada" });
    assert.deepEqual(mentionQuery("hi @a", 5), { at: 3, query: "a" });
    assert.deepEqual(mentionQuery("hi @", 4), { at: 3, query: "" });
    assert.equal(mentionQuery("@a b", 4), null);
    assert.equal(mentionQuery("no at", 5), null);
    assert.deepEqual(mentionQuery("@ada more", 4), { at: 0, query: "ada" });
  });

  it("replaces the query with a chip and a space", () => {
    const block = paragraph([text("hi @ad and")]);
    const { block: next, caret } = insertMention(block, 3, 6, {
      id: "m1",
      image: "https://i/ada.png",
      kind: "MUSE",
      name: "Ada",
    });
    assert.equal(blockText(next), "hi @Ada  and");
    assert.equal(next.children[1].type, "mention");
    assert.equal(caret, 8);
  });
});

describe("document", () => {
  it("always has a paragraph to type in", () => {
    assert.deepEqual(normalizeDocument([]), [emptyParagraph()]);
    const doc = normalizeDocument([{ src: "https://i/x.png", type: "image" }]);
    assert.equal(doc.length, 2);
    assert.equal(doc[1].type, "paragraph");
  });

  it("numbers each list from one", () => {
    const item = (value: string, ordered: boolean): RichBlock => ({
      children: [text(value)],
      list: { ordered },
      type: "listItem",
    });
    const doc = normalizeDocument([
      item("a", true),
      item("b", true),
      paragraph([text("x")]),
      item("c", true),
      item("d", false),
    ]);
    assert.deepEqual(
      doc.map((node) => (node.type === "image" ? "" : (node.marker ?? "-"))),
      ["1.", "2.", "-", "1.", "•"],
    );
  });

  it("toggles a paragraph into a list, switches kinds and back out", () => {
    let doc: RichDocument = [paragraph([text("a")])];
    doc = toggleList(doc, 0, false);
    assert.equal(doc[0].type, "listItem");
    assert.equal((doc[0] as RichBlock).marker, "•");
    doc = toggleList(doc, 0, true);
    assert.equal((doc[0] as RichBlock).marker, "1.");
    doc = toggleList(doc, 0, true);
    assert.equal(doc[0].type, "paragraph");
    assert.equal("marker" in doc[0], false);
  });

  it("restyles only the list the item sits in", () => {
    const item = (value: string): RichBlock => ({
      children: [text(value)],
      list: { ordered: false },
      type: "listItem",
    });
    const doc = setListStyle(
      normalizeDocument([
        item("a"),
        item("b"),
        paragraph([]),
        item("c"),
      ]),
      0,
      "black-star",
    );
    assert.deepEqual(
      doc.map((node) => (node.type === "listItem" ? node.list?.style : "-")),
      ["black-star", "black-star", "-", undefined],
    );
    assert.equal((doc[0] as RichBlock).marker, "★");
    assert.equal((doc[3] as RichBlock).marker, "•");
  });

  it("inserts an image after the line with a line to type on", () => {
    const { caret, doc } = insertImageAfter(
      [paragraph([text("a", { fontSize: 27 })], { fontSize: 27 })],
      0,
      { src: "https://i/x.png" },
    );
    assert.equal(doc.length, 3);
    assert.deepEqual(doc[1], {
      src: "https://i/x.png",
      type: "image",
      widthPercent: 50,
      wrap: "full",
    });
    assert.equal((doc[2] as RichBlock).fontSize, 27);
    assert.equal(caret, 2);
    assert.deepEqual(imageSources(doc), ["https://i/x.png"]);
  });

  it("patches an image and drops what is cleared", () => {
    const doc: RichDocument = [
      { src: "https://i/x.png", type: "image", widthPercent: 50 },
      emptyParagraph(),
    ];
    const next = updateImage(doc, 0, {
      align: "right",
      alt: "x",
      widthPercent: 80,
      wrap: "inline-right",
    });
    assert.deepEqual(next[0], {
      align: "right",
      alt: "x",
      src: "https://i/x.png",
      type: "image",
      widthPercent: 80,
      wrap: "inline-right",
    });
    assert.equal("alt" in updateImage(next, 0, { alt: undefined })[0], false);
    assert.equal(updateImage(doc, 1, { alt: "no" }), doc);
  });

  it("removes a block and keeps the document editable", () => {
    const doc: RichDocument = [
      paragraph([text("a")]),
      { src: "https://i/x.png", type: "image" },
      emptyParagraph(),
    ];
    assert.equal(removeBlock(doc, 1).length, 2);
    assert.deepEqual(removeBlock([paragraph([text("a")])], 0), [
      emptyParagraph(),
    ]);
  });

  it("turns a block into a quote and back", () => {
    const doc = setBlockType([paragraph([text("q")])], 0, "quote");
    assert.equal(doc[0].type, "quote");
    assert.equal(setBlockType(doc, 0, "paragraph")[0].type, "paragraph");
  });
});

describe("in and out", () => {
  it("round-trips a document through the editor's HTML", () => {
    const doc = normalizeDocument([
      paragraph([text("Title", { fontSize: 43 })], { align: "center" }),
      paragraph([text("hi "), ada, text(" and "), text("you", bold)]),
      {
        children: [text("one")],
        list: { ordered: true, style: "lower-roman" },
        type: "listItem",
      },
      { src: "https://i/x.png", type: "image", widthPercent: 30 },
    ]);
    const html = documentToHtml(doc);
    assert.deepEqual(documentFromHtml(html), doc);
  });

  it("writes nothing for an empty document", () => {
    assert.equal(documentToHtml([emptyParagraph(), emptyParagraph()]), "");
    assert.equal(documentIsEmpty([emptyParagraph()]), true);
    assert.equal(documentIsEmpty([paragraph([ada])]), false);
  });

  it("reads nothing as one empty line", () => {
    assert.deepEqual(documentFromHtml(""), [emptyParagraph()]);
    assert.deepEqual(documentFromHtml(null), [emptyParagraph()]);
  });
});

describe("font family", () => {
  const block = () => documentFromHtml("<div>Hello world</div>")[0];

  it("sets a family over a range and reads it back", () => {
    const b = block();
    if (b.type === "image") throw new Error("expected text");
    const next = setFontFamily(b, { end: 5, start: 0 }, "Savate");
    assert.equal(fontFamilyIn(next, { end: 5, start: 0 }), "Savate");
    assert.equal(fontFamilyIn(next, { end: 11, start: 6 }), undefined);
    // Mixed: the whole line has no one family.
    assert.equal(fontFamilyIn(next, { end: 11, start: 0 }), undefined);
    assert.equal(
      documentToHtml([next]),
      '<div><span style="font-family: Savate">Hello</span> world</div>',
    );
  });

  it("clears back to the default face", () => {
    const b = block();
    if (b.type === "image") throw new Error("expected text");
    const styled = setFontFamily(b, { end: 11, start: 0 }, "Genos");
    const cleared = setFontFamily(styled, { end: 11, start: 0 }, undefined);
    assert.equal(fontFamilyIn(cleared, { end: 11, start: 0 }), undefined);
    assert.equal(documentToHtml([cleared]), "<div>Hello world</div>");
  });

  it("a collapsed caret reads the family of the character before it", () => {
    const b = block();
    if (b.type === "image") throw new Error("expected text");
    const next = setFontFamily(b, { end: 5, start: 0 }, "Tourney");
    assert.equal(fontFamilyIn(next, { end: 3, start: 3 }), "Tourney");
    assert.equal(fontFamilyIn(next, { end: 8, start: 8 }), undefined);
  });
});
