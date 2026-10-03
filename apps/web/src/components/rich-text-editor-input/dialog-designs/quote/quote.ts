import type { DialogEmbedData } from "../../dialog-embed";
import { buildText, hasNamedSender } from "../shared";

type QuoteOptions = {
  /** Whether to append the `— Name` attribution. */
  showAuthor?: boolean;
};

/**
 * Minimal design: just the quoted line (quotes drawn in CSS), no card, no
 * color, no avatar. A plain em-dash attribution is appended for named muses,
 * unless `showAuthor` is false (the "minimal without author" variant).
 */
export const renderQuoteDialog = (
  embed: HTMLElement,
  data: DialogEmbedData,
  { showAuthor = true }: QuoteOptions = {},
): void => {
  embed.replaceChildren();

  embed.appendChild(buildText(data));

  if (showAuthor && hasNamedSender(data)) {
    const attr = document.createElement("span");
    attr.className = "dialog-attr";
    attr.textContent = ` — ${data.name}`;
    embed.appendChild(attr);
  }
};
