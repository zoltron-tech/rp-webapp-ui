"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import {
  LINK_SLOT_CLASS,
  type LinkSlot,
  mountNovelistWorldLinkSlots,
} from "@/components/muse-embed/link-slots";
import { NovelistWorldLinkEmbed } from "@/components/nw-link-embed";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import {
  DEFAULT_DIALOG_DESIGN,
  type DialogDesign,
  dialogDesignClass,
  type MuseDialogAttrs,
  renderDialogEmbeds,
} from "./dialog-designs";
import * as S from "./styled";

interface RichTextRendererProps {
  savedText: string;
  collapsedHeight?: number;
  overlayHidden?: boolean;
  disableCollapse?: boolean;
  /** Overrides the accent for all accent-colored elements (toggle, mentions,
      image hover). Falls back to the inherited --accent when unset. */
  accent?: string | null;
  /** How embedded dialogs are presented. Defaults to the card design. */
  dialogDesign?: DialogDesign;
  /** Per-thread muse id → sender name/accent, used to inflate dialogs. */
  museDialogAttrs?: MuseDialogAttrs;
}

export const RichTextRenderer = ({
  savedText = "",
  collapsedHeight = 160,
  overlayHidden = false,
  disableCollapse = false,
  accent = null,
  dialogDesign = DEFAULT_DIALOG_DESIGN,
  museDialogAttrs,
}: RichTextRendererProps) => {
  const { routeToPage } = usePageRouter();

  // Callers build the muse map inline, so it is a new object every render.
  // The inject effect below now sets state, and re-running it on every new
  // identity would set state, re-render the caller, get a new map, and loop.
  // Key it by content instead: the same names and accents are the same map.
  const museDialogAttrsKey = JSON.stringify(museDialogAttrs ?? null);
  const stableMuseDialogAttrs = useMemo(
    () => museDialogAttrs,
    [museDialogAttrsKey],
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>(`${collapsedHeight}px`);
  const [animating, setAnimating] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  // Novelist World links found in the injected HTML, each with the empty span
  // that replaced it. Cards are portalled into those spans below.
  const [linkSlots, setLinkSlots] = useState<LinkSlot[]>([]);

  const onNovelistTagClick = useCallback(
    (novelistId: string) => {
      // console.log("authState", authState);
      routeToPage(ROUTES.Novelist.View(novelistId));
      // console.log("novelist click:", novelistId, routeToPage);
    },
    [routeToPage],
  );

  const onMuseTagClick = useCallback(
    (museId: string) => {
      routeToPage(ROUTES.Muse.View(museId));
    },
    [routeToPage],
  );

  // The click handlers follow `routeToPage`, which follows the pathname, so
  // they are not stable across renders. Read through a ref so the inject
  // effect below — which now sets state — does not have to depend on them,
  // and re-injects the HTML only when the HTML or its dialog data changes.
  const clickHandlersRef = useRef({ onMuseTagClick, onNovelistTagClick });
  clickHandlersRef.current = { onMuseTagClick, onNovelistTagClick };

  // Inject HTML + attach click delegation
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // Create a temporary DOM element to manipulate the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = savedText;

    // Strip trailing whitespace / empty lines (blank text nodes, <br>, empty
    // elements) from the end of the content so it renders without a dangling gap.
    const hasEmbedded = (el: Element) =>
      !!el.querySelector("img, video, audio, iframe, canvas, svg");

    const trimTrailing = (parent: Node) => {
      let last = parent.lastChild;
      while (last) {
        if (last.nodeType === Node.TEXT_NODE) {
          const text = last.textContent ?? "";
          if (!text.trim()) {
            const prev = last.previousSibling;
            parent.removeChild(last);
            last = prev;
            continue;
          }
          last.textContent = text.replace(/\s+$/, "");
          break;
        }

        if (last.nodeType === Node.ELEMENT_NODE) {
          const el = last as Element;
          if (el.tagName === "BR") {
            const prev = last.previousSibling;
            parent.removeChild(last);
            last = prev;
            continue;
          }
          if (hasEmbedded(el)) break;
          if (!el.textContent || !el.textContent.trim()) {
            const prev = last.previousSibling;
            parent.removeChild(last);
            last = prev;
            continue;
          }
          // Element holds real text: descend to trim its trailing whitespace.
          trimTrailing(el);
          break;
        }

        break;
      }
    };

    trimTrailing(tempDiv);

    // Set the cleaned HTML
    container.innerHTML = tempDiv.innerHTML;
    // container.innerHTML = savedText;

    // Render any stored dialog embeds using the chosen read-only design,
    // resolving sender name/accent from the thread's muse map.
    renderDialogEmbeds(container, dialogDesign, stableMuseDialogAttrs);

    // Swap every Novelist World link for a slot; the cards render into them
    // via portals. Two fast paths: a post with no link-shaped text is not
    // walked at all, and a post that had no slots and still has none keeps
    // its state — otherwise every post re-rendered once after mount for
    // nothing.
    const found =
      savedText.includes("/rp/") || savedText.includes("/@")
        ? mountNovelistWorldLinkSlots(container)
        : [];
    setLinkSlots((prev) =>
      prev.length === 0 && found.length === 0 ? prev : found,
    );

    const handleMentionClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const mentionTag = target.closest(".mention-tag") as HTMLElement | null;

      if (!mentionTag) return;

      const { type, id } = mentionTag.dataset;
      if (!type || !id) return;

      if (type === "NOVELIST") clickHandlersRef.current.onNovelistTagClick(id);
      if (type === "MUSE") clickHandlersRef.current.onMuseTagClick(id);
    };

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const img =
        target.tagName === "IMG"
          ? (target as HTMLImageElement)
          : (target
              .closest(".inline-image-container")
              ?.querySelector("img") as HTMLImageElement | null);
      if (!img) return;
      e.stopPropagation();
      setViewerSrc(img.src);
    };

    container.addEventListener("click", handleMentionClick);
    container.addEventListener("click", handleImageClick);

    return () => {
      container.removeEventListener("click", handleMentionClick);
      container.removeEventListener("click", handleImageClick);
    };
  }, [savedText, dialogDesign, stableMuseDialogAttrs]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (disableCollapse) {
      setIsOverflowing(false);
      setMaxHeight("none");
      setAnimating(false);
      return;
    }

    let animTimeout: ReturnType<typeof setTimeout> | undefined;

    // Bottom edge (relative to content top) of the last piece of meaningful
    // content, ignoring trailing whitespace / empty lines. Trailing spaces and
    // newlines add to scrollHeight (white-space: pre-wrap) but shouldn't count
    // as hidden content worth a "Read more..." toggle.
    const getMeaningfulBottom = () => {
      const contentTop = content.getBoundingClientRect().top;
      let maxBottom = 0;

      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!node.textContent || !node.textContent.trim()) continue;
        range.selectNodeContents(node);
        maxBottom = Math.max(
          maxBottom,
          range.getBoundingClientRect().bottom - contentTop,
        );
      }

      // Embedded content counts as meaningful even without text.
      content
        .querySelectorAll(
          `img, video, audio, iframe, canvas, svg, .${LINK_SLOT_CLASS}`,
        )
        .forEach((el) => {
          maxBottom = Math.max(
            maxBottom,
            el.getBoundingClientRect().bottom - contentTop,
          );
        });

      return maxBottom;
    };

    const measure = () => {
      const contentHeight = content.scrollHeight;

      // If the first image or embedded card starts inside the collapsed area,
      // don't cut it in half: extend the collapsed height down to its bottom
      // edge so it is fully visible. One that starts further down (after a
      // long passage of text) stays hidden behind "Read more" — extending to
      // it would stretch the collapsed height over the whole post, and the
      // toggle would never appear.
      const firstEmbed = content.querySelector(`img, .${LINK_SLOT_CLASS}`);
      let effectiveCollapsed = collapsedHeight;
      if (firstEmbed) {
        const contentTop = content.getBoundingClientRect().top;
        const embedRect = firstEmbed.getBoundingClientRect();
        if (embedRect.top - contentTop < collapsedHeight) {
          effectiveCollapsed = Math.max(
            collapsedHeight,
            Math.ceil(embedRect.bottom - contentTop),
          );
        }
      }

      // Decide overflow from meaningful content only, so purely trailing
      // whitespace/newlines don't trigger the "Read more..." toggle.
      const meaningfulHeight = getMeaningfulBottom() || contentHeight;
      const shouldOverflow = meaningfulHeight > effectiveCollapsed + 4;

      setIsOverflowing(shouldOverflow);

      // ✅ Short content → no maxHeight restriction at all
      if (!shouldOverflow) {
        setMaxHeight("none");
        setAnimating(false);
        return;
      }

      // Long content
      setMaxHeight(expanded ? `${contentHeight}px` : `${effectiveCollapsed}px`);

      setAnimating(true);
      animTimeout = setTimeout(() => setAnimating(false), 160);
    };

    measure();

    // Images may not be measured yet on first render; re-measure once the first
    // image loads so the collapsed height matches its real size.
    const firstImg = content.querySelector("img");
    if (firstImg && !firstImg.complete) {
      firstImg.addEventListener("load", measure);
      firstImg.addEventListener("error", measure);
    }

    // An embedded card grows from a skeleton to its real height once its
    // muse arrives, after this effect has run. Re-measure when it does, so a
    // post that was short enough to show whole does not get clipped.
    // Coalesced to a frame: a card going from skeleton to content resizes
    // the column several times in a burst, and `measure` walks every text
    // node.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(content);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      if (animTimeout) clearTimeout(animTimeout);
      if (firstImg) {
        firstImg.removeEventListener("load", measure);
        firstImg.removeEventListener("error", measure);
      }
    };
  }, [expanded, savedText, collapsedHeight, disableCollapse]);

  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disableCollapse || !isOverflowing) return;
      const target = e.target as HTMLElement;
      // Let links, images, videos, and mention tags handle their own clicks.
      if (
        target.closest("a") ||
        target.closest(`.${LINK_SLOT_CLASS}`) ||
        target.closest(".mention-tag") ||
        target.tagName === "IMG" ||
        target.tagName === "VIDEO" ||
        target.tagName === "AUDIO" ||
        target.closest(".inline-image-container")
      ) {
        return;
      }
      setExpanded((v) => !v);
    },
    [disableCollapse, isOverflowing],
  );

  if (!savedText.length) {
    return (
      <S.Container $accent={accent}>
        <S.EmptyState>
          <S.EmptyText>Loading</S.EmptyText>
        </S.EmptyState>
      </S.Container>
    );
  }

  return (
    <S.Container $accent={accent}>
      <S.ContentWrapper
        ref={wrapperRef}
        style={{
          cursor: !disableCollapse && isOverflowing ? "pointer" : undefined,
          maxHeight,
        }}
        $animating={animating}
        $noClip={disableCollapse}
        onClick={handleContentClick}
      >
        <S.SavedContent
          ref={contentRef}
          className={dialogDesignClass(dialogDesign)}
        />
        {!disableCollapse && !expanded && isOverflowing && !overlayHidden && (
          <S.FadeOverlay />
        )}
      </S.ContentWrapper>

      {!disableCollapse && isOverflowing && (
        <S.Toggle onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less..." : "Read more..."}
        </S.Toggle>
      )}

      {linkSlots.map((slot) =>
        createPortal(
          <NovelistWorldLinkEmbed link={slot.link} />,
          slot.node,
          slot.key,
        ),
      )}

      {viewerSrc && (
        <AppImageViewer
          src={viewerSrc}
          open
          onOpenChange={(open) => {
            if (!open) setViewerSrc(null);
          }}
        />
      )}
    </S.Container>
  );
};
