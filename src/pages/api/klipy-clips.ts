import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const KLIPY_V1_BASE = "https://api.klipy.com/api/v1";
const KLIPY_V2_BASE = "https://api.klipy.com/v2";

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

export type ClipItem = {
  id: string;
  title: string;
  clipUrl: string;
  previewUrl: string;
};

type ClipResponse = {
  hasNext: boolean;
  items: ClipItem[];
};

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = serverRuntimeConfig.KLIPY_API_KEY as string | undefined;
  if (!apiKey) {
    return res.status(500).json({ error: "KLIPY_API_KEY is not configured" });
  }

  const { q, limit = "30", page = "1", pos } = req.query;

  const tryV1 = async (): Promise<ClipResponse | null> => {
    const baseWithKey = `${KLIPY_V1_BASE}/${encodeURIComponent(apiKey)}`;
    const klipyUrl =
      q && typeof q === "string" && q.trim()
        ? `${baseWithKey}/clips/search?q=${encodeURIComponent(q.trim())}&per_page=${limit}&page=${page}`
        : `${baseWithKey}/clips/trending?per_page=${limit}&page=${page}`;

    const upstream = await fetch(klipyUrl, {
      headers: { "User-Agent": "rp-webapp-ui/1.0" },
    });

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
    let klipyUrl: string;

    if (q && typeof q === "string" && q.trim()) {
      klipyUrl = `${KLIPY_V2_BASE}/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q.trim())}&limit=${limit}`;
    } else {
      klipyUrl = `${KLIPY_V2_BASE}/featured?key=${encodeURIComponent(apiKey)}&limit=${limit}`;
    }

    if (pos && typeof pos === "string") {
      klipyUrl += `&pos=${encodeURIComponent(pos)}`;
    }

    const upstream = await fetch(klipyUrl, {
      headers: { "User-Agent": "rp-webapp-ui/1.0" },
    });

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
      (await tryV2()) ?? {
        hasNext: false,
        items: [],
      };

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching clips from Klipy:", error);
    return res.status(502).json({ error: "Failed to reach Klipy API" });
  }
}
