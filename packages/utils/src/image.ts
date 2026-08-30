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

import type { Friend, ImageCropFilter, Muse, Novelist } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import type { Comment, Prompt, PromptSource, Reply } from "@nw/types/prompt";

/**
 * Packs a crop editor's pan/zoom state into the stored `ImageCropFilter`.
 *
 * Scale is stored as a whole percentage in both `width` and `height` — the
 * crop is always uniform, so one number is expressed twice rather than the
 * shape carrying a separate aspect.
 */
export function toCropFilter(
  src: string,
  x: number,
  y: number,
  scale: number,
): ImageCropFilter {
  const scalePct = Math.round(scale * 100);
  return {
    height: scalePct,
    src,
    width: scalePct,
    x: Math.round(x),
    y: Math.round(y),
  };
}

/**
 * The largest zoom the crop editors allow, as the whole percentage the crop is
 * stored in (`scale: 3` → `width: 300`). Anything above it is not a zoom this
 * app wrote: older records stored a pixel crop box in the same fields, and
 * reading those as a percentage would blow the image up by an arbitrary factor.
 */
export const CROP_SCALE_MAX_PCT = 300;

/** Whether a stored crop is one of ours, and therefore safe to render. */
export function hasUsableCrop(
  crop?: ImageCropFilter | null,
): crop is ImageCropFilter {
  return !!crop && crop.width > 0 && crop.width <= CROP_SCALE_MAX_PCT;
}

/**
 * Unpacks a stored crop back into a crop editor's pan/zoom state — the inverse
 * of `toCropFilter`, and what an "adjust the image you already have" flow seeds
 * its dialog from. Falls back to dead centre at 1x when there is nothing usable
 * to read, which is also the right starting point for a freshly picked image.
 */
export function cropToEditorState(crop?: ImageCropFilter | null): {
  scale: number;
  x: number;
  y: number;
} {
  if (!hasUsableCrop(crop)) return { scale: 1, x: 50, y: 50 };
  return { scale: crop.width / 100, x: crop.x, y: crop.y };
}

/**
 * The CSS a stored crop describes.
 *
 * `x`/`y` are 0–100 `background-position` percentages and `width` is the zoom
 * as `scale * 100`, so the image is sized `width% auto` — fit by width, height
 * following — which is exactly what the crop dialogs preview. Rendering it this
 * way makes the avatar match the user's adjustment at any display size, whatever
 * the image's aspect ratio.
 *
 * Falls back to the uncropped default, so it is safe to spread unconditionally:
 *
 * ```ts
 * <div style={{ backgroundImage: `url(${src})`, ...cropBackgroundStyle(crop) }} />
 * ```
 */
export function cropBackgroundStyle(crop?: ImageCropFilter | null): {
  backgroundPosition: string;
  backgroundSize: string;
} {
  if (!hasUsableCrop(crop)) {
    return { backgroundPosition: "center", backgroundSize: "cover" };
  }
  return {
    backgroundPosition: `${crop.x}% ${crop.y}%`,
    backgroundSize: `${crop.width}% auto`,
  };
}

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
  // Banners, like card backgrounds, must preserve the original aspect ratio
  // (no cropping) — the crop dialog always frames at 5:2 and stores its
  // scale/position (banner.crop) as percentages against the un-cropped
  // source image. `fit: "cover"` with a hard-coded w×h forces a *different*
  // aspect ratio (e.g. 1200×400 = 3:1) onto that source before the CSS
  // background-size/position math runs, which visibly distorts/mis-crops
  // the banner. `inside` + a 5:2 bounding box just downsizes for delivery
  // without touching the aspect ratio the crop math depends on.
  BANNER_LARGE: { fit: "inside" as const, h: 480, w: 1200 },
  BANNER_MEDIUM: { fit: "inside" as const, h: 240, w: 600 },
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
  opts?: WsrvOptions | null,
): T {
  if (!s3Url) return s3Url;
  if (!opts) return s3Url; // null sizing profile → caller wants the source untouched
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
// "profile"  — /rp/novelists/[username] pages: larger, used as hero/profile imagery.
// "feed"     — /rp/home & /rp/explore cards: smaller, denser layouts.
// "hero"     — /rp/novelists landing muse rows.
// "carousel" — /rp/novelists landing novelist carousel cards.
// ──────────────────────────────────────────────────────────────────────────

type Context = "profile" | "feed" | "hero" | "carousel";

const sizesFor = (ctx: Context) => {
  if (ctx === "profile")
    return {
      // Untouched: full profile avatar and banner are hero images — skip wsrv
      // entirely so quality and the stored crop's x/y/scale positioning
      // (measured against the un-resized source) stay exact. This also keeps
      // the profile-edit avatar/banner crop dialogs repositioning/zooming
      // against the real source instead of an already-cropped 240×240 thumb.
      avatar: null,
      banner: null,
      cardBg: IMAGE_SIZES.CARD_BG, // 500x800
      cover: IMAGE_SIZES.COVER_LARGE, // 400x400 — muse cards on profile
    };
  if (ctx === "carousel")
    return {
      // NovelistCard uses `novelist.image` twice: as the 180px round avatar and
      // as the full-bleed card background (which is blur(20px)'d, so detail
      // there is irrelevant). 240 covers the avatar at 1x with headroom.
      // The "profile" context leaves this field untouched — i.e. the raw S3
      // original — which is far too heavy for eight simultaneous carousel cards.
      avatar: IMAGE_SIZES.AVATAR_MEDIUM, // 240
      banner: IMAGE_SIZES.BANNER_MEDIUM,
      // Nested muses only ever render as 60px avatars inside the expanded card,
      // so both muse image slots collapse to one small square.
      cardBg: IMAGE_SIZES.COVER_MEDIUM, // 300x300
      cover: IMAGE_SIZES.COVER_MEDIUM, // 300x300
    };
  if (ctx === "hero")
    return {
      avatar: IMAGE_SIZES.AVATAR_SMALL, // 96 — carousel avatars
      banner: IMAGE_SIZES.BANNER_MEDIUM, // bounded to 600x240 (5:2), aspect preserved
      cardBg: IMAGE_SIZES.CARD_BG_MINI, // 250x400 — compact carousel cards
      cover: IMAGE_SIZES.COVER_MEDIUM, // 300x300
    };
  // "feed"
  return {
    avatar: IMAGE_SIZES.AVATAR_SMALL, // 96 — feed source/avatar
    banner: IMAGE_SIZES.BANNER_MEDIUM, // bounded to 600x240 (5:2), aspect preserved
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
  if (muse.wallpaper && sizes.banner) {
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
 * Transform every image field on a Friend overview (image, avatar, banner,
 * and its top muses). Shared by transformNovelist's friends array and by the
 * standalone friends-list endpoint.
 */
export function transformFriend(
  friend: Friend | null | undefined,
  ctx: Context = "feed",
  visited: WeakSet<object> = new WeakSet(),
): void {
  if (!friend || visited.has(friend)) return;
  visited.add(friend);
  const sizes = sizesFor(ctx);

  friend.image = wsrvImage(friend.image, sizes.avatar);
  if (friend.avatar) {
    friend.avatar.src = wsrvImage(friend.avatar.src, sizes.avatar);
    if (friend.avatar.crop?.src) {
      friend.avatar.crop.src = wsrvImage(friend.avatar.crop.src, sizes.avatar);
    }
  }
  if (friend.banner && sizes.banner) {
    friend.banner.src = wsrvImage(friend.banner.src, sizes.banner);
    if (friend.banner.crop?.src) {
      friend.banner.crop.src = wsrvImage(friend.banner.crop.src, sizes.banner);
    }
  }
  if (Array.isArray(friend.muses)) {
    for (const muse of friend.muses) transformMuse(muse, ctx, visited);
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

  if (novelist.avatar) {
    novelist.avatar.src = wsrvImage(novelist.avatar.src, sizes.avatar);
    if (novelist.avatar.crop?.src) {
      novelist.avatar.crop.src = wsrvImage(
        novelist.avatar.crop.src,
        sizes.avatar,
      );
    }
  }
  if (novelist.banner && sizes.banner) {
    novelist.banner.src = wsrvImage(novelist.banner.src, sizes.banner);
    if (novelist.banner.crop?.src) {
      novelist.banner.crop.src = wsrvImage(
        novelist.banner.crop.src,
        sizes.banner,
      );
    }
  }

  if (Array.isArray(novelist.muses)) {
    for (const muse of novelist.muses) transformMuse(muse, ctx, visited);
  }
  if (Array.isArray(novelist.friends)) {
    for (const friend of novelist.friends)
      transformFriend(friend, ctx, visited);
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
