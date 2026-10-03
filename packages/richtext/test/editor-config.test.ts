import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BULLET_POINT_CATEGORIES,
  HIGHLIGHT_COLORS,
  highlightTextColor,
  ORDERED_LIST_STYLES,
  QUOTATION_MARK_CATEGORIES,
} from "../src/editor-config.ts";
import { BULLET_GLYPHS, listMarker } from "../src/parse.ts";

describe("editor config", () => {
  it("mixes a highlight's text colour 35% towards white, as web does", () => {
    assert.equal(highlightTextColor("#000000"), "#595959");
    assert.equal(highlightTextColor("#ffffff"), "#ffffff");
    assert.equal(highlightTextColor("#eab308"), "#f1ce5e");
  });

  it("offers fifteen swatches for a four-by-four grid with a remove cell", () => {
    assert.equal(HIGHLIGHT_COLORS.length, 15);
    assert.equal(new Set(HIGHLIGHT_COLORS.map((c) => c.value)).size, 15);
  });

  it("names only bullets the parser can draw", () => {
    for (const category of BULLET_POINT_CATEGORIES) {
      for (const symbol of category.symbols) {
        assert.ok(BULLET_GLYPHS[symbol.value], `${symbol.value} has no glyph`);
        assert.equal(symbol.label, BULLET_GLYPHS[symbol.value]);
        assert.equal(
          listMarker({ ordered: false, style: symbol.value }, 1),
          symbol.label,
        );
      }
    }
  });

  it("numbers every ordered style", () => {
    const expected: Record<string, string[]> = {
      decimal: ["1.", "2.", "10."],
      "lower-alpha": ["a.", "b.", "j."],
      "lower-roman": ["i.", "ii.", "x."],
      "upper-alpha": ["A.", "B.", "J."],
      "upper-roman": ["I.", "II.", "X."],
    };
    for (const style of ORDERED_LIST_STYLES) {
      const marks = [1, 2, 10].map((n) =>
        listMarker({ ordered: true, style: style.value }, n),
      );
      assert.deepEqual(marks, expected[style.value]);
    }
    // Past z, alphabetic numbering carries like a spreadsheet column.
    assert.equal(listMarker({ ordered: true, style: "lower-alpha" }, 27), "aa.");
  });

  it("inserts quotation marks as the characters themselves", () => {
    for (const category of QUOTATION_MARK_CATEGORIES) {
      for (const symbol of category.symbols) {
        assert.equal(symbol.label, symbol.value);
      }
    }
  });
});
