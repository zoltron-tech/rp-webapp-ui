/**
 * Fixture artwork, generated as inline SVG data URIs.
 *
 * The promo capture runs with no backend and no network at all, so every image
 * the scene needs has to be self-contained. These are deliberately abstract —
 * they read as cover art and portraits at chip and card size without pretending
 * to be anyone's real muse.
 */

/**
 * Note the media type carries no `;charset=` parameter, and the parentheses are
 * escaped by hand on top of `encodeURIComponent`.
 *
 * These end up inside a styled-components `url(...)` (see `CoverImage`'s
 * `PlainCover`), and stylis parses that template as CSS: a `;` inside an
 * unquoted `url()` ends the declaration and the whole rule is dropped, and a
 * `)` closes the `url()` early. Percent-encoding is understood as UTF-8 without
 * being told, so nothing is lost by leaving the parameter off.
 */
const dataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")}`;

/** A round portrait: a two-stop wash under the character's initial. */
export const portrait = (
  initial: string,
  from: string,
  to: string,
  seed = 0,
): string =>
  dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#g)"/>
      <circle cx="${28 + (seed % 5) * 14}" cy="${30 + (seed % 3) * 12}" r="34"
        fill="#ffffff" opacity="0.10"/>
      <circle cx="${96 - (seed % 4) * 10}" cy="96" r="26"
        fill="#000000" opacity="0.14"/>
      <text x="60" y="60" text-anchor="middle" dominant-baseline="central"
        font-family="Montserrat, sans-serif" font-size="52" font-weight="600"
        fill="#ffffff" fill-opacity="0.9">${initial}</text>
    </svg>
  `);

/** A 2:3 chapter cover: banded wash, a horizon and an ordinal numeral. */
export const cover = (
  numeral: string,
  from: string,
  to: string,
  seed = 0,
): string =>
  dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill="url(#g)"/>
      <circle cx="${150 - (seed % 4) * 22}" cy="${78 + (seed % 3) * 18}" r="46"
        fill="#ffffff" opacity="0.12"/>
      <path d="M0 ${196 + (seed % 3) * 14} L64 ${152 + (seed % 4) * 10}
        L118 ${208 - (seed % 3) * 16} L200 ${140 + (seed % 5) * 12} L200 300 L0 300 Z"
        fill="#000000" opacity="0.24"/>
      <path d="M0 ${232 + (seed % 3) * 10} L78 ${196 + (seed % 4) * 8}
        L142 ${240 - (seed % 3) * 10} L200 ${198 + (seed % 4) * 9} L200 300 L0 300 Z"
        fill="#000000" opacity="0.3"/>
      <text x="26" y="52" font-family="Montserrat, sans-serif" font-size="34"
        font-weight="700" fill="#ffffff" fill-opacity="0.55">${numeral}</text>
    </svg>
  `);

/**
 * A landscape tile standing in for a GIF in the picker.
 *
 * Deliberately a still. The capture steps time itself, so anything animating on
 * the wall clock would make two runs of the same frame differ — and the point
 * of the beat is the attach-and-place flow, not the loop.
 */
export const gifTile = (
  label: string,
  from: string,
  to: string,
  seed = 0,
): string =>
  dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#g)"/>
      <circle cx="${72 + (seed % 4) * 46}" cy="${64 + (seed % 3) * 20}" r="52"
        fill="#ffffff" opacity="0.13"/>
      <path d="M0 ${150 + (seed % 3) * 12} L86 ${112 + (seed % 4) * 10}
        L168 ${162 - (seed % 3) * 14} L260 ${118 + (seed % 4) * 12} L320 ${150}
        L320 200 L0 200 Z" fill="#000000" opacity="0.26"/>
      <rect x="12" y="12" width="42" height="20" rx="6"
        fill="#000000" opacity="0.45"/>
      <text x="33" y="23" text-anchor="middle" dominant-baseline="central"
        font-family="Montserrat, sans-serif" font-size="11" font-weight="700"
        fill="#ffffff" fill-opacity="0.92">GIF</text>
      <text x="160" y="178" text-anchor="middle"
        font-family="Montserrat, sans-serif" font-size="16" font-weight="600"
        fill="#ffffff" fill-opacity="0.9">${label}</text>
    </svg>
  `);

/**
 * A 9:16 character plate — what a muse card, its wallpaper and its nav peek
 * all draw from. A silhouette rather than a face: it reads as a portrait at
 * card size without pretending to be anyone.
 */
export const museCover = (
  name: string,
  from: string,
  to: string,
  seed = 0,
): string =>
  dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640">
      <defs>
        <linearGradient id="g" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
        <radialGradient id="h" cx="0.5" cy="0.34" r="0.5">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="360" height="640" fill="url(#g)"/>
      <rect width="360" height="640" fill="url(#h)"/>
      <circle cx="180" cy="${232 + (seed % 3) * 10}" r="${74 + (seed % 4) * 5}"
        fill="#000000" opacity="0.24"/>
      <path d="M180 ${318 + (seed % 3) * 8}
        c-84 0 -128 66 -136 150 l272 0 c-8 -84 -52 -150 -136 -150 z"
        fill="#000000" opacity="0.24"/>
      <path d="M0 ${470 + (seed % 4) * 16} L112 ${418 + (seed % 3) * 14}
        L226 ${492 - (seed % 3) * 18} L360 ${430 + (seed % 5) * 12} L360 640 L0 640 Z"
        fill="#000000" opacity="0.3"/>
      <text x="180" y="600" text-anchor="middle"
        font-family="Montserrat, sans-serif" font-size="30" font-weight="600"
        fill="#ffffff" fill-opacity="0.86">${name}</text>
    </svg>
  `);

/** A wide plate for a back-story section. */
export const storyPlate = (
  label: string,
  from: string,
  to: string,
  seed = 0,
): string =>
  dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="300" fill="url(#g)"/>
      <circle cx="${180 + (seed % 4) * 90}" cy="${96 + (seed % 3) * 24}" r="72"
        fill="#ffffff" opacity="0.12"/>
      <path d="M0 ${222 + (seed % 3) * 14} L156 ${170 + (seed % 4) * 12}
        L318 ${238 - (seed % 3) * 18} L482 ${182 + (seed % 4) * 14}
        L640 ${226} L640 300 L0 300 Z" fill="#000000" opacity="0.3"/>
      <text x="32" y="264" font-family="Montserrat, sans-serif" font-size="22"
        font-weight="600" fill="#ffffff" fill-opacity="0.85">${label}</text>
    </svg>
  `);

/** The story's own cover, wider than a chapter's. */
export const storyCover = (): string =>
  dataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#123b32"/>
          <stop offset="0.55" stop-color="#1d5a49"/>
          <stop offset="1" stop-color="#0d2b26"/>
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g)"/>
      <circle cx="300" cy="150" r="96" fill="#ffffff" opacity="0.1"/>
      <path d="M0 400 L120 300 L230 420 L400 280 L400 600 L0 600 Z"
        fill="#000000" opacity="0.28"/>
    </svg>
  `);
