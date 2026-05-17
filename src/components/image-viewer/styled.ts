import { Dialog } from "radix-ui";
import { styled } from "styled-components";

export const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;

  /* Critical: isolate stacking context */
  isolation: isolate;
`;

export const Overlay = styled(Dialog.Overlay)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 1);
  /* No fade-in: when swiping crosses media type, dialogs swap and a fade
     would briefly expose the page behind. Snap to full opacity on mount. */
`;

export const Content = styled.div`
  position: absolute;
  inset: 0;

  .touch-container {
  touch-action: none;
  overscroll-behavior: contain;
}

  display: flex;
  align-items: center;
  justify-content: center;

  outline: none;
`;

export const GestureContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  touch-action: none; /* blocks browser pinch zoom */
  user-select: none;
  -webkit-user-drag: none;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;

  /* will-change: transform; */
  transform-origin: center;
`;

export const CloseButton = styled.button`
  all: unset;

  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;

  width: 48px;
  height: 48px;
  border-radius: 50%;

  font-size: 32px;
  color: white;
  background: rgba(0, 0, 0, 0.6);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }

  &:focus-visible {
    outline: 2px solid white;
  }
`;

export const NavButton = styled.button<{ $side: "left" | "right" }>`
  all: unset;

  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 12px;" : "right: 12px;")}
  transform: translateY(-50%);
  z-index: 10;

  width: 44px;
  height: 44px;
  border-radius: 50%;

  font-size: 28px;
  line-height: 1;
  color: white;
  background: rgba(0, 0, 0, 0.55);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }

  &:focus-visible {
    outline: 2px solid white;
  }
`;

/* ── Image Card (non-fullscreen / card mode) ──────────────────────────────── */

export const ImageCardContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
`;

export const ImageCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: min(92vw, 900px);
  height: min(84vh, 84svh);

  background: #0d0d0d;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.07);
`;

export const ImageCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 10px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.6);
`;

export const ImageCardClose = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    color: white;
  }

  &:focus-visible {
    outline: 2px solid white;
  }
`;

export const ImageCardArea = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  touch-action: pan-y;
`;

export const NsfwOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
`;

export const NsfwLabel = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
`;

export const NsfwRevealButton = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 7px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }
`;

/* ── Video Viewer ─────────────────────────────────────────────────────────── */

export const VideoContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
`;

export const VideoDialog = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: min(92vw, 900px);
  height: min(84vh, 84svh);

  background: #0d0d0d;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.07);

  cursor: none;
  &.controls-visible {
    cursor: default;
  }

  &:fullscreen,
  &:-webkit-full-screen {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
`;

/* Header bar — fades in/out with controls */
export const VideoDialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 8px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.82) 0%, transparent 100%);

  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  pointer-events: none;

  &.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }
`;

export const VideoCloseButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    color: white;
  }

  &:focus-visible {
    outline: 2px solid white;
  }
`;

/* Flex-1 wrapper that holds the video + absolute overlays (controls, nav) */
export const VideoArea = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: pan-y;
`;

export const VideoControlsBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 28px 16px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, transparent 100%);

  display: flex;
  flex-direction: column;
  gap: 10px;

  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  pointer-events: none;

  &.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
  }
`;

export const VideoSeekBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.15s ease;

  &:hover {
    height: 6px;
  }
`;

export const VideoSeekFill = styled.div`
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--accent);
  border-radius: 2px;
  box-shadow: 0 0 6px var(--accent);
  filter: brightness(1.2);
  pointer-events: none;
  transition: width 0.1s linear;
`;

export const VideoControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const VideoIconBtn = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.92);
  }
`;

export const VideoTimeDisplay = styled.span`
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
`;

export const VideoVolumeSpacer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const VideoVolumeSlider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 72px;
  height: 4px;
  border-radius: 2px;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  background: linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) var(--vol, 100%),
    rgba(255, 255, 255, 0.22) var(--vol, 100%),
    rgba(255, 255, 255, 0.22) 100%
  );

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.3);
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;
