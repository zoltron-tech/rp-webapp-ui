import type { RichBlock, RichInline, RichNode } from "@nw/richtext";
import {
  findNovelistWorldLinks,
  type NovelistWorldLink,
  parseNovelistWorldLink,
  uniqueNovelistWorldLinks,
} from "@nw/utils/nw-links";
import { headcanonIdInUrl } from "@nw/types/headcanon";
import type { Href } from "expo-router";
import { WEB_URL } from "@/lib/links";
import { urlHost } from "@/lib/safe-link";

/**
 * Links back into Novelist World, as this client reads and routes them.
 *
 * The parsing is shared (`@nw/utils/nw-links`); what is native here is which
 * hosts count as ours — production plus whatever `WEB_URL` names, so a dev
 * build pointed at a local site unfurls its own links — and where each kind
 * goes in this app's router.
 */

const extraHosts = (): string[] => {
  const host = urlHost(WEB_URL);
  return host ? [host] : [];
};

export const parseLink = (url: string): NovelistWorldLink | null =>
  parseNovelistWorldLink(url, extraHosts());

export const linksIn = (text: string): NovelistWorldLink[] =>
  uniqueNovelistWorldLinks(text, extraHosts());

/**
 * The screen a link opens.
 *
 * Every tab's stack carries the profile, prompt, thread and character
 * screens, so a relative path lands inside whichever tab the reader is in;
 * the story screens live on the root stack.
 */
export const hrefFor = (link: NovelistWorldLink): Href => {
  switch (link.kind) {
    case "muse": {
      // A headcanon's link is its character's, opened at the card.
      const headcanon = headcanonIdInUrl(link.url);
      return {
        params: headcanon
          ? { headcanon, museId: link.id }
          : { museId: link.id },
        pathname: "/muse/[museId]",
      };
    }
    case "prompt":
      return { params: { promptId: link.id }, pathname: "/prompt/[promptId]" };
    case "thread":
      return { params: { threadId: link.id }, pathname: "/threads/[threadId]" };
    case "novelist":
      return {
        params: { username: link.id },
        pathname: "/novelist/[username]",
      };
    case "story":
      return { params: { storyId: link.id }, pathname: "/story/[storyId]" };
    case "chapter":
      return {
        params: { eventId: link.id },
        pathname: "/story/chapter/[eventId]",
      };
  }
};

/* ─── Cutting links out of a rich-text document ───────────────────────── */

/**
 * A document, cut around its links.
 *
 * React Native lays no `<View>` out inside a `<Text>`, so a card cannot sit
 * where the URL sat the way web's portal can. Instead the document is split
 * at every link: the words before it stay one run of blocks, the card takes
 * its own place in the column, the words after it carry on. A paragraph
 * that held a link in mid-sentence becomes two paragraphs with a card
 * between them, which is the layout web ends up drawing anyway.
 */
export type RichSegment =
  | { kind: "nodes"; nodes: RichNode[] }
  | { kind: "link"; link: NovelistWorldLink };

const isText = (inline: RichInline): inline is RichInline & { type: "text" } =>
  inline.type === "text";

/** True when the block has nothing a reader would see. */
const blockIsBlank = (block: RichBlock): boolean =>
  block.children.every(
    (child) =>
      child.type === "break" || (child.type === "text" && !child.text.trim()),
  );

/**
 * One block's inlines, split where links occur: alternating runs of inlines
 * and links, in document order.
 */
const splitInlines = (
  children: RichInline[],
  hosts: string[],
): Array<RichInline[] | NovelistWorldLink> => {
  const out: Array<RichInline[] | NovelistWorldLink> = [];
  let run: RichInline[] = [];
  const flush = () => {
    if (run.length) out.push(run);
    run = [];
  };

  for (const child of children) {
    if (!isText(child)) {
      run.push(child);
      continue;
    }
    // A bare anchor whose text is the link itself; a captioned anchor stays.
    if (child.href) {
      const link = parseNovelistWorldLink(child.href, hosts);
      const label = child.text.trim();
      if (
        link &&
        (!label || parseNovelistWorldLink(label, hosts)?.id === link.id)
      ) {
        flush();
        out.push(link);
        continue;
      }
      run.push(child);
      continue;
    }
    const found = findNovelistWorldLinks(child.text, hosts);
    if (found.length === 0) {
      run.push(child);
      continue;
    }
    let cursor = 0;
    for (const link of found) {
      if (link.start > cursor) {
        run.push({ ...child, text: child.text.slice(cursor, link.start) });
      }
      flush();
      out.push({ id: link.id, kind: link.kind, url: link.url });
      cursor = link.end;
    }
    if (cursor < child.text.length) {
      run.push({ ...child, text: child.text.slice(cursor) });
    }
  }
  flush();
  return out;
};

/**
 * Splits, by the tree they came from.
 *
 * `parseCached` hands the same array back for the same markup, so a feed
 * cell re-bound to a prompt it showed a moment ago, or a bubble re-rendered
 * for a reaction, gets its segments by identity rather than by walking every
 * run again. A `WeakMap`: a tree the parse cache has evicted takes its split
 * with it.
 */
const SPLITS = new WeakMap<RichNode[], RichSegment[]>();

export const splitRichTextAroundLinks = (nodes: RichNode[]): RichSegment[] => {
  const hit = SPLITS.get(nodes);
  if (hit) return hit;
  const segments = splitUncached(nodes);
  SPLITS.set(nodes, segments);
  return segments;
};

const splitUncached = (nodes: RichNode[]): RichSegment[] => {
  const hosts = extraHosts();
  const segments: RichSegment[] = [];
  let current: RichNode[] = [];
  const flush = () => {
    if (current.length) segments.push({ kind: "nodes", nodes: current });
    current = [];
  };

  for (const node of nodes) {
    if (node.type === "image") {
      current.push(node);
      continue;
    }
    // Cheap test first: nearly every block has no link in it.
    const hasCandidate = node.children.some(
      (child) =>
        child.type === "text" &&
        (child.text.includes("/rp/") ||
          child.text.includes("/@") ||
          (child.href?.includes("/rp/") ?? false) ||
          (child.href?.includes("/@") ?? false)),
    );
    if (!hasCandidate) {
      current.push(node);
      continue;
    }
    const pieces = splitInlines(node.children, hosts);
    if (!pieces.some((piece) => !Array.isArray(piece))) {
      current.push(node);
      continue;
    }
    for (const piece of pieces) {
      if (Array.isArray(piece)) {
        const block = { ...node, children: piece } as RichBlock;
        if (!blockIsBlank(block)) current.push(block);
      } else {
        flush();
        segments.push({ kind: "link", link: piece });
      }
    }
  }
  flush();
  return segments;
};

/** True when nothing in the document would be cut out — the common case. */
export const hasLinkEmbeds = (segments: RichSegment[]): boolean =>
  segments.some((segment) => segment.kind === "link");
