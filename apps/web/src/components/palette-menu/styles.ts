import { Popover } from "radix-ui";
import styled, { keyframes } from "styled-components";
import { NO_USER_SELECT, Z_INDEX } from "@/theme";

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }
`;

/* Sits in the bar's flex flow between the search trigger and Log In, so it
   never needs a pinned offset of its own. */
export const PositionContainer = styled.div`
  display: inline-flex;
  align-items: center;
  transition: max-width 0.2s ease-in-out, opacity 0.2s ease-in-out;

  /* The mobile search expands across the whole row — everything else in the
     bar gets out of its way rather than being pushed off the edge. */
  @media (max-width: 700px) {
    &.searchBarExpanded {
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
    }
  }
`;

/* Matches the notifications bell: a bare circular icon button that only grows
   a background on hover, so the bar reads as icons plus one call to action. */
export const TriggerButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.15s ease, color 0.15s ease;
  line-height: 0;

  &:hover {
    background-color: var(--bg-4);
    color: var(--accent-11);
  }

  &[data-state="open"] {
    background-color: var(--bg-4);
    color: var(--accent-11);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-7);
    outline-offset: 2px;
  }

  .menu-icon {
    width: 30px;
    height: 30px;
  }

  /* 36px hit target on phones (was 28 at the 375 baseline). Search, palette
     and Log In still clear the gutter at 375 with the wordmark in place. */
  @media (max-width: 700px) {
    padding: 5px;

    .menu-icon {
      width: 26px;
      height: 26px;
    }
  }
`;

export const PopoverContent = styled(Popover.Content)`
  width: 260px;
  background-color: var(--bg-2);
  border: 1px solid var(--bg-5);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: ${Z_INDEX.MODAL};

  &[data-state="open"] {
    animation: ${slideDown} 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  &[data-state="closed"] {
    animation: ${slideUp} 0.14s ease forwards;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px 8px;
`;

export const Title = styled.h3`
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  margin: 0;
  font-family: var(--font);
`;

export const Subtitle = styled.span`
  font-size: 10px;
  line-height: 1.3;
  color: var(--text-secondary);
  font-family: var(--font);
`;

export const PaletteGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 4px 8px 12px;
`;

/* Each option carries its own accent class, so `var(--accent)` inside it
   resolves to the palette it offers rather than the one in force. */
export const PaletteOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  position: relative;
  padding: 6px 2px;
  border-radius: 6px;
  box-sizing: border-box;
  ${NO_USER_SELECT}

  &:hover {
    background-color: var(--bg-4);
  }

  &:hover .palette-swatch {
    transform: scale(1.08);
  }

  /* The radio itself carries the checked state and the keyboard focus; only
     the swatch is drawn. */
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
  }

  &:has(input:focus-visible) {
    outline: 2px solid var(--accent-9);
    outline-offset: -2px;
  }

  .palette-swatch {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background-color: var(--accent);
    transition: transform 0.15s ease, outline-color 0.15s ease;
    box-sizing: border-box;
  }

  &[data-selected="true"] .palette-swatch {
    outline: 2px solid var(--accent-9);
    outline-offset: 2px;
  }

  .palette-name {
    font-size: 9px;
    line-height: 1;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.04em;
    text-transform: capitalize;
    color: var(--text-secondary);
    font-family: var(--font);
    white-space: nowrap;
  }

  &[data-selected="true"] .palette-name {
    color: var(--text);
  }
`;
