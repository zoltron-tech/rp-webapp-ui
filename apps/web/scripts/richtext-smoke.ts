/**
 * The rich-text parser, checked against the markup the editor actually saves.
 *
 * Worth a smoke test because this is the one piece of shared code with real
 * logic in it rather than data: everything else in `packages/` is tokens,
 * endpoints or hooks that fail loudly. A parser fails quietly — a dropped
 * mention or a swallowed paragraph looks like an empty About, on both clients
 * at once, and nothing else in `verify` would notice.
 */
import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { RichBlock, RichNode } from "@nw/richtext";

let failures = 0;

const check = (name: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    console.log(`PASS  ${name}  (${a})`);
  } else {
    failures += 1;
    console.error(`FAIL  ${name}\n        expected ${b}\n        actual   ${a}`);
  }
};

const blocks = (nodes: RichNode[]) =>
  nodes.filter((node): node is RichBlock => node.type !== "image");

// ── Paragraphs and marks ────────────────────────────────────────────────────
{
  const nodes = parseRichText("<p>Hello <strong>bold</strong> world</p>");
  check("one paragraph", nodes.length, 1);
  check("three runs", blocks(nodes)[0].children.length, 3);
  check(
    "the middle run is bold",
    (blocks(nodes)[0].children[1] as { marks: string[] }).marks,
    ["bold"],
  );
}

{
  const nodes = parseRichText("<p><em><u>both</u></em></p>");
  check(
    "nested marks accumulate",
    (blocks(nodes)[0].children[0] as { marks: string[] }).marks,
    ["italic", "underline"],
  );
}

// ── Mentions ────────────────────────────────────────────────────────────────
{
  const html =
    '<p>hi <span class="mention-tag" data-type="MUSE" data-id="m1">' +
    '<img class="mention-avatar" src="a.png"/>' +
    '<span class="mention-text">Aria</span></span>!</p>';
  const children = blocks(parseRichText(html))[0].children;
  const mention = children.find((child) => child.type === "mention");
  check("mention is one node", mention?.type, "mention");
  check("mention keeps its id", (mention as { id: string })?.id, "m1");
  check("mention keeps its kind", (mention as { kind: string })?.kind, "MUSE");
  check("mention keeps its name", (mention as { name: string })?.name, "Aria");
  check(
    "mention keeps its avatar",
    (mention as { image?: string })?.image,
    "a.png",
  );
  check(
    "the avatar is not also an image block",
    parseRichText(html).some((node) => node.type === "image"),
    false,
  );
}

// ── Images, lists, quotes, breaks ────────────────────────────────────────────
{
  const nodes = parseRichText('<p>before</p><img src="x.png" alt="a cat">');
  check("image becomes its own block", nodes[1]?.type, "image");
  check("image keeps alt", (nodes[1] as { alt?: string }).alt, "a cat");
}

{
  const nodes = parseRichText("<ol><li>one</li><li>two</li></ol>");
  check("ordered markers count up", blocks(nodes).map((b) => b.marker), [
    "1.",
    "2.",
  ]);
}

{
  const nodes = parseRichText("<ul><li>a</li></ul>");
  check("unordered marker is a bullet", blocks(nodes)[0].marker, "•");
}

{
  const nodes = parseRichText("<p>a<br>b</p>");
  check(
    "a break survives inside a paragraph",
    blocks(nodes)[0].children.map((child) => child.type),
    ["text", "break", "text"],
  );
}

// ── The things that used to break ───────────────────────────────────────────
check("entities are decoded", richTextToPlainText(parseRichText("<p>a &amp; b</p>")), "a & b");
check("numeric entities are decoded", richTextToPlainText(parseRichText("<p>&#233;</p>")), "é");
check("empty input is an empty document", parseRichText("").length, 0);
check("null input is an empty document", parseRichText(null).length, 0);
check(
  "trailing empty paragraphs are dropped",
  parseRichText("<p>text</p><p><br></p><p>   </p>").length,
  1,
);
check(
  "an unclosed tag does not swallow the rest",
  richTextToPlainText(parseRichText("<p><strong>bold<p>after</p>")),
  "bold\nafter",
);
check(
  "unknown tags render their children",
  richTextToPlainText(parseRichText("<p><mark>kept</mark></p>")),
  "kept",
);
check(
  "script content is not rendered",
  richTextToPlainText(parseRichText("<p>a</p><script>alert(1)</script>")),
  "a",
);
check(
  "plain text with no tags still parses",
  richTextToPlainText(parseRichText("just words")),
  "just words",
);
check(
  "an inline colour is captured",
  (blocks(parseRichText('<p><span style="color: #ff0000">red</span></p>'))[0]
    .children[0] as { color?: string }).color,
  "#ff0000",
);
check(
  "a link is captured on the run",
  (blocks(parseRichText('<p><a href="https://x.test">go</a></p>'))[0]
    .children[0] as { href?: string }).href,
  "https://x.test",
);

// ── Newlines and alignment: the two things the first version dropped ────────
{
  // Profiles are frequently one plain-text blob with literal newlines, and the
  // web renderer shows them because saved content is `white-space: pre-wrap`.
  const nodes = parseRichText("line one\nline two\n\nline four");
  check(
    "newlines become breaks",
    blocks(nodes)[0].children.map((child) => child.type),
    ["text", "break", "text", "break", "break", "text"],
  );
  check(
    "a blank line survives as two breaks",
    richTextToPlainText(nodes),
    "line one\nline two\n\nline four",
  );
}

check(
  "runs of spaces are preserved, as `pre-wrap` preserves them",
  richTextToPlainText(parseRichText("a   b\n  c")),
  "a   b\n  c",
);

check(
  "leading indentation survives — it is how profiles centre a line",
  (blocks(
    parseRichText("<div>       ╰─➤  text</div>"),
  )[0].children[0] as { text: string }).text,
  "       ╰─➤  text",
);

{
  const nodes = parseRichText(
    '<div style="text-align: center;">mid</div><div style="text-align: right;">end</div>',
  );
  check("alignment is read off the block", blocks(nodes).map((b) => b.align), [
    "center",
    "right",
  ]);
}

check(
  "alignment is inherited by nested blocks",
  blocks(
    parseRichText('<div style="text-align: center;"><div>inner</div></div>'),
  )[0].align,
  "center",
);

check(
  "an unknown alignment is ignored rather than passed through",
  blocks(parseRichText('<div style="text-align: bogus;">x</div>'))[0].align,
  undefined,
);

// ── Size, highlight, image sizing and blank lines ────────────────────────
check(
  "a font-size token resolves to pixels",
  (blocks(
    parseRichText(
      '<div style="font-size: var(--font-size-h2);">big</div>',
    ),
  )[0].children[0] as { fontSize?: number }).fontSize,
  43,
);

check(
  "the default size is not recorded as an override",
  (blocks(
    parseRichText(
      '<div style="font-size: var(--font-size-input);">plain</div>',
    ),
  )[0].children[0] as { fontSize?: number }).fontSize,
  undefined,
);

check(
  "the block reports its largest run",
  blocks(
    parseRichText(
      '<div>small <span style="font-size: var(--font-size-h4);">big</span></div>',
    ),
  )[0].fontSize,
  27,
);

check(
  "a highlight is captured",
  (blocks(
    parseRichText(
      '<div><font style="background-color: rgba(244, 63, 94, 0.16);">hi</font></div>',
    ),
  )[0].children[0] as { background?: string }).background,
  "rgba(244, 63, 94, 0.16)",
);

check(
  "font tags carry their colour through",
  (blocks(
    parseRichText('<div><font style="color: rgb(248, 130, 150);">x</font></div>'),
  )[0].children[0] as { color?: string }).color,
  "rgb(248, 130, 150)",
);

{
  const nodes = parseRichText(
    '<div style="text-align: center;">' +
      '<span class="inline-image-container" style="width: 32%;">' +
      '<img src="g.gif" data-width-pct="32"></span></div>',
  );
  const image = nodes.find((node) => node.type === "image");
  check("an image keeps its authored width", (image as { widthPercent?: number })?.widthPercent, 32);
  check("an image keeps its alignment", (image as { align?: string })?.align, "center");
}

check(
  "a width on something other than an image container is ignored",
  (parseRichText('<div style="width: 50%;"><img src="g.gif"></div>').find(
    (node) => node.type === "image",
  ) as { widthPercent?: number })?.widthPercent,
  undefined,
);

{
  // `<div><br></div>` between two paragraphs is a blank line someone typed; a
  // browser gives it a line's height, so it must survive as an empty block.
  const nodes = parseRichText("<div>a</div><div><br></div><div>b</div>");
  check("a blank line between paragraphs survives", nodes.length, 3);
  check(
    "and it is empty rather than whitespace",
    (nodes[1] as { children: unknown[] }).children.length,
    0,
  );
}

check(
  "trailing blank lines are still dropped",
  parseRichText("<div>a</div><div><br></div><div><br></div>").length,
  1,
);

// ── Images that never came from the editor ─────────────────────────────
{
  // A pasted Discord emoji: no container, no width percentage, its own pixel
  // caps. Sizing it to the text column turns 32px into a full-width banner.
  const nodes = parseRichText(
    '<div style="text-align: center;"><img data-type="emoji" ' +
      'src="https://cdn.test/e.webp?size=80&amp;animated=true" ' +
      'style="max-height: 32px; max-width: 32px; min-height: 32px;"></div>',
  );
  const image = nodes.find((node) => node.type === "image") as {
    src: string;
    maxWidth?: number;
    maxHeight?: number;
    widthPercent?: number;
    align?: string;
  };
  check("a pasted image keeps its pixel cap", image?.maxWidth, 32);
  check("and its height cap", image?.maxHeight, 32);
  check("and has no column percentage", image?.widthPercent, undefined);
  check("and keeps its alignment", image?.align, "center");
  check(
    "the entity in its query string is decoded",
    image?.src,
    "https://cdn.test/e.webp?size=80&animated=true",
  );
}

check(
  "an editor image reports its wrap mode",
  (parseRichText(
    '<span class="inline-image-container" data-wrap="inline-left" ' +
      'style="width: 40%;"><img src="a.png" data-width-pct="40"></span>',
  ).find((node) => node.type === "image") as { wrap?: string })?.wrap,
  "inline-left",
);

if (failures > 0) {
  // Thrown rather than `process.exit`, matching the other smoke scripts: the
  // shared packages narrow the ambient `process` type to `{ env }`, and an
  // unhandled throw is a non-zero exit either way.
  throw new Error(`${failures} smoke check(s) failed`);
}

console.log("\nALL PASS");
