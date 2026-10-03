import { type DialogEmbedData, dialogAvatarUrl } from "../dialog-embed";

/** Legacy dialogs baked the ❝ ❞ marks into a plain-text line; designs draw
 *  their own quotes, so strip them from pure-text content to avoid doubling. */
const stripLegacyQuotes = (html: string): string => {
  if (html.includes("<")) return html; // has formatting — leave untouched
  const match = html.match(/^\s*❝\s?([\s\S]*?)\s?❞\s*$/);
  return match ? match[1] : html;
};

/** Builds the avatar node (image or initial) for designs that show one. The
 *  image comes from the avatar endpoint of whichever pool the speaker is in —
 *  a novelist's muse, or one of the story's own characters. */
export const buildAvatar = (data: DialogEmbedData): HTMLElement => {
  const url = dialogAvatarUrl(data.museId, data.source);
  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = data.name;
    img.className = "dialog-avatar";
    return img;
  }
  const fallback = document.createElement("span");
  fallback.className = "dialog-avatar-fallback";
  fallback.textContent = (data.name || "?").charAt(0).toUpperCase();
  return fallback;
};

/** Builds the spoken line, preserving its rich text and chosen font. */
export const buildText = (data: DialogEmbedData): HTMLSpanElement => {
  const text = document.createElement("span");
  text.className = "dialog-text";
  text.innerHTML = stripLegacyQuotes(data.text);
  if (data.font) text.style.fontFamily = data.font;
  return text;
};

/** True when the sender is a named muse (worth attributing) vs. anonymous. */
export const hasNamedSender = (data: DialogEmbedData): boolean =>
  !!data.name && data.name !== "Anonymous";
