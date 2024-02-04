import {
  AVATAR_IMAGE,
  DEV_MODE_BORDER,
  NO_SCROLLBAR,
  PILL,
  Z_INDEX,
} from "@/theme";
import { css, styled } from "styled-components";
import { Pill } from "../common";

export const BoxCenteredContent = styled(Pill)`
  justify-content: flex-start;
  padding: 0px 20px;
  gap: 20px;
  /* width: 100%; */
  max-width: min(800px, calc(100cqw - 40px));
  min-width: 300px;
  contain: paint;
  position: relative;
  margin-top: 250px;
  margin-inline: auto;

  @container (max-width: 1024px) {
    & {
      margin-top: 0px;
    }
  }

  @container (max-width: 600px) {
    & {
      max-width: 100%;
      border-radius: 0px;
      width: 100cqw;
    }
  }
`;

export const MusesContainer = styled(BoxCenteredContent)`
  height: 120px;
  transition: height 0.2s ease-in-out;

  &.expanded {
    height: 500px;
  }

  container-name: muses-pill;
  container-type: inline-size;
  contain: paint;
`;

export const ScrollableAvatarContainer = styled.div`
  ${PILL}
  width: 120px;
  overflow-y: auto;
  padding: 0px 10px;
  position: absolute;
  /* top: -220px; */
  left: 60px;
  height: calc(100cqw - 200px);
  transform: rotate(-90deg) translateY(calc(50%));
  scroll-snap-type: y mandatory;
  transition: opacity 0.1s ease-in-out;
  pointer-events: all;

  ${NO_SCROLLBAR}
  ${DEV_MODE_BORDER("lime")}
  
  @container content-container (max-width: 1024px) {
    & {
      left: -50px;
      height: calc(100cqw - 80px);
    }
  }

  &.expanded {
    opacity: 0;
    pointer-events: none;
  }
`;

export const Searchbar = styled.div`
  background-color: ${({ theme }) => theme.cardBackgroundColor};
  height: 100px;
  border-radius: 50px;
  top: 10px;
  left: 120px;
  width: calc(100cqw - 200px);
  /* margin-right: 120px; */
  /* margin-inline: auto; */
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.1s ease-in-out;

  &.expanded {
    opacity: 1;
    pointer-events: all;
  }

  @container content-container (max-width: 1024px) {
    & {
      left: 10px;
      width: calc(100cqw - 80px);
    }
  }
`;

export const MagnifyingGlass = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  height: 80px;
  width: 80px;
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
  transition: opacity 0.1s ease-in-out;

  & svg {
    height: 80px;
    width: 80px;
  }

  &.expanded {
    opacity: 1;
    pointer-events: all;
  }
`;

export const ExpandMuses = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 50%;
  height: 100px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
  /* box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4); */

  & svg {
    height: 80px;
    width: 80px;
    transition: transform 0.2s linear;
    transform: rotate(0deg);
    fill: ${({ theme }) => theme.text};
  }

  &.expanded svg {
    transform: rotate(135deg);
  }

  &:hover {
    background-color: ${({ theme }) => theme.hoverGreyAlpha};
  }
`;

const MusesTagTypography = css`
  text-transform: uppercase;
  text-align: center;
  font-size: 16px;
  font-weight: 300;
  line-height: 24px;

  color: ${({ theme }) => theme.text};
`;

export const MusesTagInline = styled.div`
  ${MusesTagTypography}
  width: 80px;
  height: 120px;
  position: absolute;
  top: 0px;
  left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  @container content-container (max-width: 1024px) {
    & {
      display: none;
    }
  }
`;

export const MusesTagTop = styled.div`
  ${MusesTagTypography}
  width: 100%;
  display: none;
  margin-top: 40px;
  margin-bottom: 20px;

  @container content-container (max-width: 1024px) {
    & {
      display: block;
    }
  }
`;

export const Avatar = styled.div`
  ${AVATAR_IMAGE}
  width: var(--profile-small-avatar-size);
  height: var(--profile-small-avatar-size);
  z-index: ${Z_INDEX.AVATAR};
  transform: rotate(90deg);
  margin-block: 5px;
  scroll-snap-align: center;
  box-shadow: none;
  cursor: pointer;

  & > img {
    width: var(--profile-small-avatar-size);
    height: var(--profile-small-avatar-size);
    object-fit: cover;
  }
`;
