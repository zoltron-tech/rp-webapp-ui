import { Z_INDEX } from "@/theme";
import { styled } from "styled-components";

export const Dropdown = styled.div`
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  border-radius: 5px;
  box-shadow: none;
  z-index: 100;
  overflow: hidden;
  max-height: 400px;
  transition: all 0.2s ease-in-out;
  border-radius: 30px;
  height: 0px;
  opacity: 0;
  z-index: ${Z_INDEX.DEFAULT - 1};
`;

export const Container = styled.div`
  max-width: 600px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.background};
  width: 60px;
  height: 60px;
  transition: width 0.2s ease-in-out, background-color 0.2s ease-in-out;
  position: relative;
  border-radius: 60px;
  z-index: ${Z_INDEX.DEFAULT + 1};

  & > input {
    width: 0px;
  }

  &.expanded {
    width: 100%;
  }

  &.expanded > input:not(:placeholder-shown) + ${Dropdown} {
    height: min(400px, calc(100vh - 20px));
    box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
    opacity: 1;
  }

  &.expanded > input {
    display: block;
    width: 100%;
    padding: 5px 60px 5px 30px;
  }

  &.expanded > button {
    background-color: ${({ theme }) => theme.primary};
    width: 30px;
    height: 30px;
    right: 15px;
    & > svg {
      color: ${({ theme }) => theme.textPrimary};
    }

    &:hover {
      background-color: ${({ theme }) => theme.error};
    }
  }
`;

export const Input = styled.input`
  border-radius: 60px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.background};
  border: none;
  transition: width 0.2s ease-in-out, padding 0.2s ease-in-out;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 100%;
  padding: 0px;
  z-index: ${Z_INDEX.DEFAULT + 1};
`;

export const Button = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  right: 0px;
  margin-right: 5px;
  color: ${({ theme }) => theme.text};
  z-index: ${Z_INDEX.DEFAULT + 1};
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.background};
  cursor: pointer;
  transition: width 0.2s linear, height 0.2s linear,
    background-color 0.2s linear, right 0.2s linear;

  & > svg {
    width: 25px;
    height: 25px;
  }
`;
