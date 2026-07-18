import { keyframes, styled } from "styled-components";
import { Z_INDEX } from "@/theme";

const scrollText = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  height: 30px;
  width: 120px;
  padding-inline: 2px;

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
`;

export const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
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

export const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 3px;
  background: var(--bg-6);
  border-radius: 4px;
  cursor: pointer;
  overflow-x: hidden;
  margin-top: 2px;

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
  align-items: center;
  font-size: var(--font-size-xxsmall);
  overflow: hidden;
  width: 100%;

    &:hover ${ProgressBar} {
    height: 6px;
  }
`;

export const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  color: var(--accent);
  font-size: 12px;
  opacity: 0.8;

  transition: opacity 0.2s ease, transform 0.15s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

/**
 * Outer mask container
 */
export const SongNameWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
`;

/**
 * Animated inner text
 */
export const SongName = styled.div`
  display: inline-block;
  white-space: nowrap;
  padding-right: 2rem;
  color: var(--text-secondary);

  animation: ${scrollText} 12s linear infinite;
  animation-play-state: running;

  &:hover {
    animation-play-state: paused;
  }
`;

export const Audio = styled.audio`
  display: none;
`;

export const HiddenEmbed = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
`;
