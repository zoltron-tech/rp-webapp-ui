/**
 * What counts as media in a message, and how to find it.
 *
 * A chat message is a string. Some of those strings are a GIF: the picker sends
 * a bare CDN URL as the message body, so
 * `https://static.klipy.com/ii/…/wLP3Qu3EJIv6dN.webp` *is* the message. Whether
 * a client shows that as an image or as forty characters of blue text comes
 * down to this one predicate, which is exactly why it belongs here rather than
 * copied into each of them — a client that gets it wrong does not error, it
 * just renders a link where everyone else sees a picture.
 *
 * Extension-based, deliberately. A HEAD request per URL to sniff the content
 * type would be more correct and would also put a network round trip in front
 * of every message bubble; every service these come from (Klipy, Tenor, Giphy,
 * the app's own uploads) puts the real extension in the path.
 */

/** Matches a bare http(s) URL inside message text. */
export const URL_REGEX = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;

export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
export const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv"];
export const AUDIO_EXTENSIONS = ["mp3", "mpeg", "wav", "ogg", "m4a", "aac"];

export type AttachmentKind = "image" | "video" | "audio" | "file";

/**
 * The extension, ignoring the query string and fragment.
 *
 * Both matter: Discord signs its CDN links (`?ex=…&hm=…`) and Klipy appends
 * `?animated=true`, so `url.split(".").pop()` on the raw string returns
 * `webp?animated=true` and nothing is ever recognised as an image.
 */
export const getFileExtension = (url: string): string => {
  const cleaned = url.split("?")[0]?.split("#")[0] || "";
  return cleaned.split(".").pop()?.toLowerCase() || "";
};

export const getAttachmentKind = (url: string): AttachmentKind => {
  const extension = getFileExtension(url);
  if (!extension) return "file";
  if (IMAGE_EXTENSIONS.includes(extension)) return "image";
  if (VIDEO_EXTENSIONS.includes(extension)) return "video";
  if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
  return "file";
};

export const isDirectImageUrl = (url: string): boolean =>
  IMAGE_EXTENSIONS.includes(getFileExtension(url));

export const isDirectVideoUrl = (url: string): boolean =>
  VIDEO_EXTENSIONS.includes(getFileExtension(url));

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"',
};

/**
 * The HTML entities a contenteditable leaves in a message, as characters.
 *
 * Web's chat input sends its `innerHTML`, and a browser writes the space
 * after a pasted link as `&nbsp;` and an `&` in a query string as `&amp;`.
 * `URL_REGEX` accepts `&` and `;`, so the entity was being read as part of
 * the URL — `….gif&nbsp;` has the extension `gif&nbsp;`, which is not an
 * image — and a GIF link that rendered as a picture when typed on a phone
 * rendered as forty characters of text when typed in a browser.
 */
export const decodeEntities = (text: string): string =>
  text
    .replace(/&(amp|apos|gt|lt|nbsp|quot);/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );

/**
 * The words of a message, whatever markup they came wrapped in.
 *
 * Tags out, entities decoded, whitespace collapsed. For asking "is this
 * message one GIF link?" of a message the web composer sent as
 * `check this<br>https://….gif` — the question is about the words, and the
 * `<br>` is not one of them. A URL inside a tag's attributes (an `<img>`'s
 * `src`) is not a word either, and is dropped with the tag.
 */
export const messageTextOf = (text: string | null | undefined): string =>
  text
    ? decodeEntities(text.replace(/<[^>]*>/g, " "))
        .replace(/\s+/g, " ")
        .trim()
    : "";

/** `&` as a contenteditable writes it into a text node. */
const asEntityText = (url: string): string => url.replace(/&/g, "&amp;");

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The message with the given URLs taken out of its words.
 *
 * For a client that has drawn a URL as the picture it points at and wants
 * the sentence around it without the link repeated underneath. Works on the
 * raw message, markup and all, and touches only its text nodes: a URL inside
 * a tag — an `<a>`'s `href`, an `<img>`'s `src` — is left for the renderer.
 * Each URL is matched both as typed and as a contenteditable writes it
 * (`&` as `&amp;`). An anchor whose only text was the link is dropped whole,
 * and the whitespace and line breaks that framed the link go with it, so a
 * link that stood on its own line leaves no blank line behind. Runs of
 * breaks that the removal has merged are kept to one blank line.
 */
export const withoutUrls = (text: string, urls: string[]): string => {
  if (!text || urls.length === 0) return text;
  const pattern = new RegExp(
    urls
      .flatMap((url) => [escapeRegExp(asEntityText(url)), escapeRegExp(url)])
      .join("|"),
    "g",
  );
  // Tags and text nodes alternate; the odd indices are the tags.
  return text
    .split(/(<[^>]*>)/)
    .map((part, index) => (index % 2 === 1 ? part : part.replace(pattern, "")))
    .join("")
    .replace(/<a\b[^>]*>(?:\s|&nbsp;)*<\/a>/gi, "")
    .replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/i, "")
    .replace(/(?:\s|&nbsp;|<br\s*\/?>)+$/i, "")
    // The same trim at the edges of a block, for a link on its own line
    // inside a paragraph.
    .replace(/(<(?:p|div|li|blockquote|h\d)\b[^>]*>)(?:\s|&nbsp;|<br\s*\/?>)+/gi, "$1")
    .replace(/(?:\s|&nbsp;|<br\s*\/?>)+(<\/(?:p|div|li|blockquote|h\d)>)/gi, "$1")
    .replace(/(?:<br\s*\/?>(?:\s|&nbsp;)*){3,}/gi, "<br><br>")
    // The two spaces a link leaves behind mid-sentence.
    .replace(/ {2,}/g, " ");
};

/** Every http(s) URL in the text, in order, deduplicated. */
export const extractUrls = (text: string): string[] => {
  if (!text) return [];
  // A `g` regex carries `lastIndex` between calls, so a shared instance would
  // start half way through the next message it was handed. New one per call.
  const matches =
    decodeEntities(text).match(new RegExp(URL_REGEX.source, "gi")) ?? [];
  return [...new Set(matches)];
};

/**
 * Is the message nothing but one image URL?
 *
 * Then it is a GIF someone sent, and it should render as the picture alone —
 * no bubble, no repeated URL underneath it. Mirrors the web bubble's
 * `isMessageOnlyUrls`, including its deliberate narrowness: exactly one URL,
 * and an image one. Two GIFs, or a GIF with a caption, keep the bubble.
 */
export const isMediaOnlyMessage = (text: string): boolean => {
  const urls = extractUrls(text);
  if (urls.length !== 1) return false;
  if (!isDirectImageUrl(urls[0] as string)) return false;
  return (
    decodeEntities(text)
      .replace(new RegExp(URL_REGEX.source, "gi"), "")
      .trim().length === 0
  );
};

/**
 * Is the message nothing but one video URL?
 *
 * The companion to `isMediaOnlyMessage`, and it exists because that one is
 * deliberately image-only: web needs the narrow rule, since it decides between
 * a bare picture and a bubble. A phone needs the broader question too — a clip
 * sent from the picker *is* the message, and a client that only recognises the
 * image case renders the player and then prints
 * `https://static.klipy.com/….mp4` underneath it as text.
 */
export const isVideoOnlyMessage = (text: string): boolean => {
  const urls = extractUrls(text);
  if (urls.length !== 1) return false;
  if (!isDirectVideoUrl(urls[0] as string)) return false;
  return (
    decodeEntities(text)
      .replace(new RegExp(URL_REGEX.source, "gi"), "")
      .trim().length === 0
  );
};

/**
 * Klipy's video clips, which are `.mp4` rather than an animated image.
 *
 * Narrow on purpose — host *and* extension. A general "message is one video
 * URL" rule would swallow any linked mp4, and an autoplaying video is not what
 * someone linking a file expects.
 */
export const isKlipyClip = (text: string): boolean => {
  const trimmed = text.trim();
  return (
    trimmed.startsWith("https://static.klipy.com") && trimmed.endsWith(".mp4")
  );
};

/** The last path segment, for labelling a file attachment. */
export const getFileNameFromUrl = (url: string): string => {
  const path = url.split("?")[0]?.split("#")[0] ?? "";
  const name = path.split("/").pop() || "file";
  try {
    return decodeURIComponent(name);
  } catch {
    // A malformed percent-escape should not take out a message bubble.
    return name;
  }
};
