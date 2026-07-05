import styled, { css } from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.79);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
`;

/* ── Controls rendered outside the exported card ── */
export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 360px;
`;

export const PositionSliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 360px;
`;

export const PositionSliderLabel = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.7;
`;

export const PositionSlider = styled.input`
  flex: 1;
  height: 3px;
  accent-color: var(--accent);
  cursor: ew-resize;
  border-radius: 2px;
`;

export const DownloadButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 28px;
  flex: 1;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CloseButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  opacity: 0.6;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
  }
`;

/* ── Design switcher (carousel of export designs) ── */
export const DesignSwitcher = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 360px;
`;

export const NavArrow = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--text);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const DesignLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  min-width: 120px;
  text-align: center;
  user-select: none;
`;

export const CarouselViewport = styled.div<{
  $maxWidth: number;
  $maxHeight: number;
  $isSquareActive?: boolean;
}>`
  position: relative;
  width: ${({ $maxWidth }) => $maxWidth}px;
  height: ${({ $maxHeight }) => $maxHeight}px;
  overflow: hidden;
  touch-action: pan-y;
  transition: width 0.25s ease, height 0.25s ease;

  /* Only grows on desktop while the square design is active — enough room
     for SquarePreviewScale's desktop scale-up to avoid clipping. Mobile and
     the portrait design keep the base size above untouched. */
  ${({ $isSquareActive }) =>
    $isSquareActive &&
    css`
      @media (min-width: 769px) {
        width: 600px;
        height: 600px;
      }
    `}
`;

export const CarouselTrack = styled.div<{
  $index: number;
  $dragX: number;
  $dragging: boolean;
}>`
  display: flex;
  height: 100%;
  width: 100%;
  transform: translateX(
    calc(-${({ $index }) => $index * 100}% + ${({ $dragX }) => $dragX}px)
  );
  transition: ${({ $dragging }) =>
    $dragging ? "none" : "transform 300ms ease"};
`;

/* overflow: hidden clips each slide to its own box. Without it, an inactive
   square slide (translated off-screen) can still bleed back into view: its
   desktop scale-up in SquarePreviewScale is driven by a media query (window
   width), not by whether that slide is active, so it scales from its own
   center regardless — and without this clip, that scaled content can extend
   past its own slide's edge into the neighboring (visible) slide's area. */
export const CarouselSlide = styled.div`
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Purely a display-time visual scale for the square design's on-screen
   preview — bigger on desktop, smaller on mobile. This wraps OUTSIDE the
   design's own ref'd node, so html-to-image (which clones only the ref'd
   node and its descendants, never its ancestors) never sees this transform —
   the exported PNG's resolution/framing is completely unaffected. */
export const SquarePreviewScale = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.85);

  @media (min-width: 769px) {
    transform: scale(1.4);
  }
`;

export const DotsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

export const Dot = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: ${({ $active }) => ($active ? "18px" : "6px")};
  height: 6px;
  border-radius: 3px;
  background: ${({ $active }) =>
    $active ? "var(--accent)" : "rgba(255, 255, 255, 0.25)"};
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;
`;
