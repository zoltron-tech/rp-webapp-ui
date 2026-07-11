import type { DialogEmbedData } from "../../dialog-embed";
import { buildAvatar, buildText } from "../shared";

type CardOptions = {
  /** Colored-cards variant: tint the card with the muse's accent. */
  colored?: boolean;
};

/**
 * Card design (the default): avatar + accent-tinted card with the quoted line
 * and the sender's name — matches the composer's own presentation. The
 * `colored` variant recolors the card with the muse's own accent when the muse
 * opted into `useAccent`; otherwise it falls back to the app accent.
 */
export const renderCardDialog = (
  embed: HTMLElement,
  data: DialogEmbedData,
  { colored = false }: CardOptions = {},
): void => {
  embed.replaceChildren();

  // Drives the mirrored layout in card.styles.ts (avatar/accent on the right).
  embed.dataset.orientation = data.orientation === "right" ? "right" : "left";

  if (colored && data.useAccent && data.accent) {
    embed.style.setProperty("--accent", data.accent);
    embed.style.setProperty(
      "--accent-hover",
      `color-mix(in srgb, ${data.accent} 70%, black)`,
    );
  }

  embed.appendChild(buildAvatar(data));

  const body = document.createElement("div");
  body.className = "dialog-body";

  const line = document.createElement("div");
  line.className = "dialog-line";
  line.appendChild(buildText(data));

  const sender = document.createElement("span");
  sender.className = "dialog-sender";
  sender.textContent = data.name;

  body.appendChild(line);
  body.appendChild(sender);
  embed.appendChild(body);
};
