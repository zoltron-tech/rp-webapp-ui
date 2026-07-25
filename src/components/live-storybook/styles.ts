import styled, { css, keyframes } from "styled-components";

/* ────────────────────────────────────────────────────────────────────────────
   Live storybook — a compact, static preview of Novelist World's book-view
   reader (see rp/story/event/[slug]). A two-page paper spread: the left page is
   the chapter title page (cover plate → eyebrow → serif title → meta); the
   right page carries the narration and its embedded dialogue bubbles. Tokens
   are lifted from that page's styles so the preview reads like the live book —
   soft spine fold, fore-edge page blocks, page-turn chrome. Presentational
   only. On narrow screens the spread stacks into a single readable column.
   ──────────────────────────────────────────────────────────────────────────── */

const DISPLAY_SERIF = `"PlayfairDisplaySC", "BodoniModaSC", Georgia, serif`;
const READING_SERIF = `"ZillaSlab", Georgia, "Times New Roman", serif`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const readingType = css`
  font-family: ${READING_SERIF};
  color: var(--text);
`;

/* ── Stage + spread ─────────────────────────────────────────────────────── */

export const BookStage = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeUp} 0.4s ease both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Spread = styled.div`
  ${readingType};
  position: relative;
  width: 100%;
  display: flex;
  aspect-ratio: 1040 / 660;
  border-radius: 8px;
  overflow: hidden;
  background:
    linear-gradient(var(--bg-2), var(--bg-2)) padding-box,
    linear-gradient(
        135deg,
        color-mix(in srgb, var(--bg-12) 12%, transparent),
        transparent 40%
      )
      border-box;
  border: 1px solid var(--bg-4);
  box-shadow:
    0 2px 0 -1px var(--bg-2),
    0 3px 0 -1px var(--bg-5),
    0 5px 0 -2px var(--bg-2),
    0 6px 0 -2px var(--bg-5),
    0 9px 0 -4px var(--bg-2),
    0 10px 0 -4px var(--bg-5),
    0 40px 80px -40px rgba(0, 0, 0, 0.6),
    0 16px 30px -22px rgba(0, 0, 0, 0.4);

  @media (max-width: 560px) {
    flex-direction: column;
    aspect-ratio: auto;
  }
`;

/* One page half. */
export const Page = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 30px 30px;
  overflow: hidden;

  @media (max-width: 560px) {
    padding: 24px 20px;
  }
`;

/* ── Title page (left) ──────────────────────────────────────────────────── */

export const TitlePage = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

export const CoverFrame = styled.div`
  position: relative;
  width: 108px;
  height: 162px;
  margin-bottom: 18px;
  border-radius: 4px;
  overflow: hidden;
  background: center / cover no-repeat url("/images/storybook-img1.jpg"),
    var(--bg-3);
  box-shadow:
    0 2px 0 color-mix(in srgb, var(--bg-12) 10%, transparent),
    0 14px 30px -16px rgba(0, 0, 0, 0.6);

  &::after {
    content: "";
    position: absolute;
    inset: 5px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 2px;
    pointer-events: none;
  }
`;

export const EyebrowRule = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 10px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  margin-bottom: 12px;

  &::before,
  &::after {
    content: "";
    width: 26px;
    height: 1px;
    background: currentColor;
    opacity: 0.5;
  }
`;

export const EventTitle = styled.h1`
  font-family: ${DISPLAY_SERIF};
  font-weight: 700;
  font-size: clamp(22px, 3.4vw, 30px);
  line-height: 1.12;
  letter-spacing: 0.01em;
  color: var(--text);
  margin: 0 0 14px;
  text-wrap: balance;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: 11px;
  letter-spacing: 0.02em;

  span.meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  svg {
    opacity: 0.8;
  }
`;

/* ── Narration page (right) ─────────────────────────────────────────────── */

export const EyebrowContinued = styled.div`
  font-family: ${DISPLAY_SERIF};
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 12px;
`;

export const Asterism = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 0 16px;
  color: var(--text-secondary);
  user-select: none;

  &::before,
  &::after {
    content: "";
    height: 1px;
    width: min(70px, 24%);
    background: linear-gradient(var(--dir, to left), transparent, currentColor);
    opacity: 0.6;
  }
  &::before {
    --dir: to right;
  }

  .glyph {
    font-family: ${DISPLAY_SERIF};
    font-size: 13px;
    letter-spacing: 0.4em;
    padding-left: 0.4em;
    opacity: 0.8;
  }
`;

export const Overture = styled.p`
  font-size: 13.5px;
  line-height: 1.62;
  margin: 0 0 12px;

  &::first-letter {
    float: left;
    font-family: ${DISPLAY_SERIF};
    font-weight: 700;
    font-size: 3em;
    line-height: 0.72;
    padding: 5px 8px 0 0;
    color: var(--accent);
  }

  em {
    font-style: italic;
    color: var(--text-secondary);
  }
`;

export const ByLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 12px;
  font-family: var(--font);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--text-secondary);

  .author {
    font-variant: small-caps;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: color-mix(in srgb, var(--text) 78%, transparent);
  }

  .dot {
    opacity: 0.5;
  }
`;

/* ── Embedded dialogue (bubble design) ──────────────────────────────────── */

export const Dialog = styled.div<{ $right?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 7px;
  margin: 10px 0;
  flex-direction: ${(p) => (p.$right ? "row-reverse" : "row")};
`;

export const DialogAvatar = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
  margin-bottom: -3px;
`;

export const DialogContent = styled.div<{ $right?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  max-width: 82%;
  align-items: ${(p) => (p.$right ? "flex-end" : "flex-start")};
`;

export const DialogSender = styled.span<{ $right?: boolean }>`
  ${(p) => (p.$right ? "margin-right: 9px;" : "margin-left: 9px;")}
  font-size: 10px;
  color: var(--text-secondary);
`;

export const DialogBody = styled.div<{ $right?: boolean }>`
  width: fit-content;
  max-width: 100%;
  padding: 6px 11px;
  border-radius: 14px;
  border-bottom-left-radius: ${(p) => (p.$right ? "14px" : "4px")};
  border-bottom-right-radius: ${(p) => (p.$right ? "4px" : "14px")};
  background-color: var(--bg-3);
  color: var(--text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);

  font-family: ${READING_SERIF};
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
`;

/* ── Book chrome: spine, fore-edge stacks, page-turn buttons ─────────────── */

export const Spine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 48px;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 3;
  background: linear-gradient(
    to right,
    transparent,
    rgba(0, 0, 0, 0.16) 44%,
    rgba(0, 0, 0, 0.22) 50%,
    rgba(0, 0, 0, 0.16) 56%,
    transparent
  );

  @media (max-width: 560px) {
    display: none;
  }
`;

export const PageStack = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  top: 8px;
  bottom: 8px;
  ${(p) => (p.$side === "left" ? "left: 0;" : "right: 0;")}
  width: 14px;
  pointer-events: none;
  z-index: 2;

  background:
    repeating-linear-gradient(
      to ${(p) => (p.$side === "left" ? "right" : "left")},
      color-mix(in srgb, var(--bg-12) 13%, transparent) 0,
      color-mix(in srgb, var(--bg-12) 13%, transparent) 1px,
      transparent 1px,
      transparent 3px
    ),
    linear-gradient(
      to ${(p) => (p.$side === "left" ? "right" : "left")},
      color-mix(in srgb, var(--bg-12) 16%, transparent),
      transparent 90%
    );

  mask-image: linear-gradient(
    to ${(p) => (p.$side === "left" ? "right" : "left")},
    black,
    black 25%,
    transparent
  );

  @media (max-width: 560px) {
    display: none;
  }
`;

export const PageEdgeButton = styled.button<{ $side: "left" | "right" }>`
  all: unset;
  position: absolute;
  top: 0;
  bottom: 0;
  ${(p) => (p.$side === "left" ? "left: 0;" : "right: 0;")}
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  color: var(--text-secondary);
  transition: color 0.15s ease, opacity 0.2s ease;

  background: linear-gradient(
    to ${(p) => (p.$side === "left" ? "right" : "left")},
    color-mix(in srgb, var(--bg-3) 70%, transparent),
    transparent
  );
  opacity: 0.55;

  &:hover {
    opacity: 1;
    color: var(--accent);
  }

  svg {
    width: 22px;
    height: 22px;
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

/* ── Footer pager ───────────────────────────────────────────────────────── */

export const BookFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  color: var(--text-secondary);
`;

export const PagerButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--bg-4);
  background-color: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const PageIndicator = styled.div`
  font-family: ${DISPLAY_SERIF};
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  min-width: 120px;
  text-align: center;
  color: var(--text-secondary);
`;
