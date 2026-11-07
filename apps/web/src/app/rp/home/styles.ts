import { css, styled } from "styled-components";
import { FOCUS_RING, GLASS, MATERIAL_CARD, Z_INDEX } from "@/theme";
import { shimmerMove, spin } from "@/theme/animations";

// ─── Feed shimmer ─────────────────────────────────────────────────────────────

export const SpinnerRing = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--bg-6);
  border-top-color: var(--accent);
  animation: ${spin} 0.7s linear infinite;
`;

/* Washes rather than --bg steps, so placeholders sit inside the translucent
   cards the same way the real content will. */
const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--fill-hover) 25%,
    var(--fill-pressed) 50%,
    var(--fill-hover) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

export const FeedShimmerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(480px, 100%);

  /* One ghost per list now, so the rails can sit between them. */
  & + & {
    margin-top: 16px;
  }
`;

export const FeedShimmerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 20px;
  ${MATERIAL_CARD}
`;

export const ShimmerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ShimmerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  ${shimmer}

  @media (max-width: 430px) {
    width: 36px;
    height: 36px;
  }
`;

export const ShimmerLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const ShimmerLine = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 6px;
  ${shimmer}
`;

export const ShimmerBlock = styled.div<{ $height?: string }>`
  height: ${({ $height }) => $height ?? "120px"};
  width: 100%;
  border-radius: 8px;
  ${shimmer}
`;

// ─── Carousel card shimmers ───────────────────────────────────────────────────

/** Matches MusePreviewCard dimensions (240 × 420, 140 × 245 mobile). */
export const MuseCardShimmer = styled.div`
  flex-shrink: 0;
  width: 240px;
  height: 420px;
  border-radius: 16px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 140px;
    height: 245px;
  }
`;

/** Matches StoryCard dimensions (200 × 392 desktop, 158 × 321 mobile). */
export const StoryCardShimmer = styled.div`
  flex-shrink: 0;
  /* Cover (2:3 of width) + info panel, matching the redesigned StoryCard. */
  width: 200px;
  height: calc(200px * 1.5 + 92px);
  border-radius: 16px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 158px;
    height: calc(158px * 1.5 + 84px);
  }
`;

/** Matches NovelistPreviewCard dimensions (240 × 344, 160 × 248 mobile). */
export const NovelistCardShimmer = styled.div`
  flex-shrink: 0;
  width: 240px;
  height: 344px;
  border-radius: 16px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 160px;
    height: 248px;
    border-radius: 14px;
  }
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 0.5em;
`;

export const Button = styled.button`
  padding: 0.5em 1em;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--accent-hover);
  }
`;

/** Single-column page body, centered like the profile page. The outer
 * main.page-container owns scrolling — no fixed height, no internal scroll
 * container here.
 *
 * No surface of its own. This used to be an opaque --bg-2 slab around the
 * whole column, which hid the page's ambient light and left the cards inside
 * it nothing to be lifted off. The rails and feed cards are the surfaces now,
 * sitting straight on the page. */
export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  max-width: 900px;
  margin: 4px auto 24px;
  padding: 8px 16px 16px;

  @media (max-width: 600px) {
    margin-block: 0;
    padding: 0;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 22px;

  @media (max-width: 600px) {
    margin-top: 18px;
  }
`;

/** The composer at the top of Home: the feed cards' width (800px at most,
 * centred), so the pill and the inline composer line up with the posts. */
export const ComposeWrap = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 8px auto 0;
`;

/** The "continue reading" bookmark and its heading: the feed cards' width
 * (`Prompt`'s and `ActivityBox`'s wrappers — 800px at most, centred, 8px in
 * from each side once the screen is narrower), so the card lines up with
 * the posts under it and the heading with their edge. */
export const ContinueReadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin-inline: auto;

  @media screen and (max-width: 800px) {
    width: calc(100% - 16px);
  }
`;

export const ActivityContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 22px;
  padding-bottom: 20px;
`;

/** Section heading for each shelf.
 *
 * Was an 18px light italic, centred — the thinnest weight at the largest size,
 * so the sections read as captions rather than structure, and it shrank to
 * 10px in narrow containers. Now a small semibold eyebrow on the leading edge,
 * with a hairline running out to the column edge: the shelf, without a box. */
export const SubText = styled.h2`
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px;
  padding-inline: 4px;
  font-family: var(--font);
  font-size: 12px;
  font-weight: var(--font-weight-semi-bold);
  letter-spacing: 0.14em;
  line-height: 1.3;
  text-transform: uppercase;
  text-align: left;
  color: var(--text-secondary);

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--material-edge), transparent);
  }

  @media (max-width: 600px) {
    padding-inline: 12px;
    font-size: 11px;
  }
`;

export const PartitionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 12px;
  /* Room above and below for the cards' hover lift and drop shadow, which
     the row's own overflow-x box would otherwise clip. */
  padding: 6px 4px 16px;
  overflow-x: auto;

  @media (max-width: 600px) {
    gap: 8px;
    padding-inline: 12px;
    scroll-padding-inline: 12px;
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover {
    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  }
`;

/** Positioning context for a PartitionContainer row plus its
 * left/right ScrollNavButtons. */
export const ScrollRowWrap = styled.div`
  position: relative;
  width: 100%;
  /* The nav arrows carry Z_INDEX.SCROLL_JUMP (40), which outranks the
     sticky TopBar (10) in the shared page-container stacking context: without
     a local stacking context here they paint over the top bar as the row
     scrolls underneath it. */
  isolation: isolate;
`;

/** Circular scroll-by-one-page button overlaid on a horizontal row's edge. */
export const ScrollNavButton = styled.button<{
  $side: "left" | "right";
  $visible: boolean;
}>`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === "left" ? "left: 2px;" : "right: 2px;")}
  z-index: ${Z_INDEX.SCROLL_JUMP};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--text);
  /* Floats over the row's cover art: the thin glass variant. */
  ${GLASS("clear")}
  border: 1px solid var(--glass-edge);
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.18s ease, background 0.15s ease, color 0.15s ease,
    border-color 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  @media (hover: hover) {
    &:hover {
      background-color: var(--glass-fill-panel);
    }
  }

  &:active {
    transform: translateY(-50%) scale(0.92);
  }

  ${FOCUS_RING}
`;

/** Placeholder card at the end of a horizontal carousel that loads the next page. */
export const NextPageCard = styled.button<{ $height?: string }>`
  all: unset;
  box-sizing: border-box;
  flex-shrink: 0;
  /* Match MusePreviewCard sizing */
  width: 240px;
  min-width: 240px;
  height: ${({ $height }) => $height ?? "420px"};
  border-radius: 16px;
  border: 1.5px dashed color-mix(in srgb, var(--bg-12) 20%, transparent);
  background: var(--material-fill);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      border-color: var(--accent-11, var(--accent));
      color: var(--accent-11, var(--accent));
      background: var(--fill-hover);
    }
  }

  &:active:not(:disabled) {
    background: var(--fill-pressed);
  }

  ${FOCUS_RING}

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  @media (max-width: 600px) {
    width: 140px;
    min-width: 140px;
    height: ${({ $height }) => $height ?? "245px"};
  }
`;

/** Same shape as NovelistPreviewCard (240px wide; height = Banner + Body content). */
export const NextPageNovelistCard = styled(NextPageCard)`
  width: 240px;
  min-width: 240px;
  height: auto;
  min-height: 360px;
  border-radius: 16px;

  @media (max-width: 600px) {
    width: 160px;
    min-width: 160px;
    min-height: 265px;
    border-radius: 14px;
  }
`;

/** A shelf dealt into the feed between posts (see `RAIL_SLOTS` in page.tsx).
 *
 * The same frame as the feed's cards (`PromptRoot`, the activity box's
 * `ParentContainer`): 800px at most, centred, and 8px in from each edge once
 * the screen is narrower than that, so a rail does not stick out past the
 * posts either side of it. The card row and the heading drop their own inset
 * so the first card lines up with the posts' edges. Air above and below so
 * it reads as a change of subject rather than one more card.
 *
 * Declared after `PartitionContainer` and `SubText`: it selects them, and a
 * styled component cannot be referenced before it exists. */
export const FeedRail = styled(ContentContainer)`
  max-width: 800px;
  margin: 12px auto 24px;

  ${SubText} {
    padding-inline: 2px;
  }

  ${PartitionContainer} {
    padding-inline: 0;
    scroll-padding-inline: 0;
  }

  @media screen and (max-width: 800px) {
    width: calc(100% - 16px);
  }

  @media (max-width: 600px) {
    margin-block: 8px 20px;
  }
`;
