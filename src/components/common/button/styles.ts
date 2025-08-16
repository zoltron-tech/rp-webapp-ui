import styled from "styled-components";
import { pSBC } from "@/lib/pSBC";
import { SPIN } from "@/theme";
import { setOpacity } from "@/utils/helpers";

export const Container = styled.div`
  width: 100%;
  min-width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size);
  color: var(--text);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  ${SPIN}

  & span {
    display: inline-block;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
    width: max-content;
    min-width: 20px;
  }

  & svg.loading-icon {
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    fill: ${({ theme }: any) => theme.textPrimary};
  }

  &.xs {
    font-size: var(--font-size-xsmall);
  }

  &.sm {
    font-size: var(--font-size-small);
  }

  &.lg {
    font-size: var(--font-size-large);
  }

  &.primary {
    background-color: var(--accent);
    border: none;
    color: var(--text);
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: var(--accent-hover);
    }
  }

  &.secondary {
    background-color: transparent;
    border: 2px solid var(--text);
    color: var(--text);
    padding: 8px 18px;

    &:not(.loading):not(.disabled):hover {
      border-color: var(--accent-hover);
      background-color: var(--accent-hover);
    }
  }

  &.positive {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
    border: none;
    color: var(--text);
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: var(--accent-hover);
    }
  }

  &.negative {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
    border: none;
    color: var(--text);
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: var(--accent-hover);
    }
  }

  &.action {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.navbar, 0.8))};
    border: none;
    color: var(--text);
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: var(--accent-hover);
    }
  }

  &.link {
    background-color: transparent;
    border: none;
    color: var(--text);
    padding: 10px 20px;
    border-radius: 0px;

    &:not(.loading):not(.disabled):hover {
      color: var(--accent-hover);
    }
  }

  &.rounded {
    border-radius: 20px;
  }

  &.menu-item {
    background-color: transparent;
    padding: 10px 20px;

    & span {
      color: var(--text);
    }

    &:not(.loading):not(.disabled):hover {
      background-color: var(--accent-hover);
    }
  }

  &.rounded-edge {
    border-radius: 4px;
  }

  &.square {
    border-radius: 0px;
  }

  &.loading {
    pointer-events: none;
    cursor: wait;

    &.primary {
      background-color: ${({ theme }: any) => theme.primaryLoading};
    }

    &.secondary {
      border-color: ${({ theme }: any) => theme.primaryLoading};
      color: ${({ theme }: any) => theme.primaryLoading};
    }

    &.link {
      color: ${({ theme }: any) => theme.primaryLoading};
    }

    & span {
      opacity: 0;
    }

    & svg.loading-icon {
      display: inline-block;
      opacity: 1;
      animation: spin 1s infinite steps(8);
    }
  }

  &.disabled {
    background-color: ${({ theme }: any) => theme.primaryDisabled};
    cursor: not-allowed;
    pointer-events: all !important;
  }

  transition: background-color 0.1s ease-in-out;
`;
