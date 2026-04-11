import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const KLIPY_BASE = "https://api.klipy.com/v2";

type KlipyMediaItem = { url: string; dims?: number[]; size?: number };

type KlipyResult = {
  id: string;
  title: string;
  content_description?: string;
  media_formats: {
    gif?: KlipyMediaItem;
    mediumgif?: KlipyMediaItem;
    tinygif?: KlipyMediaItem;
    nanogif?: KlipyMediaItem;
  };
};

type KlipyApiResponse = { results: KlipyResult[]; next?: string };

export type GifItem = {
  id: string;
  title: string;
  gifUrl: string;
  previewUrl: string;
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

  const { q, limit = "20", pos } = req.query;

  let klipyUrl: string;

  if (q && typeof q === "string" && q.trim()) {
    klipyUrl = `${KLIPY_BASE}/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q.trim())}&limit=${limit}`;
  } else {
    klipyUrl = `${KLIPY_BASE}/featured?key=${encodeURIComponent(apiKey)}&limit=${limit}`;
  }

  if (pos && typeof pos === "string") {
    klipyUrl += `&pos=${encodeURIComponent(pos)}`;
  }

  try {
    const upstream = await fetch(klipyUrl, {
      headers: { "User-Agent": "rp-webapp-ui/1.0" },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Upstream Klipy API error" });
    }

    const data = (await upstream.json()) as KlipyApiResponse;

    const items: GifItem[] = (data.results ?? [])
      .map((r) => ({
        id: r.id,
        title: r.content_description || r.title || "GIF",
        gifUrl:
          r.media_formats.gif?.url ||
          r.media_formats.mediumgif?.url ||
          "",
        previewUrl:
          r.media_formats.tinygif?.url ||
          r.media_formats.nanogif?.url ||
          r.media_formats.gif?.url ||
          "",
      }))
      .filter((item) => item.gifUrl !== "");

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    return res.status(200).json({ items, next: data.next ?? null });
  } catch {
    return res.status(502).json({ error: "Failed to reach Klipy API" });
  }
}
