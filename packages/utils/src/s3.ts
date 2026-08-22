/**
 * The object key for an S3 URL, with no leading slash.
 *
 * Falls back to the input when it is not a parseable URL — callers pass both
 * full URLs and bare keys, and a bare key is already the answer.
 */
export const s3KeyFromUrl = (url: string): string => {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return url.replace(/^\/+/, "");
  }
};

/**
 * Encodes an S3 key for use as a single path segment.
 *
 * The delete endpoint takes the key in the URL path, so every separator has to
 * survive the round trip as something that is not itself a separator.
 */
export const escapeS3Key = (key: string): string => key.replace(/\//g, "-slash-");

/** Reverses {@link escapeS3Key}. */
export const unescapeS3Key = (key: string): string =>
  key.replace(/-slash-/g, "/");

/**
 * A human-readable file name derived from a URL: last path segment, extension
 * removed, separators turned back into spaces.
 */
export const getFileNameFromUrl = (url: string): string => {
  if (!url) return "";

  try {
    // Extract last part after '/'
    const parts = url.split("/");
    let fileName = parts[parts.length - 1];

    // Remove file extension
    fileName = fileName.replace(/\.[^/.]+$/, "");

    // Replace special characters with spaces
    fileName = fileName.replace(/[-_+%20]+/g, " ");

    // Decode URI components if needed (e.g., %20 -> space)
    fileName = decodeURIComponent(fileName);

    // Trim extra spaces
    return fileName.trim();
  } catch {
    return "";
  }
};
