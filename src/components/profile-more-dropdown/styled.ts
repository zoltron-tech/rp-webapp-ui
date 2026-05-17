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
`;

export const Separator = styled.div`
  height: 1px;
  background-color: var(--bg-5);
  margin: 4px 0;
`;
