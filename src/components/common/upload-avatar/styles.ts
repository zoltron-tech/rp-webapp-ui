import { styled, css } from "styled-components";
export const AvatarPositionStyle = css`
  position: absolute;
  top: 0;
  left: 0px;
  width: clamp(150px, 30cqw, 400px);
  height: clamp(150px, 30cqw, 400px);
  overflow: hidden;
  border-radius: 50%;
  scale: 0.6;
  transform: translate(-20%, 0%);
`;

export const FileInputHidden = styled.input`
  ${AvatarPositionStyle}
  opacity: 0;
  z-index: 2;
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
  background-color: ${({ theme }) => theme.cardBackgroundColor};
  z-index: 1;
  opacity: 1;
  box-shadow: 0px 3px 10px 5px ${({ theme }) => theme.cardBoxShadowColor};
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
    stroke: ${({ theme }) => theme.primary};
    opacity: 0;
    transition: opacity 0.15s linear;
    z-index: 2;
  }

  & > img {
    opacity: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.15s linear;
  }

  &.added > img {
    opacity: 1;
  }
`;
