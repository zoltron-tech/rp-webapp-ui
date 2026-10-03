import { wrappedImageSelector } from "@/components/rich-text-editor-input/editor-config";
import type { FlowKey, Page, PageItem, PageMap } from "./types";

/**
 * The pagination engine.
 *
 * Given a container holding a chapter's whole content flow, laid out at the
 * page's content width, it works out where the page cuts fall. It does that in
 * two passes:
 *
 *   1. **Candidates** — every y offset a cut is *allowed* at: the top of each
 *      top-level block, and the top of each line box inside a paragraph (via
 *      `Range.getClientRects()`, which reports one rect per line fragment).
 *      Offsets that fall inside something that must not be split — a muse
 *      dialog embed, an image, or a float and the prose wrapping it — are
 *      dropped, giving Word's keep-together behaviour.
 *
 *   2. **Cuts** — greedily take the last candidate that still fits the page.
 *
 * Nothing here touches the stored HTML; pages are pure presentation.
 */

/** Blocks whose insides are never split across a page. */
const KEEP_TOGETHER_SELECTOR =
  ".dialog-embed, .inline-image-container, img, video, iframe, canvas, svg";

/** A wrapper marking one item of the flow (a passage, the overture, …). */
export const FLOW_ITEM_ATTR = "data-flow-key";

/** Guard against a pathological measure pass locking up the tab. */
const MAX_PAGES = 400;

interface Span {
  from: number;
  to: number;
}

const topOf = (el: Element, rootTop: number) =>
  el.getBoundingClientRect().top - rootTop;

const bottomOf = (el: Element, rootTop: number) =>
  el.getBoundingClientRect().bottom - rootTop;

/**
 * Spans of the flow that a cut may not land inside: each keep-together node,
 * plus — for a floated image — the run of prose that wraps it, since the float
 * and its text read as one composite block.
 */
const protectedSpans = (root: HTMLElement, rootTop: number): Span[] => {
  const spans: Span[] = [];

  root.querySelectorAll(KEEP_TOGETHER_SELECTOR).forEach((el) => {
    const from = topOf(el, rootTop);
    const to = bottomOf(el, rootTop);
    if (to > from) spans.push({ from, to });
  });

  // A floated image plus everything that wraps it: the run ends where the
  // float clears, so break there or before it — never in the middle.
  root
    .querySelectorAll<HTMLElement>(
      `${wrappedImageSelector("left")}, ${wrappedImageSelector("right")}`,
    )
    .forEach((float) => {
      const from = topOf(float, rootTop);
      const floatBottom = bottomOf(float, rootTop);
      let to = floatBottom;
      // Blocks that begin above the float's bottom edge have their line boxes
      // shortened by it — they are part of the same composite run. Walk from
      // the float's own block, so the siblings examined are the paragraphs
      // actually flowing around it.
      let block: HTMLElement | null = float.parentElement;
      while (block) {
        const next = block.nextElementSibling as HTMLElement | null;
        if (!next) break;
        if (topOf(next, rootTop) >= floatBottom) break;
        to = Math.max(to, bottomOf(next, rootTop));
        block = next;
      }
      spans.push({ from, to });
    });

  return spans;
};

const insideAnySpan = (y: number, spans: Span[]) =>
  spans.some((span) => y > span.from + 0.5 && y < span.to - 0.5);

/** Every y offset (relative to the flow's top) that a cut may land on. */
const collectCandidates = (root: HTMLElement): number[] => {
  const rootTop = root.getBoundingClientRect().top;
  const spans = protectedSpans(root, rootTop);
  const candidates = new Set<number>();

  const consider = (y: number) => {
    if (y <= 0.5) return;
    if (insideAnySpan(y, spans)) return;
    candidates.add(Math.round(y * 100) / 100);
  };

  root.querySelectorAll<HTMLElement>(`[${FLOW_ITEM_ATTR}]`).forEach((item) => {
    // The boundary between two flow items is always a legal cut.
    consider(topOf(item, rootTop));

    for (const block of Array.from(item.children) as HTMLElement[]) {
      consider(topOf(block, rootTop));
      collectLineTops(block, rootTop, consider);
    }
  });

  return Array.from(candidates).sort((a, b) => a - b);
};

/**
 * Line-box tops inside a block. `getClientRects()` on a range over the block's
 * contents yields one rect per line fragment, so their tops are exactly the
 * offsets a page may cut a paragraph at.
 */
const collectLineTops = (
  block: HTMLElement,
  rootTop: number,
  consider: (y: number) => void,
) => {
  // Lists break between items, not mid-item; recurse so each `li` contributes
  // its own line boxes but the marker never separates from its first line.
  if (block.tagName === "UL" || block.tagName === "OL") {
    for (const item of Array.from(block.children) as HTMLElement[]) {
      consider(topOf(item, rootTop));
    }
    return;
  }

  // Offsets that land inside an image or a dialog embed are filtered out by
  // the protected spans, so the rects can be collected wholesale here.
  const range = document.createRange();
  range.selectNodeContents(block);
  for (const rect of Array.from(range.getClientRects())) {
    if (rect.height <= 0) continue;
    consider(rect.top - rootTop);
  }
};

/** Greedily takes the last candidate that still fits on the page. */
const computeCuts = (
  totalHeight: number,
  pageHeight: number,
  candidates: number[],
): number[] => {
  const cuts = [0];
  if (pageHeight <= 0) return cuts;

  let start = 0;
  while (start + pageHeight < totalHeight - 0.5 && cuts.length < MAX_PAGES) {
    const limit = start + pageHeight;
    let next = -1;
    for (const candidate of candidates) {
      if (candidate > limit + 0.5) break;
      if (candidate > start + 0.5) next = candidate;
    }
    // Content taller than a whole page (a full-bleed image, a long dialog):
    // let it overflow this page and cut at the first legal offset past it,
    // rather than dropping a cut in the middle of it.
    if (next < 0) {
      next = candidates.find((candidate) => candidate > limit + 0.5) ?? -1;
      if (next < 0) break;
    }
    cuts.push(next);
    start = next;
  }

  return cuts;
};

/** Which slice of each flow item lands on each page. */
const sliceItems = (
  root: HTMLElement,
  cuts: number[],
  totalHeight: number,
): Page[] => {
  const rootTop = root.getBoundingClientRect().top;
  const items = Array.from(
    root.querySelectorAll<HTMLElement>(`[${FLOW_ITEM_ATTR}]`),
  ).map((el) => {
    const threadIndex = el.dataset.threadIndex;
    return {
      bottom: bottomOf(el, rootTop),
      key: el.getAttribute(FLOW_ITEM_ATTR) as FlowKey,
      threadIndex: threadIndex ? Number(threadIndex) : undefined,
      top: topOf(el, rootTop),
    };
  });

  return cuts.map((top, index) => {
    const bottom = cuts[index + 1] ?? totalHeight;
    const pageItems: PageItem[] = [];

    for (const item of items) {
      if (item.bottom <= top + 0.5 || item.top >= bottom - 0.5) continue;
      pageItems.push({
        ends: item.bottom <= bottom + 0.5,
        fromY: Math.max(0, top - item.top),
        key: item.key,
        starts: item.top >= top - 0.5,
        threadIndex: item.threadIndex,
        toY: Math.min(item.bottom, bottom) - item.top,
      });
    }

    return { height: bottom - top, index, items: pageItems, top };
  });
};

/**
 * Paginates the flow currently laid out inside `root`.
 *
 * `root` must be rendered at the page's content width with the page's font
 * settings — the measuring container does exactly that off-screen.
 */
export const paginate = (root: HTMLElement, pageHeight: number): PageMap => {
  const totalHeight = root.getBoundingClientRect().height;
  if (totalHeight <= 0 || pageHeight <= 0) {
    return {
      pageHeight,
      pages: [{ height: pageHeight, index: 0, items: [], top: 0 }],
      tailSpace: pageHeight,
      totalHeight: 0,
    };
  }

  const cuts = computeCuts(totalHeight, pageHeight, collectCandidates(root));
  const pages = sliceItems(root, cuts, totalHeight);
  const lastTop = cuts[cuts.length - 1] ?? 0;

  return {
    pageHeight,
    pages,
    tailSpace: Math.max(0, pageHeight - (totalHeight - lastTop)),
    totalHeight,
  };
};
