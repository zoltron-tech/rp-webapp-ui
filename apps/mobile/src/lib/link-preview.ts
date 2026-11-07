import { useQuery } from "@tanstack/react-query";
import { urlHost } from "@/lib/safe-link";

/**
 * What a link in a chat message is, and what the page behind it says about
 * itself. Web's `LinkPreview` rules, written against `urlHost`: React Native's
 * `URL` does not implement `hostname`.
 *
 * Hosts are matched whole or as a parent domain. Web's substring test also
 * calls `netflix.com` an X link.
 *
 * ## The lookup
 *
 * The same request web makes. It can be refused, and then there is no title or
 * picture: the card still draws, with the site's name and the link. Nothing
 * about a message depends on it. YouTube is not looked up, because its
 * thumbnail address follows from the video id.
 */

export type LinkProvider =
  | "facebook"
  | "generic"
  | "instagram"
  | "tenor"
  | "x"
  | "youtube";

export interface LinkMeta {
  description?: string | null;
  image?: string | null;
  site_name?: string | null;
  title?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const isHost = (host: string | null, domains: string[]): boolean =>
  Boolean(host) &&
  domains.some((domain) => host === domain || host?.endsWith(`.${domain}`));

export const linkProvider = (url: string): LinkProvider => {
  const host = urlHost(url);
  if (isHost(host, ["youtube.com", "youtu.be"])) {
    return youTubeId(url) ? "youtube" : "generic";
  }
  if (isHost(host, ["instagram.com"])) return "instagram";
  if (isHost(host, ["facebook.com", "fb.com", "fb.watch"])) return "facebook";
  if (isHost(host, ["twitter.com", "x.com"])) return "x";
  if (isHost(host, ["tenor.com"])) return "tenor";
  return "generic";
};

/** The video in a watch, Shorts or youtu.be link. */
export const youTubeId = (url: string): string | null =>
  /youtu\.be\/([\w-]+)/.exec(url)?.[1] ??
  /\/shorts\/([\w-]+)/.exec(url)?.[1] ??
  /[?&]v=([\w-]+)/.exec(url)?.[1] ??
  null;

export const youTubeThumbnail = (id: string): string =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

/** The link with its scheme off, for a card with nothing better to say. */
export const shortUrl = (url: string): string =>
  url.replace(/^https?:\/\/(?:www\.)?/i, "");

/** The site's name for a card: the bare host. */
export const siteOf = (url: string): string =>
  urlHost(url)?.replace(/^www\./, "") ?? "Link";

const PROVIDER_TITLE: Partial<Record<LinkProvider, string>> = {
  facebook: "Facebook Post",
  instagram: "Instagram Post",
  x: "X Post",
  youtube: "YouTube Video",
};

export const linkTitle = (
  url: string,
  provider: LinkProvider,
  meta: LinkMeta | null | undefined,
): string => meta?.title || PROVIDER_TITLE[provider] || siteOf(url);

const lookUp = async (url: string): Promise<LinkMeta | null> => {
  const response = await fetch(
    `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`,
  );
  if (!response.ok) return null;
  return (await response.json()) as LinkMeta;
};

/** Null until it answers, and if it never does. Remembered for a day. */
export const useLinkMeta = (url: string, enabled: boolean) =>
  useQuery({
    enabled,
    gcTime: DAY_MS,
    queryFn: () => lookUp(url).catch(() => null),
    queryKey: ["link-meta", url],
    retry: false,
    staleTime: DAY_MS,
  }).data;
