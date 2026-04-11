import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const KLIPY_BASE = "https://api.klipy.com/api/v1";

type KlipyMediaItem = {
  url: string;
  width?: number;
  height?: number;
  size?: number;
};

type KlipyFileSize = {
  gif?: KlipyMediaItem;
  webp?: KlipyMediaItem;
  webm?: KlipyMediaItem;
  png?: KlipyMediaItem;
};

type KlipyResult = {
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
};

type KlipyApiResponse = {
  result: boolean;
  data: {
    data: KlipyResult[];
    current_page: number;
    per_page: number;
    has_next: boolean;
  };
};

export type StickerItem = {
  id: string;
  title: string;
  stickerUrl: string;
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

  const { q, limit = "30", page = "1" } = req.query;

  const perPage = limit;
  const baseWithKey = `${KLIPY_BASE}/${encodeURIComponent(apiKey)}`;
  let klipyUrl: string;

  if (q && typeof q === "string" && q.trim()) {
    klipyUrl = `${baseWithKey}/stickers/search?q=${encodeURIComponent(q.trim())}&per_page=${perPage}&page=${page}`;
  } else {
    klipyUrl = `${baseWithKey}/stickers/trending?per_page=${perPage}&page=${page}`;
  }

  console.log(`Fetching stickers from Klipy: ${klipyUrl}`);

  try {
    const upstream = await fetch(klipyUrl, {
      headers: { "User-Agent": "rp-webapp-ui/1.0" },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Upstream Klipy API error" });
    }

    const data = (await upstream.json()) as KlipyApiResponse;

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

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    console.log(
      `Fetched ${items.length} stickers from Klipy (query: "${q ?? ""}")`,
    );
    return res
      .status(200)
      .json({ hasNext: data.data?.has_next ?? false, items });
  } catch (error) {
    console.error("Error fetching stickers from Klipy:", error);
    return res.status(502).json({ error: "Failed to reach Klipy API" });
  }
}
