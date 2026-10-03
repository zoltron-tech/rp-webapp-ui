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

/** Every http(s) URL in the text, in order, deduplicated. */
export const extractUrls = (text: string): string[] => {
  if (!text) return [];
  // A `g` regex carries `lastIndex` between calls, so a shared instance would
  // start half way through the next message it was handed. New one per call.
  const matches = text.match(new RegExp(URL_REGEX.source, "gi")) ?? [];
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
    text.replace(new RegExp(URL_REGEX.source, "gi"), "").trim().length === 0
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
    text.replace(new RegExp(URL_REGEX.source, "gi"), "").trim().length === 0
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
