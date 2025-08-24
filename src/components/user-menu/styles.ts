import styled from "styled-components";
import { BACKGROUND_BLUR, BASE_TRANSITION, DEV_MODE_BORDER } from "@/theme";
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
  padding: 10px 0px;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: ${({ theme }: any) => theme.modalBackground};

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

  @media (max-width: 700px) {
    & {
      top: 55px;
    }
  }
`;

export const ContentContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}

  position: relative;
  width: max-content;
  height: max-content;

  .avatar {
    width: var(--font-size-h2);
    height: var(--font-size-h2);
  }

  @media screen and (max-width: 480px) {
  .avatar {
    width: var(--font-size-h3);
    height: var(--font-size-h3);
  }
  }
`;

export const Separator = styled.div`
  border-top: 1px solid #42434a;
`;

export const List = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0px 8px;
`;

export const Element = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: rgb(171, 178, 189);
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease-out;

  svg {
    width: 19px;
    height: 19px;
    transition: all 0.3s ease-out;
  }

  &:hover {
    background-color: var(--accent);
    color: #ffffff;

    svg {
      stroke: #ffffff;
    }
  }
`;

export const DeleteElement = styled(Element)`
  &:hover {
    background-color: #8e2a2a;
  }
`;

export const DisabledElement = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: rgb(103, 109, 117);
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
`;

export const LastSectionElement = styled(Element)`
  color: ${({ theme }: any) => theme.primaryLoading};

  svg {
    stroke: #bd89ff;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.primaryAlpha};

    svg {
      stroke: #bd89ff;
    }
  }
`;
