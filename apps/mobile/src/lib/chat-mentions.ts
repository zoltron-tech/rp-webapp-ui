import { hasMarkdown, markdownToHtml } from "@nw/chat";
import { mentionToHtml } from "@nw/richtext";
import type { MentionDataItem } from "@nw/types";

/**
 * Turning a typed message into what goes on the wire, mentions included.
 *
 * The chat field is plain text, so a picked mention is `@Name` in the draft and
 * the composer remembers what that name stands for. Only here does it become the
 * `mention-tag` markup web's rich field writes, so a bubble draws the same
 * tappable chip whichever client sent it.
 *
 * A mention whose text was edited away is no longer in the draft and stays out.
 * A name that is a prefix of another is replaced after it, so "@Ana Maria" is not
 * cut in half by "@Ana".
 */
export const messageToWire = (
  text: string,
  mentions: MentionDataItem[],
): string => {
  const used = mentions
    .filter((item) => text.includes(`@${item.displayName}`))
    .sort((a, b) => b.displayName.length - a.displayName.length);
  if (used.length === 0) return hasMarkdown(text) ? markdownToHtml(text) : text;

  // The name as the conversion writes it, entities and all, not as it was typed.
  const asWritten = (name: string) =>
    markdownToHtml(`@${name}`).replace(/^<div>|<\/div>$/g, "");

  // A placeholder first, so a later name cannot match inside a finished chip.
  let html = markdownToHtml(text);
  used.forEach((item, index) => {
    html = html.split(asWritten(item.displayName)).join(`\uE000${index}\uE000`);
  });
  return html.replace(/\uE000(\d+)\uE000/g, (_, index) => {
    const item = used[Number(index)];
    return mentionToHtml({
      id: item.id,
      image: item.image,
      kind: item.type,
      name: item.displayName,
      type: "mention",
    });
  });
};
