import type { Prompt, PromptSource } from "@/types";
import { IMAGE_SIZES, reverseWsrvUrl, wsrvImage } from "@/utils/image";

// ─── Discord API types ────────────────────────────────────────────────────────

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  author: { name: string; icon_url?: string; url?: string };
  title?: string;
  description?: string;
  color: number;
  url?: string;
  timestamp?: string;
  footer: { text: string };
  thumbnail?: { url: string };
  image?: { url: string };
  fields?: DiscordEmbedField[];
}

export interface DiscordMessage {
  content?: string;
  embeds: [DiscordEmbed];
}

/** Shape of the body sent from the browser to /api/discord/share. */
export interface SharePromptPayload {
  promptUrl: string;
  prompt: Pick<Prompt, "source" | "text" | "media" | "createdOn">;
  novelistUsername: string;
}

/** Shape of the successful response returned from /api/discord/share. */
export interface SharePromptResult {
  success: true;
  messageUrl: string;
}

// ─── HTML parsing helpers (regex-based, zero extra deps) ─────────────────────

interface MentionInfo {
  name: string;
  id: string;
  type: "MUSE" | "NOVELIST";
}

function extractFirstInlineImage(html: string): string | null {
  const imgTag = /<img\b([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgTag.exec(html)) !== null) {
    const attrs = m[1];
    if (/class="[^"]*\binline-image\b[^"]*"/.test(attrs)) {
      const src = attrs.match(/src="([^"]+)"/);
      if (src) return src[1];
    }
  }
  return null;
}

/**
 * Strips HTML from a prompt's `text` field and returns:
 * - `plainText`   — Discord-markdown ready string (mentions become **@Name**)
 * - `inlineImage` — first inline image src found in the markup, or null
 * - `mentions`    — every @-tagged character with name, id, and sourceType
 */
function parsePromptHtml(html: string): {
  plainText: string;
  inlineImage: string | null;
  mentions: MentionInfo[];
} {
  const inlineImage = extractFirstInlineImage(html);
  const mentions: MentionInfo[] = [];

  let s = html;

  // 1. Remove entire inline-image-container spans
  s = s.replace(
    /<span\b[^>]*class="[^"]*\binline-image-container\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi,
    "",
  );

  // 2. Convert mention-tag spans → **@Name** and collect { name, id, type }.
  //    Capture the full opening-tag attribute string so we can pull data-id/data-type.
  s = s.replace(
    /<span\b((?:[^>](?!>))*class="[^"]*\bmention-tag\b[^"]*"(?:[^>](?!>))*[^>]?)>[\s\S]*?<span\b[^>]*class="[^"]*\bmention-text\b[^"]*"[^>]*>([^<]*)<\/span>\s*<\/span>/gi,
    (_, openAttrs: string, rawName: string) => {
      const name = rawName.trim();
      const id = openAttrs.match(/data-id="([^"]+)"/)?.[1] ?? "";
      const rawType = openAttrs
        .match(/data-type="([^"]+)"/i)?.[1]
        ?.toUpperCase();
      const type: "MUSE" | "NOVELIST" =
        rawType === "NOVELIST" ? "NOVELIST" : "MUSE";
      mentions.push({ name, id, type });
      return `**@${name}**`;
    },
  );

  // 3. Block-level elements and <br> → newline
  s = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(div|p|h[1-6]|section|article|blockquote)\b[^>]*>/gi, "\n");

  // 4. Strip remaining tags, decode entities
  const plainText = s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return { plainText, inlineImage, mentions };
}

/** "2026-06-14 13:26:12.960236" → ISO 8601 string */
function toIso(createdOn: string): string {
  const normalized = createdOn.replace(" ", "T").replace(/(\.\d{3})\d*/, "$1");
  const withZ = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
  return new Date(withZ).toISOString();
}

const MAX_DESC_LENGTH = 200;

function trimText(text: string): string {
  if (text.length <= MAX_DESC_LENGTH) return text;
  const boundary = text.lastIndexOf(" ", MAX_DESC_LENGTH);
  const cutoff = boundary > 0 ? boundary : MAX_DESC_LENGTH;
  return `${text.slice(0, cutoff).trimEnd()}...`;
}

const readMoreChip = (url: string) => `[\`→ read more\`](${url})`;

/** Builds a profile URL from the app origin + source type + id. */
function profileUrl(
  baseUrl: string,
  type: "MUSE" | "NOVELIST",
  id: string,
): string {
  return type === "MUSE"
    ? `${baseUrl}/rp/muse/${id}`
    : `${baseUrl}/rp/novelist/${id}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

// ─── Muse share types ────────────────────────────────────────────────────────

/** Minimal muse data serialised from the frontend and sent to /api/discord/share-muse. */
export interface ShareMuseData {
  firstName: string;
  lastName: string;
  fandom: { name: string };
  tags: { label: string }[];
  note: string;
  image: string | null;
  /** Pre-resolved from NWImage.src — avatar portrait used as embed thumbnail. */
  avatarSrc: string | null;
  /** Pre-resolved from NWImage.src — card background used as full-width embed image. */
  cardBackgroundSrc: string | null;
  nicknames: string[] | null;
  extraAttributes: Record<string, string> | null;
  level: number;
  useAccent: boolean;
  accent: string | null;
  pennedBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    image: string;
  };
}

export interface ShareMusePayload {
  museUrl: string;
  muse: ShareMuseData;
  novelistUsername: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Radix dark step-9 hex for each ACCENT_MAP palette index (0–9). */
const NOVELIST_PALETTE_HEX: Record<number, string> = {
  0: "#29a383", // jade
  1: "#00a2c7", // cyan
  2: "#5b5bd6", // iris
  3: "#e93d82", // crimson
  4: "#d4bd2c", // amber
  5: "#e5484d", // red
  6: "#bdee63", // lime
  7: "#bf7db1", // lotus
  8: "#ac0a0a", // dracula (--dracula-red-9)
  9: "#2563eb", // lunar (--lunar-9)
};

const isGifUrl = (url: string) => /\.gif(?:$|[?#])/i.test(url);

/**
 * Prepares an image URL for a Discord embed.
 *
 * Stills go through wsrv: raw S3 keys can lack an extension and be served as
 * application/octet-stream, which <img> tolerates but Discord's embed proxy
 * drops.
 *
 * GIFs are handed over as the raw S3 URL. Discord decides whether to animate
 * from the URL *path* ending in `.gif` — a wsrv URL ends in its query string
 * (`…&n=-1`), so even a correctly re-encoded animated GIF renders as a still.
 */
function embedImageUrl(url: string, kind: "avatar" | "banner"): string {
  // Unwrap first: callers on feed-sized pages hand us an already-proxied URL,
  // which would hide the .gif behind wsrv's `url=` param.
  const source = reverseWsrvUrl(url);
  if (isGifUrl(source)) return source;

  return wsrvImage(
    source,
    kind === "avatar" ? IMAGE_SIZES.AVATAR_LARGE : IMAGE_SIZES.BANNER_LARGE,
  );
}

/** Converts a CSS hex colour string (#rgb or #rrggbb) to a Discord decimal int. */
function hexToDecimal(hex: string): number | null {
  const m = hex.replace(/\s/g, "").match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const full =
    m[1].length === 3
      ? m[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : m[1];
  return parseInt(full, 16);
}

/**
 * Resolves the Discord embed border colour from a prompt's source.
 * - NOVELIST: `accent` is a palette index string → look up NOVELIST_PALETTE_HEX
 * - MUSE:     `accent` is already a hex string → pass through hexToDecimal
 * Falls back to NW teal when useAccent is false or accent is missing.
 */
function resolvePromptColor(
  source: Pick<PromptSource, "sourceType" | "useAccent" | "accent">,
): number {
  const NW_TEAL = 0x29a383;
  if (!source.useAccent || !source.accent) return NW_TEAL;

  if (source.sourceType === "NOVELIST") {
    const hex = NOVELIST_PALETTE_HEX[Number(source.accent)];
    return hex ? (hexToDecimal(hex) ?? NW_TEAL) : NW_TEAL;
  }

  return hexToDecimal(source.accent) ?? NW_TEAL;
}

// ─── Prompt embed ─────────────────────────────────────────────────────────────

/**
 * Builds the Discord message body for a shared prompt.
 *
 * @param prompt     The subset of Prompt fields needed for the embed.
 * @param promptUrl  Absolute URL to the prompt page.
 */
export function buildDiscordEmbed(
  prompt: Pick<Prompt, "source" | "text" | "media" | "createdOn">,
  promptUrl: string,
  novelistUsername: string,
): DiscordMessage {
  const { plainText, inlineImage, mentions } = parsePromptHtml(prompt.text);
  const imageUrl = prompt.media || inlineImage || null;
  const isoTs = toIso(prompt.createdOn);
  const unixTs = Math.floor(new Date(isoTs).getTime() / 1000);
  const baseUrl = new URL(promptUrl).origin;

  // Wrap every line in a Discord blockquote so the text stands out visually
  const trimmed = plainText ? trimText(plainText) : null;
  const description = trimmed
    ? trimmed
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n") + `\n${readMoreChip(promptUrl)}`
    : undefined;

  const fields: DiscordEmbedField[] = [];

  if (mentions.length > 0) {
    // Each mention on its own line as a clickable ✦-bulleted link, no @ prefix
    const featuringValue = mentions
      .map(
        ({ name, id, type }) => `✦ [${name}](${profileUrl(baseUrl, type, id)})`,
      )
      .join("\n");

    fields.push({
      name: "🎭 featuring",
      value: featuringValue,
      inline: true,
    });
  }

  // Discord native relative timestamp — renders as "2 hours ago" in the client
  fields.push({
    name: "🕒 posted",
    value: `<t:${unixTs}:R>`,
    inline: true,
  });

  const authorProfileUrl = profileUrl(
    baseUrl,
    prompt.source.sourceType,
    prompt.source.sourceId,
  );

  const embed: DiscordEmbed = {
    author: {
      name: `${prompt.source.name}`,
      icon_url: prompt.source.image || undefined,
      url: authorProfileUrl, // makes the author name a clickable link in Discord
    },
    description,
    color: resolvePromptColor(prompt.source),
    url: promptUrl,
    fields,
    footer: { text: `novelist.world · shared by @${novelistUsername}` },
  };

  if (imageUrl) {
    embed.image = { url: imageUrl };
  }

  return {
    content:
      "**📖 A new story prompt is looking for writers!** Jump in and add your part.",
    embeds: [embed],
  };
}

// ─── Muse embed ───────────────────────────────────────────────────────────────

/**
 * Builds the Discord message body announcing a shared muse character.
 *
 * @param muse    Lightweight muse data extracted from the Muse object.
 * @param museUrl Absolute URL to the muse's profile page.
 */
export function buildDiscordMuseEmbed(
  muse: ShareMuseData,
  museUrl: string,
  novelistUsername: string,
): DiscordMessage {
  const baseUrl = new URL(museUrl).origin;
  const novelistUrl = `${baseUrl}/rp/novelist/${muse.pennedBy.id}`;
  const fullName = [muse.firstName, muse.lastName].filter(Boolean).join(" ");

  // Resolve embed colour from muse accent or fall back to NW teal
  const accentDecimal =
    muse.useAccent && muse.accent ? hexToDecimal(muse.accent) : null;
  const color = accentDecimal ?? 0x29a383;

  // Plain-text description (note is plain text; strip any accidental tags from story)
  const rawDesc = (muse.note || "").replace(/<[^>]+>/g, "").trim();
  const description = rawDesc
    ? rawDesc
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n")
    : undefined;

  // Trailing \n​ adds exactly one blank line after a field value before the next field
  const pad = (value: string) => `${value}\n​`;

  const fields: DiscordEmbedField[] = [
    {
      name: "🎬  universe",
      value: pad(`\`${muse.fandom.name}\``),
      inline: false,
    },
  ];

  if (muse.nicknames && muse.nicknames.length > 0) {
    fields.push({
      name: "🏷️  also known as",
      value: pad(muse.nicknames.map((n) => `\`${n}\``).join("   ")),
      inline: false,
    });
  }

  if (muse.extraAttributes && Object.keys(muse.extraAttributes).length > 0) {
    const entries = Object.entries(muse.extraAttributes);
    const visible = entries.slice(0, 3);
    const remaining = entries.length - visible.length;
    const traitLines = visible.map(([k, v]) => `**${k}**\n*${v}*`).join("\n");
    const readMore =
      remaining > 0 ? `\n[\`+ ${remaining} more\`](${museUrl})` : "";
    fields.push({
      name: "✨  information",
      value: pad(`${traitLines}${readMore}`),
      inline: false,
    });
  }

  if (muse.tags.length > 0) {
    fields.push({
      name: "🔖  tags",
      value: muse.tags.map((t) => `\`${t.label}\``).join("   "),
      inline: false,
    });
  }

  const thumbnailUrl = muse.avatarSrc ?? muse.image;

  const embed: DiscordEmbed = {
    author: {
      name: `Penned by ${muse.pennedBy.firstName} ${muse.pennedBy.lastName}`,
      icon_url: muse.pennedBy.image || undefined,
      url: novelistUrl,
    },
    title: `✦ ${fullName}`,
    description,
    color,
    url: museUrl,
    fields,
    footer: { text: `novelist.world · shared by @${novelistUsername}` },
  };

  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  if (muse.cardBackgroundSrc) {
    embed.image = { url: muse.cardBackgroundSrc };
  }

  return {
    content: `🌟 **A new character has entered the story!** Come say hello to **${fullName}**.`,
    embeds: [embed],
  };
}

// ─── Story share types ──────────────────────────────────────────────────────

/** Minimal story data serialised from the frontend and sent to /api/discord/share-story. */
export interface ShareStoryData {
  name: string;
  description: string | null;
  image: string | null;
  /** Pre-resolved from NWImage.src — cover used as the embed thumbnail. */
  coverSrc: string | null;
  fandomName: string | null;
  genres: string[];
  isPublic: boolean;
  createdBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string | null;
    image: string;
  } | null;
}

export interface ShareStoryPayload {
  storyUrl: string;
  story: ShareStoryData;
  novelistUsername: string;
}

// ─── Profile share types ────────────────────────────────────────────────────

/** Minimal novelist data serialised from the frontend and sent to /api/discord/share-profile. */
export interface ShareProfileData {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  image: string | null;
  /** Pre-resolved from NWImage.src — avatar portrait used as embed thumbnail. */
  avatarSrc: string | null;
  /** Pre-resolved from NWImage.src — banner used as full-width embed image. */
  bannerSrc: string | null;
  /** Status note text, shown above the about blurb when present. */
  note: string | null;
  /** Rich-text about blurb (HTML). */
  about: string | null;
  /** ACCENT_MAP palette index — resolves the embed border colour. */
  palette: number | null;
  museCount: number;
  friendsCount: number;
  isVerified: boolean;
  createdAt: string | null;
  /** A few muses to spotlight on the embed. */
  muses: { id: string; name: string }[];
}

export interface ShareProfilePayload {
  profileUrl: string;
  profile: ShareProfileData;
  novelistUsername: string;
}

// ─── Chapter share types ────────────────────────────────────────────────────

/** Minimal chapter data serialised from the frontend and sent to /api/discord/share-chapter. */
export interface ShareChapterData {
  name: string;
  description: string;
  image: string | null;
  /** Pre-resolved from NWImage.src — cover used as the embed thumbnail. */
  coverSrc: string | null;
  storyBoardName: string;
  storyBoardId: string;
}

export interface ShareChapterPayload {
  chapterUrl: string;
  chapter: ShareChapterData;
  novelistUsername: string;
}

// ─── Story embed ────────────────────────────────────────────────────────────

/**
 * Builds the Discord message body announcing a shared story.
 *
 * @param story    Lightweight story data extracted from the StoryBoard object.
 * @param storyUrl Absolute URL to the story's page.
 */
export function buildDiscordStoryEmbed(
  story: ShareStoryData,
  storyUrl: string,
  novelistUsername: string,
): DiscordMessage {
  const baseUrl = new URL(storyUrl).origin;
  const authorUrl = story.createdBy
    ? `${baseUrl}/rp/novelist/${story.createdBy.id}`
    : undefined;

  const rawDesc = (story.description || "").replace(/<[^>]+>/g, "").trim();
  const description = rawDesc
    ? trimText(rawDesc)
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n")
    : undefined;

  const fields: DiscordEmbedField[] = [];

  fields.push({
    name: "🎬  universe",
    value: `\`${story.fandomName || "Original"}\``,
    inline: true,
  });

  fields.push({
    name: "🔓  access",
    value: story.isPublic ? "\`Public\`" : "\`Members only\`",
    inline: true,
  });

  if (story.genres.length > 0) {
    fields.push({
      name: "🔖  genres",
      value: story.genres.map((g) => `\`${g}\``).join("   "),
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    author: story.createdBy
      ? {
          name: `Penned by ${story.createdBy.firstName} ${story.createdBy.lastName ?? ""}`.trim(),
          icon_url: story.createdBy.image || undefined,
          url: authorUrl,
        }
      : { name: "novelist.world" },
    title: `📖 ${story.name}`,
    description,
    color: 0x29a383,
    url: storyUrl,
    fields,
    footer: { text: `novelist.world · shared by @${novelistUsername}` },
  };

  const thumbnailUrl = story.coverSrc ?? story.image;
  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  return {
    content: `📚 **A new story is ready to be read!** Come explore **${story.name}**.`,
    embeds: [embed],
  };
}

// ─── Chapter embed ──────────────────────────────────────────────────────────

/**
 * Builds the Discord message body announcing a shared story chapter.
 *
 * @param chapter    Lightweight chapter data extracted from the StoryBoardEvent object.
 * @param chapterUrl Absolute URL to the chapter's page.
 */
export function buildDiscordChapterEmbed(
  chapter: ShareChapterData,
  chapterUrl: string,
  novelistUsername: string,
): DiscordMessage {
  const baseUrl = new URL(chapterUrl).origin;
  const storyUrl = `${baseUrl}/rp/story/${chapter.storyBoardId}`;

  const rawDesc = (chapter.description || "").replace(/<[^>]+>/g, "").trim();
  const description = rawDesc
    ? trimText(rawDesc)
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n")
    : undefined;

  const embed: DiscordEmbed = {
    author: {
      name: chapter.storyBoardName,
      url: storyUrl,
    },
    title: `📜 ${chapter.name}`,
    description,
    color: 0x29a383,
    url: chapterUrl,
    footer: { text: `novelist.world · shared by @${novelistUsername}` },
  };

  const thumbnailUrl = chapter.coverSrc ?? chapter.image;
  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  return {
    content: `📖 **A new chapter has been posted in ${chapter.storyBoardName}!** Catch up on **${chapter.name}**.`,
    embeds: [embed],
  };
}

// ─── Profile embed ──────────────────────────────────────────────────────────

/** Best-effort unix seconds from a backend timestamp; null when unparseable. */
function toUnixSeconds(raw: string): number | null {
  try {
    const ts = new Date(toIso(raw)).getTime();
    return Number.isNaN(ts) ? null : Math.floor(ts / 1000);
  } catch {
    return null;
  }
}

/**
 * Builds the Discord message body announcing a shared novelist profile.
 *
 * @param profile    Lightweight novelist data extracted from the Novelist object.
 * @param profileUrl Absolute URL to the novelist's profile page.
 */
export function buildDiscordProfileEmbed(
  profile: ShareProfileData,
  profileUrl: string,
  novelistUsername: string,
): DiscordMessage {
  const baseUrl = new URL(profileUrl).origin;
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  // Palette index → Radix step-9 hex, falling back to NW teal
  const paletteHex =
    typeof profile.palette === "number"
      ? NOVELIST_PALETTE_HEX[profile.palette]
      : undefined;
  const color = (paletteHex ? hexToDecimal(paletteHex) : null) ?? 0x29a383;

  // Note takes priority over the about blurb — it's the novelist's current status
  const rawDesc = (profile.note || profile.about || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
  const description = rawDesc
    ? trimText(rawDesc)
        .split("\n")
        .map((l: string) => `> ${l}`)
        .filter(Boolean)
        .join("\n")
    : undefined;

  const fields: DiscordEmbedField[] = [
    {
      name: "🎭  muses",
      value: `\`${profile.museCount}\``,
      inline: true,
    },
    {
      name: "🤝  friends",
      value: `\`${profile.friendsCount}\``,
      inline: true,
    },
  ];

  if (profile.muses.length > 0) {
    fields.push({
      name: "✨  featured muses",
      value: profile.muses
        .map(({ id, name }) => `✦ [${name}](${baseUrl}/rp/muse/${id})`)
        .join("\n"),
      inline: false,
    });
  }

  const joinedUnix = profile.createdAt
    ? toUnixSeconds(profile.createdAt)
    : null;
  if (joinedUnix !== null) {
    fields.push({
      name: "📅  writing since",
      value: `<t:${joinedUnix}:D>`,
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    author: {
      name: `@${profile.username}`,
      icon_url: profile.image || profile.avatarSrc || undefined,
      url: profileUrl,
    },
    title: `${profile.isVerified ? "✅" : "✦"} ${fullName || profile.username}`,
    description,
    color,
    url: profileUrl,
    fields,
    footer: { text: `novelist.world · shared by @${novelistUsername}` },
  };

  // Empty strings come back from the API for missing images — `||` so they fall through.
  const avatarUrl = profile.avatarSrc || profile.image;
  const bannerUrl = profile.bannerSrc;

  // Discord only animates GIFs in `image`, never in `thumbnail`. When the
  // avatar is animated and there's no banner competing for the slot, show it
  // full-width instead of as a frozen first frame in the corner.
  const promoteAvatar = !bannerUrl && !!avatarUrl && isGifUrl(avatarUrl);

  if (avatarUrl && !promoteAvatar) {
    embed.thumbnail = { url: embedImageUrl(avatarUrl, "avatar") };
  }

  if (bannerUrl) {
    embed.image = { url: embedImageUrl(bannerUrl, "banner") };
  } else if (promoteAvatar) {
    embed.image = { url: embedImageUrl(avatarUrl, "avatar") };
  }

  return {
    content: `👋 **A novelist worth writing with!** Come meet **${fullName || profile.username}**.`,
    embeds: [embed],
  };
}
