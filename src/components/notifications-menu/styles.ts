import { Popover, Separator } from "radix-ui";
import styled, { keyframes } from "styled-components";
import { NO_SCROLLBAR, Z_INDEX } from "@/theme";
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

  &:hover {
    background-color: var(--bg-4);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-7);
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
  border: 2px solid var(--bg-3);
  pointer-events: none;
  font-size: 9px;
  min-width: 16px;
  height: 16px;
`;

export const PopoverContent = styled(Popover.Content)`
  width: 360px;
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
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  flex-shrink: 0;
`;

export const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  font-family: var(--font);
`;

export const MarkAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--accent-11);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 9px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  font-family: var(--font);
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background-color: var(--accent-a3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Divider = styled(Separator.Root)`
  height: 1px;
  background-color: var(--bg-4);
  flex-shrink: 0;
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  max-height: 360px;
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
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-11);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  transition: background-color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background-color: var(--bg-3);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-7);
    outline-offset: -2px;
  }
`;
