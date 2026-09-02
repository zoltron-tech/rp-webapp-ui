import { type Context, Hono } from "hono";

/**
 * Open Graph injection for shared storyboard links — the one real loss in the
 * migration, bought back.
 *
 * Every other route is served straight off the CDN as the static SPA shell. For
 * these two, `vercel.json` rewrites to this function, which fetches the story
 * and rewrites the OG/Twitter block before responding. Crawlers do not run JS,
 * so without this a shared story link unfurls with the generic site card — and
 * shared links are how stories travel.
 *
 * **Failure is always soft.** A missing, private, or errored story yields the
 * site-wide defaults already in index.html, which is exactly what
 * `generateMetadata` did by returning `{}`. A crawler carries no JWT, so the
 * backend hides private stories and nothing leaks.
 *
 * See REACT_MIGRATION_STEPS.md C8.
 */

/**
 * One deadline for the whole injection, not one per fetch.
 *
 * The chapter route makes two sequential backend calls, so per-fetch timeouts
 * would let a slow backend hold the response for twice as long. Real users
 * hitting a shared link cold wait on this, not just crawlers.
 */
const BUDGET_MS = 2500;

/**
 * CDN caching does the work a per-slug in-memory cache would, and does it
 * better here: functions are per-request, so there is no reliable process
 * memory to cache in, while shared links arrive in bursts on the same slug —
 * exactly what a shared edge cache is for.
 */
const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=3600";

type StoryBoard = {
  name?: string;
  description?: string;
  image?: string | null;
  avatar?: { src?: string } | null;
};

type StoryBoardEvent = StoryBoard & { storyBoardId?: string };

type Card = { title: string; description: string; image: string | null };

/** Mirrors `@/utils/rich-text`'s toPlainText — descriptions are stored as HTML. */
const toPlainText = (html: string | null | undefined): string => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(div|p|h[1-6]|section|article|blockquote|li)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getJson = async <T>(url: string, signal: AbortSignal): Promise<T | null> => {
  try {
    const response = await fetch(url, { cache: "no-store", signal });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

/**
 * Replaces the value of a meta tag already present in index.html.
 *
 * Rewriting rather than appending matters: a duplicated `og:title` is resolved
 * differently by different unfurlers, so the card would vary by platform.
 */
const setMeta = (html: string, attr: "property" | "name", key: string, value: string) => {
  const pattern = new RegExp(
    `(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`,
    "i",
  );
  return pattern.test(html)
    ? html.replace(pattern, `$1${escapeHtml(value)}$2`)
    : html.replace(
        "</head>",
        `  <meta ${attr}="${key}" content="${escapeHtml(value)}" />\n</head>`,
      );
};

const inject = (html: string, card: Card) => {
  let out = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeHtml(card.title)}</title>`,
  );
  out = setMeta(out, "name", "description", card.description);
  out = setMeta(out, "property", "og:title", card.title);
  out = setMeta(out, "property", "og:description", card.description);
  out = setMeta(out, "property", "og:type", "article");
  out = setMeta(out, "name", "twitter:title", card.title);
  out = setMeta(out, "name", "twitter:description", card.description);
  if (card.image) {
    out = setMeta(out, "property", "og:image", card.image);
    out = setMeta(out, "name", "twitter:image", card.image);
  }
  return out;
};

/**
 * The SPA shell, fetched from the deployment's own CDN rather than bundled.
 *
 * `index.html` is not part of the function's file bundle, and adding it via
 * `includeFiles` would pin the function to a build artefact it would then have
 * to locate on disk. One CDN-cached request is simpler and always current.
 */
const getShell = async (origin: string, signal: AbortSignal) => {
  const response = await fetch(`${origin}/index.html`, { signal });
  if (!response.ok) throw new Error(`shell fetch failed: ${response.status}`);
  return response.text();
};

const cover = (item: StoryBoard | null) =>
  item?.image ?? item?.avatar?.src ?? null;

export const og = new Hono();

const serve = async (
  c: Context,
  buildCard: (signal: AbortSignal, serviceUrl: string) => Promise<Card | null>,
) => {
  const origin = new URL(c.req.url).origin;
  const serviceUrl = process.env.RP_SERVICE_URL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BUDGET_MS);

  try {
    const shell = await getShell(origin, controller.signal);
    const card = serviceUrl
      ? await buildCard(controller.signal, serviceUrl)
      : null;

    c.header("Cache-Control", CACHE_CONTROL);
    c.header("Content-Type", "text/html; charset=utf-8");
    return c.body(card ? inject(shell, card) : shell);
  } catch (error) {
    // The shell itself could not be fetched or the budget expired. Redirecting
    // would break the URL; letting Vercel serve the static shell is the right
    // fallback, and the visitor still gets the app.
    console.error("og: falling back to the plain shell", error);
    return c.redirect("/index.html", 302);
  } finally {
    clearTimeout(timer);
  }
};

// ── /rp/story/:slug ────────────────────────────────────────────────────────
og.get("/rp/story/:slug", (c) =>
  serve(c, async (signal, serviceUrl) => {
    const slug = c.req.param("slug");
    const story = await getJson<StoryBoard>(
      `${serviceUrl}/rp/portfolio/story/${slug}`,
      signal,
    );
    if (!story?.name) return null;

    return {
      description:
        toPlainText(story.description).slice(0, 200) ||
        `Read "${story.name}" — a story on Novelist World.`,
      image: cover(story),
      title: story.name,
    };
  }),
);

// ── /rp/story/event/:slug ──────────────────────────────────────────────────
//
// Two sequential fetches: the chapter, then its parent story for the name
// suffix and the cover fallback. The parent is best-effort — the chapter card
// still works without it — which is why its absence does not abandon the card.
og.get("/rp/story/event/:slug", (c) =>
  serve(c, async (signal, serviceUrl) => {
    const slug = c.req.param("slug");
    const event = await getJson<StoryBoardEvent>(
      `${serviceUrl}/rp/portfolio/story/event/${slug}`,
      signal,
    );
    if (!event?.name) return null;

    const parent = event.storyBoardId
      ? await getJson<StoryBoard>(
          `${serviceUrl}/rp/portfolio/story/${event.storyBoardId}`,
          signal,
        )
      : null;

    return {
      description:
        toPlainText(event.description).slice(0, 200) ||
        `Read "${event.name}" on Novelist World.`,
      image: cover(event) ?? cover(parent),
      title: parent?.name ? `${event.name} — ${parent.name}` : event.name,
    };
  }),
);
