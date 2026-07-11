import { css } from "styled-components";
import { readDialogData } from "../dialog-embed";
import { renderBubbleDialog } from "./bubble/bubble";
import { bubbleDialogCss } from "./bubble/bubble.styles";
import { renderCardDialog } from "./card/card";
import { cardDialogCss } from "./card/card.styles";
import { renderQuoteDialog } from "./quote/quote";
import { quoteDialogCss } from "./quote/quote.styles";
import {
  DEFAULT_DIALOG_DESIGN,
  type DialogDesign,
  type DialogDesignOption,
  type DialogDesignRenderer,
  type MuseDialogAttrs,
} from "./types";

export type {
  DialogDesign,
  DialogDesignOption,
  MuseDialogAttr,
  MuseDialogAttrs,
} from "./types";
export { DEFAULT_DIALOG_DESIGN } from "./types";

// Several designs reuse the same renderer with a behavior flag.
const RENDERERS: Record<DialogDesign, DialogDesignRenderer> = {
  bubble: (embed, data) => renderBubbleDialog(embed, data),
  "bubble-colored": (embed, data) =>
    renderBubbleDialog(embed, data, { colored: true }),
  card: (embed, data) => renderCardDialog(embed, data),
  "card-colored": (embed, data) =>
    renderCardDialog(embed, data, { colored: true }),
  quote: (embed, data) => renderQuoteDialog(embed, data),
  "quote-plain": (embed, data) =>
    renderQuoteDialog(embed, data, { showAuthor: false }),
};

/** Designs offered in the reader's dropdown, in display order. */
export const DIALOG_DESIGNS: DialogDesignOption[] = [
  {
    description: "Avatar, accent card and quote",
    label: "Card",
    value: "card",
  },
  {
    description: "Card tinted with the muse's own accent color",
    label: "Colored cards",
    value: "card-colored",
  },
  {
    description: "Messenger-style speech bubbles",
    label: "Chat bubbles",
    value: "bubble",
  },
  {
    description: "Chat bubbles tinted with the muse's own accent color",
    label: "Colored chat bubbles",
    value: "bubble-colored",
  },
  {
    description: "Just the quoted line — no card or avatar",
    label: "Minimal quotes",
    value: "quote",
  },
  {
    description: "Minimal quotes without the author attribution",
    label: "Minimal (no author)",
    value: "quote-plain",
  },
];

/** True when `value` is a known dialog design. */
export const isDialogDesign = (value: string | null): value is DialogDesign =>
  DIALOG_DESIGNS.some((design) => design.value === value);

/** Class placed on the render container to scope the chosen design's styles. */
export const dialogDesignClass = (design: DialogDesign): string =>
  `dialog-design-${design}`;

/**
 * Rebuilds every dialog embed inside `root` using the chosen read-only design.
 * The sender's name and accent are resolved from `museAttrs` (keyed by muse id,
 * provided per thread by the backend); the avatar is derived from the muse id.
 */
export const renderDialogEmbeds = (
  root: HTMLElement,
  design: DialogDesign = DEFAULT_DIALOG_DESIGN,
  museAttrs: MuseDialogAttrs = {},
): void => {
  const render = RENDERERS[design] ?? renderCardDialog;
  root.querySelectorAll<HTMLElement>(".dialog-embed").forEach((embed) => {
    const data = readDialogData(embed);
    const attr = data.museId ? museAttrs[data.museId] : undefined;
    const resolved = {
      ...data,
      accent: attr?.accent ?? null,
      name: attr?.name ?? data.name,
      useAccent: !!attr?.accent,
    };
    embed.removeAttribute("contenteditable");
    embed.removeAttribute("data-selected");
    embed.className = "dialog-embed";
    render(embed, resolved);
  });
};

/** All design styles combined, each scoped by its `.dialog-design-*` class. */
export const dialogDesignsCss = css`
  ${cardDialogCss}
  ${bubbleDialogCss}
  ${quoteDialogCss}
`;
