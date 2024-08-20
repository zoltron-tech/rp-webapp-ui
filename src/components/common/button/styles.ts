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
  font-weight: 600;
  border-radius: var(--border-radius);
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
    fill: ${({ theme }) => theme.textPrimary};
  }

  &.xs {
    height: 26px;
    font-size: 12px;
  }

  &.sm {
    height: 36px;
    font-size: 16px;
  }

  &.lg {
    height: 56px;
    font-size: 20px;
  }

  &.primary {
    background-color: ${({ theme }) => theme.primary};
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.secondary {
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.text};
    color: ${({ theme }) => theme.text};
    padding: 8px 18px;

    &:not(.loading):not(.disabled):hover {
      border-color: ${({ theme }) => theme.primaryHover};
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.positive {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.negative {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.action {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.navbar, 0.8))};
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }) => theme.textPrimary};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.link {
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;
    border-radius: 0px;

    &:not(.loading):not(.disabled):hover {
      color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.rounded {
    border-radius: 20px;
  }

  &.menu-item {
    background-color: transparent;
    padding: 10px 20px;

    & span {
      color: ${({ theme }) => theme.text};
    }

    &:not(.loading):not(.disabled):hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.rounded-edge {
    border-radius: 5px;
  }

  &.square {
    border-radius: 0px;
  }

  &.loading {
    pointer-events: none;
    cursor: wait;

    &.primary {
      background-color: ${({ theme }) => theme.primaryLoading};
    }

    &.secondary {
      border-color: ${({ theme }) => theme.primaryLoading};
      color: ${({ theme }) => theme.primaryLoading};
    }

    &.link {
      color: ${({ theme }) => theme.primaryLoading};
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
    background-color: ${({ theme }) => theme.primaryDisabled};
    cursor: not-allowed;
    pointer-events: all !important;
  }

  transition: background-color 0.1s ease-in-out;
`;
