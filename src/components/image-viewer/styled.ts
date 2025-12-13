import { Dialog } from "radix-ui";
import { keyframes, styled } from "styled-components";

const overlayShow = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const Overlay = styled(Dialog.Overlay)`
  background: rgba(0, 0, 0, 1);
  position: fixed;
  inset: 0;
  animation: ${overlayShow} 150ms ease-out;
`;

export const Content = styled(Dialog.Content)`
  position: fixed;
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

  touch-action: none;
  user-select: none;
  -webkit-user-drag: none;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
`;

export const CloseButton = styled.button`
  all: unset;
  position: fixed;
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
