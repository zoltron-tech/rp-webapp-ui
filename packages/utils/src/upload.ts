import { formatBytes } from "./bytes";
import { isHostedMediaUrl } from "./image";

export const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

const MB = 1024 * 1024;

// ─── Caps, from the service (AWS_COST_SECURITY_PLAN.md D7) ──────────────────

/**
 * The service's per-file caps by family, in bytes, as `GET /s3/usage` sends
 * them under `limits.caps`. Never written into the client: the presign refuses
 * anything above them with 413 `size_over_cap` (and S3 refuses a PUT whose body
 * is not the size that was signed), so a number baked in here could only
 * drift from the one that decides.
 */
export interface UploadCaps {
  image: number;
  video: number;
  audio: number;
  other: number;
}

/**
 * `limits` on `GET /s3/usage`: the caps, whether the storage and daily limits
 * are enforced yet (they ship recording only), and the CloudFront hosts for
 * stored media and for chat media, `null` while each is unset.
 */
export interface UploadLimits {
  caps: UploadCaps | null;
  enforce: boolean;
  chatMediaHost: string | null;
  mediaHost: string | null;
  /**
   * Each storyboard's own storage limit, in bytes (owner decision 2026-11-08:
   * storyboard media does not count toward the account's total). `null` or
   * left out from a service that predates it. Only the refusal copy reads it,
   * never a client-side check: the service judges a storyboard's room.
   */
  storyboardLimitBytes?: number | null;
}

/**
 * What an upload is for, sent to `GET /s3/presigned-url` as `purpose`
 * (owner decisions 2026-11-08):
 *
 * - `personal` (the default): avatars, muse images and gallery, profile
 *   media, music. Counts toward the account's storage total.
 * - `post`: media in a prompt, comment or reply. Does not count toward the
 *   total; the per-file cap and the daily limits still apply.
 * - `storyboard`: media inside a storyboard (covers, chapters, threads, maps,
 *   codex, notes). Keyed under the storyboard (`scoped=false`, the storyboard
 *   id as the prefix) and charged to the storyboard's own limit
 *   (413 `storyboard_full`), not the account's total.
 */
export type UploadPurpose = "personal" | "post" | "storyboard";

/** Whether an upload of this purpose counts toward the account's storage total. */
export const countsTowardStorage = (
  purpose: UploadPurpose | null | undefined,
): boolean => (purpose ?? "personal") === "personal";

export type UploadFamily = keyof UploadCaps;

/** A MIME type's family: image, video, audio, or anything else. */
export const uploadFamilyOf = (
  contentType: string | null | undefined,
): UploadFamily => {
  const type = (contentType ?? "").toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "other";
};

/**
 * The cap for a MIME type, from the service's caps. `Infinity` when the caps
 * are unknown (the limits call failed) or carry no usable number for that
 * family: the client then refuses nothing on size and the service decides.
 */
export const capForType = (
  contentType: string | null | undefined,
  caps: Partial<UploadCaps> | null | undefined,
): number => {
  const cap = caps?.[uploadFamilyOf(contentType)];
  return typeof cap === "number" && Number.isFinite(cap) && cap > 0
    ? cap
    : Number.POSITIVE_INFINITY;
};

/** The one "too large" line, client-side and for a 413 `size_over_cap`. */
export const fileTooLargeMessage = (maxBytes: number): string =>
  `File too large (max ${formatBytes(maxBytes)}).`;

const HINT_NOUNS: Record<UploadFamily, string> = {
  audio: "audio file",
  image: "image",
  other: "file",
  video: "video",
};

/**
 * A picker's hint from the service's caps: "max 30 MB" when the families it
 * takes share one cap, else "max 30 MB per image, 50 MB per video". `null`
 * while the caps are unknown, so a hint never shows a number the service did
 * not send.
 */
export const uploadCapsHint = (
  caps: Partial<UploadCaps> | null | undefined,
  families: readonly UploadFamily[],
): string | null => {
  const known = families
    .map((family) => [family, caps?.[family]] as const)
    .filter(
      (entry): entry is readonly [UploadFamily, number] =>
        typeof entry[1] === "number" &&
        Number.isFinite(entry[1]) &&
        entry[1] > 0,
    );
  if (!known.length) return null;
  if (known.every(([, cap]) => cap === known[0][1])) {
    return `max ${formatBytes(known[0][1])}`;
  }
  return `max ${known
    .map(([family, cap]) => `${formatBytes(cap)} per ${HINT_NOUNS[family]}`)
    .join(", ")}`;
};

export interface UploadCandidate {
  /** Bytes. `File.size` on web, `fileSize` from expo-image-picker on native. */
  size: number;
  /** MIME type. */
  type: string;
}

/**
 * The "too large" line when `file` is over its family's cap, else `null`
 * (also `null` while the caps are unknown). Takes size and type rather than a
 * `File` so the same call works against React Native's picker result.
 */
export const oversizeMessage = (
  file: UploadCandidate,
  caps: Partial<UploadCaps> | null | undefined,
): string | null => {
  const cap = capForType(file.type, caps);
  return file.size > cap ? fileTooLargeMessage(cap) : null;
};

// ─── Refusals (AWS_COST_SECURITY_PLAN.md §2.2) ──────────────────────────────

/**
 * The codes the service refuses an upload with: 413 (`size_over_cap`,
 * `storage_full`, and `storyboard_full` for a storyboard's own limit), 429
 * and 503 on the presign; 422 `media_rejected` from `/s3/moderate` (the NSFW
 * screen, which has already deleted the object); 422 `too_many_media` from
 * the prompt, comment and reply save endpoints (more than
 * {@link MAX_POST_MEDIA} media items); and `unsupported_type`, the client's
 * name for the presign's bare 415 (a type the service will not sign).
 */
export type UploadRefusalCode =
  | "size_over_cap"
  | "upload_daily_limit"
  | "storage_full"
  | "storyboard_full"
  | "too_many_media"
  | "upload_unavailable"
  | "media_rejected"
  | "unsupported_type";

/**
 * A refused upload, as the shared helpers read it off a 413/429. `code` stays
 * a plain string so a code this client does not know still arrives (and gets
 * the generic line) instead of being dropped.
 */
export interface UploadRefusal {
  refused: true;
  code: UploadRefusalCode | string;
  status: number;
  /** `Retry-After` in seconds, when the service sent one. */
  retryAfterSeconds: number | null;
}

export const isUploadRefusal = (value: unknown): value is UploadRefusal =>
  typeof value === "object" &&
  value !== null &&
  (value as { refused?: unknown }).refused === true;

/** Seconds from `now` to the next UTC midnight, when the daily limit resets. */
export const secondsToUtcMidnight = (now: Date = new Date()): number => {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
};

/** "5 h", or "40 min" under an hour. Rounded up: never promise it sooner. */
export const formatResetIn = (seconds: number): string => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  if (safe < 3600) return `${Math.max(1, Math.ceil(safe / 60))} min`;
  return `${Math.ceil(safe / 3600)} h`;
};

/** Whole seconds from `now` to an ISO time; `null` when it does not parse or has passed. */
const secondsUntil = (
  iso: string | null | undefined,
  now: Date = new Date(),
): number | null => {
  const at = iso ? Date.parse(iso) : Number.NaN;
  if (!Number.isFinite(at)) return null;
  const seconds = Math.ceil((at - now.getTime()) / 1000);
  return seconds > 0 ? seconds : null;
};

export const UPLOAD_FAILED_MESSAGE = "Upload failed. Please try again.";

/** 503 `upload_unavailable`: the service could not take the account's lock. */
export const UPLOAD_UNAVAILABLE_MESSAGE =
  "Uploads are paused for a moment. Please try again.";

/** 422 `media_rejected`: the one line for a picture the NSFW screen refused. */
export const MEDIA_REJECTED_MESSAGE =
  "This image appears to contain sexual content, which isn't allowed on Novelist World.";

/** 415: a file type the service will not store. */
export const UNSUPPORTED_TYPE_MESSAGE = "This type of file can't be uploaded.";

// ─── Post media cap (owner decision 2026-11-08) ─────────────────────────────

/** The most media items one prompt, comment or reply may carry. */
export const MAX_POST_MEDIA = 5;

/** What the composer is writing; a prompt is "a post" to the person. */
export type PostMediaKind = "prompt" | "post" | "comment" | "reply";

/**
 * The line for a prompt, comment or reply at its media limit: the picker's
 * own refusal and the save endpoints' 422 `too_many_media` alike.
 */
export const tooManyMediaMessage = (kind: PostMediaKind = "post"): string =>
  `You can add up to ${MAX_POST_MEDIA} images or videos to a ${kind === "prompt" ? "post" : kind}.`;

/** Avatars inside mention chips and dialog embeds: chrome, not media. */
const AVATAR_CLASS = /\b(mention-avatar|dialog-avatar|muse-av)\b/;

/** `klipy.com` or any subdomain (the picker's files are on `static.klipy.com`). */
const KLIPY_HOST = /^https?:\/\/(?:[a-z0-9-]+\.)*klipy\.com(?:[/:?#]|$)/i;

/**
 * Whether a media URL is served by Klipy: a GIF, sticker or clip chosen from
 * a picker, never stored on our side. Not hosted by us, so it never counts
 * toward {@link MAX_POST_MEDIA}; kept for callers that name Klipy itself.
 */
export const isKlipyMediaUrl = (url: string | null | undefined): boolean =>
  Boolean(url && KLIPY_HOST.test(url.trim()));

/** A picture still on the device or in the page while its upload runs. */
const PENDING_UPLOAD = /^(?:blob|file|content|ph|assets-library):/i;

/**
 * Whether a media URL counts toward {@link MAX_POST_MEDIA} (owner decision
 * 2026-11-08): only media we host ({@link isHostedMediaUrl}: our bucket or
 * media host), plus a local picture whose upload to us is still running
 * (`blob:`, `file:`, `content:`, `ph:`). A link to another site, Klipy
 * included, is free. The portfolio service's `PostMedia` is the same rule.
 */
export const countsAsPostMedia = (url: string | null | undefined): boolean => {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  return PENDING_UPLOAD.test(trimmed) || isHostedMediaUrl(trimmed);
};

const attr = (tag: string, name: string): string | null => {
  const match = new RegExp(
    `\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    "i",
  ).exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
};

/**
 * How many media items a rich-text body holds toward {@link MAX_POST_MEDIA}:
 * every `<img>`, `<video>` and `<audio>` whose `src` we host
 * ({@link countsAsPostMedia}), except the avatars drawn inside mention chips
 * and dialog embeds. A plain tag count, enough for the composer's limit; the
 * save endpoint (`PostMedia` in the portfolio service, which counts the same
 * way) is the authority.
 */
export const countRichTextMedia = (html: string | null | undefined): number => {
  if (!html) return 0;
  let count = 0;
  for (const match of html.matchAll(/<(img|video|audio)\b[^>]*>/gi)) {
    const tag = match[0];
    if (!countsAsPostMedia(attr(tag, "src"))) continue;
    if (match[1].toLowerCase() === "img") {
      const cls = attr(tag, "class");
      if (cls && AVATAR_CLASS.test(cls)) continue;
    }
    count += 1;
  }
  return count;
};

export interface UploadRefusalContext {
  /**
   * The file's cap for `size_over_cap`, from the service's caps
   * ({@link capForType}); the copy leaves the number out without it.
   */
  capBytes?: number | null;
  /** The account's total, from `/s3/usage`; the copy leaves the number out without it. */
  limitBytes?: number | null;
  /**
   * A storyboard's own limit (`limits.storyboardLimitBytes` on `/s3/usage`),
   * for `storyboard_full`; the copy leaves the number out without it.
   */
  storyboardLimitBytes?: number | null;
  /**
   * `/s3/usage`'s `resetsAt`, for the daily line when the refusal carried no
   * `Retry-After` (a refusal made on this side, before any upload).
   */
  resetsAt?: string | null;
  /** For tests. */
  now?: Date;
}

/**
 * The line to show for a refused upload. Never the service's own `message`:
 * the web toasts render HTML, and the copy is the client's to own.
 */
export const uploadRefusalMessage = (
  refusal: Pick<UploadRefusal, "code" | "retryAfterSeconds">,
  {
    capBytes,
    limitBytes,
    now,
    resetsAt,
    storyboardLimitBytes,
  }: UploadRefusalContext = {},
): string => {
  switch (refusal.code) {
    case "storage_full":
      return limitBytes && limitBytes > 0
        ? `You've used all ${formatBytes(limitBytes)} of your storage. Delete some media to make room.`
        : "You've used all of your storage. Delete some media to make room.";
    case "storyboard_full":
      return storyboardLimitBytes &&
        Number.isFinite(storyboardLimitBytes) &&
        storyboardLimitBytes > 0
        ? `This storyboard has used all ${formatBytes(storyboardLimitBytes)} of its storage. Delete some media from the storyboard to make room.`
        : "This storyboard has used all of its storage. Delete some media from the storyboard to make room.";
    case "too_many_media":
      return tooManyMediaMessage();
    case "upload_daily_limit": {
      const seconds =
        refusal.retryAfterSeconds && refusal.retryAfterSeconds > 0
          ? refusal.retryAfterSeconds
          : (secondsUntil(resetsAt, now) ?? secondsToUtcMidnight(now));
      return `You've reached today's upload limit. It resets in ${formatResetIn(seconds)}.`;
    }
    case "size_over_cap":
      return capBytes && Number.isFinite(capBytes) && capBytes > 0
        ? fileTooLargeMessage(capBytes)
        : "This file is too large to upload.";
    case "upload_unavailable":
      return UPLOAD_UNAVAILABLE_MESSAGE;
    case "media_rejected":
      return MEDIA_REJECTED_MESSAGE;
    case "unsupported_type":
      return UNSUPPORTED_TYPE_MESSAGE;
    default:
      return UPLOAD_FAILED_MESSAGE;
  }
};

// ─── Storage usage (GET /s3/usage) ──────────────────────────────────────────

/**
 * `GET /s3/usage`, as the service sends it. `resetsAt` is ISO-8601 UTC.
 * `limits` is `null` from a service that predates it (or sent it unreadable).
 */
export interface StorageUsage {
  usedBytes: number;
  limitBytes: number;
  dailyUsedBytes: number;
  dailyLimitBytes: number;
  dailyFiles: number;
  dailyFilesLimit: number;
  resetsAt: string;
  limits: UploadLimits | null;
}

/**
 * The check every upload makes before anything is sent
 * (AWS_COST_SECURITY_PLAN.md §2.2), in order:
 *
 * 1. over the family cap: `size_over_cap`;
 * 2. only while `limits.enforce` is on: over the room left in storage:
 *    `storage_full`, for a `personal` upload only (`post` and `storyboard`
 *    media do not count toward the account's total, and a storyboard's own
 *    room is the service's to judge with 413 `storyboard_full`, never guessed
 *    here); over the room left today, or today's file count used up:
 *    `upload_daily_limit`, for every purpose.
 *
 * With enforcement off the service only records, so nothing but the cap is
 * refused here. `null` when the file may go, including when the usage is
 * unknown (`null`): a failed limits call refuses nothing and the service
 * decides. The refusal has the service's shape, so the same copy words it.
 */
export const checkUploadAllowance = (
  file: UploadCandidate,
  usage: StorageUsage | null | undefined,
  purpose: UploadPurpose = "personal",
): UploadRefusal | null => {
  if (!usage) return null;
  const refuse = (code: UploadRefusalCode, status: number): UploadRefusal => ({
    code,
    refused: true,
    retryAfterSeconds: null,
    status,
  });
  const size = Number.isFinite(file.size) && file.size > 0 ? file.size : 0;
  if (size > capForType(file.type, usage.limits?.caps)) {
    return refuse("size_over_cap", 413);
  }
  if (!usage.limits?.enforce) return null;
  if (
    countsTowardStorage(purpose) &&
    usage.limitBytes > 0 &&
    size > usage.limitBytes - usage.usedBytes
  ) {
    return refuse("storage_full", 413);
  }
  if (
    usage.dailyLimitBytes > 0 &&
    size > usage.dailyLimitBytes - usage.dailyUsedBytes
  ) {
    return refuse("upload_daily_limit", 429);
  }
  if (usage.dailyFilesLimit > 0 && usage.dailyFiles >= usage.dailyFilesLimit) {
    return refuse("upload_daily_limit", 429);
  }
  return null;
};

/** The share of the total used, 0–1, for the settings bar. */
export const storageUsedRatio = (
  usage: Pick<StorageUsage, "usedBytes" | "limitBytes">,
): number =>
  usage.limitBytes > 0
    ? Math.min(1, Math.max(0, usage.usedBytes / usage.limitBytes))
    : 0;

/** At or past this share the bar turns to the warning colour. */
export const STORAGE_WARNING_RATIO = 0.9;

/** "340 MB of 2 GB". */
export const storageSummary = (
  usage: Pick<StorageUsage, "usedBytes" | "limitBytes">,
): string =>
  `${formatBytes(usage.usedBytes)} of ${formatBytes(usage.limitBytes)}`;

/** "Today: 120 MB of 500 MB uploaded", or `null` when nothing went up today. */
export const storageDailySummary = (
  usage: Pick<StorageUsage, "dailyUsedBytes" | "dailyLimitBytes">,
): string | null =>
  usage.dailyUsedBytes > 0 && usage.dailyLimitBytes > 0
    ? `Today: ${formatBytes(usage.dailyUsedBytes)} of ${formatBytes(usage.dailyLimitBytes)} uploaded`
    : null;

/**
 * When the daily limit resets, in the reader's own clock ("at 5:00 AM"), from
 * `resetsAt`. Falls back to "at midnight UTC" when the value does not parse.
 */
export const storageResetTime = (
  resetsAt: string | null | undefined,
): string => {
  const time = resetsAt ? new Date(resetsAt) : null;
  if (!time || Number.isNaN(time.getTime())) return "at midnight UTC";
  return `at ${time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
};

const CAP_FAMILIES: ReadonlyArray<[UploadFamily, string]> = [
  ["image", "Images"],
  ["video", "video"],
  ["audio", "audio"],
  ["other", "other files"],
];

/**
 * "Images up to 30 MB, video up to 50 MB, audio up to 50 MB, other files up to
 * 50 MB." from the service's caps; `null` without them, so the explainer never
 * prints a number the service did not send.
 */
export const uploadCapsLine = (
  caps: Partial<UploadCaps> | null | undefined,
): string | null => {
  const parts: string[] = [];
  for (const [family, noun] of CAP_FAMILIES) {
    const cap = caps?.[family];
    if (typeof cap === "number" && Number.isFinite(cap) && cap > 0) {
      parts.push(`${noun} up to ${formatBytes(cap)}`);
    }
  }
  if (!parts.length) return null;
  const line = parts.join(", ");
  return `${line.charAt(0).toUpperCase()}${line.slice(1)}.`;
};

/** The explainer behind the Storage row, shared so web and mobile say the same. */
export const storageExplainer = (
  usage: Pick<
    StorageUsage,
    "limitBytes" | "dailyLimitBytes" | "dailyFilesLimit" | "resetsAt"
  > & { limits?: UploadLimits | null },
): { title: string; lines: string[] } => {
  const caps = uploadCapsLine(usage.limits?.caps);
  const limits = [
    usage.dailyLimitBytes > 0 ? formatBytes(usage.dailyLimitBytes) : null,
    usage.dailyFilesLimit > 0 ? `${usage.dailyFilesLimit} files` : null,
  ].filter(Boolean);
  const daily = limits.length
    ? `There's also a daily upload limit of ${limits.join(" or ")}, chat media included. It resets ${storageResetTime(usage.resetsAt)}.`
    : `There's also a daily upload limit, chat media included. It resets ${storageResetTime(usage.resetsAt)}.`;
  return {
    lines: [
      `You have ${formatBytes(usage.limitBytes)} for the images, video, music and gallery files you upload. Media in chats, posts, comments, replies and storyboards doesn't count.`,
      "Deleting media frees up its space.",
      ...(caps ? [caps] : []),
      daily,
    ],
    title: "Storage",
  };
};
