import { AlertDialog } from "radix-ui";
import { keyframes, styled } from "styled-components";

const overlayShow = keyframes`
from { opacity: 0; }
to { opacity: 1; }
`;
const contentShow = keyframes`
from {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.97);
}
to {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
`;

export const Overlay = styled(AlertDialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  position: fixed;
  inset: 0;
  /* Must beat every other overlay in the app (mobile trays sit at 99999,
     some editor toolbars at the int32 max) so confirmation dialogs are
     never trapped behind whatever triggered them. */
  z-index: 2147483646;
  animation: ${overlayShow} 160ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Content = styled(AlertDialog.Content)<{ $size?: "default" | "lg" }>`
  display: flex;
  flex-direction: column;
  background-color: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 12px;
  box-shadow:
    0 12px 44px rgba(0, 0, 0, 0.55),
    0 3px 10px rgba(0, 0, 0, 0.35);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(92vw, 440px);
  max-height: 85vh;
  padding: 24px;
  z-index: 2147483647;
  color: var(--text);
  font-family: var(--font);
  animation: ${contentShow} 160ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 480px) {
    width: calc(100vw - 56px);
    max-width: 300px;
    padding: 14px;
    border-radius: 10px;

    ${({ $size }) =>
      $size === "lg" &&
      `
      width: calc(100vw - 20px);
      max-width: 460px;
      padding: 10px;
    `}
  }
`;

export const Title = styled(AlertDialog.Title)`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: var(--font-size);
  }
`;

export const Description = styled(AlertDialog.Description)`
  margin: 10px 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-input);
  line-height: 1.55;

  @media (max-width: 480px) {
    margin-top: 6px;
    font-size: var(--font-size-xsmall);
    line-height: 1.5;
  }
`;

/* Wrapper for custom body content — scrolls when content is tall. */
export const Body = styled.div`
  margin-top: 16px;
  overflow-y: auto;
  min-height: 0;

  @media (max-width: 480px) {
    margin-top: 10px;
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 28px;

  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 14px;
  }
`;

const buttonBase = `
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 10px 18px;
  text-align: center;
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-medium);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    flex: 1;
    min-width: 0;
    padding: 7px 8px;
    font-size: var(--font-size-xsmall);
    border-radius: 6px;
  }
`;

export const CancelButton = styled.button`
  ${buttonBase}
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--bg-6);

  &:hover {
    background-color: var(--bg-4);
    color: var(--text);
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ActionButton = styled.button<{
  colorVariant?: "negative" | "neutral";
}>`
  ${buttonBase}
  border: 1px solid transparent;

  background-color: ${({ colorVariant }) =>
    colorVariant === "neutral" ? "var(--accent)" : "var(--tomato-9)"};
  color: ${({ colorVariant }) =>
    colorVariant === "neutral" ? "var(--text)" : "#fff"};

  &:hover {
    background-color: ${({ colorVariant }) =>
      colorVariant === "neutral" ? "var(--accent-hover)" : "var(--tomato-10)"};
  }

  &:active {
    background-color: ${({ colorVariant }) =>
      colorVariant === "neutral" ? "var(--accent-active)" : "var(--tomato-8)"};
  }

  &:disabled {
    background-color: var(--bg-4);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;
