import { Hono } from "hono";

/**
 * The three Klipy proxy routes — clips, GIFs and stickers.
 *
 * **These must stay server-side**: they hold `KLIPY_API_KEY`, which Klipy puts
 * in the URL path or query string, so proxying is the only way to keep it off
 * the client.
 *
 * Ported from `src/pages/api/klipy-*.ts` — the last three files in the
 * vestigial pages router, which existed only because they were never moved to
 * `app/`. Every URL shape, fallback chain, status code and cache header below
 * is carried over unchanged; only the request/response plumbing differs.
 *
 * See REACT_MIGRATION_STEPS.md C4.
 */

const KLIPY_V1_BASE = "https://api.klipy.com/api/v1";
const KLIPY_V2_BASE = "https://api.klipy.com/v2";
const UA = { "User-Agent": "rp-webapp-ui/1.0" };
const CACHE = "public, max-age=60, stale-while-revalidate=300";

type KlipyMediaItem = {
  url: string;
  width?: number;
  height?: number;
  dims?: number[];
  size?: number;
};

type KlipyDirectFileFormats = {
  mp4?: string;
  gif?: string;
  webp?: string;
  webm?: string;
};

type KlipyFileSize = {
  gif?: KlipyMediaItem;
  webp?: KlipyMediaItem;
  webm?: KlipyMediaItem;
  png?: KlipyMediaItem;
};

export type ClipItem = {
  id: string;
  title: string;
  clipUrl: string;
  previewUrl: string;
};

export type GifItem = {
  id: string;
  title: string;
  gifUrl: string;
  previewUrl: string;
};

export type StickerItem = {
  id: string;
  title: string;
  stickerUrl: string;
  previewUrl: string;
};

type ClipResponse = { hasNext: boolean; items: ClipItem[] };

const pickFirstUrl = (
  formats: Record<string, KlipyMediaItem | undefined> | undefined,
  keys: string[],
) => {
  for (const key of keys) {
    const url = formats?.[key]?.url;
    if (url) return url;
  }
  return "";
};

export const klipy = new Hono();

// ── Clips ──────────────────────────────────────────────────────────────────
// Two upstream APIs, tried in order: v1 first, v2 as a fallback, and an empty
// result if neither answers. That chain is deliberate and is preserved as-is.
klipy.get("/klipy-clips", async (c) => {
  const apiKey = process.env.KLIPY_API_KEY;
  if (!apiKey) {
    return c.json({ error: "KLIPY_API_KEY is not configured" }, 500);
  }

  const q = c.req.query("q");
  const limit = c.req.query("limit") ?? "30";
  const page = c.req.query("page") ?? "1";
  const pos = c.req.query("pos");

  const tryV1 = async (): Promise<ClipResponse | null> => {
    const baseWithKey = `${KLIPY_V1_BASE}/${encodeURIComponent(apiKey)}`;
    const klipyUrl = q?.trim()
      ? `${baseWithKey}/clips/search?q=${encodeURIComponent(q.trim())}&per_page=${limit}&page=${page}`
      : `${baseWithKey}/clips/trending?per_page=${limit}&page=${page}`;

    const upstream = await fetch(klipyUrl, { headers: UA });
    if (!upstream.ok) return null;

    const data = (await upstream.json()) as {
      result?: boolean;
      data?: {
        data?: Array<{
          id?: number | string;
          url?: string;
          title?: string;
          slug?: string;
          file?: KlipyDirectFileFormats;
        }>;
        has_next?: boolean;
      };
    };

    const items: ClipItem[] = (data.data?.data ?? [])
      .map((r) => ({
        clipUrl: r.file?.mp4 || r.file?.webm || r.file?.gif || "",
        id: String(r.id ?? r.slug ?? r.url ?? crypto.randomUUID()),
        previewUrl: r.file?.webp || r.file?.gif || r.file?.mp4 || "",
        title: r.title || r.slug || "Clip",
      }))
      .filter((item) => item.clipUrl !== "");

    return {
      hasNext: data.data?.has_next ?? items.length >= Number(limit),
      items,
    };
  };

  const tryV2 = async (): Promise<ClipResponse | null> => {
    let klipyUrl = q?.trim()
      ? `${KLIPY_V2_BASE}/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q.trim())}&limit=${limit}`
      : `${KLIPY_V2_BASE}/featured?key=${encodeURIComponent(apiKey)}&limit=${limit}`;

    if (pos) klipyUrl += `&pos=${encodeURIComponent(pos)}`;

    const upstream = await fetch(klipyUrl, { headers: UA });
    if (!upstream.ok) return null;

    const data = (await upstream.json()) as {
      next?: string | null;
      results?: Array<{
        id: string;
        title: string;
        content_description?: string;
        media_formats?: Record<string, KlipyMediaItem | undefined>;
      }>;
    };

    const items: ClipItem[] = (data.results ?? [])
      .map((r) => ({
        clipUrl: pickFirstUrl(r.media_formats, [
          "mp4",
          "mediummp4",
          "tinymp4",
          "nanomp4",
          "webm",
          "tinywebm",
        ]),
        id: r.id,
        previewUrl: pickFirstUrl(r.media_formats, [
          "tinymp4",
          "tinywebm",
          "mediummp4",
          "mp4",
          "tinygif",
          "gif",
        ]),
        title: r.content_description || r.title || "Clip",
      }))
      .filter((item) => item.clipUrl !== "");

    return {
      hasNext: Boolean(data.next) || items.length >= Number(limit),
      items,
    };
  };

  try {
    const response = (await tryV1()) ??
      (await tryV2()) ?? { hasNext: false, items: [] };

    c.header("Cache-Control", CACHE);
    return c.json(response);
  } catch (error) {
    console.error("Error fetching clips from Klipy:", error);
    return c.json({ error: "Failed to reach Klipy API" }, 502);
  }
});

// ── GIFs ───────────────────────────────────────────────────────────────────
// v2 only, and note the different default limit (20, not 30) and the cursor
// parameter `pos` rather than `page`.
klipy.get("/klipy-gifs", async (c) => {
  const apiKey = process.env.KLIPY_API_KEY;
  if (!apiKey) {
    return c.json({ error: "KLIPY_API_KEY is not configured" }, 500);
  }

  const q = c.req.query("q");
  const limit = c.req.query("limit") ?? "20";
  const pos = c.req.query("pos");

  let klipyUrl = q?.trim()
    ? `${KLIPY_V2_BASE}/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q.trim())}&limit=${limit}`
    : `${KLIPY_V2_BASE}/featured?key=${encodeURIComponent(apiKey)}&limit=${limit}`;

  if (pos) klipyUrl += `&pos=${encodeURIComponent(pos)}`;

  try {
    const upstream = await fetch(klipyUrl, { headers: UA });
    if (!upstream.ok) {
      return c.json({ error: "Upstream Klipy API error" }, 502);
    }

    const data = (await upstream.json()) as {
      results: Array<{
        id: string;
        title: string;
        content_description?: string;
        media_formats: {
          gif?: KlipyMediaItem;
          mediumgif?: KlipyMediaItem;
          tinygif?: KlipyMediaItem;
          nanogif?: KlipyMediaItem;
        };
      }>;
      next?: string;
    };

    const items: GifItem[] = (data.results ?? [])
      .map((r) => ({
        gifUrl: r.media_formats.gif?.url || r.media_formats.mediumgif?.url || "",
        id: r.id,
        previewUrl:
          r.media_formats.tinygif?.url ||
          r.media_formats.nanogif?.url ||
          r.media_formats.gif?.url ||
          "",
        title: r.content_description || r.title || "GIF",
      }))
      .filter((item) => item.gifUrl !== "");

    c.header("Cache-Control", CACHE);
    return c.json({ items, next: data.next ?? null });
  } catch {
    return c.json({ error: "Failed to reach Klipy API" }, 502);
  }
});

// ── Stickers ───────────────────────────────────────────────────────────────
// v1 only, and the one route whose response key is `hasNext` from the upstream
// pagination rather than a computed guess.
klipy.get("/klipy-stickers", async (c) => {
  const apiKey = process.env.KLIPY_API_KEY;
  if (!apiKey) {
    return c.json({ error: "KLIPY_API_KEY is not configured" }, 500);
  }

  const q = c.req.query("q");
  const perPage = c.req.query("limit") ?? "30";
  const page = c.req.query("page") ?? "1";

  const baseWithKey = `${KLIPY_V1_BASE}/${encodeURIComponent(apiKey)}`;
  const klipyUrl = q?.trim()
    ? `${baseWithKey}/stickers/search?q=${encodeURIComponent(q.trim())}&per_page=${perPage}&page=${page}`
    : `${baseWithKey}/stickers/trending?per_page=${perPage}&page=${page}`;

  try {
    const upstream = await fetch(klipyUrl, { headers: UA });
    if (!upstream.ok) {
      return c.json({ error: "Upstream Klipy API error" }, 502);
    }

    const data = (await upstream.json()) as {
      result: boolean;
      data: {
        data: Array<{
          id: number;
          slug: string;
          title: string;
          file: {
            hd?: KlipyFileSize;
            md?: KlipyFileSize;
            sm?: KlipyFileSize;
            xs?: KlipyFileSize;
          };
          type: string;
        }>;
        current_page: number;
        per_page: number;
        has_next: boolean;
      };
    };

    const items: StickerItem[] = (data.data?.data ?? [])
      .map((r) => ({
        id: String(r.id),
        previewUrl:
          r.file.sm?.webp?.url ||
          r.file.sm?.gif?.url ||
          r.file.xs?.webp?.url ||
          r.file.xs?.gif?.url ||
          r.file.hd?.webp?.url ||
          "",
        stickerUrl:
          r.file.hd?.webp?.url ||
          r.file.hd?.gif?.url ||
          r.file.md?.webp?.url ||
          r.file.md?.gif?.url ||
          "",
        title: r.title || "Sticker",
      }))
      .filter((item) => item.stickerUrl !== "");

    c.header("Cache-Control", CACHE);
    return c.json({ hasNext: data.data?.has_next ?? false, items });
  } catch (error) {
    console.error("Error fetching stickers from Klipy:", error);
    return c.json({ error: "Failed to reach Klipy API" }, 502);
  }
});
