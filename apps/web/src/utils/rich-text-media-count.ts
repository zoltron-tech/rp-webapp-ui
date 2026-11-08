import { countRichTextMedia, countsAsPostMedia } from "@nw/utils";

/**
 * The media a rich-text input holds toward the five-item limit: the pictures
 * and GIFs in its text plus its attachment. Only media we host (or a local
 * picture still uploading) counts, owner decision 2026-11-08: a Klipy GIF or
 * clip, or any other site's link, in the attachment slot is free, as
 * `countRichTextMedia` already treats the text.
 */
export const attachmentCounts = (attachment: string | null | undefined) =>
  countsAsPostMedia(attachment);

export const richTextMediaCount = (
  html: string | null | undefined,
  attachment?: string | null,
): number => countRichTextMedia(html) + (attachmentCounts(attachment) ? 1 : 0);
