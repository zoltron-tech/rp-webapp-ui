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

/**
 * Returns true when `url` is a virtual-hosted-style S3 URL belonging to our
 * bucket.  Accepts both the global endpoint and any regional variant:
 *   https://<bucket>.s3.amazonaws.com/…
 *   https://<bucket>.s3.<region>.amazonaws.com/…
 */
const isOurS3Url = (url: string): boolean => {
  const bucket = process.env.RP_BUCKET_NAME;
  if (!bucket) return false;
  const afterHttps = url.startsWith("https://") ? url.slice(8) : null;
  if (!afterHttps?.startsWith(`${bucket}.s3`)) return false;
  const rest = afterHttps.slice(bucket.length + 3); // past "<bucket>.s3"
  // global:   .amazonaws.com/…
  // regional: .<region>.amazonaws.com/…
  return (
    rest.startsWith(".amazonaws.com/") ||
    /^\.[a-z0-9-]+\.amazonaws\.com\//.test(rest)
  );
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
  AVATAR_LARGE: { fit: "cover" as const, h: 600, w: 600 },
  AVATAR_MEDIUM: { fit: "cover" as const, h: 240, w: 240 },
  AVATAR_SMALL: { fit: "cover" as const, h: 120, w: 120 },
  BANNER_LARGE: { fit: "cover" as const, h: 400, w: 1200 },
  BANNER_MEDIUM: { fit: "cover" as const, h: 300, w: 600 },
  // Card backgrounds must preserve the original aspect ratio (no cropping) so
  // the stored CSS crop (background-size/position) frames the image exactly as
  // it was set in the editor, which positions against the un-cropped image.
  CARD_BG: { fit: "inside" as const, h: 1422, w: 800 },
  CARD_BG_MINI: { fit: "inside" as const, h: 800, w: 450 },
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

/**
 * Reverse a wsrv.nl proxy URL back to the original S3 URL.
 * Safe to call on any URL — non-wsrv.nl URLs are returned unchanged.
 * Mirrors the generic signature of wsrvImage so callers preserve null/undefined.
 */
export function reverseWsrvUrl<T extends string | null | undefined>(url: T): T {
  if (!url || !(url as string).startsWith("https://wsrv.nl/?")) return url;
  const qIndex = (url as string).indexOf("?");
  if (qIndex === -1) return url;
  const params = new URLSearchParams((url as string).slice(qIndex + 1));
  const s3Part = params.get("url");
  return (s3Part ? `https://${s3Part}` : url) as T;
}

export function wsrvImage<T extends string | null | undefined>(
  s3Url: T,
  opts: WsrvOptions = {},
): T {
  if (!s3Url) return s3Url;
  if (!process.env.RP_BUCKET_NAME) return s3Url; // env not configured → no-op
  if (!isOurS3Url(s3Url as string)) return s3Url; // foreign URL → untouched

  const { fit = "cover", h, q = 80, w } = opts;
  // Normalise to the global S3 endpoint (no region) so both
  // s3.amazonaws.com and s3.<region>.amazonaws.com produce the same
  // wsrv.nl cache key.
  const bucket = process.env.RP_BUCKET_NAME as string;
  const stripped = (s3Url as string)
    .replace("https://", "")
    .replace(
      new RegExp(`^${bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/`),
      `${bucket}.s3.amazonaws.com/`,
    );
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

type Context = "profile" | "feed" | "hero";

const sizesFor = (ctx: Context) => {
  if (ctx === "profile")
    return {
      avatar: IMAGE_SIZES.AVATAR_MEDIUM, // 120 — matches profile-card avatar
      banner: IMAGE_SIZES.BANNER_LARGE, // 1200x400
      cardBg: IMAGE_SIZES.CARD_BG, // 500x800
      cover: IMAGE_SIZES.COVER_LARGE, // 400x400 — muse cards on profile
    };
  if (ctx === "hero")
    return {
      avatar: IMAGE_SIZES.AVATAR_SMALL, // 96 — carousel avatars
      banner: IMAGE_SIZES.BANNER_MEDIUM, // 600x300
      cardBg: IMAGE_SIZES.CARD_BG_MINI, // 250x400 — compact carousel cards
      cover: IMAGE_SIZES.COVER_MEDIUM, // 300x300
    };
  // "feed"
  return {
    avatar: IMAGE_SIZES.AVATAR_SMALL, // 96 — feed source/avatar
    banner: IMAGE_SIZES.BANNER_MEDIUM, // 600x300
    cardBg: IMAGE_SIZES.CARD_BG, // 500x800
    cover: IMAGE_SIZES.COVER_MEDIUM, // 300x300
  };
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
  // When there's no cardBackground, muse.image fills the card banner slot
  // and should be sized to CARD_BG proportions rather than a square cover.
  muse.image = wsrvImage(
    muse.image,
    muse.cardBackground ? sizes.cover : sizes.cardBg,
  );

  // NWImage wrappers — transform both the main `.src` and the pre-cropped
  // `.crop.src` variant (stored separately in S3) through wsrv.
  if (muse.wallpaper) {
    muse.wallpaper.src = wsrvImage(muse.wallpaper.src, sizes.banner);
    if (muse.wallpaper.crop?.src) {
      muse.wallpaper.crop.src = wsrvImage(
        muse.wallpaper.crop.src,
        sizes.banner,
      );
    }
  }
  if (muse.avatar) {
    muse.avatar.src = wsrvImage(muse.avatar.src, sizes.avatar);
    if (muse.avatar.crop?.src) {
      muse.avatar.crop.src = wsrvImage(muse.avatar.crop.src, sizes.avatar);
    }
  }
  if (muse.cardBackground) {
    muse.cardBackground.src = wsrvImage(muse.cardBackground.src, sizes.cardBg);
    if (muse.cardBackground.crop?.src) {
      muse.cardBackground.crop.src = wsrvImage(
        muse.cardBackground.crop.src,
        sizes.cardBg,
      );
    }
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
