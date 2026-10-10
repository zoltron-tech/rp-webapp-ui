import {
  documentToHtml,
  parseRichText,
  type RichDocument,
} from "@nw/richtext";
import { type DialogEmbed, mapDialogs } from "@/lib/story";

/**
 * A passage, on its way into the editor and back out of it.
 *
 * A passage is rich text with its characters' lines embedded in it, and
 * `@nw/richtext` has no node for a dialog. Rather than teach the shared
 * document model one — every reader of that model on both clients would have
 * to learn it too — a dialog rides through the editor as a *picture*: its own
 * block, never text, with a line after it to type on. The picture's source is
 * a key (`nw-dialog:7`) into a map the composer holds, and the composer draws
 * the block itself (`RichTextEditor`'s `renderEmbed`).
 *
 * In: every `.dialog-embed` in the saved HTML is swapped for an `<img>` with
 * such a key, and the rest parses as it always has. Out: the document is cut
 * at those pictures, the prose between them is serialised as usual, and each
 * dialog is written back in web's canonical form (`serializeDialogEmbeds`) —
 * the speaker's id, the font, the side, and the line. Never the speaker's
 * name or accent: the server resolves those when the passage is read.
 */
const DIALOG_SOURCE = "nw-dialog:";

let seed = 0;

export const newDialogSource = (): string => `${DIALOG_SOURCE}${(seed += 1)}`;

export const isDialogSource = (src: string): boolean =>
  src.startsWith(DIALOG_SOURCE);

export const passageToEditor = (
  html: string | null | undefined,
): { dialogs: Map<string, DialogEmbed>; html: string } => {
  const dialogs = new Map<string, DialogEmbed>();
  const out = mapDialogs(html ?? "", (dialog, before) => {
    const src = newDialogSource();
    dialogs.set(src, dialog);
    // A dialog that opens the passage, or follows another directly, has no
    // line before it to put the caret on. It is given an empty one, which
    // serialises to nothing for as long as it stays empty.
    const bare =
      !/<img\b/i.test(before) && before.replace(/<[^>]*>/g, "").trim() === "";
    return `${bare ? "<div><br></div>" : ""}<img src="${src}">`;
  });
  return { dialogs, html: out };
};

const escapeText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttribute = (value: string) =>
  escapeText(value).replace(/"/g, "&quot;");

/** Web's `createDialogModel`, less the composer-only `data-muse-name`. */
const dialogHtml = (dialog: DialogEmbed): string => {
  // Exactly one id attribute, never both: the server reads each pool with
  // its own pattern.
  const speaker =
    dialog.source === "CHARACTER" && dialog.speakerId
      ? ` data-character-id="${escapeAttribute(dialog.speakerId)}"`
      : ` data-muse-id="${escapeAttribute(dialog.speakerId ?? "")}"`;
  const font = dialog.font
    ? ` data-font="${escapeAttribute(dialog.font)}"`
    : "";
  const side = dialog.orientation === "right" ? ' data-orientation="right"' : "";
  return `<div class="dialog-embed" data-dialog-embed=""${speaker}${font}${side}><span class="dialog-text">${dialog.html}</span></div>`;
};

/** The pictures in a document that are pictures — for upload bookkeeping. */
export const passageImageSources = (doc: RichDocument): string[] =>
  doc.flatMap((node) =>
    node.type === "image" && !isDialogSource(node.src) ? [node.src] : [],
  );

/** The document as a passage's saved HTML. Empty when nothing is in it. */
export const editorToPassage = (
  doc: RichDocument,
  dialogs: ReadonlyMap<string, DialogEmbed>,
): string => {
  const out: string[] = [];
  let prose: RichDocument = [];
  const flush = () => {
    if (prose.length > 0) out.push(documentToHtml(prose));
    prose = [];
  };

  for (const node of doc) {
    if (node.type === "image" && isDialogSource(node.src)) {
      flush();
      const dialog = dialogs.get(node.src);
      if (dialog) out.push(dialogHtml(dialog));
      continue;
    }
    prose.push(node);
  }
  flush();
  return out.join("");
};

// ── The spoken line ─────────────────────────────────────────────────────────

/**
 * The marks a line can carry as a whole.
 *
 * Web formats a dialog's line word by word. Here the line is one plain field
 * and the marks are the line's: a short spoken sentence is bold or it is not,
 * and a field of styled runs for it would be the editor again inside a tray.
 * A line written on web with mixed formatting keeps it for as long as its
 * words and marks are left alone here — see `DialogSheet`.
 */
export type LineMark = "bold" | "italic" | "underline";

const LINE_MARKS: LineMark[] = ["bold", "italic", "underline"];

export const readDialogLine = (
  html: string,
): { marks: LineMark[]; text: string } => {
  const lines: string[] = [];
  const runs: { marks: readonly string[] }[] = [];

  for (const node of parseRichText(html)) {
    if (node.type === "image") continue;
    let line = "";
    for (const inline of node.children) {
      if (inline.type === "break") line += "\n";
      else if (inline.type === "mention") line += `@${inline.name}`;
      else {
        line += inline.text;
        if (inline.text.trim()) runs.push(inline);
      }
    }
    lines.push(line);
  }

  return {
    marks: LINE_MARKS.filter(
      (mark) => runs.length > 0 && runs.every((run) => run.marks.includes(mark)),
    ),
    text: lines.join("\n"),
  };
};

export const writeDialogLine = (text: string, marks: LineMark[]): string => {
  let html = escapeText(text.trim()).replace(/\n/g, "<br>");
  if (!html) return "";
  if (marks.includes("underline")) html = `<u>${html}</u>`;
  if (marks.includes("italic")) html = `<i>${html}</i>`;
  if (marks.includes("bold")) html = `<b>${html}</b>`;
  return html;
};
