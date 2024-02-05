import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import { css, styled } from "styled-components";

const Background = css`
  background-color: ${({ theme }) => setOpacity(theme.background, 0.3)};
  -webkit-backdrop-filter: blur(40px);
  backdrop-filter: blur(40px);
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
  transition: all 0.2s ease-in-out;
  border-radius: var(--border-radius);
  height: 0px;
  opacity: 0;
  z-index: ${Z_INDEX.DEFAULT - 1};
`;

export const Container = styled.div`
  --height: 40px;
  --max-width: 600px;
  --border-radius: calc(var(--height) / 2);

  max-width: var(--max-width);
  border-radius: var(--border-radius);
  background-color: ${({ theme }) => theme.background};
  height: var(--height);
  width: var(--height);
  position: relative;
  z-index: ${Z_INDEX.DEFAULT + 1};
  transition: width 0.2s ease-in-out, background-color 0.2s ease-in-out;

  & > input {
    width: 0px;
  }

  &.expanded {
    width: 100%;
    background-color: transparent;

    & > input:not(:placeholder-shown) + ${Dropdown} {
      height: min(400px, calc(100vh - var(--border-radius)));
      box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
      opacity: 1;

      ${Background}
    }

    & > input:placeholder-shown {
      ${Background}
    }

    & > input {
      display: block;
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

  & > svg {
    width: var(--border-radius);
    height: var(--border-radius);
  }
`;
