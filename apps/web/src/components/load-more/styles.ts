// components/styled.ts
import styled from "styled-components";
import { FOCUS_RING } from "@/theme";
import { UnreadBadgeBase } from "../common/unread-badge";

export const LoadMoreContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block: 16px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--material-edge);
  }
`;

export const LoadMoreButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 18px;
  border: 1px solid var(--material-edge);
  border-radius: 50px;
  background: var(--material-fill);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--accent-11, var(--accent));
      border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 40%, transparent);
      background: var(--fill-hover);
    }
  }

  &:active:not(:disabled) {
    background: var(--fill-pressed);
  }

  ${FOCUS_RING}

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

export const UnreadDot = styled(UnreadBadgeBase)`
  flex-shrink: 0;
`;
