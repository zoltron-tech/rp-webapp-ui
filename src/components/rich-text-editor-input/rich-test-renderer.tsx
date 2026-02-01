"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

interface RichTextRendererProps {
  savedText: string;
  collapsedHeight?: number;
  overlayHidden?: boolean;
}

export const RichTextRenderer = ({
  savedText = "",
  collapsedHeight = 160,
  overlayHidden = false,
}: RichTextRendererProps) => {
  const { routeToPage } = usePageRouter();

  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>(`${collapsedHeight}px`);
  const [animating, setAnimating] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

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

    container.innerHTML = savedText;

    const handleMentionClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const mentionTag = target.closest(".mention-tag") as HTMLElement | null;

      if (!mentionTag) return;

      const { type, id } = mentionTag.dataset;
      if (!type || !id) return;

      if (type === "NOVELIST") onNovelistTagClick(id);
      if (type === "MUSE") onMuseTagClick(id);
    };

    container.addEventListener("click", handleMentionClick);

    return () => {
      container.removeEventListener("click", handleMentionClick);
    };
  }, [savedText, onNovelistTagClick, onMuseTagClick]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

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
  }, [expanded, savedText, collapsedHeight]);

  if (!savedText.length) {
    return (
      <S.Container>
        <S.EmptyState>
          <S.EmptyText>
            No saved texts yet. Create and save some content above!
          </S.EmptyText>
        </S.EmptyState>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.ContentWrapper
        ref={wrapperRef}
        style={{ maxHeight }}
        $animating={animating}
      >
        <S.SavedContent ref={contentRef} />
        {!expanded && isOverflowing && !overlayHidden && <S.FadeOverlay />}
      </S.ContentWrapper>

      {isOverflowing && (
        <S.Toggle onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less..." : "See more..."}
        </S.Toggle>
      )}
    </S.Container>
  );
};
