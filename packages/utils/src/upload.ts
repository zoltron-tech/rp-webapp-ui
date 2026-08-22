export const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

const MB = 1024 * 1024;

/**
 * Per-surface upload ceilings.
 *
 * These are three different numbers today, not one. DEDUPLICATION_PLAN.md §4.5
 * decides on a single 50MB limit, but that is blocked on the nginx
 * `client_max_body_size 25M` question — raising the proxy-path limit past 25MB
 * without raising nginx turns a slow upload into a 413. Naming them is the part
 * that is safe now; collapsing them is a behaviour change that waits for that
 * decision.
 */
export const MAX_UPLOAD_BYTES = {
  /** Gallery batches. */
  gallery: 30 * MB,
  /** Muse appearance media. */
  museMedia: 50 * MB,
  /** Avatars, banners, about-section media, connection art. */
  standard: 10 * MB,
} as const;

export interface UploadCandidate {
  /** Bytes. `File.size` on web, `fileSize` from expo-image-picker on native. */
  size: number;
  /** MIME type. */
  type: string;
}

export interface ValidateUploadOptions {
  maxBytes: number;
  /** Defaults to {@link VALID_IMAGE_TYPES}. Pass `null` to skip the check. */
  types?: readonly string[] | null;
}

/**
 * Validates a file about to be uploaded.
 *
 * Returns the message to show, or `null` when the file is fine. Takes size and
 * type rather than a `File` so the same call works against React Native's
 * picker result, which is not a `File`.
 */
export const validateUpload = (
  file: UploadCandidate,
  { maxBytes, types = VALID_IMAGE_TYPES }: ValidateUploadOptions,
): string | null => {
  if (types && !types.includes(file.type)) {
    return "File type not supported. Allowed: .png, .jpg, .gif";
  }
  if (file.size > maxBytes) {
    return `File too large (max ${Math.round(maxBytes / MB)} MB).`;
  }
  return null;
};
