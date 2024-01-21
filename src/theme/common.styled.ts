import { css } from "styled-components";

export const NO_USER_SELECT = css`
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const NO_SCROLLBAR = css`
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

export const BORDER_TOP = css`
  border-top: 1px solid ${({ theme }) => theme.hoverGreyAlpha};
`;

export const AVATAR_IMAGE = css`
  border-radius: 50%;
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);

  img {
    object-fit: cover;
    border-radius: 50%;
    pointer-events: none;
  }
`;

export const SPIN = css`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
