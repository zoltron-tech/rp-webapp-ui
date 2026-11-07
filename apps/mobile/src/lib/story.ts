import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type {
  CharacterRefType,
  Fandom,
  StoryBoard,
  StoryCharacter,
} from "@nw/types";
import { env } from "@/lib/env";

/**
 * Rich text as one line of plain prose, for previews. Dialog lines included;
 * pictures are not — their alt text ("Pasted image") is not prose.
 */
export const plainText = (html: string | null | undefined): string =>
  html
    ? richTextToPlainText(
        parseRichText(html).filter((node) => node.type !== "image"),
      )
        .replace(/\s+/g, " ")
        .trim()
    : "";

/**
 * What web's story pages know, without the DOM.
 *
 * Each piece mirrors a web source and says which, so a change there has an
 * obvious counterpart here: asterisms (`components/asterism-styles`), in-story
 * dates (`date-time-picker/date-format`), dialog embeds
 * (`rich-text-editor-input/dialog-embed`), codex icon keys
 * (`story-codex/icons`) and the timeline's chapter accents
 * (`story-timeline/chapter-colors`).
 */

// ── Asterisms ───────────────────────────────────────────────────────────────

export type AsterismLine =
  | "gradient"
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "beaded";

const ASTERISMS: Record<string, { glyph: string; line: AsterismLine }> = {
  classic: { glyph: "⁂", line: "gradient" },
  diamond: { glyph: "❖", line: "double" },
  dots: { glyph: "●", line: "beaded" },
  fleuron: { glyph: "❦", line: "solid" },
  flourish: { glyph: "❧", line: "dashed" },
  none: { glyph: "", line: "solid" },
  stars: { glyph: "✦", line: "dotted" },
};

/** Unknown keys fall back to the classic divider, as they do on web. */
export const resolveAsterism = (value: string | null | undefined) =>
  ASTERISMS[value ?? ""] ?? ASTERISMS.classic;

// ── In-story dates ──────────────────────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** The wire value: "yyyy-MM-dd HH:mm…", with a "BC" prefix for BC dates. */
const parseStoryTime = (value: string | null | undefined) => {
  const match = value?.match(
    /^(BC)?(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/,
  );
  if (!match) return null;
  const [, bc, y, m, d, hh, mm] = match;
  return {
    bc: Boolean(bc),
    day: Number(d),
    hour: Number(hh),
    minute: Number(mm),
    month: Number(m),
    year: Number(y),
  };
};

/** "12 Mar 1892", or "12 Mar 500 BC". Never guessed at. */
export const storyDate = (value: string | null | undefined): string | null => {
  const fields = parseStoryTime(value);
  if (!fields) return null;
  const month = MONTHS[fields.month - 1] ?? pad(fields.month);
  return `${fields.day} ${month} ${fields.year}${fields.bc ? " BC" : ""}`;
};

/** "14:30". Midnight is the picker's default, so it reads as no time at all. */
export const storyClock = (value: string | null | undefined): string | null => {
  const fields = parseStoryTime(value);
  if (!fields || (fields.hour === 0 && fields.minute === 0)) return null;
  return `${pad(fields.hour)}:${pad(fields.minute)}`;
};

/** Web's `ASTERISM_STYLES`: what the chapter editor offers, in display order. */
export const ASTERISM_OPTIONS: {
  description: string;
  label: string;
  value: string;
}[] = [
  {
    description: "Three raised dots — the traditional scene break",
    label: "Classic asterism",
    value: "classic",
  },
  {
    description: "A single decorative leaf on a solid rule",
    label: "Fleuron",
    value: "fleuron",
  },
  {
    description: "A mirrored, flowing leaf on a dashed rule",
    label: "Flourish",
    value: "flourish",
  },
  {
    description: "A bold diamond on a double rule",
    label: "Diamond",
    value: "diamond",
  },
  {
    description: "A four-pointed star on a dotted rule",
    label: "Stars",
    value: "stars",
  },
  {
    description: "A round dot on a beaded rule",
    label: "Dots",
    value: "dots",
  },
  { description: "No divider at all", label: "None", value: "none" },
];

export const DEFAULT_ASTERISM = "classic";

export const asterismLabel = (value: string | null | undefined) =>
  (
    ASTERISM_OPTIONS.find((option) => option.value === value) ??
    ASTERISM_OPTIONS[0]
  ).label;

// ── Writing an in-story date ────────────────────────────────────────────────

export interface StoryTimeFields {
  bc: boolean;
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
}

export const readStoryTime = (
  value: string | null | undefined,
): StoryTimeFields | null => parseStoryTime(value);

/** Web's `toWireValue`: "yyyy-MM-dd HH:mm:00.000000", "BC"-prefixed for BC. */
export const writeStoryTime = (fields: StoryTimeFields): string =>
  `${fields.bc ? "BC" : ""}${String(Math.max(0, fields.year)).padStart(4, "0")}-${pad(fields.month)}-${pad(fields.day)} ${pad(fields.hour)}:${pad(fields.minute)}:00.000000`;

/**
 * A chapter description as the editor's HTML.
 *
 * Descriptions predate the rich text editor and may still be stored as plain
 * text; web's `toInitialDescriptionHtml` escapes those and turns their lines
 * into blocks so they are not misread as markup.
 */
export const descriptionHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n")
    .map((line) => `<div>${line || "<br>"}</div>`)
    .join("");
};

// ── People ──────────────────────────────────────────────────────────────────

/**
 * Web's `isMember`: the story's creator, or anyone on its member list. What
 * lets a novelist write in a story — chapters, passages, the lot.
 */
export const isStoryMember = (
  story: StoryBoard | null | undefined,
  username: string | null | undefined,
): boolean =>
  Boolean(story) &&
  Boolean(username) &&
  (story?.createdBy?.username === username ||
    (story?.members ?? []).some((member) => member.username === username));

/** Web's `museAvatarUrl` / `storyCharacterAvatarUrl`. */
export const speakerAvatarUrl = (
  id: string | null | undefined,
  source: CharacterRefType | undefined,
): string | null => {
  if (!id) return null;
  return source === "CHARACTER"
    ? `${env.RP_SERVICE_URL}/rp/portfolio/story/character/${id}/avatar`
    : `${env.RP_SERVICE_URL}/rp/portfolio/muse/${id}/avatar`;
};

export const characterName = (character: StoryCharacter) =>
  `${character.firstName} ${character.lastName ?? ""}`.trim();

export type StoryRole = "creator" | "admin" | "member";

/** Author first, then co-authors, without the author repeated. */
export const storyAuthors = (story: StoryBoard | null | undefined) => {
  if (!story) return [];
  const creator = story.createdBy;
  return [
    ...(creator
      ? [
          {
            image: creator.image as string | null,
            role: "creator" as StoryRole,
            username: creator.username,
          },
        ]
      : []),
    ...(story.members ?? [])
      .filter((member) => member.username !== creator?.username)
      .map((member) => ({
        image: member.image as string | null,
        role: (member.isAdmin ? "admin" : "member") as StoryRole,
        username: member.username,
      })),
  ];
};

export const fandomLabel = (fandom: Fandom | null | undefined) => {
  const fandomless = !fandom?.id || fandom.id === "FANDOMLESS";
  return fandomless
    ? "Original"
    : fandom?.name || fandom?.id?.replace(/_/g, " ");
};

// ── Dialog embeds ───────────────────────────────────────────────────────────

export type DialogDesign =
  | "card"
  | "card-colored"
  | "bubble"
  | "bubble-colored"
  | "quote"
  | "quote-plain";

const DESIGNS: DialogDesign[] = [
  "card",
  "card-colored",
  "bubble",
  "bubble-colored",
  "quote",
  "quote-plain",
];

export const resolveDialogDesign = (
  value: string | null | undefined,
): DialogDesign =>
  DESIGNS.includes(value as DialogDesign) ? (value as DialogDesign) : "card";

export interface DialogEmbed {
  /** The speaker, or null for an anonymous line. */
  speakerId: string | null;
  source: CharacterRefType;
  /** The name the composer wrote down; the thread's map is preferred. */
  storedName: string;
  orientation: "left" | "right";
  font: string | null;
  /** The spoken line, as rich-text HTML. */
  html: string;
}

export type ProseSegment =
  | { kind: "html"; html: string }
  | { kind: "dialog"; dialog: DialogEmbed };

/*
 * `<div class="dialog-embed" data-dialog-embed data-muse-id="…">` holding one
 * `<span class="dialog-text">` of inline markup. The line never contains a
 * `<div>`, so the first `</div>` after the opening tag is the embed's own.
 */
const EMBED =
  /<div\b(?=[^>]*(?:data-dialog-embed|class="[^"]*\bdialog-embed\b))([^>]*)>([\s\S]*?)<\/div>/gi;
const ATTRIBUTE = /([\w-]+)\s*=\s*"([^"]*)"/g;

const decode = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const readEmbed = (attributes: string, inner: string): DialogEmbed => {
  const attrs: Record<string, string> = {};
  for (const match of attributes.matchAll(ATTRIBUTE)) {
    attrs[match[1].toLowerCase()] = decode(match[2]);
  }

  const text = inner.match(
    /<span\b[^>]*class="[^"]*\bdialog-text\b[^"]*"[^>]*>([\s\S]*)<\/span>/i,
  );
  let html = text ? text[1] : inner;
  // Legacy lines baked the quote marks in; the designs draw their own.
  if (!html.includes("<")) {
    const legacy = html.match(/^\s*❝\s?([\s\S]*?)\s?❞\s*$/);
    if (legacy) html = legacy[1];
  }

  const characterId = attrs["data-character-id"] || null;
  return {
    font: attrs["data-font"] || null,
    html,
    orientation: attrs["data-orientation"] === "right" ? "right" : "left",
    source: characterId ? "CHARACTER" : "MUSE",
    speakerId: characterId ?? (attrs["data-muse-id"] || null),
    storedName: attrs["data-muse-name"] || "Anonymous",
  };
};

/**
 * A passage cut into prose and dialogs.
 *
 * `@nw/richtext` has no dialog node — an embed would parse as a plain line with
 * its speaker lost — so the embeds are lifted out first and everything between
 * them is handed to the renderer as ordinary rich text.
 */
export const splitDialogs = (
  html: string | null | undefined,
): ProseSegment[] => {
  if (!html) return [];
  const segments: ProseSegment[] = [];
  let cursor = 0;
  for (const match of html.matchAll(EMBED)) {
    const at = match.index ?? 0;
    if (at > cursor)
      segments.push({ html: html.slice(cursor, at), kind: "html" });
    segments.push({ dialog: readEmbed(match[1], match[2]), kind: "dialog" });
    cursor = at + match[0].length;
  }
  if (cursor < html.length) {
    segments.push({ html: html.slice(cursor), kind: "html" });
  }
  return segments;
};

/**
 * The passage with every embed swapped for what `replace` answers for it.
 * `before` is the markup between this embed and the one before it (or the
 * start of the passage).
 */
export const mapDialogs = (
  html: string,
  replace: (dialog: DialogEmbed, before: string) => string,
): string => {
  let cursor = 0;
  return html.replace(
    EMBED,
    (match: string, attributes: string, inner: string, at: number) => {
      const before = html.slice(cursor, at);
      cursor = at + match.length;
      return replace(readEmbed(attributes, inner), before);
    },
  );
};

/** Web's `DIALOG_DESIGNS`: what the composer offers, in display order. */
export const DIALOG_DESIGN_OPTIONS: {
  description: string;
  label: string;
  value: DialogDesign;
}[] = [
  {
    description: "Avatar, accent card and quote",
    label: "Card",
    value: "card",
  },
  {
    description: "Card tinted with the speaker's own accent color",
    label: "Colored cards",
    value: "card-colored",
  },
  {
    description: "Messenger-style speech bubbles",
    label: "Chat bubbles",
    value: "bubble",
  },
  {
    description: "Chat bubbles tinted with the speaker's own accent color",
    label: "Colored chat bubbles",
    value: "bubble-colored",
  },
  {
    description: "Just the quoted line — no card or avatar",
    label: "Minimal quotes",
    value: "quote",
  },
  {
    description: "Minimal quotes without the author attribution",
    label: "Minimal (no author)",
    value: "quote-plain",
  },
];

// ── Codex ───────────────────────────────────────────────────────────────────

/** Web's curated codex icon keys, as MaterialCommunityIcons names. */
const CODEX_ICONS: Record<string, string> = {
  anchor: "anchor",
  book: "book-open-variant",
  castle: "castle",
  crown: "crown-outline",
  droplet: "water-outline",
  feather: "feather",
  flame: "fire",
  gem: "diamond-stone",
  key: "key-variant",
  leaf: "leaf",
  "map-pin": "map-marker-outline",
  moon: "moon-waning-crescent",
  mountain: "image-filter-hdr",
  package: "package-variant",
  scroll: "script-text-outline",
  shield: "shield-outline",
  ship: "sail-boat",
  skull: "skull-outline",
  sparkles: "creation",
  star: "star-outline",
  swords: "sword-cross",
  trees: "pine-tree",
};

/** Web's `CODEX_ICON_KEYS`: what a category or an entry may wear. */
export const CODEX_ICON_KEYS = Object.keys(CODEX_ICONS);

export const codexIcon = (key: string | null | undefined): string =>
  CODEX_ICONS[key ?? ""] ?? CODEX_ICONS.sparkles;

/** Web's `TONE_SPECS`: the three built-in relationship tones. */
export const RELATIONSHIP_TONES = {
  BOND: { dark: "#199e70", label: "Bond", light: "#1baf7a" },
  NEUTRAL: { dark: "#3987e5", label: "Neutral", light: "#2a78d6" },
  STRAIN: { dark: "#d95926", label: "Strain", light: "#eb6834" },
} as const;

// ── Timeline ────────────────────────────────────────────────────────────────

const CHAPTER_COLORS = [
  "#3f6fd8",
  "#c2483d",
  "#2f8f6b",
  "#8a5cd6",
  "#c07a1e",
  "#1e7f96",
  "#b4478c",
  "#5f7a2c",
  "#8d5a3c",
  "#4b5bbf",
  "#a03b5e",
  "#337d4a",
];

/** The accent for the chapter at 1-based reading position `order`. */
export const chapterColor = (order: number) =>
  CHAPTER_COLORS[Math.max(0, order - 1) % CHAPTER_COLORS.length];

/**
 * Web's `STORY_COVER_ZOOM_MAX` (8x), as the crop stores it. Story covers zoom
 * further than avatars, so `CroppedImage`'s default limit would drop the crop of
 * a tightly framed cover.
 */
export const STORY_COVER_ZOOM_MAX_PCT = 800;
