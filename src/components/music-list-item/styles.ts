import { css, keyframes, styled } from "styled-components";
import { DEV_MODE_BORDER, Z_INDEX } from "@/theme";

const scrollText = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
`;

export const CardWrapper = styled.div<{
  $isPlaying?: boolean;
  $hasTags?: boolean;
  $hasDescription?: boolean;
}>`
  ${DEV_MODE_BORDER("blue")}
  width: 95%;
  min-height: ${(p) => {
    const base = 60;
    const height =
      base +
      (p.$isPlaying ? 15 : 0) +
      (p.$hasTags ? 15 : 0) +
      (p.$hasDescription ? 25 : 0) +
      (p.$isPlaying && p.$hasTags && p.$hasDescription ? 5 : 0);

    return `${height}px`;
  }};
  height: auto;
  padding-inline: 10px;
  align-items: flex-start;
  padding-block: 5px;
  border-radius: 0;
  background-color: ${(props) => (props.$isPlaying ? "var(--accent-2)" : "var(--bg-3)")};
  border: 1px solid ${(props) => (props.$isPlaying ? "var(--accent-hover)" : "var(--bg-6)")};
  display: flex;

  &:first-child {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  &:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  }

  .avatar {
    height: 50px;
    width: 50px;
  }

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: music-list-card;
  container-type: size;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  position: relative;
  height: 100%;
  width: 100%;
  min-width: 0;
`;

export const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;

  background: var(--accent);
  border: 1px solid var(--bg-5);
  border-radius: 50%;
  cursor: pointer;

  font-size: var(--font-size-xxsmall);
  color: var(--text);

  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-5);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 2px;
`;

export const TimeDisplay = styled.span`
  font-size: var(--font-size-xxsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 32px;
  text-align: center;
`;

export const ProgressBar = styled.div`
  position: relative;
  flex: 1;
  height: 3px;
  background: var(--bg-6);
  border-radius: 4px;
  cursor: pointer;
  overflow-x: hidden;

  transition: height 0.2s ease;

  /* allow vertical glow bleed */
  overflow-y: visible;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: 0%;
  border-bottom-left-radius: 35%;
  border-top-left-radius: 35%;
  background: var(--accent, var(--accent-hover));
  transition: width 0.1s linear, filter 0.2s ease;

  /* subtle glow */
  box-shadow: 0 0 6px var(--accent);
  filter: brightness(1.3);
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;  
  font-size: var(--font-size-xxsmall);
  overflow: hidden;
  flex: 1;
  min-width: 0;
  gap: 4px;

  &:hover ${ProgressBar} {
    height: 6px;
  }
`;

export const HeaderDropdownMenuContainer = styled.div`

  display: flex;
  gap: 6px;
  position: absolute;
  right: 10px;
  top: 10px;
`;

export const AuthorPill = styled.div`
  display: flex;
  background-color: var(--accent);
  white-space: nowrap;
  margin-inline: 4px;
  padding: 2px 4px;
  border-radius: 999px;
  align-items: center;
  gap: 4px;
    cursor: pointer;

  .avatar {
    height: 14px;
    width: 14px;
  }
`;

export const AuthorName = styled.div`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

/**
 * Outer mask container
 */
export const SongNameWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  width: 100%;

  @media (max-width: 400px) {
    width: 70%;
  }
`;

/**
 * Animated inner text
 */
export const SongName = styled.div<{
  $isPlaying?: boolean;
  $isOverflow?: boolean;
}>`
  display: inline-block;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  padding-right: 2rem;
  color: var(--text-secondary);
  position: relative;
  
  ${(props) =>
    props.$isOverflow
      ? css`
          &::after {
            content: "...";
            position: absolute;
            right: 0;
            background: inherit;
            padding-left: 4px;
          }
        `
      : ""}
  
  ${(props) =>
    props.$isOverflow && props.$isPlaying
      ? css`
          animation: ${scrollText} 10s linear infinite;
          
          &::after {
            display: none;
          }
        `
      : ""}
`;

export const SongDescription = styled.div`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  word-break: break-word;
  min-width: 200px;
  width: 70%;
`;

export const Audio = styled.audio`
  display: none;
`;

export const SongTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
  overflow: hidden;
`;

export const SongTag = styled.span<{ $color: string }>`
background-color: ${({ $color }) =>
  $color.replace("rgb(", "rgba(").replace(")", ", 0.1)")};
  color: var(--text);
  border: 1px solid ${(props) => props.$color};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: var(--font-size-xxsmall);
  white-space: nowrap;
`;
