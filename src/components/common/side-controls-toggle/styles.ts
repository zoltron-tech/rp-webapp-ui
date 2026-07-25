import styled from "styled-components";
import { Z_INDEX } from "@/theme";

/** Mobile-only — desktop has room enough that the side controls never need
 *  hiding. */
export const Toggle = styled.button<{ $topOffset?: number }>`
  display: none;

  @media (max-width: 600px) {
    display: flex;
    position: fixed;
    right: 22px;
    top: calc(
      var(--topbar-height, 45px) + 34px + ${({ $topOffset = 0 }) => $topOffset}px
    );
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    z-index: ${Z_INDEX.SCROLL_JUMP};
    background-color: var(--bg-3);
    border: 1px solid var(--accent-4);
    color: var(--accent);
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;

    &:hover {
      color: var(--accent-hover);
      border-color: var(--accent-hover);
    }

    svg {
      width: 17px;
      height: 17px;
    }
  }
`;
