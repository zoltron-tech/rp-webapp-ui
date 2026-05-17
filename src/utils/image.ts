/**
 * wsrv.nl image proxy / resizer.
 *
 * Whenever we receive an image URL that points at our S3 bucket, route it
 * through wsrv.nl so the CDN handles resizing + format conversion. Any URL
 * that does not match the bucket prefix is passed through untouched.
 *
 * The bucket name is configured via the `RP_BUCKET_NAME` env var. This util
 * is intended for use in the data-fetching layer (server actions) only —
 * call it on novelist / muse image fields *before* the data is returned to
 * the client. Never call it from component templates.
 */

import type { Muse, Novelist } from "@/types";
import type { Activity } from "@/types/activity";
import type { Comment, Prompt, PromptSource, Reply } from "@/types/prompt";

// ──────────────────────────────────────────────────────────────────────────
// Bucket prefix — single source of truth.
// ──────────────────────────────────────────────────────────────────────────

const getS3Prefix = (): string | null => {
  const bucket = process.env.RP_BUCKET_NAME;
  if (!bucket) return null;
  return `https://${bucket}.s3.eu-central-1.amazonaws.com/`;
};

// ──────────────────────────────────────────────────────────────────────────
// Sizing presets — tuned to current component dimensions.
//
//   AVATAR_*       — circular profile photos (square)
//   BANNER_*       — wide hero / wallpaper / cardBackground images
//   COVER          — squareish muse cards & generic fallbacks
//
// Suffix indicates render context:
//   _LARGE  — full profile pages
//   _MEDIUM — list / grid cards
//   _SMALL  — feed prompt / activity rows
// ──────────────────────────────────────────────────────────────────────────

export const IMAGE_SIZES = {
  AVATAR_LARGE: { fit: "cover" as const, h: 240, w: 240 },
  AVATAR_MEDIUM: { fit: "cover" as const, h: 120, w: 120 },
  AVATAR_SMALL: { fit: "cover" as const, h: 96, w: 96 },
  BANNER_LARGE: { fit: "cover" as const, h: 400, w: 1200 },
  BANNER_MEDIUM: { fit: "cover" as const, h: 300, w: 600 },
  COVER_LARGE: { fit: "cover" as const, h: 400, w: 400 },
  COVER_MEDIUM: { fit: "cover" as const, h: 300, w: 300 },
};

type WsrvOptions = {
  w?: number;
  h?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  q?: number;
};

// ──────────────────────────────────────────────────────────────────────────
// Core URL transform.
// ──────────────────────────────────────────────────────────────────────────

export function wsrvImage<T extends string | null | undefined>(
  s3Url: T,
  opts: WsrvOptions = {},
): T {
  if (!s3Url) return s3Url;
  const prefix = getS3Prefix();
  if (!prefix) return s3Url; // env not configured → no-op
  if (!s3Url.startsWith(prefix)) return s3Url; // foreign URL → untouched

  const { fit = "cover", h, q = 80, w } = opts;
  const stripped = (s3Url as string).replace("https://", "");
  const params = new URLSearchParams({
    fit,
    output: "webp",
    q: String(q),
    url: stripped,
    we: "1",
    ...(w ? { w: String(w) } : {}),
    ...(h ? { h: String(h) } : {}),
  });
  return `https://wsrv.nl/?${params.toString()}` as T;
}

// ──────────────────────────────────────────────────────────────────────────
// Per-context size profiles.
//
// "profile" — /rp/novelists pages: larger, used as hero/profile imagery.
// "feed"    — /rp/home & /rp/explore cards: smaller, denser layouts.
// ──────────────────────────────────────────────────────────────────────────

type Context = "profile" | "feed";

const sizesFor = (ctx: Context) =>
  ctx === "profile"
    ? {
        avatar: IMAGE_SIZES.AVATAR_MEDIUM, // 120 — matches profile-card avatar
        banner: IMAGE_SIZES.BANNER_LARGE, // 1200x400
        cover: IMAGE_SIZES.COVER_LARGE, // 400x400 — muse cards on profile
      }
    : {
        avatar: IMAGE_SIZES.AVATAR_SMALL, // 96 — feed source/avatar
        banner: IMAGE_SIZES.BANNER_MEDIUM, // 600x300
        cover: IMAGE_SIZES.COVER_MEDIUM, // 300x300
      };

// ──────────────────────────────────────────────────────────────────────────
// Domain-object transforms — mutate in place.
//
// Mutation is safe here because server actions parse fresh JSON on each call
// (no shared cache), and these functions are only invoked on the server in
// the data-fetching layer just before returning to the client.
// ──────────────────────────────────────────────────────────────────────────

/** Apply wsrv transform to any image field on a generic source-like object. */
export function transformPromptSource(
  src: PromptSource | null | undefined,
  ctx: Context = "feed",
): void {
  if (!src) return;
  const sizes = sizesFor(ctx);
  src.image = wsrvImage(src.image, sizes.avatar);
}

export function transformActivitySource(
  src: Activity["source"] | null | undefined,
  ctx: Context = "feed",
): void {
  if (!src) return;
  const sizes = sizesFor(ctx);
  src.image = wsrvImage(src.image, sizes.avatar);
}

/**
 * Transform every image field on a Muse, including its nested NWImage
 * variants and its `pennedBy` novelist.
 */
export function transformMuse(
  muse: Muse | null | undefined,
  ctx: Context = "feed",
  visited: WeakSet<object> = new WeakSet(),
): void {
  if (!muse || visited.has(muse)) return;
  visited.add(muse);
  const sizes = sizesFor(ctx);

  // Plain string fields.
  muse.image = wsrvImage(muse.image, sizes.cover);

  // NWImage wrappers — the user-facing URL is `.src`. Crop coords stay valid
  // because wsrv preserves the source dimensions when we don't pass `w`/`h`
  // alongside cropping; we apply our own sizing on top.
  if (muse.wallpaper) {
    muse.wallpaper.src = wsrvImage(muse.wallpaper.src, sizes.banner);
  }
  if (muse.avatar) {
    muse.avatar.src = wsrvImage(muse.avatar.src, sizes.avatar);
  }
  if (muse.cardBackground) {
    muse.cardBackground.src = wsrvImage(muse.cardBackground.src, sizes.banner);
  }

  if (muse.pennedBy) {
    transformNovelist(muse.pennedBy, ctx, visited);
  }
}

/**
 * Transform every image field on a Novelist, including nested muses, friends,
 * and their muses. Cycles are guarded by a `visited` WeakSet.
 */
export function transformNovelist(
  novelist: Novelist | null | undefined,
  ctx: Context = "feed",
  visited: WeakSet<object> = new WeakSet(),
): void {
  if (!novelist || visited.has(novelist)) return;
  visited.add(novelist);
  const sizes = sizesFor(ctx);

  novelist.image = wsrvImage(novelist.image, sizes.avatar);

  if (Array.isArray(novelist.muses)) {
    for (const muse of novelist.muses) transformMuse(muse, ctx, visited);
  }
  if (Array.isArray(novelist.friends)) {
    for (const friend of novelist.friends) {
      if (visited.has(friend)) continue;
      visited.add(friend);
      friend.image = wsrvImage(friend.image, sizes.avatar);
      if (Array.isArray(friend.muses)) {
        for (const muse of friend.muses) transformMuse(muse, ctx, visited);
      }
    }
  }
}

/** Transform images on a Prompt and any nested comment/reply sources. */
export function transformPrompt(
  prompt: Prompt | null | undefined,
  ctx: Context = "feed",
): void {
  if (!prompt) return;
  transformPromptSource(prompt.source, ctx);
}

export function transformComment(
  comment: Comment | null | undefined,
  ctx: Context = "feed",
): void {
  if (!comment) return;
  transformPromptSource(comment.source, ctx);
  if (comment.prompt) transformPrompt(comment.prompt, ctx);
  if (Array.isArray(comment.replies)) {
    for (const reply of comment.replies) transformReply(reply, ctx);
  }
}

export function transformReply(
  reply: Reply | null | undefined,
  ctx: Context = "feed",
): void {
  if (!reply) return;
  transformPromptSource(reply.source, ctx);
}

/** Transform images on an Activity (its `source` carries the avatar URL). */
export function transformActivity(
  activity: Activity | null | undefined,
  ctx: Context = "feed",
): void {
  if (!activity) return;
  transformActivitySource(activity.source, ctx);
}
