"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

interface RichTextRendererProps {
  savedText: string;
  collapsedHeight?: number;
  overlayHidden?: boolean;
  disableCollapse?: boolean;
}

export const RichTextRenderer = ({
  savedText = "",
  collapsedHeight = 160,
  overlayHidden = false,
  disableCollapse = false,
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

    // Set the cleaned HTML
    container.innerHTML = tempDiv.innerHTML;
    // container.innerHTML = savedText;

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
  }, [savedText, onNovelistTagClick, onMuseTagClick]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (disableCollapse) {
      setIsOverflowing(false);
      setMaxHeight("none");
      setAnimating(false);
      return;
    }

    const contentHeight = content.scrollHeight;
    const shouldOverflow = contentHeight > collapsedHeight + 4;

    setIsOverflowing(shouldOverflow);

    // ✅ Short content → no maxHeight restriction at all
    if (!shouldOverflow) {
      setMaxHeight("none");
      setAnimating(false);
      return;
    }

    // Long content
    if (expanded) {
      setMaxHeight(`${contentHeight}px`);
    } else {
      setMaxHeight(`${collapsedHeight}px`);
    }

    setAnimating(true);
    const timeout = setTimeout(() => setAnimating(false), 160);
    return () => clearTimeout(timeout);
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
      <S.Container>
        <S.EmptyState>
          <S.EmptyText>Loading</S.EmptyText>
        </S.EmptyState>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.ContentWrapper
        ref={wrapperRef}
        style={{
          cursor: !disableCollapse && isOverflowing ? "pointer" : undefined,
          maxHeight,
        }}
        $animating={animating}
        onClick={handleContentClick}
      >
        <S.SavedContent ref={contentRef} />
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
