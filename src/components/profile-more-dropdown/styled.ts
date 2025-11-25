import { DropdownMenu } from "radix-ui";
import { keyframes, styled } from "styled-components";

const fadeIn = keyframes`
from { opacity: 0; transform: translateY(-4px); }
to { opacity: 1; transform: translateY(0); }
`;

export const TriggerWrapper = styled.div`
  position: relative;
  /* display: inline-flex; keeps the button inline */
`;

export const ActionBadge = styled.div`
  background-color: ${({ theme }: any) => theme.unreadMark};
  border-radius: 50%;
  width: 10px;
  height: 10px;
  position: absolute;
  top: -3px;
  right: -4px;
  z-index: 10;
`;

export const TriggerButton = styled.button`
  all: unset;
  padding-inline: 8px;
  padding-block: 6px;
  text-align: center;
  background-color: var(--bg-3);
  color: var(--text-secondary);
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-regular);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--bg-4);
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: var(--bg-2);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

`;

export const Content = styled(DropdownMenu.Content)`
  min-width: 160px;
  background-color: var(--bg-3);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
    0 10px 20px -15px rgba(22, 23, 24, 0.2);
  border: 1px solid var(--bg-6);
  animation: ${fadeIn} 120ms ease-out;
  z-index: 99999;

  /* position it below + right aligned */
  &[data-side="bottom"] {
    margin-top: 6px;
    transform-origin: top right;
  }

  &[data-align="end"] {
    right: 0;
  }
`;

export const Item = styled(DropdownMenu.Item)`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;

  /* default colors */
  color: var(--text);

  &:hover {
    background-color: var(--accent);
    outline: none;
  }

  &[data-variant="danger"] {
    color: #a93434ff; /* red text */

    &:hover {
      background-color: #8e2a2a;
      color: white; /* white when hovered */
    }
  }

  &[data-variant="positive"] {
    color: #37a84aff; /* red text */

    &:hover {
      background-color: #368e2aff;
      color: white; /* white when hovered */
    }
  }
`;

export const ItemIcon = styled.span`
  display: inline-flex;
  margin-right: 8px;
  vertical-align: middle;
  color: inherit; // matches text color based on variant
`;

export const Separator = styled.div`
  height: 1px;
  background-color: #42434a;
  margin: 6px 0;
`;
