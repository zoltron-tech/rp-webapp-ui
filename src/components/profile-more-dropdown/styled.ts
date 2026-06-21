import { DropdownMenu } from "radix-ui";
import { keyframes, styled } from "styled-components";

const fadeIn = keyframes`
from { opacity: 0; transform: translateY(-4px); }
to { opacity: 1; transform: translateY(0); }
`;

export const TriggerWrapper = styled.div`
  position: relative;
`;

export const ActionBadge = styled.div`
  background-color: ${({ theme }: any) => theme.unreadMark};
  border-radius: 50%;
  width: 10px;
  height: 10px;
  position: absolute;
  top: -1px;
  right: -1px;
  z-index: 10;
`;

export const TriggerButton = styled.button`
  all: unset;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  padding-inline: 10px;
  padding-block: 8px;
  text-align: center;

  color: var(--text-secondary);
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-regular);

  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  display: flex;
  align-items: center;
  justify-content: center;

  &.bordered {
    border: 1px solid var(--bg-6);
    background-color: var(--bg-3);

    &:disabled {
      background-color: var(--bg-2);
    }
  }

  &.minimal {
    border: none;
  }

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-4);
      color: var(--text);
    }
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

export const Content = styled(DropdownMenu.Content)`
  min-width: 200px;
  background-color: var(--bg-2);
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--bg-5);
  animation: ${fadeIn} 120ms ease-out;
  z-index: 99999;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-side="bottom"] {
    margin-top: 6px;
    transform-origin: top right;
  }

  &[data-align="end"] {
    right: 0;
  }
`;

export const Item = styled(DropdownMenu.Item)`
  padding: 9px 12px;
  margin-block: 1px;
  border-radius: 6px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  transition: background-color 0.1s ease;

  &:hover, &:focus {
    background-color: var(--accent);
    outline: none;
    color: var(--text);
  }

  &[data-variant="danger"] {
    color: var(--tomato-9);

    &:hover, &:focus {
      background-color: var(--tomato-9);
      color: white;
    }
  }

  &[data-variant="positive"] {
    color: var(--grass-9);

    &:hover, &:focus {
      background-color: var(--grass-9);
      color: white;
    }
  }
`;

export const ItemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
  font-size: var(--font-size);

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const Separator = styled.div`
  height: 1px;
  background-color: var(--bg-5);
  margin: 4px 0;
`;

export const MobileSeparator = styled.div`
  height: 1px;
  background-color: var(--bg-5);
  margin-block: 20px !important;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 4px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--bg-5);
`;

export const MobileHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
  padding: 4px 4px 14px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--bg-5);
`;

// Mobile Bottom Sheet Styles
export const MobilePortalRoot = styled.div`
  /* Carries the accent + theme classes so the fixed children below resolve
     CSS variables (e.g. --bg-2) even when portaled to document.body. The
     element itself takes no layout space. */
  @media (min-width: 801px) {
    display: none;
  }
`;

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

interface MobileSheetProps {
  $open: boolean;
}

export const MobileSheet = styled.div<MobileSheetProps>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  background-color: var(--bg-2);
  border-radius: 16px 16px 0 0;
  padding-inline: 18px;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  z-index: 99999;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  transform: translateY(${(p) => (p.$open ? "0" : "100%")});
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-out;
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};

  @media (min-width: 801px) {
    display: none;
  }

  @media (max-height: 600px) {
    max-height: 90vh;
  }
`;

export const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background-color: var(--bg-9);
  border-radius: 2px;
  margin: 12px auto;
  flex-shrink: 0;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

export const MobileContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 0;

  /* Smooth scrolling on iOS */
  -webkit-overflow-scrolling: touch;

  /* Separator spacing — creates visual gap between groups */
  & > div {
    margin-block: 5px;
  }

  /* Group border-radius: round only the first item in each group */
  & > button:first-child,
  & > div + button {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  /* Group border-radius: round only the last item in each group */
  & > button:last-child,
  & > button:has(+ div) {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--bg-5);
    border-radius: 3px;

    &:hover {
      background-color: var(--bg-6);
    }
  }
`;

export const MobileItem = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 0;
  background-color: var(--bg-3);
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
  transition: background-color 0.12s ease;
  min-height: 44px;
  width: 100%;

  &:active {
    background-color: var(--bg-5);
    color: var(--text);
  }

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-4);
    }
  }

  &[data-variant="danger"] {
    color: var(--tomato-9);

    &:active {
      background-color: var(--tomato-9);
      color: white;
    }

    @media (hover: hover) {
      &:hover {
        background-color: rgba(219, 39, 119, 0.12);
      }
    }
  }

  &[data-variant="positive"] {
    color: var(--grass-9);

    &:active {
      background-color: var(--grass-9);
      color: white;
    }

    @media (hover: hover) {
      &:hover {
        background-color: rgba(80, 227, 194, 0.12);
      }
    }
  }
`;
