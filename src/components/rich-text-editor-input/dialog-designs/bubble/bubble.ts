import type { DialogEmbedData } from "../../dialog-embed";
import { buildAvatar, buildText } from "../shared";

type BubbleOptions = {
  /** Colored-bubbles variant: tint the bubble with the muse's accent. */
  colored?: boolean;
};

/**
 * Chat-bubble design: avatar on the left, the sender's name above a rounded
 * speech bubble containing the line. The `colored` variant tints the bubble
 * with the muse's accent when the muse opted into `useAccent`; otherwise it
 * falls back to the plain neutral bubble.
 */
export const renderBubbleDialog = (
  embed: HTMLElement,
  data: DialogEmbedData,
  { colored = false }: BubbleOptions = {},
): void => {
  embed.replaceChildren();

  // Drives the mirrored layout in bubble.styles.ts (avatar/bubble on the right).
  embed.dataset.orientation = data.orientation === "right" ? "right" : "left";

  embed.appendChild(buildAvatar(data));

  const content = document.createElement("div");
  content.className = "dialog-bubble-content";

  const sender = document.createElement("span");
  sender.className = "dialog-sender";
  sender.textContent = data.name;

  const bubble = document.createElement("div");
  bubble.className = "dialog-bubble-body";
  if (colored && data.useAccent && data.accent) {
    bubble.style.backgroundColor = `color-mix(in srgb, ${data.accent} 35%, var(--bg-3))`;
  }
  bubble.appendChild(buildText(data));

  content.appendChild(sender);
  content.appendChild(bubble);
  embed.appendChild(content);
};
