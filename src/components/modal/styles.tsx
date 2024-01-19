import { BORDER_RADIUS } from "@/theme";
import styled from "styled-components";
import { Button } from "@/components";

type ContainerProps = {
  open: boolean;
};

export const Container = styled.div<ContainerProps>`
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.592);
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ open }) => !open && "display: none;"}
`;

type ContentProps = {
  width?: string;
  height?: string;
};

export const Content = styled.div<ContentProps>`
  z-index: 1000;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.modalBackground};
  border-radius: ${BORDER_RADIUS};
  padding: 16px;
  min-height: 200px;
  min-width: 300px;
  box-shadow: 0px 5px 20px 10px rgb(0 0 0 / 60%);

  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
`;

export const CloseButton = styled.div`
  z-index: 9999;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  width: 30px;
  height: 30px;

  & svg {
    width: 30px;
    height: 30px;
  }
`;
