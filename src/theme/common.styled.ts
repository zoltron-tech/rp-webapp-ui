"use client";

import { __DEV__ } from "@/utils/constants";
import { setOpacity } from "@/utils/helpers/theme";
import { css } from "styled-components";
import { Theme } from "./palette";

const DEV_MODE = __DEV__;

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
  border-top: 1px solid ${({ theme }: any) => theme.hoverGreyAlpha};
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

export const CARD_BG_BLUR = css`
  /* From https://css.glass */
  /* background: ${({ theme }: any) => theme.modalBackground}; */
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(13px);
  -webkit-backdrop-filter: blur(13px);
`;

export const BLUR_FILTER = css`
  filter: blur(80px);
  -webkit-filter: blur(80px);
  -moz-filter: blur(80px);
  -o-filter: blur(80px);
  -ms-filter: blur(80px);
`;

export const PILL = css`
  border-radius: 60px;
`;

export const DEV_MODE_BORDER = (color = "red") => css`
  ${DEV_MODE && `border: 1px solid ${color}`};
`;

export const BACKGROUND_FADE = (color: keyof Theme = "background") => css`
  background-color: ${({ theme }: any) => setOpacity(theme[color], 0.5)};
`;

export const BACKGROUND_BLUR = (color: keyof Theme = "background") => css`
  ${BACKGROUND_FADE(color)}
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
`;

export const BASE_TRANSITION = css`
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
`;

export const CARD_BORDER = css`
  border: 1px solid var(--bg-6);
`;
