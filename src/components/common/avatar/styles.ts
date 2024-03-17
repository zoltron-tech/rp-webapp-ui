import {
  AVATAR_IMAGE,
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  Z_INDEX,
} from "@/theme";
import { styled } from "styled-components";

interface AvatarProps {
  width?: number;
  height?: number;
  "data-size"?: number;
}

export const Name = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${Z_INDEX.AVATAR};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  opacity: 0;
  transition-property: opacity;
  ${BASE_TRANSITION}

  border-radius: 50%;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 0.75rem;
`;

export const Avatar = styled.div<AvatarProps>`
  --size: ${({ "data-size": size }) => `${size || 100}px`};

  ${AVATAR_IMAGE}
  ${DEV_MODE_BORDER("red")}
  width: var(--size);
  height: var(--size);
  z-index: ${Z_INDEX.AVATAR};
  margin-block: 5px;
  scroll-snap-align: center;
  box-shadow: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition-property: filter;

  ${BASE_TRANSITION}

  & > img {
    width: var(--size);
    height: var(--size);
    object-fit: cover;
  }

  &.hoverable {
    cursor: pointer;

    &:hover {
      filter: brightness(50%);
    }

    &:hover > ${Name} {
      opacity: 1;
    }
  }
`;
