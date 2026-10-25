import { bookCoverUrl } from "@nw/types/books";

/**
 * Spine colours (BOOKSHELF_PLAN.md §1.3).
 *
 * A spine is drawn, not downloaded: the owner's browser samples the cover once
 * when the book is first shelved and the hex travels with the shelve request.
 * Covers from covers.openlibrary.org are CORS-readable, so a tiny canvas is
 * enough; anything that throws (tainted canvas, blocked image) falls back to
 * a deterministic hue from the work key so the fallback is still unique per
 * book — and the server may still get a colour from a later shelver.
 */

const SAMPLE_W = 16;
const SAMPLE_H = 24;
/** Lightness is clamped so white-on-spine text stays legible in both themes. */
const MIN_L = 0.25;
const MAX_L = 0.62;

const cache = new Map<number, Promise<string | null>>();

export const extractSpineHex = (coverId: number): Promise<string | null> => {
  const cached = cache.get(coverId);
  if (cached) return cached;
  const task = sample(coverId).catch(() => null);
  cache.set(coverId, task);
  return task;
};

const sample = (coverId: number) =>
  new Promise<string | null>((resolve) => {
    if (typeof document === "undefined") return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_W;
        canvas.height = SAMPLE_H;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
        // Middle 50% only: skips white borders and scanner edges.
        const x0 = SAMPLE_W / 4;
        const y0 = SAMPLE_H / 4;
        const { data } = ctx.getImageData(x0, y0, SAMPLE_W / 2, SAMPLE_H / 2);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
        if (!n) return resolve(null);
        resolve(clampLightness(r / n, g / n, b / n));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = bookCoverUrl(coverId, "M");
  });

const clampLightness = (r: number, g: number, b: number): string => {
  const [h, s, l] = rgbToHsl(r, g, b);
  const clampedL = Math.min(MAX_L, Math.max(MIN_L, l));
  // A near-grey average usually means a busy cover; give it a little life.
  const boostedS = Math.max(s, 0.22);
  return hslToHex(h, boostedS, clampedL);
};

/** Deterministic fallback: same key, same colour, on every device. */
export const fallbackSpineColor = (olKey: string): string => {
  let hash = 0;
  for (let i = 0; i < olKey.length; i++) {
    hash = (hash * 31 + olKey.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue / 360, 0.38, 0.42);
};

export const spineColorOf = (book: {
  olKey: string;
  spineHex: string | null;
}) => book.spineHex ?? fallbackSpineColor(book.olKey);

// ── colour maths ──────────────────────────────────────────────────────────

const rgbToHsl = (
  r: number,
  g: number,
  b: number,
): [number, number, number] => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h / 6, s, l];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
