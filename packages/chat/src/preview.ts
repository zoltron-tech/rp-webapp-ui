// From `@nw/richtext/parse` rather than the package root: the root also exports
// `renderRichText`, which is a .tsx file, and this package's tsconfig has no
// `jsx` setting — correctly, since nothing here renders anything.
import { parseRichText, richTextToPlainText } from "@nw/richtext/parse";
import type { Conversation, Message } from "@nw/types";
import { getAttachmentKind, getFileExtension, isDirectImageUrl } from "./media";

/**
 * The one line under a conversation in the inbox.
 *
 * "Sent a GIF" rather than
 * `https://static.klipy.com/ii/4bbcf901ea0d5dec489bd8c608d7f1fd/ba/05/…`, and
 * "Hey, are you around?" rather than
 * `<div style="text-align: center;">Hey, are you around?</div>`. Both failures
 * are what you get by rendering `lastMessage.message` directly, and both were
 * on the phone.
 *
 * Shared because the inbox is the first thing either client shows: two clients
 * summarising the same message differently is visible side by side on a desk.
 */

/**
 * A GIF is called a GIF.
 *
 * Web's card distinguishes it from a still image, and it is worth keeping —
 * "Sent a GIF" tells you the tone of what arrived, which is most of what a
 * preview is for.
 */
const describeUrl = (url: string): string => {
  if (getFileExtension(url) === "gif") return "Sent a GIF";
  if (isDirectImageUrl(url)) return "Sent an image";
  const kind = getAttachmentKind(url);
  if (kind === "video") return "Sent a video";
  if (kind === "audio") return "Sent an audio clip";
  return "Sent a link";
};

export interface ConversationPreview {
  text: string;
  /**
   * True when the text describes the message rather than quoting it.
   *
   * Callers that truncate should leave these alone: "Sent an audio cl..." is
   * worse than the sentence it came from.
   */
  describes: boolean;
}

/**
 * One message, summarised in a line.
 *
 * Pulled out of `conversationPreview` because three places need exactly this
 * and were each doing a worse version of it: the inbox row, the quote inside a
 * reply bubble, and the composer's reply banner. The last two were printing
 * `message.message` raw, so replying to a GIF quoted a CDN URL and replying to
 * a formatted message quoted `<div><strong>…`.
 *
 * Naming a *quoted* message reads differently from naming the last message in
 * a list — "GIF" rather than "Sent a GIF" — so the describing half takes a
 * voice. `sent` is the inbox's ("Sent a GIF", a sentence about what happened);
 * `noun` is the quote's ("GIF", a label for a thing).
 */
export const messagePreview = (
  message: Message | null | undefined,
  voice: "sent" | "noun" = "sent",
): ConversationPreview => {
  if (!message) return { describes: true, text: "" };

  const raw = message.message?.trim() ?? "";
  const describe = (url: string) =>
    voice === "sent" ? describeUrl(url) : nameUrl(url);

  if (raw) {
    if (/^https?:\/\/\S+$/i.test(raw)) {
      return { describes: true, text: describe(raw) };
    }
    const text = richTextToPlainText(parseRichText(raw))
      .replace(/\s+/g, " ")
      .trim();
    if (text) return { describes: false, text };
  }

  if (message.attachments?.length) {
    const first = message.attachments[0];
    const count = message.attachments.length;
    if (count === 1 && first) {
      return { describes: true, text: describe(first.url) };
    }
    return {
      describes: true,
      text:
        voice === "sent" ? `Sent ${count} attachments` : `${count} attachments`,
    };
  }

  if (message.image) {
    return {
      describes: true,
      text: voice === "sent" ? "Sent an image" : "Image",
    };
  }

  const type = message.type?.toLowerCase() ?? "";
  for (const [needle, sent, noun] of [
    ["image", "Sent an image", "Image"],
    ["video", "Sent a video", "Video"],
    ["audio", "Sent an audio clip", "Audio"],
    ["file", "Sent a file", "File"],
  ] as const) {
    if (type.includes(needle)) {
      return { describes: true, text: voice === "sent" ? sent : noun };
    }
  }

  return {
    describes: true,
    text: voice === "sent" ? "Sent a message" : "Message",
  };
};

/** `messagePreview` as a plain string. */
export const messagePreviewText = (
  message: Message | null | undefined,
  voice: "sent" | "noun" = "sent",
): string => messagePreview(message, voice).text;

export const conversationPreview = (
  conversation: Conversation,
): ConversationPreview => {
  const message = conversation.lastMessage;
  if (!message) return { describes: true, text: "Start a conversation" };

  const raw = message.message?.trim() ?? "";

  if (raw) {
    // A message that is *only* a URL is the GIF/sticker case: describe it.
    // One that merely contains a link is a sentence, and should read as one.
    if (/^https?:\/\/\S+$/i.test(raw)) {
      return { describes: true, text: describeUrl(raw) };
    }
    // Through the shared parser rather than a tag-stripping regex — the same
    // parse the message bubble runs, so the preview cannot disagree with the
    // message it is previewing about what the words are.
    const text = richTextToPlainText(parseRichText(raw))
      .replace(/\s+/g, " ")
      .trim();
    if (text) return { describes: false, text };
  }

  if (message.image) return { describes: true, text: "Sent an image" };

  if (message.attachments?.length) {
    const count = message.attachments.length;
    return {
      describes: true,
      text: `Sent ${count} attachment${count > 1 ? "s" : ""}`,
    };
  }

  const type = message.type?.toLowerCase() ?? "";
  if (type.includes("image")) return { describes: true, text: "Sent an image" };
  if (type.includes("video")) return { describes: true, text: "Sent a video" };
  if (type.includes("audio")) {
    return { describes: true, text: "Sent an audio clip" };
  }
  if (type.includes("file")) return { describes: true, text: "Sent a file" };

  return { describes: true, text: "Sent a message" };
};

/** The same media, named as a thing rather than as something that happened. */
const nameUrl = (url: string): string => {
  if (getFileExtension(url) === "gif") return "GIF";
  if (isDirectImageUrl(url)) return "Photo";
  const kind = getAttachmentKind(url);
  if (kind === "video") return "Clip";
  if (kind === "audio") return "Audio";
  return "Link";
};

/**
 * The preview as a single string, truncated if the caller needs it to be.
 *
 * `maxLength` applies only to quoted text. A client that lays the row out with
 * `numberOfLines={1}` should pass nothing and let the platform ellipsise, which
 * is both nicer and correct at every width.
 */
export const conversationPreviewText = (
  conversation: Conversation,
  maxLength?: number,
): string => {
  const { describes, text } = conversationPreview(conversation);
  if (describes || !maxLength || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
