import { AlertDialog } from "radix-ui";
import { keyframes, styled } from "styled-components";
import { DIALOG_SCRIM, GLASS_DIALOG } from "@/theme";
import { fadeIn as overlayShow, spin } from "@/theme/animations";

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
  ${DIALOG_SCRIM}
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
  /* Dialog glass (see GLASS_DIALOG). Radix portals this to <body>, a sibling
     of the scrim rather than its child, so the blur samples the page. */
  ${GLASS_DIALOG}
  border-radius: 22px;
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
    padding: 16px;
    border-radius: 20px;

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
    font-size: var(--font-size-small);
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
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    flex: 1;
    min-width: 0;
    padding: 8px;
    font-size: var(--font-size-small);
  }
`;

export const CancelButton = styled.button`
  ${buttonBase}
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--glass-edge);

  &:hover {
    background-color: var(--fill-hover);
    color: var(--text);
  }

  &:active {
    background-color: var(--fill-pressed);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ButtonSpinner = styled.span`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  opacity: 0.85;
  animation: ${spin} 0.7s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 1.6s;
  }
`;

export const ActionButton = styled.button<{
  colorVariant?: "negative" | "neutral";
  $busy?: boolean;
}>`
  ${buttonBase}
  border: 1px solid transparent;
  ${({ $busy }) => ($busy ? "cursor: progress;" : "")}

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
    background-color: var(--fill-hover);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;
