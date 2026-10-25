"use client";

import {
  parseRichText,
  type RichTextComponents,
  renderRichText,
} from "@nw/richtext";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

/**
 * An About section, rendered from the shared rich-text tree.
 *
 * `RichTextRenderer` still owns posts, prompts and thread bodies: it injects
 * HTML and then walks the live DOM, which is how it measures a collapse around
 * images and inflates embedded muse dialogs. None of that survives on a phone,
 * so About — the one rich-text surface both clients show — goes through
 * `@nw/richtext` instead, and the two are the same document by construction
 * rather than by two parsers agreeing.
 *
 * The markup this emits is deliberately the markup the old path emitted:
 * `<p>`, `<strong>`, `<span class="mention-tag">`, inside `S.SavedContent`. The
 * CSS is untouched, so this is an adoption rather than a redesign.
 */

const COLLAPSED_HEIGHT = 100;

export const AboutRichText = ({
  savedText,
  collapsedHeight = COLLAPSED_HEIGHT,
}: {
  savedText: string;
  collapsedHeight?: number;
}) => {
  const { routeToPage } = usePageRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  const nodes = useMemo(() => parseRichText(savedText), [savedText]);

  const components = useMemo<RichTextComponents>(
    () => ({
      Break: () => <br />,
      Heading: ({ align, children, level }) => {
        const Tag = `h${Math.min(6, Math.max(1, level ?? 2))}` as "h2";
        return (
          <Tag style={align ? { textAlign: align } : undefined}>{children}</Tag>
        );
      },
      /**
       * Rebuilt as the editor saved it, attribute for attribute.
       *
       * This matters more than it looks. `.inline-image` is what carries
       * `width: 100%` inside its percentage-width container — an image without
       * that class renders at its natural size, overflows the container it was
       * meant to fill, and stops centring. Dropping the class is exactly how
       * the first version of this component made every profile image too big
       * and off-centre.
       *
       * An image that never came from the editor — a pasted Discord emoji, say
       * — has no container and its own pixel limits. It is emitted bare, with
       * those limits intact, which is what the old innerHTML path did with it.
       */
      Image: ({ align, alt, maxHeight, maxWidth, src, widthPercent, wrap }) => {
        const open = () => setViewerSrc(src);
        const fromEditor = widthPercent !== undefined || wrap !== undefined;

        const image = fromEditor ? (
          <img
            alt={alt ?? ""}
            className="inline-image"
            onClick={open}
            onKeyDown={(event) => {
              if (event.key === "Enter") open();
            }}
            src={src}
            style={{
              height: "auto",
              maxHeight: "none",
              maxWidth: "none",
              width: "100%",
            }}
          />
        ) : (
          <img
            alt={alt ?? ""}
            onClick={open}
            onKeyDown={(event) => {
              if (event.key === "Enter") open();
            }}
            src={src}
            style={{
              maxHeight: maxHeight ? `${maxHeight}px` : undefined,
              maxWidth: maxWidth ? `${maxWidth}px` : undefined,
            }}
          />
        );

        return (
          <div style={align ? { textAlign: align } : undefined}>
            {fromEditor ? (
              <span
                className="inline-image-container"
                data-wrap={wrap ?? "full"}
                style={widthPercent ? { width: `${widthPercent}%` } : undefined}
              >
                {image}
              </span>
            ) : (
              image
            )}
          </div>
        );
      },
      ListItem: ({ align, children, marker }) => (
        <p
          className="rich-list-item"
          style={align ? { textAlign: align } : undefined}
        >
          <span className="rich-list-marker">{marker}</span>
          {children}
        </p>
      ),
      Mention: ({ id, image, kind, name }) => (
        <span
          className="mention-tag"
          data-id={id}
          data-type={kind}
          onClick={() =>
            routeToPage(
              kind === "MUSE" ? ROUTES.Muse.View(id) : ROUTES.Novelist.View(id),
            )
          }
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            routeToPage(
              kind === "MUSE" ? ROUTES.Muse.View(id) : ROUTES.Novelist.View(id),
            );
          }}
        >
          {image ? (
            <img alt={name} className="mention-avatar" src={image} />
          ) : null}
          <span className="mention-text">{name}</span>
        </span>
      ),
      Paragraph: ({ align, children }) => (
        <p style={align ? { textAlign: align } : undefined}>
          {children ?? null}
          {Array.isArray(children) && children.length === 0 ? <br /> : null}
        </p>
      ),
      Quote: ({ align, children }) => (
        <blockquote style={align ? { textAlign: align } : undefined}>
          {children}
        </blockquote>
      ),
      Root: ({ children }) => <>{children}</>,
      Run: ({
        background,
        bold,
        children,
        code,
        color,
        fontFamily,
        fontSize,
        href,
        italic,
        strike,
        underline,
      }) => {
        let content = <>{children}</>;
        if (code) content = <code>{content}</code>;
        if (strike) content = <s>{content}</s>;
        if (underline) content = <u>{content}</u>;
        if (italic) content = <em>{content}</em>;
        if (bold) content = <strong>{content}</strong>;
        if (color || background || fontSize || fontFamily) {
          content = (
            <span
              style={{
                backgroundColor: background,
                color,
                fontFamily,
                fontSize: fontSize ? `${fontSize}px` : undefined,
              }}
            >
              {content}
            </span>
          );
        }
        if (href) {
          return (
            <a href={href} rel="noreferrer noopener" target="_blank">
              {content}
            </a>
          );
        }
        return content;
      },
    }),
    [routeToPage],
  );

  // Overflow is measured from the rendered height rather than the source
  // length: the same text is two lines wide on a desktop and six on a phone.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // The full height is kept too: `max-height: none` can't be transitioned,
    // so expanding animates to this pixel value instead.
    const measure = () => {
      setContentHeight(content.scrollHeight);
      setIsOverflowing(content.scrollHeight > collapsedHeight + 4);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  if (!savedText.length) return null;

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isOverflowing) return;
    const target = event.target as HTMLElement;
    // Links, mentions and images handle their own clicks.
    if (
      target.closest("a") ||
      target.closest(".mention-tag") ||
      target.tagName === "IMG" ||
      target.closest(".inline-image-container")
    ) {
      return;
    }
    setExpanded((value) => !value);
  };

  return (
    <S.Container $accent={null}>
      <S.ContentWrapper
        $animating={false}
        $noClip={false}
        onClick={handleContentClick}
        style={{
          cursor: isOverflowing ? "pointer" : undefined,
          maxHeight: !isOverflowing
            ? "none"
            : `${expanded ? contentHeight : collapsedHeight}px`,
        }}
      >
        <S.SavedContent ref={contentRef}>
          {renderRichText(nodes, components)}
        </S.SavedContent>
        {!expanded && isOverflowing && <S.FadeOverlay />}
      </S.ContentWrapper>

      {isOverflowing && (
        <S.Toggle onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show less..." : "Read more..."}
        </S.Toggle>
      )}

      {viewerSrc && (
        <AppImageViewer
          onOpenChange={(open) => {
            if (!open) setViewerSrc(null);
          }}
          open
          src={viewerSrc}
        />
      )}
    </S.Container>
  );
};
