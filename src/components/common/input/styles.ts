import styled from "styled-components";
import { SPIN } from "@/theme";
import { setOpacity } from "@/utils/helpers";

export const InputWrapper = styled.div`
  margin-bottom: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 4px;
  margin-top: 10px;
  font-style: italic;
`;

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px;
`;

export const InputLabel = styled.label`
  color: ${({ theme }) => theme.text};
  pointer-events: none;
  /* vertical-align: middle; */
  transition: all 0.12s linear;
  z-index: 1;
`;

export const Input = styled.input`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  border: 2px solid ${({ theme }) => setOpacity(theme.inputBackground, 0.4)};
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  padding: 18px 10px 10px 15px;
  color: ${({ theme }) => theme.textStark};
  overflow: hidden;
  background-color: ${({ theme }) => theme.inputBackground};

  &:not(:read-only):hover {
    border-color: ${({ theme }) => setOpacity(theme.primary, 0.6)};
  }

  &:not(:read-only):focus {
    border-color: ${({ theme }) => setOpacity(theme.primary, 0.6)};
  }

  &:focus ~ label,
  &:not(:placeholder-shown):not(:focus) ~ label {
    transform: translate(0px, -12px);
    font-size: 11px;
    font-weight: 400;
    color: ${({ theme }) => theme.text};
    /* padding: 0px 5px; */
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
  justify-content: center;
  right: 16px;
  height: 100%;
  top: 0px;
  cursor: pointer;

  & svg {
    transition: opacity 0.1s ease-in-out;
    opacity: 0.5;
    fill: ${({ theme }) => setOpacity(theme.primary, 0.6)};
    width: 100%;
    height: 28px;
    path {
      fill: ${({ theme }) => theme.text};
    }

    &:hover,
    &.visible {
      opacity: 1;
      fill: ${({ theme }) =>
        theme.name === "light" ? theme.primary : theme.text};

      path {
        fill: ${({ theme }) =>
          theme.name === "light" ? theme.primary : theme.text};
      }
    }
  }
`;
