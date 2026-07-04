import type { PromptSource } from "@/types";
import { ACCENT_MAP, type Accent } from "@/types/theme";

export const ICE_BREAKER_PREVIEW_LENGTH = 20;
export const ICE_BREAKER_SOURCE_NAME_LENGTH = 16;

export const truncateIceBreakerMessage = (message: string) =>
  message.length > ICE_BREAKER_PREVIEW_LENGTH
    ? `${message.slice(0, ICE_BREAKER_PREVIEW_LENGTH)}...`
    : message;

export const truncateIceBreakerSourceName = (name: string) =>
  name.length > ICE_BREAKER_SOURCE_NAME_LENGTH
    ? `${name.slice(0, ICE_BREAKER_SOURCE_NAME_LENGTH)}...`
    : name;

/** Resolves a source's accent into a ring color, mirroring MuseAvatar/
 *  NovelistAvatar: muses carry a literal hex color, while novelists carry a
 *  palette index that must be applied as a CSS class so `var(--accent)`
 *  resolves to their chosen palette. */
export const getSourceRingAccent = (
  source: PromptSource,
): { className: string | null; color: string | null } => {
  if (!source.useAccent || source.accent == null) {
    return { className: null, color: null };
  }

  if (source.sourceType === "MUSE") {
    return { className: null, color: source.accent };
  }

  const paletteClass = ACCENT_MAP[Number(source.accent) as Accent] ?? null;
  return {
    className: paletteClass,
    color: paletteClass ? "var(--accent)" : null,
  };
};

/** Ice breaker messages are stored as plain text (unlike chat messages, which
 *  store the rich-text HTML ChatRichInput produces), so `**bold**`/`*italic*`
 *  markers typed while composing one — which ChatRichInput live-converts into
 *  `<strong>`/`<em>` elements the same as it does for a reply — need to be
 *  flattened back to their plain-text markdown form before saving. */
export const htmlToIceBreakerMarkdown = (html: string): string => {
  if (typeof document === "undefined") return html;

  const container = document.createElement("div");
  container.innerHTML = html;

  const walk = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") return "\n";

    const inner = Array.from(el.childNodes).map(walk).join("");
    if (tag === "strong" || tag === "b") return `**${inner}**`;
    if (tag === "em" || tag === "i") return `*${inner}*`;
    return inner;
  };

  // Strip the zero-width spaces ChatRichInput inserts after a converted
  // bold/italic span to give the cursor somewhere to land outside it (avoid
  // an invisible literal in source — build the character from its code point).
  const zeroWidthSpace = String.fromCharCode(0x200b);
  return Array.from(container.childNodes)
    .map(walk)
    .join("")
    .split(zeroWidthSpace)
    .join("");
};

/** The ice-breaker endpoint serializes `createdOn` as a raw epoch-seconds
 *  float (e.g. "1782895379.212409000") rather than an ISO string like the
 *  rest of the API, so it needs its own parsing before being handed to the
 *  usual date-formatting helpers (which expect milliseconds or ISO). */
export const parseIceBreakerTimestamp = (value: string): number => {
  const seconds = Number.parseFloat(value);
  return Number.isFinite(seconds) ? seconds * 1000 : Date.now();
};
