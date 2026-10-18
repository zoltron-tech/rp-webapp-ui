import {
  findNovelistWorldLinks,
  type NovelistWorldLink,
  parseNovelistWorldLink,
} from "@nw/utils/nw-links";

/**
 * Where, in a blob of saved HTML, the Novelist World links are.
 *
 * The rich-text renderer draws posts by handing their HTML to `innerHTML`, so
 * there is no React tree to put a card into. Instead this walks the live DOM
 * once, cuts each link out of the text it sits in, leaves an empty `<span>`
 * in its place, and hands the spans back. The renderer then portals a card
 * into each one — React owns what is inside the span, the browser owns what
 * is around it, and neither tramples the other.
 *
 * Only the link itself is replaced. The words either side of it stay exactly
 * where they were, so "She's here! <link>" renders as the sentence with the
 * card beneath it, which is what the author meant.
 */

export const LINK_SLOT_CLASS = "nw-link-slot";

export type LinkSlot = {
  /** Stable within one mount; a muse linked twice gets two slots. */
  key: string;
  node: HTMLElement;
  link: NovelistWorldLink;
};

/**
 * The hosts a link may use besides production: this page's own, so a local
 * build that writes `localhost:5173/rp/muse/…` unfurls its own links too.
 */
export const localLinkHosts = (): string[] =>
  typeof window === "undefined" ? [] : [window.location.host];

/**
 * Where not to look. A URL inside a mention chip, an embedded dialog, a code
 * span or an existing slot is either not a link or already handled.
 */
const SKIP_INSIDE = `a, code, pre, .mention-tag, .dialog-embed, .${LINK_SLOT_CLASS}`;

const createSlot = (link: NovelistWorldLink): HTMLElement => {
  const slot = document.createElement("span");
  slot.className = LINK_SLOT_CLASS;
  slot.dataset.kind = link.kind;
  slot.dataset.id = link.id;
  slot.dataset.href = link.url;
  slot.setAttribute("contenteditable", "false");
  // A block in the flow of the paragraph, so the card takes its own line.
  slot.style.display = "block";
  return slot;
};

export const mountNovelistWorldLinkSlots = (root: HTMLElement): LinkSlot[] => {
  const hosts = localLinkHosts();
  const slots: LinkSlot[] = [];
  const nextKey = (link: NovelistWorldLink) =>
    `${link.kind}-${link.id}-${slots.length}`;

  // Anchors first: a server-generated `<a href>` or a pasted one. Only a bare
  // link — one whose visible text is the URL — becomes a card; an anchor that
  // reads "meet her here" is a deliberate caption and stays a link.
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const link = parseNovelistWorldLink(
      anchor.getAttribute("href") ?? "",
      hosts,
    );
    if (!link) return;
    const label = (anchor.textContent ?? "").trim();
    if (label && parseNovelistWorldLink(label, hosts)?.id !== link.id) return;
    const slot = createSlot(link);
    anchor.replaceWith(slot);
    slots.push({ key: nextKey(link), link, node: slot });
  });

  // Then the plain URLs people type or paste. Collected before any edit:
  // splitting a text node while a TreeWalker is on it is undefined enough to
  // avoid.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const candidates: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const text = current as Text;
    if (
      (text.data.includes("/rp/") || text.data.includes("/@")) &&
      !text.parentElement?.closest(SKIP_INSIDE)
    ) {
      candidates.push(text);
    }
    current = walker.nextNode();
  }

  for (const text of candidates) {
    const found = findNovelistWorldLinks(text.data, hosts);
    if (found.length === 0) continue;

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const link of found) {
      if (link.start > cursor) {
        fragment.appendChild(
          document.createTextNode(text.data.slice(cursor, link.start)),
        );
      }
      const slot = createSlot(link);
      fragment.appendChild(slot);
      slots.push({ key: nextKey(link), link, node: slot });
      cursor = link.end;
    }
    if (cursor < text.data.length) {
      fragment.appendChild(document.createTextNode(text.data.slice(cursor)));
    }
    text.replaceWith(fragment);
  }

  return slots;
};
