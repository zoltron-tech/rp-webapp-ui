import styled, { keyframes } from "styled-components";
import { CARD_BORDER, Z_INDEX } from "@/theme";
import { MobileSheet } from "../profile-more-dropdown/styled";

/* 6:9 (2:3) portrait cover, locked regardless of the info panel's height. */
export const Cover = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--bg-4);
  flex-shrink: 0;

  .cover-image {
    width: 100%;
    height: 100%;
    transition: transform 0.35s ease;
  }
`;

/* Darkens the top (visibility badge) and bottom (fandom + genres) of the cover
   so overlaid chips stay legible on light artwork. */
export const CoverScrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    transparent 26%,
    transparent 58%,
    rgba(0, 0, 0, 0.55) 100%
  );
`;

export const CoverBadge = styled.span<{ $public?: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  background: ${(p) =>
    p.$public
      ? "color-mix(in srgb, var(--accent) 82%, black)"
      : "rgba(0, 0, 0, 0.62)"};
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

  svg {
    width: 11px;
    height: 11px;
  }

  /* Real viewport check, not a container query: the layout's content column
     is squeezed under 1000px by the fixed sidebar reserves on effectively
     every desktop width once the sidebars are showing (>= 1300px), so a
     container query here would keep this in its "narrow" state on desktop
     too. */
  @media (max-width: 600px) {
    .badge-label {
      display: none;
    }
    padding: 5px;
  }
`;

/* Chapter count pinned to the cover's bottom-right corner. */
export const CoverChapterBadge = styled.span`
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);

  svg {
    width: 12px;
    height: 12px;
    color: var(--accent);
  }
`;

/* Like count + toggle pinned to the cover's bottom-left corner. */
export const CoverHeartBadge = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  cursor: pointer;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  transition: transform 0.1s ease;

  svg {
    width: 12px;
    height: 12px;
    color: ${(p) => (p.$active ? "var(--tomato-9)" : "#fff")};
  }

  &:active {
    transform: scale(0.94);
  }
`;

/* Vertical, lightly-overlapping stack of author/co-author avatars pinned to
   the cover's top-left corner. */
export const CoverAuthorsRail = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const CoverAuthorAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-4);
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  margin-top: -6px;

  &:first-child {
    margin-top: 0;
  }
`;

export const CoverAuthorOverflow = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-top: -6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  border: 2px solid rgba(255, 255, 255, 0.7);
  color: #fff;
  font-size: 9px;
  font-weight: var(--font-weight-semi-bold);
`;

export const Info = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  padding: 10px 11px 12px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  line-height: 1.25;
  color: var(--text);
  /* Single line; trim with an ellipsis when the title is too long to fit. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 600px) {
    font-size: var(--font-size-small);
  }
`;

/* Fandom chip, shown underneath the title — mirrors the muse profile's
   solid-color FandomValue chip (color-coded, uppercase, dot marker). */
export const CardFandom = styled.span<{ $color: string }>`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  min-width: 0;
  padding: 3px 9px 3px 7px;
  border-radius: 4px;
  background: ${(p) => p.$color};
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }
`;

export const GenreDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 0 1px color-mix(in srgb, ${(p) => p.$color} 45%, transparent);
`;

/* Placeholder tile shown for the "Add New" (empty) storyboard. */
export const AddTileInner = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  aspect-ratio: 2 / 3;
  color: var(--text-secondary);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: var(--font-size-small);

  svg {
    width: 28px;
    height: 28px;
    color: var(--accent);
  }
`;

/* The clickable poster: a 2:3 cover stacked above a solid info panel. */
export const Card = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--bg-2);
  ${CARD_BORDER};
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease,
    border-color 0.22s ease;

  /* hover:hover excludes touch devices — otherwise :hover sticks after a tap
     until the next tap elsewhere, which reads as a stuck/broken card. */
  @media (hover: hover) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
      border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    }

    &:hover ${Cover} .cover-image {
      transform: scale(1.05);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &.new {
    background: linear-gradient(
      ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
    );
    border-style: dashed;
  }
`;

/* Sizing shell: fixes the tile width; height flows from cover (2:3) + info. */
export const CardWrapper = styled.div`
  --card-w: 200px;
  position: relative;
  width: var(--card-w);
  min-width: var(--card-w);
  z-index: ${Z_INDEX.CARD};

  &.own ${Card} {
    border: 2px solid var(--accent);
  }

  &.profile {
    --card-w: 150px;
  }

  @media (max-width: 600px) {
    --card-w: 158px;
  }
`;

// ─── Shared detail bits (author, stats, members, chapters) ──────────────────

export const VisibilityBadge = styled.span<{ $public?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => (p.$public ? "var(--text)" : "var(--text-secondary)")};
  background: ${(p) =>
    p.$public
      ? "color-mix(in srgb, var(--accent) 26%, transparent)"
      : "color-mix(in srgb, var(--text-secondary) 16%, transparent)"};
  border: 1px solid
    ${(p) =>
      p.$public
        ? "color-mix(in srgb, var(--accent) 45%, transparent)"
        : "color-mix(in srgb, var(--text-secondary) 24%, transparent)"};

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const PreviewMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`;

export const CreatorsRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const StatChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-secondary) 12%, transparent);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;

  b {
    color: var(--text);
  }

  svg {
    width: 14px;
    height: 14px;
    color: var(--accent);
  }
`;

/* Heart reaction chip, styled to match StatChip but interactive. */
export const HeartStatChip = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--tomato-9) 20%, transparent)"
      : "color-mix(in srgb, var(--text-secondary) 12%, transparent)"};
  color: ${(p) => (p.$active ? "var(--tomato-9)" : "var(--text-secondary)")};

  b {
    color: ${(p) => (p.$active ? "var(--tomato-9)" : "var(--text)")};
  }

  svg {
    width: 14px;
    height: 14px;
    color: var(--tomato-9);
  }

  &:active {
    transform: scale(0.94);
  }
`;

export const HeartCountText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const TagPill = styled.span`
  padding: 3px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
`;

/* Colored pill for a curated genre; tinted with the genre's own color. */
export const GenrePill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, ${(p) => p.$color} 18%, transparent);
  color: ${(p) => p.$color};
  border: 1px solid color-mix(in srgb, ${(p) => p.$color} 40%, transparent);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${(p) => p.$color};
    flex-shrink: 0;
  }
`;

/* Genre row shown underneath the fandom chip: as many genres as fit get a
   full colored chip, the rest fall back to a small color dot — all confined
   to a single, non-wrapping row. */
export const CardGenreRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  min-width: 0;
  overflow: hidden;

  ${GenrePill} {
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${GenreDot} {
    flex-shrink: 0;
  }
`;

/* Compact chip announcing the story's fandom. */
export const FandomChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px 11px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);

  svg {
    width: 13px;
    height: 13px;
    color: var(--accent);
    flex-shrink: 0;
  }

  b {
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const MemberStack = styled.div`
  display: flex;
  align-items: center;
`;

export const MemberStackAvatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-4);
  border: 2px solid var(--bg-2);
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`;

export const MemberStackOverflow = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-left: -8px;
  border-radius: 50%;
  background: var(--bg-4);
  border: 2px solid var(--bg-2);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
`;

export const SectionLabel = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
`;

/* Horizontal, swipeable row of cast (muse) avatars shown in the preview. */
export const CastRow = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin-top: 8px;
  padding: 4px 2px 2px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CastChip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  width: 56px;
`;

export const CastAvatar = styled.img`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-4);
  border: 2px solid var(--bg-2);
`;

export const CastAvatarFallback = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 70%);
  color: #fff;
  font-weight: var(--font-weight-bold);
  border: 2px solid var(--bg-2);
`;

export const CastName = styled.span`
  max-width: 56px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Positioning context for the rail and its left/right nav arrows. */
export const ChapterRailWrap = styled.div`
  position: relative;
  margin-top: 10px;
`;

/* Circular scroll arrow overlaid on the rail's edge (desktop pointer only). */
export const ChapterRailNav = styled.button<{
  $side: "left" | "right";
  $visible: boolean;
}>`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: calc(50% - 5px);
  ${(p) => (p.$side === "left" ? "left: 2px;" : "right: 2px;")}
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--text);
  background: color-mix(in srgb, var(--bg-1) 80%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: translateY(-50%)
    ${(p) => (p.$visible ? "scale(1)" : "scale(0.8)")};
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  transition: opacity 0.18s ease, transform 0.18s ease, background 0.15s ease,
    color 0.15s ease, border-color 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: var(--accent);
    color: #fff;
    border-color: transparent;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Touch devices scroll the rail by swiping — arrows aren't needed. */
  @media (pointer: coarse) {
    display: none;
  }
`;

/* Horizontal, scrollable rail of chapter cover tiles — a Netflix-style row. */
export const ChapterRail = styled.div`
  display: flex;
  gap: 10px;
  padding-bottom: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--text-secondary) 38%, transparent)
    transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-secondary) 34%, transparent);
    border-radius: 999px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--text-secondary) 55%, transparent);
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const ChapterTile = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  width: 118px;
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  scroll-snap-align: start;
  background: var(--bg-4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease;

  .cover-image {
    width: 100%;
    height: 100%;
  }

  &:hover {
    transform: translateY(-3px) scale(1.03);
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.5);
  }

  &:active {
    transform: translateY(-1px) scale(1.01);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const ChapterTileScrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.2) 44%,
    transparent 66%
  );
`;

export const ChapterTileIndex = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--accent) 88%, black);
  color: #fff;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
`;

export const ChapterTileName = styled.span`
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 7px;
  z-index: 1;
  color: #fff;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.75);
`;

export const EmptyNote = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-style: italic;
`;

// ─── Mobile preview tray (Netflix-style) ───────────────────────────────────

/* Outer frame — a blurred, over-scaled copy of the cover image bleeds through
 * the top/side padding gap to form a glossy, image-tinted border along the top
 * edge of the tray. Negative inline margin cancels the shared sheet's 18px
 * padding to reach the sheet edges. Mirrors StoryCardEvent. */
export const TrayFrame = styled.div`
  position: relative;
  margin: 0 -18px;
  padding: 2.5px 2.5px 0;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.5),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.18);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(to bottom, transparent 42%, var(--bg-4) 82%);
  }
`;

export const TrayFrameGlow = styled.div`
  position: absolute;
  inset: -14%;
  z-index: 0;
  pointer-events: none;
  filter: blur(18px) saturate(2) brightness(1.15);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const TrayHero = styled.div`
  position: relative;
  z-index: 1;
  /* Banner-style cover, sized to fill more of the tray while the body below
     scrolls on smaller viewports (down to 375×667). */
  height: clamp(200px, 46vw, 220px);
  overflow: hidden;
  border-radius: 14px 14px 0 0;

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const TrayHeroScrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 42%,
    color-mix(in srgb, var(--bg-2) 55%, transparent) 78%,
    var(--bg-2) 100%
  );
`;

export const TrayDragHandle = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
`;

export const TrayHeaderActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TrayHeaderButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.12s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:active {
    background: rgba(0, 0, 0, 0.72);
    transform: scale(0.92);
  }
`;

export const TrayDeleteHeaderButton = styled(TrayHeaderButton)`
  &:active {
    background: color-mix(in srgb, var(--tomato-9) 70%, rgba(0, 0, 0, 0.5));
  }
`;

export const TrayCloseButton = styled(TrayHeaderButton)``;

export const TrayHeroText = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 8px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const TrayEyebrow = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.55);
`;

export const TrayTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--text);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);

  /* Keep long titles from pushing the banner text past two lines. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const TrayBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 2px 4px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* Compact the shared detail bits (creators, stats, tags, chapters) so the
     preview fits the smallest supported viewport (375×667) without the body
     needing to scroll. Scoped to the tray only — the desktop dialog, which
     reuses the same sub-components, keeps its roomier sizing. */
  ${PreviewMeta} {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 10px;
  }

  ${VisibilityBadge} {
    padding: 2px 9px;
  }

  ${StatChip} {
    padding: 4px 10px;
  }

  ${MemberStackAvatar},
  ${MemberStackOverflow} {
    width: 24px;
    height: 24px;
  }

  ${ChapterRailWrap} {
    margin-top: 6px;
  }

  ${ChapterTile} {
    width: 74px;
  }
`;

/* Pinned footer so "Read more" is always visible without scrolling, even on
   the rare device/content combo where the body still overflows. */
export const TrayFooter = styled.div`
  flex-shrink: 0;
  padding: 10px 2px max(12px, env(safe-area-inset-bottom));
`;

export const TrayReadMoreButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 20px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;

/* Local extension of the shared bottom sheet: the tray supplies its own pinned
   footer (TrayFooter) with the safe-area padding, so the sheet's default 60px
   bottom padding would just waste vertical space here. */
export const TraySheet = styled(MobileSheet)`
  padding-bottom: 0;
`;

// ─── Desktop preview dialog (Netflix-style) ────────────────────────────────

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const dialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  animation: ${overlayFadeIn} 0.2s ease both;
`;

export const DialogFrame = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 501;
  padding: 2.5px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.6),
    inset 0 1.5px 0 rgba(255, 255, 255, 0.5),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.18);
  animation: ${dialogPopIn} 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(to bottom, transparent 42%, var(--bg-4) 78%);
  }
`;

export const DialogFrameGlow = styled.div`
  position: absolute;
  inset: -14%;
  z-index: 0;
  pointer-events: none;
  filter: blur(18px) saturate(2) brightness(1.15);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const DialogContent = styled.div`
  position: relative;
  z-index: 1;
  width: min(680px, calc(100vw - 50px));
  max-height: 86vh;
  display: flex;
  gap: 22px;
  padding: 22px;
  overflow: hidden;
  background: var(--bg-2);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  outline: none;
`;

export const DialogCover = styled.div`
  position: relative;
  width: 240px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
  /* Keep the cover at its own 2:3 height instead of stretching to match a
     taller info column (default flex align is stretch, which distorts it). */
  align-self: flex-start;
  overflow: hidden;
  border-radius: 10px;
  ${CARD_BORDER};
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const DialogHeaderActions = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DialogHeaderButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.75);
    transform: scale(1.06);
  }
`;

export const DialogDeleteHeaderButton = styled(DialogHeaderButton)`
  &:hover {
    background: color-mix(in srgb, var(--tomato-9) 70%, rgba(0, 0, 0, 0.55));
  }
`;

export const DialogClose = styled(DialogHeaderButton)``;

export const DialogInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  padding: 2px 0;
  padding-right: 46px;
  overflow-y: auto;
`;

export const DialogHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const DialogEyebrow = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
`;

export const DialogTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;
`;

export const DialogActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 10px;
  padding-top: 4px;
  margin-top: auto;
`;

export const DialogReadMoreButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;

  &:hover {
    opacity: 0.94;
    box-shadow: 0 8px 22px color-mix(in srgb, var(--accent) 55%, transparent);
  }

  &:active {
    transform: scale(0.97);
  }

  svg {
    transition: transform 0.15s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;
