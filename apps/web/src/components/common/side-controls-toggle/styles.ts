import styled from "styled-components";
import { GLASS, Z_INDEX } from "@/theme";

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
    ${GLASS("bar")}
    border: 1px solid var(--glass-edge);
    color: var(--accent-11);
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;

    &:hover {
      color: var(--accent-12, var(--text));
      border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    }

    svg {
      width: 17px;
      height: 17px;
    }
  }
`;
