import { BORDER_RADIUS, Z_INDEX } from "@/theme";
import styled from "styled-components";
import { Hideable } from "../visibility-provider";

export const Container = styled.div<Partial<Hideable>>`
  position: fixed;
  z-index: ${Z_INDEX.MODAL};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  contain: paint;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;

  @supports (backdrop-filter: blur()) {
    backdrop-filter: blur(60px);
    background-color: ${({ theme }) =>
      theme.name === "dark" ? "rgba(0, 0, 0, 0.6);" : "transparent"};
  }

  ${({ isVisible }) => !isVisible && "display: none;"}
`;

export type ContentProps = {
  width?: string;
  height?: string;
  minHeight?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
};

export const Content = styled.div<ContentProps>`
  z-index: ${Z_INDEX.MODAL_CONTENT};
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
  box-shadow: 0px 5px 20px 10px ${({ theme }) => theme.cardBoxShadowColor};

  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}

  overflow: auto;
  resize: both;
  ${({ minHeight }) => minHeight && `min-height: ${minHeight};`}
  ${({ minWidth }) => minWidth && `min-width: ${minWidth};`}
  ${({ maxWidth }) => maxWidth && `max-width: ${maxWidth};`}
  ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}
`;

export const CloseButton = styled.div`
  z-index: ${Z_INDEX.MODAL_CONTENT};
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
    fill: ${({ theme }) => theme.primary};
  }

  &:hover svg {
    fill: ${({ theme }) => theme.error};
  }
`;
