import { BASE_TRANSITION, DEV_MODE_BORDER, BACKGROUND_BLUR } from "@/theme";
import styled from "styled-components";
import { Avatar } from "../common";

export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  position: absolute;
  right: 1rem;
`;

export const Menu = styled.div`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 60px;
  right: 0px;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.modalBackground};

  width: 15rem;
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

  --avatar-size: 4rem;
  position: relative;
  width: max-content;
  height: max-content;
`;

export const UserAvatar = styled(Avatar)`
  ${DEV_MODE_BORDER("green")}
  --size: var(--avatar-size);
`;
