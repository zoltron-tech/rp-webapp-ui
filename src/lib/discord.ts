import type { Prompt, PromptSource } from "@/types";

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
      const rawType = openAttrs.match(/data-type="([^"]+)"/i)?.[1]?.toUpperCase();
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
  const normalized = createdOn
    .replace(" ", "T")
    .replace(/(\.\d{3})\d*/, "$1");
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

/** Radix dark step-9 hex for each ACCENT_MAP palette index (0–7). */
const NOVELIST_PALETTE_HEX: Record<number, string> = {
  0: "#29a383", // jade
  1: "#00a2c7", // cyan
  2: "#5b5bd6", // iris
  3: "#e93d82", // crimson
  4: "#ffc53d", // amber
  5: "#e5484d", // red
  6: "#bdee63", // lime
  7: "#bf7db1", // lotus
};

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
function resolvePromptColor(source: Pick<PromptSource, "sourceType" | "useAccent" | "accent">): number {
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
      .map(({ name, id, type }) => `✦ [${name}](${profileUrl(baseUrl, type, id)})`)
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
    title: "✦ Open for writers  →",
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
  const rawDesc = (muse.note || "")
    .replace(/<[^>]+>/g, "")
    .trim();
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
    const traitLines = visible
      .map(([k, v]) => `**${k}**\n*${v}*`)
      .join("\n");
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
    title: `✦ ${fullName}  ·  Lv. ${muse.level}`,
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
