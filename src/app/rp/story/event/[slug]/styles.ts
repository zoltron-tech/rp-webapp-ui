import styled, { css, keyframes } from "styled-components";
import type { AsterismLineVariant } from "@/components/asterism-styles";
import { ASTERISM_LINE_CSS } from "@/components/asterism-styles/line-css";
import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";
import { shimmerMove } from "@/theme/animations";

/* ────────────────────────────────────────────────────────────────────────
   Storybook reader — a warm, paper-like reading surface where the event and
   its threads read as one continuous piece of prose. Two presentations share
   these tokens: a vertical "scroll" reader and a paginated desktop "book".
   ──────────────────────────────────────────────────────────────────────── */

const DISPLAY_SERIF = `"PlayfairDisplaySC", "BodoniModaSC", Georgia, serif`;
const READING_SERIF = `"ZillaSlab", Georgia, "Times New Roman", serif`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* Shared reading-typography applied to the surrounding chrome. The rich-text
   renderer keeps its own inline fonts; untyped prose inherits this serif so
   the page reads like a book. */
const readingType = css`
  font-family: ${READING_SERIF};
  color: var(--text);
`;

/* ── Page frame ─────────────────────────────────────────────────────────── */

export const ParentContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  width: 100%;
  z-index: ${Z_INDEX.CARD};
  /* No top padding — the reader's own sticky TopBar sits flush under the app
     top bar instead of leaving a gap above it. */
  padding: 0 24px 96px;
  background:
    radial-gradient(
        140% 120% at 50% -10%,
        color-mix(in srgb, var(--accent) 6%, transparent),
        transparent 60%
      )
      no-repeat,
    var(--bg-1);

  @container content-container (max-width: 800px) {
    padding: 0 0 72px;
  }
`;

/* Top navigation / breadcrumb strip — quiet, gets out of the way. */
export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 780px;
  margin-bottom: 6px;
  padding: 10px 6px;
  border-bottom: 1px solid var(--bg-4);
  position: sticky;
  /* Sits below the app's own sticky top bar rather than at the same top:0
     — both stack at 0 otherwise, and this one (painted later) ends up
     hidden underneath it once scrolled. */
  top: var(--topbar-height, 60px);
  z-index: ${Z_INDEX.TOPBAR};
  background: color-mix(in srgb, var(--bg-1) 92%, transparent);
  backdrop-filter: blur(8px);

  @container content-container (max-width: 800px) {
    max-width: 100%;
    padding: 14px 16px;
    margin-bottom: 4px;
  }
`;

export const BackButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: var(--bg-3);
    color: var(--accent);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const Breadcrumb = styled.button`
  all: unset;
  cursor: pointer;
  font-family: ${DISPLAY_SERIF};
  font-size: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;

  &:hover {
    color: var(--text);
  }
`;

export const TopBarSpacer = styled.div`
  flex: 1;
`;

/* Bookmark controls in the top bar: save the current spot, or jump to the
   saved one ($accent — rendered as a filled ribbon once a bookmark exists). */
export const BookmarkButton = styled(BackButton)<{ $accent?: boolean }>`
  width: 36px;
  height: 36px;
  color: ${(p) => (p.$accent ? "var(--accent)" : "var(--text)")};
`;

/* Small centered toggle under every passage divider in the scroll reader —
   quiet until hovered, except on the passage that's already bookmarked
   (always shown, so the reader can always see where they left off). Tapping
   it bookmarks that passage, or clears the bookmark if it's already there. */
export const PassageBookmarkToggle = styled.button<{ $active?: boolean }>`
  all: unset;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: -12px 0 12px;
  padding: 2px 0;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-secondary)")};
  font-family: var(--font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: ${(p) => (p.$active ? 1 : 0.3)};
  transition: opacity 0.2s ease, color 0.15s ease;

  svg {
    width: 11px;
    height: 11px;
  }

  &:hover {
    opacity: 1;
    color: var(--accent);
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (hover: none) {
    opacity: ${(p) => (p.$active ? 1 : 0.55)};
  }
`;

export const MemberStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;

  /* Overlap avatars like a reading party. */
  & > * + * {
    margin-left: -10px;
  }
`;

export const Avatar = styled(Common.Avatar)`
  border: 2px solid var(--bg-1);
  border-radius: 50%;

  @container content-container (max-width: 500px) {
    & {
      --size: 30px;
    }
  }
`;

/* ── Reading-mode segmented toggle (desktop only) ───────────────────────── */

export const ModeToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-4);
  flex-shrink: 0;
`;

export const ModeButton = styled.button<{ $active?: boolean }>`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${(p) => (p.$active ? "var(--text)" : "var(--text-secondary)")};
  background-color: ${(p) => (p.$active ? "var(--bg-1)" : "transparent")};
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0, 0, 0, 0.22)" : "none")};
  transition: color 0.15s ease, background-color 0.15s ease;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    color: var(--text);
  }
`;

/* ── The book / paper column ────────────────────────────────────────────── */

export const Book = styled.article`
  ${readingType};
  position: relative;
  width: 100%;
  max-width: 780px;
  padding: 56px clamp(28px, 6vw, 72px) 64px;
  border-radius: 10px;
  background:
    linear-gradient(
      to right,
      color-mix(in srgb, var(--accent) 5%, transparent),
      transparent 4%,
      transparent 96%,
      color-mix(in srgb, var(--accent) 5%, transparent)
    ),
    var(--bg-2);
  border: 1px solid var(--bg-4);
  box-shadow:
    0 1px 0 color-mix(in srgb, var(--bg-12) 6%, transparent) inset,
    0 30px 60px -30px rgba(0, 0, 0, 0.5),
    0 12px 24px -18px rgba(0, 0, 0, 0.35);
  animation: ${fadeUp} 0.4s ease both;

  @container content-container (max-width: 800px) {
    max-width: 100%;
    padding: 24px 20px 40px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }
`;

/* ── Title page (the event) ─────────────────────────────────────────────── */

/* Chapter song pill — sits just under the top bar so it stays available while
   reading in either mode. Distinct from a novelist's profile-song pill: this
   one plays the song chosen for this chapter. */
export const ChapterSong = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 460px;
  margin-block: 2px 10px;

  & > * {
    width: 100%;
  }
`;

export const TitlePage = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
`;

export const CoverFrame = styled.div`
  position: relative;
  width: 250px;
  height: 375px;
  margin-bottom: 30px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--bg-3);
  box-shadow:
    0 2px 0 color-mix(in srgb, var(--bg-12) 10%, transparent),
    0 18px 40px -18px rgba(0, 0, 0, 0.6);

  /* thin inner keyline like a plate illustration */
  &::after {
    content: "";
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 2px;
    pointer-events: none;
  }

  .cover-image {
    width: 100%;
    height: 100%;
  }

  @container content-container (max-width: 500px) {
    width: 168px;
    height: 252px;
  }
`;

export const EyebrowRule = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 11px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  margin-bottom: 16px;

  &::before,
  &::after {
    content: "";
    width: 34px;
    height: 1px;
    background: currentColor;
    opacity: 0.5;
  }
`;

export const EventTitle = styled.h1`
  font-family: ${DISPLAY_SERIF};
  font-weight: 700;
  font-size: clamp(30px, 5vw, 46px);
  line-height: 1.12;
  letter-spacing: 0.01em;
  color: var(--text);
  margin: 0 0 18px;
  text-wrap: balance;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 18px;
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: 12.5px;
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

/* Decorative asterism used to open the narration and separate scenes. Its
   rule treatment per style lives in `@/components/asterism-styles` so the
   style picker's preview always matches what renders here. */
export const Asterism = styled.div<{
  $tight?: boolean;
  $variant?: AsterismLineVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: ${(p) => (p.$tight ? "26px 0" : "34px 0")};
  color: var(--text-secondary);
  user-select: none;

  &::before,
  &::after {
    content: "";
    height: 1px;
    width: min(90px, 22%);
    ${(p) => ASTERISM_LINE_CSS[p.$variant ?? "gradient"]}
  }
  &::before {
    --dir: right;
  }
  &::after {
    --dir: left;
  }

  .glyph {
    font-family: ${DISPLAY_SERIF};
    font-size: 15px;
    letter-spacing: 0.4em;
    padding-left: 0.4em;
    opacity: 0.8;
  }
`;

/* ── Prose ──────────────────────────────────────────────────────────────── */

/* The opening narration (event description). Gets a drop cap so the story
   opens like a chapter. */
export const Overture = styled.div`
  font-size: 17px;

  /* Drop cap on the very first paragraph of the narration. Falls back
     gracefully when the block starts with media (::first-letter simply won't
     apply). */
  & > div > div > *:first-child::first-letter {
    float: left;
    font-family: ${DISPLAY_SERIF};
    font-weight: 700;
    font-size: 3.4em;
    line-height: 0.72;
    padding: 6px 10px 0 0;
    color: var(--accent);
  }
`;

/* A single thread rendered as a continuous passage — no cards, no hard rules.
   Controls fade in on hover so the reading surface stays calm. */
export const Passage = styled.section`
  position: relative;
  scroll-margin-top: 80px;

  /* Slightly larger, book-weight reading size for thread prose. */
  font-size: 16.5px;
`;

/* Byline set as marginalia — a small-caps attribution that closes the passage
   without breaking the flow. */
export const ByLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 10px;
  /* Fixed height whether or not the edit/delete controls are in it: a passage
     must measure the same for a member, a visitor, and the book — that is what
     makes the page breaks identical everywhere. */
  min-height: 22px;
  font-family: var(--font);
  font-size: 11.5px;
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

  .spacer {
    flex: 1;
  }

  .thread-action {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 3px 5px;
    border-radius: 5px;
    color: var(--text-secondary);
    opacity: 0;
    transition: opacity 0.2s ease, color 0.15s ease, background-color 0.15s ease;
  }

  ${Passage}:hover & .thread-action,
  & .thread-action:focus-visible {
    opacity: 1;
  }

  @media (hover: none) {
    .thread-action {
      opacity: 0.7;
    }
  }

  .thread-action:hover {
    color: var(--text);
    background-color: var(--bg-4);
  }

  .thread-action.danger:hover {
    color: var(--tomato-9, #e5484d);
    background-color: color-mix(
      in srgb,
      var(--tomato-9, #e5484d) 14%,
      transparent
    );
  }
`;

export const ThreadFlow = styled.div`
  display: flex;
  flex-direction: column;
`;

/* One item of the paginated chapter flow (the title/overture block, or one
   passage). `flow-root` keeps child margins and floated images inside the box,
   so the height the page packer measures is the height the item really takes. */
export const ChapterFlowItem = styled.div`
  display: flow-root;

  /* Nothing embedded may be taller than the page it sits on — otherwise no
     amount of keep-together can stop a break falling through it. The cap is
     set per view from the story's page format. */
  /* Anything long and unbroken — a URL, a pasted token — wraps rather than
     pushing the column wider than its container. */
  overflow-wrap: break-word;

  img,
  video,
  iframe,
  canvas {
    /* Never wider than the column. Without this an image at its natural size
       overflows the measure on a narrow screen and takes the prose with it. */
    max-width: 100%;
    height: auto;
    max-height: var(--nw-page-media-max, none);
    object-fit: contain;
  }
`;

/* Quiet centered control for fetching the next/previous chunk of passages in
   the scroll reader. */
export const LoadMoreButton = styled.button`
  all: unset;
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 18px auto;
  padding: 8px 22px;
  border-radius: 999px;
  border: 1px solid var(--bg-4);
  background-color: var(--bg-2);
  cursor: pointer;
  font-family: ${DISPLAY_SERIF};
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    color: var(--accent);
    border-color: var(--accent);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

/* Gentle empty state when a chapter has no passages yet. */
export const EmptyPassages = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 15px;
  padding: 28px 0 8px;
`;

/* ── Composer region ────────────────────────────────────────────────────── */

export const ComposerWrap = styled.div`
  width: 100%;
  max-width: 780px;
  margin-top: 26px;

  .separator {
    height: 1px;
    width: 100%;
    background: linear-gradient(
      to right,
      transparent,
      var(--bg-5),
      transparent
    );
    margin-bottom: 16px;
    border: none;
  }

  @container content-container (max-width: 800px) {
    max-width: 100%;
    padding: 0;
  }
`;

export const ComposerHint = styled.div`
  font-family: ${DISPLAY_SERIF};
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 14px;
`;

export const EditingBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px 8px 0 0;
  background-color: var(--bg-3);
  border-left: 3px solid var(--accent);
  font-size: var(--font-size-small);

  button {
    all: unset;
    cursor: pointer;
    color: var(--accent);
    font-weight: 600;

    &:hover {
      color: var(--accent-hover);
    }
  }
`;

/* ────────────────────────────────────────────────────────────────────────
   Book mode — a paginated two-page spread with page-turn controls.
   ──────────────────────────────────────────────────────────────────────── */

export const BookStage = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  /* A gutter so the paper never sits flush against the screen edge. The page
     geometry is derived from this element's inner width, so the pages resize
     to suit rather than overflowing it. */
  padding-inline: clamp(8px, 2vw, 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeUp} 0.4s ease both;
`;

export const Spread = styled.div`
  position: relative;
  width: 100%;
  /* Fallback shape only — book-view.tsx sets the real ratio inline from the
     story's page format (two pages side by side). This holds the stage's shape
     before the JS scale is computed, so height isn't stuck at 0 while width
     snaps to 100%. Without it the two dimensions open out of sync on mount. */
  aspect-ratio: 2 / 1.5;
  border-radius: 8px;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease;
  background:
    linear-gradient(var(--bg-2), var(--bg-2)) padding-box,
    linear-gradient(
        135deg,
        color-mix(in srgb, var(--bg-12) 12%, transparent),
        transparent 40%
      )
      border-box;
  border: 1px solid var(--bg-4);
  /* Stacked hairlines under the bottom edge suggest the closed page block. */
  box-shadow:
    0 2px 0 -1px var(--bg-2),
    0 3px 0 -1px var(--bg-5),
    0 5px 0 -2px var(--bg-2),
    0 6px 0 -2px var(--bg-5),
    0 9px 0 -4px var(--bg-2),
    0 10px 0 -4px var(--bg-5),
    0 40px 80px -40px rgba(0, 0, 0, 0.6),
    0 16px 30px -22px rgba(0, 0, 0, 0.4);
`;

/* Fore-edge page block: thin stacked hairlines drawn in the outer margin of a
   page so the reader can see there are more pages waiting on that side — shown
   on the left only when earlier pages exist, on the right only when later ones
   do. Sits over the blank page margin, under the spine, reveal and nav chrome.
   The lines are crispest at the outer edge and fade toward the text. */
export const PageStack = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  top: 8px;
  bottom: 8px;
  ${(p) => (p.$side === "left" ? "left: 0;" : "right: 0;")}
  width: 16px;
  pointer-events: none;
  z-index: 2;

  background:
    /* Individual leaf edges: a hairline every 3px. */
    repeating-linear-gradient(
      to ${(p) => (p.$side === "left" ? "right" : "left")},
      color-mix(in srgb, var(--bg-12) 13%, transparent) 0,
      color-mix(in srgb, var(--bg-12) 13%, transparent) 1px,
      transparent 1px,
      transparent 3px
    ),
    /* Soft grounding shadow where the block meets the page. */
    linear-gradient(
      to ${(p) => (p.$side === "left" ? "right" : "left")},
      color-mix(in srgb, var(--bg-12) 16%, transparent),
      transparent 90%
    );

  /* Fade the leaves out toward the inner (text) side so the block reads as
     receding into the page rather than a hard band. */
  mask-image: linear-gradient(
    to ${(p) => (p.$side === "left" ? "right" : "left")},
    black,
    black 25%,
    transparent
  );
`;

/* Center spine: a soft gutter shadow that sells the fold between pages. */
export const Spine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 60px;
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
`;

/* The book page at its fixed design size. The whole element is scaled as one
   unit (inline \`transform: scale\`) to fit the screen, so the words per line
   and the page breaks are identical on every monitor. Padding must match the
   DESIGN_PAD_X/Y constants in book-view.tsx. */
export const ScaledPage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  padding: 52px 60px;
  transform-origin: top left;
  transition: transform 0.3s ease;
`;

/* ── The book spread, built from the shared page model ──────────────────────
   Both halves of the spread are windows onto the very same packed chapter the
   scrolling manuscript renders: each shows the slice of the flow that belongs
   to its page number. Nothing is re-flowed here, so a page holds exactly what
   the author saw it holding while writing. */

/** Both pages at their fixed design size, scaled as one unit. */
export const BookPages = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  transform-origin: top left;
  transition: transform 0.3s ease;
`;

/** One page of paper in the spread. */
export const BookSheet = styled.div`
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  background: var(--bg-2);
  overflow: hidden;
`;

/** The clipped window showing this page's slice of the chapter. */
export const BookWindow = styled.div`
  position: absolute;
  overflow: hidden;
`;

/** The chapter flow, pushed up so the window frames the right page. */
/**
 * The off-screen copy of the flow the book cuts its pages from.
 *
 * Laid out at the page's own measure, so what is measured is exactly what the
 * visible pages render. Its box is collapsed to nothing: the whole loaded
 * chapter is far taller than the spread, and an absolutely-positioned
 * descendant still extends the scroll container's overflow — left uncollapsed
 * it would add phantom scroll space under the book. Clipping does not change
 * layout sizes, so the children measure the same either way.
 */
export const BookMeasureLayer = styled.div`
  position: absolute;
  top: 0;
  left: -100000px;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
`;

export const BookWindowInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

export const BookPageNumber = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  opacity: 0.75;
  user-select: none;
`;

export const Flow = styled.div<{ $offset: number }>`
  ${readingType};
  /* height is set inline (definite px) so column-fill: auto fills the left
     page top-to-bottom before flowing onto the next column — never balanced.
     Spread changes jump instantly; the reveal curtains cover the swap. */
  column-fill: auto;
  column-gap: 60px;
  font-size: 16px;
  transform: translateX(${(p) => -p.$offset}px);

  /* Keep media and quoted dialogs from splitting across the fold. */
  img,
  video,
  .dialog-embed,
  blockquote,
  figure {
    break-inside: avoid;
  }

  /* Drop cap for the opening narration, book edition. */
  & .book-overture > div > div > *:first-child::first-letter {
    float: left;
    font-family: ${DISPLAY_SERIF};
    font-weight: 700;
    font-size: 3.2em;
    line-height: 0.72;
    padding: 4px 8px 0 0;
    color: var(--accent);
  }
`;

/* ── Page-turn reveal ───────────────────────────────────────────────────
   The flow jumps to the new spread instantly; an opaque paper curtain over
   each page half then wipes away from the top, uncovering the fresh text. The
   right half is delayed so the left page settles first. No content is cloned
   and nothing is composited over other pages, so no stale page can flash. */

/** One turn's reveal duration and the right page's head-start delay. */
const REVEAL_MS = 380;
const REVEAL_STAGGER_MS = 170;

/* Wipe the paper away from the top down while fading, so the text reads in. */
const pageReveal = keyframes`
  from {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
  to {
    opacity: 0;
    clip-path: inset(100% 0 0 0);
  }
`;

export const PageReveal = styled.div<{ $delayed?: boolean }>`
  position: absolute;
  z-index: 4;
  pointer-events: none;
  background: var(--bg-2);
  animation: ${pageReveal} ${REVEAL_MS}ms ease forwards;
  animation-delay: ${(p) => (p.$delayed ? `${REVEAL_STAGGER_MS}ms` : "0ms")};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    display: none;
  }
`;

/* Title block inside the book flow — the whole first page: cover, title,
   meta. Nothing else may share its column, so the narration always starts
   fresh on page two. */
export const BookTitleBlock = styled.div`
  break-inside: avoid;
  break-after: column;
  text-align: center;
  margin-bottom: 22px;
`;

/* Wraps the opening narration (asterism + description) so it always starts
   at the top of the next column — page two — regardless of how short the
   title page is. */
export const BookOvertureBlock = styled.div`
  break-before: column;
`;

/* Chapter plate on the book's title page — sized to sit comfortably within a
   single column above the title. */
export const BookCoverFrame = styled.div`
  position: relative;
  width: 250px;
  height: 375px;
  margin: 0 auto 22px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--bg-3);
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

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const BookEventTitle = styled.h1`
  font-family: ${DISPLAY_SERIF};
  font-weight: 700;
  font-size: clamp(24px, 2.6vw, 34px);
  line-height: 1.14;
  color: var(--text);
  margin: 0 0 10px;
  text-wrap: balance;
`;

export const BookByline = styled.div`
  margin-top: 8px;
  font-family: var(--font);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--text-secondary);

  .author {
    font-variant: small-caps;
    font-weight: 600;
    letter-spacing: 0.08em;
  }
`;

export const PageEdgeButton = styled.button<{ $side: "left" | "right" }>`
  all: unset;
  position: absolute;
  top: 0;
  bottom: 0;
  ${(p) => (p.$side === "left" ? "left: 0;" : "right: 0;")}
  width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  color: var(--text-secondary);
  transition: color 0.15s ease, background-color 0.2s ease;

  background: linear-gradient(
    to ${(p) => (p.$side === "left" ? "right" : "left")},
    color-mix(in srgb, var(--bg-3) 70%, transparent),
    transparent
  );
  opacity: 0.6;

  &:hover:not(:disabled) {
    opacity: 1;
    color: var(--accent);
  }

  &:disabled {
    opacity: 0;
    cursor: default;
    pointer-events: none;
  }

  svg {
    width: 26px;
    height: 26px;
  }
`;

export const BookFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 20px;
  color: var(--text-secondary);
`;

export const PagerButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--bg-4);
  background-color: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PageIndicator = styled.div`
  font-family: ${DISPLAY_SERIF};
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  min-width: 130px;
  text-align: center;
  color: var(--text-secondary);
`;

/* Footer control that jumps the book back to the saved bookmark. */
export const BookmarkPagerButton = styled(PagerButton)`
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 45%, var(--bg-4));

  svg {
    width: 14px;
    height: 14px;
  }
`;

/* A ribbon draped over the top edge of the page half that holds the
   bookmarked passage. Lives inside the scaled page (design units) and sits
   under the reveal curtains, so it is uncovered along with the text. */
export const BookmarkRibbon = styled.div`
  position: absolute;
  top: 0;
  width: 24px;
  height: 44px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--accent) 88%, black),
    var(--accent)
  );
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%);
  z-index: 3;
  pointer-events: none;
  opacity: 0.92;
`;

/* ── Page-turn loading shimmer ──────────────────────────────────────────
   Shown over the spread while turning to a page outside the loaded window,
   which has to fetch the next/previous chunk of threads first. Sits exactly
   over the scaled page's own box (see the inline `stageW`/`stageH` sizing in
   book-view.tsx), covering the (possibly stale) content until it resolves. */

const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--bg-3) 25%,
    var(--bg-4) 50%,
    var(--bg-3) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

export const BookLoadingShimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  gap: 60px;
  padding: 52px 60px;
  background-color: var(--bg-2);
`;

export const BookShimmerPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 6px;
`;

export const BookShimmerLine = styled.div<{
  $width?: string;
  $height?: string;
}>`
  height: ${(p) => p.$height ?? "13px"};
  width: ${(p) => p.$width ?? "100%"};
  border-radius: 4px;
  flex-shrink: 0;
  ${shimmer}
`;
