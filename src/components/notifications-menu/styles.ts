import { BASE_TRANSITION, DEV_MODE_BORDER, BACKGROUND_BLUR } from "@/theme";
import styled from "styled-components";

export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  position: absolute;
  right: 6rem;
`;

export const Menu = styled.div`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 80px;
  right: 0px;

  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.modalBackground};
  width: max-content;
  height: max-content;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity, width, height;
  ${BASE_TRANSITION}
  ${BACKGROUND_BLUR()}

  border-radius: var(--border-radius);

  &.open {
    opacity: 1;
    pointer-events: all;
  }

  hr {
    height: 1px;
    opacity: 0.6;
  }
`;

export const ContentContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  position: relative;
  width: max-content;
  height: max-content;
`;
