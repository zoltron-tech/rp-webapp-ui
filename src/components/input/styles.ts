import { SPIN } from "@/theme";
import styled from "styled-components";

export const InputWrapper = styled.div`
  margin-bottom: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 4px;
  margin-top: 10px;
`;

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
  height: 48px;
`;

export const InputLabel = styled.label`
  position: absolute;
  top: 10px;
  left: 10px;
  color: ${({ theme }) => theme.text};
  cursor: text;
  pointer-events: none;
  transition: all 0.1s ease-in;
  background-color: transparent;
`;

export const Input = styled.input`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  border: 2px solid ${({ theme }) => theme.primary};
  border-radius: 10px;
  background: none;
  outline: none;
  padding: 10px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};

  &:hover {
    border-color: ${({ theme }) => theme.primaryHover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.primaryHover};
  }

  &:focus ~ label,
  &:not(:placeholder-shown):not(:focus) ~ label {
    top: -16px;
    font-size: 16px;
    padding: 0px 5px;
    background-color: ${({ theme }) => theme.modalBackground};
  }

  &.left-icon {
    padding-left: 40px;
  }

  &.right-icon {
    padding-right: 40px;
  }
`;

export const Message = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: 100%;
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
  white-space: nowrap;
  margin-top: 2px;

  & svg {
    opacity: 1;
    display: flex;
    width: 16px;
    height: 16px;
    stroke-width: 0.5px;
    margin: 1px 2px;
  }

  &.show {
    opacity: 1;

    &.error {
      color: ${({ theme }) => theme.error};

      & svg {
        fill: ${({ theme }) => theme.error};
        path {
          fill: ${({ theme }) => theme.error} !important;
        }
      }
    }

    &.success {
      color: ${({ theme }) => theme.success};

      & svg {
        fill: ${({ theme }) => theme.success};
        path {
          fill: ${({ theme }) => theme.success} !important;
        }
      }
    }

    &.warning {
      color: ${({ theme }) => theme.warning};

      & svg {
        fill: ${({ theme }) => theme.warning};
        path {
          fill: ${({ theme }) => theme.warning} !important;
        }
      }
    }

    &.processing {
      color: ${({ theme }) => theme.processing};

      ${SPIN}

      & svg {
        fill: ${({ theme }) => theme.processing};
        animation: spin 1s infinite steps(8);

        path {
          fill: ${({ theme }) => theme.processing} !important;
        }
      }
    }

    & svg {
      opacity: 1;
    }
  }
`;

export const RightIconBox = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  right: 16px;
  height: 100%;
  top: 0px;

  & svg {
    fill: ${({ theme }) => theme.text};
    path {
      fill: ${({ theme }) => theme.text} !important;
    }
  }
`;
