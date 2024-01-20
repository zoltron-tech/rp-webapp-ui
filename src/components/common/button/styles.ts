import { SPIN } from "@/theme";
import styled from "styled-components";

export type ContainerProps = {
  variant: "primary" | "secondary" | "link";
  shape: "rounded" | "square" | "rounded-edge";
};

export const is = <T>(unionProp: T, prop: T): boolean => unionProp === prop;
export const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
  position: relative;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  ${SPIN}

  & span {
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    opacity: 1;
    transform: translate(-50%, -50%);
    transition: opacity 0.2s ease-in-out;
  }

  & svg.loading-icon {
    display: block;
    width: 20px;
    height: 20px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    fill: ${({ theme }) => theme.textPrimary};
  }

  &.primary {
    background-color: ${({ theme }) => theme.primary};
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;

    & span {
      color: ${({ theme }) => theme.textPrimary};
    }

    &:hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.secondary {
    background-color: transparent;
    border: 2px solid ${({ theme }) => theme.text};
    color: ${({ theme }) => theme.text};
    padding: 8px 18px;

    &:hover {
      border-color: ${({ theme }) => theme.primaryHover};
      color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.link {
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.text};
    padding: 10px 20px;

    &:hover {
      color: ${({ theme }) => theme.primaryHover};
    }
  }

  &.rounded {
    border-radius: 20px;
  }

  &.rounded-edge {
    border-radius: 5px;
  }

  &.square {
    border-radius: 0px;
  }

  &.disabled {
    pointer-events: none;
    background-color: ${({ theme }) => theme.primaryDisabled};
    cursor: not-allowed;
  }

  &.loading {
    pointer-events: none;
    cursor: wait;

    &.primary {
      background-color: ${({ theme }) => theme.primaryDisabled};
    }

    &.secondary {
      border-color: ${({ theme }) => theme.primaryDisabled};
      color: ${({ theme }) => theme.primaryDisabled};
    }

    &.link {
      color: ${({ theme }) => theme.primaryDisabled};
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

  transition: background-color 0.1s ease-in-out;
`;
