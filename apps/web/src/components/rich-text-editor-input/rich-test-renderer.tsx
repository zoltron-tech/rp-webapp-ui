"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
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

  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>(`${collapsedHeight}px`);
  const [animating, setAnimating] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

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
    renderDialogEmbeds(container, dialogDesign, museDialogAttrs);

    const handleMentionClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const mentionTag = target.closest(".mention-tag") as HTMLElement | null;

      if (!mentionTag) return;

      const { type, id } = mentionTag.dataset;
      if (!type || !id) return;

      if (type === "NOVELIST") onNovelistTagClick(id);
      if (type === "MUSE") onMuseTagClick(id);
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
  }, [
    savedText,
    dialogDesign,
    museDialogAttrs,
    onNovelistTagClick,
    onMuseTagClick,
  ]);

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
        .querySelectorAll("img, video, audio, iframe, canvas, svg")
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

      // If the content has an image, don't hide the first image when collapsed:
      // extend the collapsed height down to the bottom edge of that image so it
      // is fully visible.
      const firstImg = content.querySelector("img");
      let effectiveCollapsed = collapsedHeight;
      if (firstImg) {
        const imgBottom =
          firstImg.getBoundingClientRect().bottom -
          content.getBoundingClientRect().top;
        effectiveCollapsed = Math.max(collapsedHeight, Math.ceil(imgBottom));
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

    return () => {
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
