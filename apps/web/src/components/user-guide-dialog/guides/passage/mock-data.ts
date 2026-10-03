import type { DialogMuse } from "@/components/rich-text-editor-input/dialog-embed";

/**
 * Sample content for the passage guide.
 *
 * A scrap of a story, written the way the composer writes one: formatted prose,
 * an embedded dialog, an inline picture. It is never saved and never sent.
 */

/**
 * Speakers are left anonymous on purpose.
 *
 * A dialog's avatar is fetched from the speaker's own endpoint, and a sample id
 * has none — so these carry a name and no id, which is exactly the case the
 * designs already draw as an initial rather than a broken image.
 */
export const dialogHtml = (
  name: string,
  line: string,
  orientation: "left" | "right" = "left",
) =>
  `<div class="dialog-embed" data-dialog-embed data-muse-id="" data-muse-name="${name}"${
    orientation === "right" ? ' data-orientation="right"' : ""
  }><span class="dialog-text">${line}</span></div>`;

/** An illustration, drawn inline — the guide never asks the network for one. */
export const SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">` +
    `<rect width="320" height="200" fill="#243044"/>` +
    `<circle cx="255" cy="52" r="26" fill="#f3d9a4"/>` +
    `<path d="M0 150 L80 96 L140 138 L210 78 L320 148 L320 200 L0 200 Z" fill="#16202f"/>` +
    `<path d="M0 172 L96 128 L176 168 L260 122 L320 160 L320 200 L0 200 Z" fill="#0d1522"/>` +
    `</svg>`,
)}`;

/**
 * The passage as the composer holds it, mid-write.
 *
 * Prose only. Dialogs have their own steps, where they are drawn the way a
 * reader gets them and can be shown being made — inside the editor they would
 * only be sitting there, already finished, explaining nothing.
 */
export const PASSAGE_HTML = [
  `<div style="text-align: center;"><span style="font-size: var(--font-size-h4); font-family: PlayfairDisplaySC;">The Salt Road</span></div>`,
  `<div>Rain had been in the lantern since dusk, and the light it gave was the colour of <i>weak tea</i>. Elenna counted the mile-stones by touch.</div>`,
  `<div>She did not laugh, which he took as a good sign, and they walked on toward the water.</div>`,
].join("");

/** The line the dialog step types out, and the word it ends up emphasising. */
export const SAMPLE_DIALOG_LINE = "You are late. ";
export const SAMPLE_DIALOG_EMPHASIS = "Again.";

/** Two lines facing opposite ways, for the step about dialog styles. */
export const DIALOG_ONLY_HTML = [
  dialogHtml("Elenna Vale", "You are late. <b>Again.</b>"),
  dialogHtml("Corvin Ash", "The road moved.", "right"),
].join("");

/** Senders the composer offers — a novelist's muses, then the story's own. */
export const SAMPLE_SPEAKERS: DialogMuse[] = [
  { accent: "#6e56cf", avatar: null, id: "muse-elenna", name: "Elenna Vale" },
  { accent: "#0091ff", avatar: null, id: "muse-corvin", name: "Corvin Ash" },
  {
    accent: "#12a594",
    avatar: null,
    id: "character-bela",
    name: "Bela Ruk",
    source: "CHARACTER",
  },
];
