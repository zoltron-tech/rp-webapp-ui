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
    opacity: 0.5;
  }

  &.loading {
    pointer-events: none;

    &.primary {
      background-color: ${({ theme }) => theme.primaryHover};
    }

    &.secondary {
      border-color: ${({ theme }) => theme.primaryHover};
    }

    &.link {
      color: ${({ theme }) => theme.primaryHover};
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
