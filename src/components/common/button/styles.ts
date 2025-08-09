import { SPIN } from "@/theme";
import styled from "styled-components";
import { pSBC } from "@/lib/pSBC";
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
    background-color: ${({ theme }: any) => theme.primary};
    border: none;
    color: ${({ theme }: any) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }: any) => theme.primaryHover};
    }
  }

  &.secondary {
    background-color: transparent;
    border: 2px solid ${({ theme }: any) => theme.text};
    color: ${({ theme }: any) => theme.text};
    padding: 8px 18px;

    &:not(.loading):not(.disabled):hover {
      border-color: ${({ theme }: any) => theme.primaryHover};
      background-color: ${({ theme }: any) => theme.primaryHover};
    }
  }

  &.positive {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
    border: none;
    color: ${({ theme }: any) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }: any) => theme.primaryHover};
    }
  }

  &.negative {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
    border: none;
    color: ${({ theme }: any) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }: any) => theme.primaryHover};
    }
  }

  &.action {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.navbar, 0.8))};
    border: none;
    color: ${({ theme }: any) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }: any) => theme.primaryHover};
    }
  }

  &.link {
    background-color: transparent;
    border: none;
    color: ${({ theme }: any) => theme.text};
    padding: 10px 20px;
    border-radius: 0px;

    &:not(.loading):not(.disabled):hover {
      color: ${({ theme }: any) => theme.primaryHover};
    }
  }

  &.rounded {
    border-radius: 20px;
  }

  &.menu-item {
    background-color: transparent;
    padding: 10px 20px;

    & span {
      color: ${({ theme }: any) => theme.text};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }: any) => theme.primaryHover};
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
