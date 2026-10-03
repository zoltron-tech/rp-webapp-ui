/**
 * The prompt-composer animation, as a function of time.
 *
 * Same contract as `timeline.ts`: `applyFrame(root, t)` puts the scene into the
 * state it should be in at `t` milliseconds, so the capture can step it frame
 * by frame. What differs is that this scene *acts on* the composer rather than
 * only styling it — it clicks the toolbar's real dropdowns and types into the
 * real contenteditable through `execCommand`, which is the same path a keyboard
 * takes. So the formatting in the finished comment was genuinely produced by
 * the editor, not staged.
 *
 * Actions are one-shot: each fires the first time `t` passes it. Seeking
 * backwards past the start (which the capture does once, to warm images up)
 * calls `resetActions` and the scene remounts the composer.
 */

import {
  BODY_TEXT,
  CHOSEN_GIF_INDEX,
  CHOSEN_MUSE_INDEX,
  GIF_END_PCT,
  GIF_START_PCT,
  HEADING_TEXT,
  MUSES,
} from "./prompt-data";

// ── Beats ──────────────────────────────────────────────────────────────────

const ENTRY = { dur: 1000, start: 0 };

/** Caret into the editor. */
const FOCUS = 1050;

const FONT_OPEN = 1300;
const FONT_PICK = 1900;

const HEAD_SIZE_OPEN = 2250;
const HEAD_SIZE_PICK = 2800;
/** ~65ms a character — fast, but still reads as typing. */
const HEAD_TYPE = { perChar: 65, start: 3050 };
const HEAD_END = HEAD_TYPE.start + HEADING_TEXT.length * HEAD_TYPE.perChar;

const NEWLINE = HEAD_END + 320;
const BODY_SIZE_OPEN = NEWLINE + 300;
const BODY_SIZE_PICK = BODY_SIZE_OPEN + 520;
const ALIGN_OPEN = BODY_SIZE_PICK + 380;
const ALIGN_PICK = ALIGN_OPEN + 520;
const BODY_TYPE = { perChar: 34, start: ALIGN_PICK + 300 };
const BODY_END = BODY_TYPE.start + BODY_TEXT.length * BODY_TYPE.perChar;

/** Attach a GIF: open the picker, let the grid read, take one. */
const GIF_OPEN = BODY_END + 450;
const GIF_PICK = GIF_OPEN + 1150;

/**
 * Place it.
 *
 * Clicking the image in the editor raises its control bar; from there the
 * block alignment goes to centre and the size slider is dragged up. The bar is
 * dismissed with Accept so the finished comment is what gets sent.
 */
const IMAGE_SELECT = GIF_PICK + 650;
const IMAGE_CENTER = IMAGE_SELECT + 700;
const ZOOM = { dur: 1150, start: IMAGE_CENTER + 420 };
const IMAGE_ACCEPT = ZOOM.start + ZOOM.dur + 420;

/** The sender picker: open, let it read, choose a character. */
const SENDER_OPEN = IMAGE_ACCEPT + 550;
const SENDER_PICK = SENDER_OPEN + 1250;

/** Send, and the comment lands on the prompt. */
const SEND_PRESS = SENDER_PICK + 800;
const SEND_CLICK = SEND_PRESS + 130;
const COMMENT_IN = { dur: 520, start: SEND_CLICK + 60 };

export const DURATION = COMMENT_IN.start + COMMENT_IN.dur + 1900;

// ── Easing ─────────────────────────────────────────────────────────────────

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (p: number) => 1 - (1 - p) ** 3;
const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
const easeOutBack = (p: number) => {
  const c = 1.42;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
};
const round = (v: number) => Math.round(v * 1000) / 1000;

const style = (
  el: Element | null | undefined,
  props: Record<string, string>,
) => {
  if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) return;
  for (const [key, value] of Object.entries(props)) {
    el.style.setProperty(key, value);
  }
};

const enter = (
  el: Element | null | undefined,
  p: number,
  { x = 0, y = 0, scale = 1 } = {},
) => {
  const e = easeOut(p);
  style(el, {
    opacity: String(round(p === 0 ? 0 : e)),
    transform: `translate3d(${round((1 - e) * x)}px, ${round((1 - e) * y)}px, 0) scale(${round(scale + (1 - scale) * e)})`,
  });
};

// ── Finding the real controls ──────────────────────────────────────────────
//
// Toolbar triggers carry `title`, the sender trigger carries literal class
// names the component writes itself, and both popovers and the sender dialog
// are portaled to <body> — so those are looked up on `document`, not the stage.

const composerIn = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-promo="composer"]');

const editorIn = (root: HTMLElement) =>
  composerIn(root)?.querySelector<HTMLElement>(
    '[contenteditable="true"][data-placeholder]',
  ) ?? null;

const toolbarButton = (root: HTMLElement, title: string) =>
  composerIn(root)?.querySelector<HTMLElement>(`[title="${title}"]`) ?? null;

/** Whichever Radix popover is open — only ever one at a time here. */
const popoverItems = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-radix-popper-content-wrapper] button",
    ),
  );

const clickPopoverItem = (label: string) => {
  const match = popoverItems().find(
    (item) => item.textContent?.trim() === label,
  );
  match?.click();
};

const clickPopoverItemAt = (index: number) => popoverItems()[index]?.click();

const senderTrigger = (root: HTMLElement) =>
  composerIn(root)
    ?.querySelector<HTMLElement>("button .mode-name")
    ?.closest("button") ?? null;

const sendButton = (root: HTMLElement) =>
  composerIn(root)?.querySelector<HTMLElement>('button[type="submit"]') ?? null;

/** The GIF the editor embedded, once one has been picked. */
const insertedImage = (root: HTMLElement) =>
  composerIn(root)?.querySelector<HTMLElement>("img.inline-image") ?? null;

/** The image control bar's size slider — present only while an image is
 *  selected. */
const imageSizeSlider = (root: HTMLElement) =>
  composerIn(root)?.querySelector<HTMLInputElement>('input[type="range"]') ??
  null;

/**
 * The image bar's buttons fire on `mousedown`, not `click` — they have to, or
 * the mouse-up would blur the editor and drop the selection they act on. So
 * `.click()` does nothing to them and the event has to be the real one.
 */
const mouseDown = (el: Element | null | undefined) => {
  if (!(el instanceof HTMLElement)) return;
  el.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
};

const byAriaLabel = (root: HTMLElement, label: string) =>
  composerIn(root)?.querySelector<HTMLElement>(`[aria-label="${label}"]`) ??
  null;

/**
 * Moves a React-controlled range input.
 *
 * Assigning `.value` alone is invisible to React: it compares against its own
 * tracked value and swallows the event as a no-op. Going through the prototype
 * setter updates the tracker too, so the `input` event reads as a real drag.
 */
const setRangeValue = (input: HTMLInputElement | null, value: number) => {
  if (!input || Number(input.value) === value) return;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, String(value));
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

// ── Typing ─────────────────────────────────────────────────────────────────

/** How much of each passage has been inserted so far. */
const typedCount: Record<string, number> = {};

/**
 * Types up to `target` characters of `text`, one insertion for whatever is
 * still missing this frame.
 *
 * `insertText` rather than assigning innerHTML: it goes through the same
 * editing path a keypress does, so the editor's pending font/size/alignment
 * apply to it exactly as they would for a person typing.
 */
const typeUpTo = (
  editor: HTMLElement | null,
  key: string,
  text: string,
  target: number,
) => {
  if (!editor) return;
  const already = typedCount[key] ?? 0;
  const wanted = Math.max(0, Math.min(text.length, Math.floor(target)));
  if (wanted <= already) return;
  if (document.activeElement !== editor) editor.focus();
  document.execCommand("insertText", false, text.slice(already, wanted));
  typedCount[key] = wanted;
};

/** Drops the caret at the end of the editor, which is what a click there does. */
const placeCaret = (editor: HTMLElement | null) => {
  if (!editor) return;
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

// ── One-shot actions ───────────────────────────────────────────────────────

type Action = { at: number; run: (root: HTMLElement) => void };

const chosenMuse = MUSES[CHOSEN_MUSE_INDEX];
const CHOSEN_NAME = `${chosenMuse.firstName} ${chosenMuse.lastName}`.trim();

const ACTIONS: Action[] = [
  { at: FOCUS, run: (root) => placeCaret(editorIn(root)) },

  { at: FONT_OPEN, run: (root) => toolbarButton(root, "Font family")?.click() },
  { at: FONT_PICK, run: () => clickPopoverItem("Times New Roman") },

  {
    at: HEAD_SIZE_OPEN,
    run: (root) => toolbarButton(root, "Font size")?.click(),
  },
  { at: HEAD_SIZE_PICK, run: () => clickPopoverItem("Heading") },

  // A real paragraph break, so the body becomes its own block and can carry
  // its own size and alignment — which is the whole point of the next beats.
  {
    at: NEWLINE,
    run: (root) => {
      const editor = editorIn(root);
      if (!editor) return;
      if (document.activeElement !== editor) editor.focus();
      document.execCommand("insertParagraph");
    },
  },

  {
    at: BODY_SIZE_OPEN,
    run: (root) => toolbarButton(root, "Font size")?.click(),
  },
  { at: BODY_SIZE_PICK, run: () => clickPopoverItem("Normal") },

  {
    at: ALIGN_OPEN,
    run: (root) => toolbarButton(root, "Text Alignment")?.click(),
  },
  // Icon-only cells, in ALIGNMENT_BUTTONS order: left, centre, right, justify.
  { at: ALIGN_PICK, run: () => clickPopoverItemAt(1) },

  // ── Attach a GIF ─────────────────────────────────────────────────────────
  { at: GIF_OPEN, run: (root) => byAriaLabel(root, "Insert GIF")?.click() },
  {
    at: GIF_PICK,
    run: () => {
      const cells = Array.from(
        document.querySelectorAll<HTMLElement>('[role="alertdialog"] button'),
      ).filter((cell) => cell.querySelector("img"));
      cells[CHOSEN_GIF_INDEX]?.click();
    },
  },

  // Clicking the embedded image is what raises its control bar.
  { at: IMAGE_SELECT, run: (root) => insertedImage(root)?.click() },
  {
    at: IMAGE_CENTER,
    run: (root) => mouseDown(byAriaLabel(root, "Align center")),
  },
  // Dismissing the bar puts the caret after the image and leaves the comment
  // as it will be sent.
  {
    at: IMAGE_ACCEPT,
    run: (root) => mouseDown(byAriaLabel(root, "Accept size")),
  },

  { at: SENDER_OPEN, run: (root) => senderTrigger(root)?.click() },
  {
    at: SENDER_PICK,
    run: () => {
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>('[role="alertdialog"] button'),
      );
      rows.find((row) => row.textContent?.includes(CHOSEN_NAME))?.click();
    },
  },

  // The scene intercepts this submit — nothing is posted (see prompt-scene).
  { at: SEND_CLICK, run: (root) => sendButton(root)?.click() },
];

const done = new Set<number>();

/** Forgets every action, so the next forward pass performs them again. */
export const resetActions = () => {
  done.clear();
  for (const key of Object.keys(typedCount)) delete typedCount[key];
};

// ── The frame ──────────────────────────────────────────────────────────────

export const applyFrame = (root: HTMLElement, t: number) => {
  for (const action of ACTIONS) {
    if (t < action.at || done.has(action.at)) continue;
    done.add(action.at);
    action.run(root);
  }

  const editor = editorIn(root);
  typeUpTo(
    editor,
    "head",
    HEADING_TEXT,
    (t - HEAD_TYPE.start) / HEAD_TYPE.perChar,
  );
  typeUpTo(
    editor,
    "body",
    BODY_TEXT,
    (t - BODY_TYPE.start) / BODY_TYPE.perChar,
  );

  // The size slider, dragged rather than jumped — the image grows with it.
  if (t >= ZOOM.start) {
    const zoom = easeInOut(clamp01((t - ZOOM.start) / ZOOM.dur));
    setRangeValue(
      imageSizeSlider(root),
      Math.round(GIF_START_PCT + (GIF_END_PCT - GIF_START_PCT) * zoom),
    );
  }

  // The card and composer rise into shot together.
  const stage = root.querySelector<HTMLElement>('[data-promo="stage"]');
  if (stage) {
    const p = clamp01((t - ENTRY.start) / ENTRY.dur);
    const e = easeOut(p);
    style(stage, {
      opacity: String(round(clamp01(t / 300))),
      transform: [
        "perspective(1600px)",
        `translate3d(0, ${round((1 - e) * 340)}px, ${round((1 - e) * -240)}px)`,
        `rotateX(${round((1 - e) * 20)}deg)`,
        `rotateZ(${round((1 - e) * -4.5)}deg)`,
        `scale(${round(0.88 + 0.12 * easeOutBack(p))})`,
      ].join(" "),
    });
  }

  // The send button dips under the pointer before it fires, so the click is
  // visible rather than something that merely happened between two frames.
  const press = clamp01((t - SEND_PRESS) / (SEND_CLICK - SEND_PRESS));
  style(sendButton(root), {
    transform: `scale(${round(1 - 0.12 * press * (t < SEND_CLICK ? 1 : 0))})`,
  });

  enter(
    root.querySelector('[data-promo="sent-comment"]'),
    clamp01((t - COMMENT_IN.start) / COMMENT_IN.dur),
    { y: 26 },
  );
};
