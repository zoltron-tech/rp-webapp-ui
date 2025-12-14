import { Dialog } from "radix-ui";
import { keyframes, styled } from "styled-components";

const overlayShow = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

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
  animation: ${overlayShow} 150ms ease-out;
`;

export const Content = styled.div`
  position: absolute;
  inset: 0;

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

  will-change: transform;
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
