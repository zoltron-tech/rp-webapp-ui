import styled from "styled-components";
import { CARD_BG_BLUR, SPIN, Z_INDEX } from "@/theme";

export const Background = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: ${Z_INDEX.MODAL};
  cursor: progress;

  ${CARD_BG_BLUR}
`;

export const Spinner = styled.div`
  top: 50%;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -50%) rotate(45deg);
  ${SPIN}

  & svg {
    width: clamp(50px, 10cqw, 100px);
    height: auto;
    fill: ${({ theme }: any) => theme.processing};
    animation: spin 0.8s infinite linear;

    path {
      fill: ${({ theme }: any) => theme.processing} !important;
    }
  }
`;
