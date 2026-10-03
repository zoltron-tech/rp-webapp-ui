import { styled } from "styled-components";
import { BASE_TRANSITION } from "@/theme";

export const DropdownContainer = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  border-radius: var(--border-radius);
  background-color: ${({ theme }: any) => theme.modalBackground};
  opacity: 0;
  pointer-events: none;
  height: 0px;
  transition-property: height, opacity;

  ${BASE_TRANSITION}

  &.show {
    opacity: 1;
    pointer-events: all;
  }
`;
