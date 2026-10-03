import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRichText } from "../src/parse.ts";
import { richTextIsEmpty, serializeRichText } from "../src/serialize.ts";
import type { RichBlock, RichNode } from "../src/types.ts";

/**
 * The serializer against the parser: what one writes the other must read
 * back as the same tree, and what the web editor writes the serializer must
 * reproduce byte for byte where the editor's own state detection depends on
 * it.
 */

const paragraph = (
  children: RichBlock["children"],
  extra: Partial<RichBlock> = {},
): RichBlock => ({ children, type: "paragraph", ...extra });

const text = (
  value: string,
  extra: Partial<Extract<RichBlock["children"][number], { type: "text" }>> = {},
) => ({ marks: [], text: value, type: "text" as const, ...extra });

/** Serialize → parse → serialize must be a fixed point. */
const assertStable = (nodes: RichNode[]) => {
  const once = serializeRichText(nodes);
  const twice = serializeRichText(parseRichText(once));
  assert.equal(twice, once);
};

describe("serializeRichText — blocks", () => {
  it("writes a paragraph as the editor's div", () => {
    const html = serializeRichText([paragraph([text("hello")])]);
    assert.equal(html, "<div>hello</div>");
    assert.deepEqual(parseRichText(html), [paragraph([text("hello")])]);
  });

  it("writes an empty paragraph as the blank line the editor keeps", () => {
    const html = serializeRichText([paragraph([])]);
    assert.equal(html, "<div><br></div>");
    // The parser keeps the block (it is a line) with nothing in it.
    const back = parseRichText(`<div>a</div>${html}<div>b</div>`);
    assert.equal(back.length, 3);
    assert.deepEqual((back[1] as RichBlock).children, []);
  });

  it("writes alignment as an inline style and omits left", () => {
    assert.equal(
      serializeRichText([paragraph([text("x")], { align: "center" })]),
      '<div style="text-align: center">x</div>',
    );
    assert.equal(
      serializeRichText([paragraph([text("x")], { align: "justify" })]),
      '<div style="text-align: justify">x</div>',
    );
    assertStable([paragraph([text("x")], { align: "right" })]);
  });

  it("writes headings by level, clamped to 1–6, and quotes", () => {
    assert.equal(
      serializeRichText([{ children: [text("t")], level: 3, type: "heading" }]),
      "<h3>t</h3>",
    );
    assert.equal(
      serializeRichText([{ children: [text("t")], level: 9, type: "heading" }]),
      "<h6>t</h6>",
    );
    assert.equal(
      serializeRichText([{ children: [text("q")], type: "quote" }]),
      "<blockquote>q</blockquote>",
    );
    assertStable([{ children: [text("t")], level: 1, type: "heading" }]);
  });

  it("writes a line break inside a block as <br>", () => {
    const nodes = [paragraph([text("a"), { type: "break" as const }, text("b")])];
    assert.equal(serializeRichText(nodes), "<div>a<br>b</div>");
    assert.deepEqual(parseRichText("<div>a<br>b</div>"), nodes);
  });

  it("escapes text and never lets a typed tag become markup", () => {
    const nodes = [paragraph([text('<b>&"x"')])];
    const html = serializeRichText(nodes);
    assert.equal(html, '<div>&lt;b&gt;&amp;"x"</div>');
    assert.deepEqual(parseRichText(html), nodes);
  });
});

describe("serializeRichText — runs", () => {
  it("nests marks in the editor's order", () => {
    const nodes = [
      paragraph([
        text("x", { marks: ["bold", "italic", "underline", "strike", "code"] }),
      ]),
    ];
    assert.equal(
      serializeRichText(nodes),
      "<div><b><i><u><strike><code>x</code></strike></u></i></b></div>",
    );
    const back = parseRichText(serializeRichText(nodes)) as RichBlock[];
    assert.deepEqual(
      [...(back[0].children[0] as { marks: string[] }).marks].sort(),
      ["bold", "code", "italic", "strike", "underline"],
    );
  });

  for (const mark of ["bold", "italic", "underline", "strike", "code"] as const) {
    it(`round-trips a lone ${mark}`, () => {
      assertStable([paragraph([text("a"), text("b", { marks: [mark] }), text("c")])]);
    });
  }

  it("writes a highlight as one span with colour and background", () => {
    const nodes = [
      paragraph([text("hi", { background: "#eab308", color: "#f6e39c" })]),
    ];
    assert.equal(
      serializeRichText(nodes),
      '<div><span style="color: #f6e39c; background-color: #eab308">hi</span></div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("writes a link around the marks", () => {
    const nodes = [
      paragraph([text("go", { href: "https://x.y/?a=1&b=2", marks: ["bold"] })]),
    ];
    assert.equal(
      serializeRichText(nodes),
      '<div><a href="https://x.y/?a=1&amp;b=2"><b>go</b></a></div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("keeps a font family and drops the default", () => {
    const nodes = [paragraph([text("x", { fontFamily: "Times New Roman" })])];
    assert.equal(
      serializeRichText(nodes),
      '<div><span style="font-family: Times New Roman">x</span></div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
    assert.deepEqual(
      parseRichText('<div><span style="font-family: Arial">x</span></div>'),
      [paragraph([text("x")])],
    );
    assert.deepEqual(parseRichText('<div><font face="Genos">x</font></div>'), [
      paragraph([text("x", { fontFamily: "Genos" })]),
    ]);
  });
});

describe("serializeRichText — font size", () => {
  it("lifts a uniform size onto the block as the editor's token", () => {
    const nodes = [
      paragraph([text("Big", { fontSize: 43 }), text(" title", { fontSize: 43 })]),
    ];
    assert.equal(
      serializeRichText(nodes),
      '<div style="font-size: var(--font-size-h2)">Big title</div>',
    );
    const back = parseRichText(serializeRichText(nodes)) as RichBlock[];
    assert.equal(back[0].fontSize, 43);
    assert.deepEqual(back[0].children, [text("Big title", { fontSize: 43 })]);
  });

  it("keeps a run's own size when it differs from the block", () => {
    const nodes = [paragraph([text("a"), text("B", { fontSize: 27 })])];
    assert.equal(
      serializeRichText(nodes),
      '<div>a<span style="font-size: var(--font-size-h4)">B</span></div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), [
      paragraph([text("a"), text("B", { fontSize: 27 })], { fontSize: 27 }),
    ]);
  });

  it("writes a size with no token as pixels", () => {
    const nodes = [paragraph([text("x", { fontSize: 20 })])];
    assert.equal(
      serializeRichText(nodes),
      '<div style="font-size: 20px">x</div>',
    );
    assertStable(nodes);
  });

  it("keeps the size of an empty line, as the editor does", () => {
    const nodes = [paragraph([], { fontSize: 27 })];
    const html = serializeRichText(nodes);
    assert.equal(html, '<div style="font-size: var(--font-size-h4)"><br></div>');
    // Mid-document: a trailing blank line is trimmed, as the web renderer
    // trims it, whatever size it carried.
    assert.deepEqual(parseRichText(`<div>a</div>${html}<div>b</div>`), [
      paragraph([text("a")]),
      paragraph([], { fontSize: 27 }),
      paragraph([text("b")]),
    ]);
    // With text in it the text decides, as before.
    assert.deepEqual(
      parseRichText('<div style="font-size: var(--font-size-h4)">x</div>'),
      [paragraph([text("x", { fontSize: 27 })], { fontSize: 27 })],
    );
  });

  it("never records the default size", () => {
    assert.deepEqual(
      parseRichText('<div style="font-size: var(--font-size-input)">x</div>'),
      [paragraph([text("x")])],
    );
    assert.deepEqual(parseRichText('<div style="font-size: 16px">x</div>'), [
      paragraph([text("x")]),
    ]);
  });
});

describe("serializeRichText — lists", () => {
  const item = (
    value: string,
    list: RichBlock["list"],
    marker: string,
  ): RichBlock => ({ children: [text(value)], list, marker, type: "listItem" });

  it("groups adjacent items into one plain list", () => {
    const nodes = [
      item("a", { ordered: false }, "•"),
      item("b", { ordered: false }, "•"),
    ];
    assert.equal(serializeRichText(nodes), "<ul><li>a</li><li>b</li></ul>");
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("writes a bullet style twice, as the editor does", () => {
    const nodes = [item("a", { ordered: false, style: "fisheye" }, "◉")];
    assert.equal(
      serializeRichText(nodes),
      '<ul style="list-style-type: fisheye" data-list-style-type="fisheye"><li>a</li></ul>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("reads a style from either attribute and treats CSS defaults as none", () => {
    assert.deepEqual(
      parseRichText('<ul data-list-style-type="black-star"><li>a</li></ul>'),
      [item("a", { ordered: false, style: "black-star" }, "★")],
    );
    assert.deepEqual(
      parseRichText('<ul style="list-style-type: disc"><li>a</li></ul>'),
      [item("a", { ordered: false }, "•")],
    );
    assert.deepEqual(
      parseRichText('<ol style="list-style-type: decimal"><li>a</li></ol>'),
      [item("a", { ordered: true }, "1.")],
    );
  });

  it("numbers ordered lists in the chosen style", () => {
    const back = parseRichText(
      '<ol data-list-style-type="lower-roman"><li>a</li><li>b</li><li>c</li><li>d</li></ol>',
    ) as RichBlock[];
    assert.deepEqual(
      back.map((block) => block.marker),
      ["i.", "ii.", "iii.", "iv."],
    );
    const alpha = parseRichText(
      '<ol data-list-style-type="upper-alpha"><li>a</li><li>b</li></ol>',
    ) as RichBlock[];
    assert.deepEqual(
      alpha.map((block) => block.marker),
      ["A.", "B."],
    );
  });

  it("starts a new list when the style changes", () => {
    const nodes = [
      item("a", { ordered: false }, "•"),
      item("b", { ordered: true }, "1."),
      item("c", { ordered: true }, "2."),
      item("d", { ordered: true, style: "lower-alpha" }, "a."),
    ];
    assert.equal(
      serializeRichText(nodes),
      '<ul><li>a</li></ul><ol><li>b</li><li>c</li></ol><ol style="list-style-type: lower-alpha" data-list-style-type="lower-alpha"><li>d</li></ol>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("closes a list before a paragraph or an image", () => {
    const nodes: RichNode[] = [
      item("a", { ordered: false }, "•"),
      paragraph([text("p")]),
      item("b", { ordered: false }, "•"),
      { src: "https://i/x.png", type: "image", widthPercent: 50, wrap: "full" },
      item("c", { ordered: false }, "•"),
    ];
    const html = serializeRichText(nodes);
    assert.equal((html.match(/<ul>/g) ?? []).length, 3);
    assertStable(nodes);
  });
});

describe("serializeRichText — mentions and images", () => {
  it("writes createMentionChip's markup and reads it back", () => {
    const nodes = [
      paragraph([
        text("hi "),
        {
          id: "m1",
          image: "https://i/ada.png",
          kind: "MUSE" as const,
          name: "Ada Lovelace",
          type: "mention" as const,
        },
        text(" there"),
      ]),
    ];
    assert.equal(
      serializeRichText(nodes),
      '<div>hi <span class="mention-tag" contenteditable="false" data-type="MUSE" data-id="m1"><img src="https://i/ada.png" alt="Ada Lovelace" class="mention-avatar"><span class="mention-text">Ada Lovelace</span></span> there</div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("writes an editor-sized image exactly as insertImageFromUrl does", () => {
    const nodes: RichNode[] = [
      {
        align: "center",
        alt: "A cat",
        src: "https://i/cat.gif",
        type: "image",
        widthPercent: 50,
        wrap: "inline-left",
      },
    ];
    assert.equal(
      serializeRichText(nodes),
      '<div style="text-align: center"><span class="inline-image-container" contenteditable="false" style="width: 50%" data-wrap="inline-left"><img src="https://i/cat.gif" class="inline-image" alt="A cat" style="width: 100%; height: auto; max-width: none; max-height: none" data-width-pct="50"></span></div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("keeps a pasted image's own pixel caps", () => {
    const nodes: RichNode[] = [
      { maxHeight: 32, maxWidth: 32, src: "https://i/emoji.png", type: "image" },
    ];
    assert.equal(
      serializeRichText(nodes),
      '<div><img src="https://i/emoji.png" style="max-width: 32px; max-height: 32px"></div>',
    );
    assert.deepEqual(parseRichText(serializeRichText(nodes)), nodes);
  });

  it("does not mistake a mention's avatar for an image block", () => {
    const back = parseRichText(
      '<div><span class="mention-tag" data-type="NOVELIST" data-id="n1"><img src="https://i/a.png"><span>ada</span></span></div>',
    );
    assert.equal(back.length, 1);
    assert.equal(back[0].type, "paragraph");
  });
});

describe("richTextIsEmpty", () => {
  it("is true for nothing, whitespace and blank lines", () => {
    assert.equal(richTextIsEmpty([]), true);
    assert.equal(richTextIsEmpty([paragraph([])]), true);
    assert.equal(richTextIsEmpty([paragraph([text("   ")])]), true);
    assert.equal(
      richTextIsEmpty([paragraph([{ type: "break" }]), paragraph([])]),
      true,
    );
  });

  it("is false for text, a mention or an image", () => {
    assert.equal(richTextIsEmpty([paragraph([text("a")])]), false);
    assert.equal(
      richTextIsEmpty([
        paragraph([{ id: "1", kind: "MUSE", name: "x", type: "mention" }]),
      ]),
      false,
    );
    assert.equal(
      richTextIsEmpty([{ src: "https://i/x.png", type: "image" }]),
      false,
    );
  });
});

describe("web-authored content survives a phone", () => {
  it("is a fixed point for a page the web editor might have written", () => {
    const web = [
      '<div style="text-align: center; font-size: var(--font-size-h2)"><b>Chapter One</b></div>',
      "<div><br></div>",
      '<div>It was a <i>dark</i> and <span style="color: #f6e39c; background-color: #eab308">stormy</span> night, said <span class="mention-tag" contenteditable="false" data-type="MUSE" data-id="m1"><img src="https://i/ada.png" alt="Ada" class="mention-avatar"><span class="mention-text">Ada</span></span> to nobody.</div>',
      '<ul style="list-style-type: arrow-heavy" data-list-style-type="arrow-heavy"><li>first</li><li style="text-align: right">second</li></ul>',
      '<ol><li>one</li><li>two</li></ol>',
      '<div style="text-align: center"><span class="inline-image-container" contenteditable="false" style="width: 40%" data-wrap="full"><img src="https://i/cat.gif" class="inline-image" alt="cat" style="width: 100%; height: auto; max-width: none; max-height: none" data-width-pct="40"></span></div>',
      "<div><br></div>",
      '<div><span style="font-family: Savate">The end.</span></div>',
    ].join("");

    const once = serializeRichText(parseRichText(web));
    assert.equal(once, web);
    assert.equal(serializeRichText(parseRichText(once)), once);
  });
});
