import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRichText } from "../src/parse.ts";
import type { RichBlock, RichTextRun } from "../src/types.ts";

const runs = (html: string): RichTextRun[] =>
  (parseRichText(html)[0] as RichBlock).children.filter(
    (child): child is RichTextRun => child.type === "text",
  );

describe("parseRichText — font size cascade", () => {
  it("lets an explicit Normal size override a sized parent", () => {
    const [normal, big] = runs(
      '<p style="font-size: 28px"><span style="font-size: 16px">normal</span> BIG</p>',
    );
    assert.equal(normal.fontSize, undefined);
    assert.equal(big.fontSize, 28);
  });

  it("treats the input token as Normal at every level", () => {
    const [run] = runs(
      '<div style="font-size: var(--font-size-input)"><div style="font-size: var(--font-size-input)">text</div></div>',
    );
    assert.equal(run.fontSize, undefined);
    assert.equal((parseRichText("<p>x</p>")[0] as RichBlock).fontSize, undefined);
  });

  it("does not record Normal as a block size", () => {
    const block = parseRichText(
      '<p style="font-size: 16px">plain</p>',
    )[0] as RichBlock;
    assert.equal(block.fontSize, undefined);
  });

  it("keeps a sized run inside normal text sized", () => {
    const [, big, after] = runs(
      '<p>before <span style="font-size: var(--font-size-h4)">big</span> after</p>',
    );
    assert.equal(big.fontSize, 27);
    assert.equal(after.fontSize, undefined);
  });
});

describe("parseRichText — marks written as styles", () => {
  it("reads italic, bold and decorations from span styles", () => {
    const [italic, both, line] = runs(
      '<div><span style="font-style: italic;">a</span><span style="font-weight: bold; font-style: italic;">b</span><span style="text-decoration: underline line-through">c</span></div>',
    );
    assert.deepEqual(italic.marks, ["italic"]);
    assert.deepEqual([...both.marks].sort(), ["bold", "italic"]);
    assert.deepEqual([...line.marks].sort(), ["strike", "underline"]);
  });

  it("reads numeric weights and ignores normal ones", () => {
    const [heavy, regular] = runs(
      '<p><span style="font-weight: 700">a</span><span style="font-weight: 400">b</span></p>',
    );
    assert.deepEqual(heavy.marks, ["bold"]);
    assert.deepEqual(regular.marks, []);
  });

  it("does not double a mark a tag already gives", () => {
    const [run] = runs('<p><b style="font-weight: bold">a</b></p>');
    assert.deepEqual(run.marks, ["bold"]);
  });
});
