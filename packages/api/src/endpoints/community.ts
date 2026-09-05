import type { ApiClient } from "../client";

/**
 * Sharing into the community Discord, and media search for the chat pickers.
 *
 * Both used to be Next.js route handlers and then Vercel functions, for one
 * reason each: the Discord bot token and the Klipy API key cannot ship to a
 * browser. They are portfolio-service endpoints now, so there is no proxy in
 * front of the app any more and a native client gets them for free.
 *
 * The embeds themselves are built server-side. The app sends the data; what a
 * share actually looks like in Discord is decided by whoever holds the token.
 */

const DISCORD = "/rp/portfolio/discord";
const KLIPY = "/rp/portfolio/klipy";

/** A posted share, with a link straight to the message. */
export type DiscordShareResult = {
  success: boolean;
  messageUrl: string;
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

/**
 * Posts a share. `path` picks the kind — the channel it lands in is decided by
 * the service, never by the caller.
 *
 * Requires a session: these endpoints are on the public API, and an open one
 * would let anyone post an arbitrary embed to the community server as the bot.
 */
const share = <T>(
  api: ApiClient,
  path: string,
  body: T,
  label: string,
): Promise<DiscordShareResult | { message: string }> =>
  api.request<DiscordShareResult>(`${DISCORD}/${path}`, {
    body,
    catchErrors: true,
    label,
    method: "POST",
    requireAuth: true,
  });

export const sharePromptToDiscord = <T>(api: ApiClient, payload: T) =>
  share(api, "share", payload, "sharePromptToDiscord");

export const shareMuseToDiscord = <T>(api: ApiClient, payload: T) =>
  share(api, "share-muse", payload, "shareMuseToDiscord");

export const shareStoryToDiscord = <T>(api: ApiClient, payload: T) =>
  share(api, "share-story", payload, "shareStoryToDiscord");

export const shareChapterToDiscord = <T>(api: ApiClient, payload: T) =>
  share(api, "share-chapter", payload, "shareChapterToDiscord");

export const shareProfileToDiscord = <T>(api: ApiClient, payload: T) =>
  share(api, "share-profile", payload, "shareProfileToDiscord");

// ── Klipy ───────────────────────────────────────────────────────────────────
//
// Public: the pickers open before a message is sent and the results are the
// same for everyone. All three degrade to an empty list rather than throwing —
// a picker with nothing in it beats a dialog that will not open.

const media = <T>(
  api: ApiClient,
  path: string,
  params: URLSearchParams,
  label: string,
  empty: T,
): Promise<T> =>
  api
    .request<T>(`${KLIPY}/${path}?${params.toString()}`, {
      anonymous: true,
      catchErrors: true,
      contentType: false,
      label,
    })
    .then((result) =>
      result && !("message" in (result as object)) ? (result as T) : empty,
    );

const pageParams = (query: string | undefined, limit: number, page: number) => {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  if (query?.trim()) params.set("q", query.trim());
  return params;
};

export const searchClips = (
  api: ApiClient,
  query: string | undefined,
  limit = 30,
  page = 1,
) =>
  media<{ items: ClipItem[]; hasNext: boolean }>(
    api,
    "clips",
    pageParams(query, limit, page),
    "searchClips",
    { hasNext: false, items: [] },
  );

export const searchStickers = (
  api: ApiClient,
  query: string | undefined,
  limit = 30,
  page = 1,
) =>
  media<{ items: StickerItem[]; hasNext: boolean }>(
    api,
    "stickers",
    pageParams(query, limit, page),
    "searchStickers",
    { hasNext: false, items: [] },
  );

/** GIFs paginate by opaque cursor rather than page number — Klipy's v2 API. */
export const searchGifs = (
  api: ApiClient,
  query: string | undefined,
  limit = 20,
  pos?: string,
) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query?.trim()) params.set("q", query.trim());
  if (pos) params.set("pos", pos);
  return media<{ items: GifItem[]; next: string | null }>(
    api,
    "gifs",
    params,
    "searchGifs",
    { items: [], next: null },
  );
};
