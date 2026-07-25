import { css, keyframes, styled } from "styled-components";
import { Z_INDEX } from "@/theme";

// ─── Feed shimmer ─────────────────────────────────────────────────────────────

const shimmerMove = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const SpinnerRing = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--bg-6);
  border-top-color: var(--accent);
  animation: ${spin} 0.7s linear infinite;
`;

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

export const FeedShimmerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(480px, 100%);
`;

export const FeedShimmerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-4);
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

/** Matches MusePreviewCard dimensions (240 × 420, 120 × 220 mobile). */
export const MuseCardShimmer = styled.div`
  flex-shrink: 0;
  width: 240px;
  height: 420px;
  border-radius: 8px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 120px;
    height: 220px;
  }
`;

/** Matches StoryCard dimensions (200 × 392 desktop, 158 × 321 mobile). */
export const StoryCardShimmer = styled.div`
  flex-shrink: 0;
  /* Cover (2:3 of width) + info panel, matching the redesigned StoryCard. */
  width: 200px;
  height: calc(200px * 1.5 + 92px);
  border-radius: 8px;
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
  border-radius: 8px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 160px;
    height: 248px;
    border-radius: 8px;
  }
`;

// ─── Friends strip shimmers ───────────────────────────────────────────────────

export const SidebarShimmerItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
`;

export const SidebarShimmerAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  ${shimmer}
`;

export const SidebarShimmerName = styled.div`
  height: 8px;
  width: 44px;
  border-radius: 4px;
  ${shimmer}
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
 * container here. Background/border/radius mark out the 900px content
 * column against the full-width page behind it. */
export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  max-width: 900px;
  margin: 16px auto;
  padding: 16px;
  background-color: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 16px;

  @media (max-width: 600px) {
    margin-top: 0;
    margin-bottom: 0;
    padding: 0;
    border: none;
    border-radius: 0;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

/** Single "continue reading" bookmark card above Stories — not a carousel,
 * so just a centered, comfortably wide single item. */
export const ContinueReadingWrap = styled.div`
  width: 100%;
  max-width: 700px;
  padding-inline: 4px;
`;

export const ActivityContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding-block: 20px;
  background-color: var(--bg-2);
`;

export const SubText = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 300;
  margin-bottom: 10px;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 200px) {
    & {
      font-size: 10px;
      font-weight: 600;
    }
  }
`;

export const AddFriendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px dashed var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--bg-4);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const PartitionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  padding-inline: 4px;
  overflow-x: auto;

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

/** Positioning context for a PartitionContainer/FriendsStrip row plus its
 * left/right ScrollNavButtons. */
export const ScrollRowWrap = styled.div`
  position: relative;
  width: 100%;
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
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--text);
  background: color-mix(in srgb, var(--bg-2) 85%, transparent);
  border: 1px solid var(--bg-6);
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
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
      background: var(--accent);
      color: #fff;
      border-color: transparent;
    }
  }

  &:active {
    transform: translateY(-50%) scale(0.92);
  }
`;

/** Friends strip — same scrollable row as PartitionContainer, plus vertical
 * padding so the avatar's hover outline has room and isn't clipped by the
 * row's own overflow-x scroll box, and a wider gap between the (now bigger)
 * desktop avatars. */
export const FriendsStrip = styled(PartitionContainer)`
  padding-block: 8px;
  gap: 1.25rem;

  @container page-container (max-width: 600px) {
    gap: 0.5rem;
  }
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
  border-radius: var(--border-radius, 8px);
  border: 1.5px dashed var(--bg-6);
  background: var(--bg-2);
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
      border-color: var(--accent);
      color: var(--accent);
      background: var(--bg-3);
    }
  }

  &:active:not(:disabled) {
    background: var(--bg-4);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  @media (max-width: 600px) {
    width: 120px;
    min-width: 120px;
    height: ${({ $height }) => $height ?? "220px"};
  }
`;

/** Same shape as NovelistPreviewCard (240px wide; height = Banner + Body content). */
export const NextPageNovelistCard = styled(NextPageCard)`
  width: 240px;
  min-width: 240px;
  height: auto;
  min-height: 360px;
  border-radius: 8px;

  @media (max-width: 600px) {
    width: 160px;
    min-width: 160px;
    min-height: 265px;
    border-radius: 4px;
  }
`;
