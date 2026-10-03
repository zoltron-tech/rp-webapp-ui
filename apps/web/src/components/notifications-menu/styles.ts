import { Popover, Separator } from "radix-ui";
import styled, { keyframes } from "styled-components";
import { FOCUS_RING, GLASS, NO_SCROLLBAR, Z_INDEX } from "@/theme";
import { UnreadBadgeBase } from "../common/unread-badge";

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

/* Laid out by the top bar rather than pinned to it.
 *
 * This used to be `position: absolute; right: 4.5rem`, which took the bell out
 * of the flow and made the bar depend on a matching fixed-width spacer to keep
 * other controls clear of it. Two magic numbers that had to be kept in sync,
 * and at 375px the search trigger ended up underneath the avatar when they
 * were not. In the flow, flexbox keeps them apart at any width. */
export const PositionContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;

export const TriggerArea = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

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
  transition: background-color 0.15s ease;
  line-height: 0;

  &:hover,
  &[data-state="open"] {
    background-color: var(--fill-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: 2px;
  }

  .menu-icon {
    width: 36px;
    height: 36px;
  }

  @media (max-width: 700px) {
    .menu-icon {
      width: 28px;
      height: 28px;
    }
  }
`;

export const NotificationBadge = styled(UnreadBadgeBase)`
  position: absolute;
  top: -2px;
  right: -2px;
  z-index: 10;
  border: 2px solid var(--bg-2);
  pointer-events: none;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
`;

/* A floating panel, so glass — the panel variant, being text-heavy. Portaled
   to <body>, outside .page-container; it carries the accent and theme classes
   itself, which is what the glass tokens resolve against (see globals.css). */
export const PopoverContent = styled(Popover.Content)`
  width: 380px;
  max-width: calc(100vw - 16px);
  ${GLASS("panel")}
  border: 1px solid var(--glass-edge);
  border-radius: 18px;
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

  @media (prefers-reduced-motion: reduce) {
    &[data-state="open"],
    &[data-state="closed"] {
      animation-duration: 0.01ms;
    }
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  flex-shrink: 0;
`;

export const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  font-family: var(--font);
`;

export const MarkAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--accent-11);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background-color 0.15s ease;
  font-family: var(--font);
  font-weight: 600;
  white-space: nowrap;

  &:hover {
    background-color: var(--fill-hover);
  }

  ${FOCUS_RING}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Divider = styled(Separator.Root)`
  height: 1px;
  background-color: var(--glass-edge);
  flex-shrink: 0;
`;

/* Rows sit inset in the panel as rounded tiles rather than full-bleed strips. */
export const ScrollArea = styled.div`
  overflow-y: auto;
  max-height: min(420px, 60vh);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  ${NO_SCROLLBAR}
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px 28px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: var(--font);

  /* The shared art sizes itself for a full page. A descendant selector
     outranks its single class, so the popover can scale it down. */
  svg {
    flex-shrink: 0;
    width: 108px;
    height: auto;
  }
`;

export const Footer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-11);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  transition: background-color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background-color: var(--fill-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: -2px;
  }
`;
