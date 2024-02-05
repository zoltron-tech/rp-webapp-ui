import { AVATAR_IMAGE, DEV_MODE_BORDER, Z_INDEX } from "@/theme";
import { styled } from "styled-components";

interface AvatarProps {
  width?: number;
  height?: number;
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
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.15s linear;
  border-radius: 50%;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 12px;
`;

export const Avatar = styled.div<AvatarProps>`
  ${AVATAR_IMAGE}
  ${DEV_MODE_BORDER("red")}
  width: var(--profile-small-avatar-size);
  height: var(--profile-small-avatar-size);
  ${(props) => props.width && `width: ${props.width}px;`}
  ${(props) => props.height && `height: ${props.height}px;`}
  z-index: ${Z_INDEX.AVATAR};
  margin-block: 5px;
  scroll-snap-align: center;
  box-shadow: none;
  position: relative;

  &.rotate {
    transform: rotate(90deg);
  }

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.hoverable {
    cursor: pointer;

    &:hover > ${Name} {
      opacity: 1;
    }
  }
`;
