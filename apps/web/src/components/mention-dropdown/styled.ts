import { AiOutlineLoading3Quarters } from "react-icons/ai";
import styled, { keyframes } from "styled-components";
import { GLASS } from "@/theme";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/**
 * The @mention popover. Floating chrome, so it sits on the glass tier and
 * mirrors the spell menu: 4px inset, rounded rows, small uppercase section
 * labels.
 */
export const Dropdown = styled.div`
  position: fixed;
  /* Portaled after any open dialog (also int32 max), so it wins on DOM
     order. pointer-events: a modal dialog sets none on <body>. */
  z-index: 2147483647;
  pointer-events: auto;
  box-sizing: border-box;
  width: min(17rem, calc(100vw - 2rem));
  max-height: min(15rem, 40vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px;
  border-radius: 0.75rem;
  border: 1px solid var(--glass-edge, var(--bg-6));
  color: var(--text);
  font-family: var(--font);
  font-size: 0.8125rem;
  ${GLASS("panel")}

  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6, #e5e4e7);
    border-radius: 3px;
  }
`;

export const SectionLabel = styled.div`
  padding: 6px 8px 3px;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-semi-bold, 600);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);

  &:not(:first-child) {
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--bg-6, rgba(128, 128, 128, 0.25));
  }
`;

interface ItemProps {
  $focused?: boolean;
}

export const Item = styled.button<ItemProps>`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: none;
  border-radius: 0.5rem;
  background: ${({ $focused }) =>
    $focused
      ? "color-mix(in srgb, var(--accent) 20%, transparent)"
      : "transparent"};
  color: var(--text);
  font: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  /* Same size as the chip the pick turns into. */
  .avatar {
    width: 22px;
    height: 22px;
    min-width: 22px;
  }

  .avatar-fallback {
    font-size: 0.6875rem;
  }
`;

export const Name = styled.span`
  flex: 0 1 auto;
  min-width: 0;
  font-weight: var(--font-weight-semi-bold, 600);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Muted trailing context: the novelist who pens a muse. */
export const Meta = styled.span`
  flex: 0 10 auto;
  min-width: 2.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Empty = styled.div`
  padding: 10px 8px;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
`;

export const LoadingWrapper = styled.div`
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Spinner = styled(AiOutlineLoading3Quarters)`
  animation: ${spin} 0.8s linear infinite;
  font-size: 1.25rem;
  opacity: 0.7;
`;
