import { css, styled } from "styled-components";
import { AVATAR_IMAGE, Z_INDEX } from "@/theme";

export const AvatarPositionStyle = css`
  position: absolute;
  top: 0;
  left: 0px;
  width: clamp(150px, 30cqw, 400px);
  height: clamp(150px, 30cqw, 400px);
  contain: paint;
  scale: 0.6;
  transform: translate(-20%, 0%);
`;

export const FileInputHidden = styled.input`
  ${AvatarPositionStyle}
  border-radius: 50%;
  opacity: 0;
  z-index: ${Z_INDEX.AVATAR};
  cursor: pointer;

  &:hover ~ div.nw-upload-avatar {
    background-size: 50%;

    & > svg {
      opacity: 1;
    }

    & > img {
      opacity: 0.5;
    }
  }
`;

export const UploadAvatar = styled.div`
  ${AvatarPositionStyle}

  ${AVATAR_IMAGE}
  background-color: ${({ theme }: any) => theme.cardBackgroundColor};
  z-index: ${Z_INDEX.DEFAULT};
  opacity: 1;
  box-shadow: 0px 3px 10px 5px ${({ theme }: any) => theme.cardBoxShadowColor};
  transition: opacity 0.15s linear;
  color: transparent;
  padding: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  & > svg {
    width: 50%;
    height: 50%;
    stroke: var(--accent);
    opacity: 0;
    transition: opacity 0.15s linear;
    z-index: ${Z_INDEX.AVATAR};
  }

  & > img {
    opacity: 0;
    transition: opacity 0.15s linear;
  }

  &.added > img {
    opacity: 1;
  }
`;
