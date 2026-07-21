import styled, { keyframes } from "styled-components";

/* Carries the accent + theme classes so fixed children resolve CSS variables
   (e.g. --bg-2) even when portaled to document.body. Takes no layout space. */
export const PortalRoot = styled.div``;

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const dialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

// ─── Desktop dialog ────────────────────────────────────────────────────────

export const DesktopBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: ${overlayFadeIn} 0.2s ease both;

  @media (max-width: 800px) {
    display: none;
  }
`;

export const DesktopPanel = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 501;
  display: flex;
  flex-direction: column;
  width: min(560px, calc(100vw - 40px));
  max-height: 90vh;
  /* The form's own header/body/footer manage scrolling and padding now, so
     this panel just clips to its rounded corners. */
  overflow: hidden;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: ${dialogPopIn} 0.26s cubic-bezier(0.2, 0.8, 0.2, 1) both;

  @media (max-width: 800px) {
    display: none;
  }
`;

// ─── Mobile slide-up tray ──────────────────────────────────────────────────

export const MobileBackdrop = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99998;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transition: opacity 250ms ease-out;

  @media (min-width: 801px) {
    display: none;
  }
`;

export const MobileSheet = styled.div<{ $open: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-2);
  /* Portaled straight to document.body, outside the app's color inheritance —
     without this, unstyled text (e.g. the rich-text editor) falls back to the
     browser default instead of the theme's text color. */
  color: var(--text);
  border-radius: 16px 16px 0 0;
  z-index: 99999;

  transform: translateY(${(p) => (p.$open ? "0" : "100%")});
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-out;
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};

  @media (min-width: 801px) {
    display: none;
  }
`;

/* Grab handle strip; owns the drag-to-dismiss touch target. */
export const DragArea = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 6px;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

export const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--bg-9);
`;

/* Passes remaining tray height to the form; the form's own body scrolls
   internally so its header and footer can stay fixed in view. */
export const MobileScroll = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
