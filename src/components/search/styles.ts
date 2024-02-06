import { SPIN, Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import { css, styled } from "styled-components";

const Background = css`
  background-color: ${({ theme }) => setOpacity(theme.background, 0.5)};
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
`;

const TypeSelectTypography = css`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textPrimary};
  padding: 2px 5px;
  user-select: none;
`;

const BoxShadow = css`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
`;

const BoxShadowLight = css`
  box-shadow: 0px 1px 5px 2px rgba(0, 0, 0, 0.2);
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  border-radius: 5px;
  box-shadow: none;
  z-index: 100;
  max-height: 400px;
  transition-property: width, height, box-shadow;
  transition-duration: 0.2s;
  transition-timing-function: linear;
  border-radius: var(--border-radius);
  height: var(--height);
  opacity: 1;
  z-index: ${Z_INDEX.DEFAULT - 1};
  pointer-events: none;
  ${Background}
`;

export const Wrapper = styled.div`
  --height: 40px;
  --max-width: 600px;
  --border-radius: calc(var(--height) / 2);
  --type-select-radius: calc(var(--border-radius) / 2);
  --type-select-width: calc(2 * var(--height));
  --type-select-gap: 2px;

  @container (max-width: 1024px) {
    --max-width: 60cqw;
  }

  height: var(--height);
  width: var(--height);

  position: relative;
`;

export const TypeSelectOption = styled.div`
  height: var(--height);
  width: var(--type-select-width);

  &:first-child {
    border-radius: var(--border-radius) 0 0 0;
  }

  &:last-child {
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }

  display: flex;
  justify-content: center;
  align-items: center;

  ${TypeSelectTypography}

  background-color: ${({ theme }) => theme.primary};
  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
  }
  cursor: pointer;
`;

export const TypeSelectOptions = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: var(--type-select-width);
  border-radius: var(--border-radius);
  height: max-content;
  background-color: ${({ theme }) => theme.primary};

  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  gap: var(--type-select-gap);

  opacity: 0;
  pointer-events: none;
  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  z-index: ${Z_INDEX.AVATAR + 1};
`;

export const TypeSelect = styled.div`
  height: var(--height);
  width: var(--type-select-width);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  position: relative;
  top: 50%;
  transform: translateY(-51%);
  left: 0px;
  color: ${({ theme }) => theme.textPrimary};
  z-index: ${Z_INDEX.AVATAR};

  transition-property: opacity, border-radius;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  cursor: pointer;

  ${TypeSelectTypography}

  background-color: ${({ theme }) => theme.primary};
  &:not(.expanded):hover {
    background-color: ${({ theme }) => theme.primaryHover};
  }

  &:hover {
    ${BoxShadowLight}
  }

  &.expanded {
    ${BoxShadowLight}
  }

  &.expanded ${TypeSelectOptions} {
    opacity: 1;
    pointer-events: all;
    ${BoxShadowLight}
  }
`;

export const Input = styled.input`
  border-radius: var(--border-radius);
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  background-color: transparent;
  border: none;
  transition: width 0.2s ease-in-out, height 0.2s ease-in-out,
    padding 0.2s ease-in-out;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  height: 0px;
  padding: 0px;
  z-index: ${Z_INDEX.DEFAULT + 1};
`;

export const Container = styled.div`
  max-width: var(--max-width);
  border-radius: var(--border-radius);
  background: transparent;
  height: var(--height);
  width: var(--height);
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: ${Z_INDEX.DEFAULT + 1};
  transition-property: width, background-color;
  transition-duration: 0.2s;
  transition-timing-function: linear;

  container-name: search-container;
  container-type: inline-size;

  & > input {
    width: 0px;
  }

  &.expanded {
    width: var(--max-width);

    &.type-select {
      & > ${TypeSelect} {
        opacity: 1;
        pointer-events: all;
      }

      & > ${Input} {
        /* left: var(--type-select-width); */
        max-width: calc(100cqw - var(--type-select-width));
      }
    }

    & > input:not(:placeholder-shown) + ${Dropdown} {
      height: min(400px, calc(100vh - var(--border-radius)));
      ${BoxShadow}
      pointer-events: all;
    }

    &:has(input:not(:placeholder-shown)) > ${TypeSelect} {
      border-radius: var(--border-radius) 0 0 0;
      transition-property: opacity;
    }

    & > input {
      height: var(--height);
      width: 100%;
      padding: 5px var(--height) 5px var(--border-radius);
    }

    & > button {
      background-color: ${({ theme }) => theme.primary};
      width: calc(var(--height) - 10px);
      height: calc(var(--height) - 10px);
      right: 5px;
      transition: background-color 0.2s ease-in-out;

      & > svg {
        color: ${({ theme }) => theme.textPrimary};
      }

      &:hover {
        background-color: ${({ theme }) => theme.error};
      }
    }
  }
`;

export const Button = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  border-radius: 50%;
  width: var(--height);
  height: var(--height);
  right: 0px;
  color: ${({ theme }) => theme.text};
  z-index: ${Z_INDEX.DEFAULT + 1};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
  cursor: pointer;
  transition: none;

  ${SPIN}

  & > svg {
    width: var(--border-radius);
    height: var(--border-radius);
  }

  &.loading {
    pointer-events: none;
    cursor: wait;
    background-color: ${({ theme }) => theme.primaryLoading};

    & svg.loading-icon {
      display: inline-block;
      opacity: 1;
      animation: spin 0.8s infinite linear;
    }
  }
`;
