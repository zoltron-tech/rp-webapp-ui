import styled from "styled-components";
import {
  BACKGROUND_BLUR,
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  Z_INDEX,
} from "@/theme";
import { UnreadBadgeBase } from "../common/unread-badge";

export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  position: absolute;
  right: 4.5rem;

  @media (max-width: 700px) {
    right: 4rem;
  }

  @media (max-width: 480px) {
    right: 4rem;
  }
`;

export const IconWrapper = styled.div`
  position: relative;
  margin-top: 4px;
  right: 35px;
  container-type: inline-size;

  .menu-icon {
    height: 40px;
    width: 40px;
  }

  @media (max-width: 700px) {
    .menu-icon {
      height: 32px;
      width: 32px;
    }
  }
`;

export const Menu = styled.div`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 55px;
  right: 0px;

  display: flex;
  flex-direction: column;
  background-color: var(--bg-3);
  width: max-content;
  height: max-content;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity, width, height;
  ${BASE_TRANSITION}
  /* ${BACKGROUND_BLUR()} */

  border-radius: 5px;

  &.open {
    opacity: 1;
    pointer-events: all;
  }

  hr {
    height: 1px;
    opacity: 0.6;
  }

  @media (max-width: 700px) {
    & {
      top: 45px;
    }
  }
`;

export const NotificationBadge = styled(UnreadBadgeBase)`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(10%, -10%);
  border: 2px solid var(--bg-3);
  z-index: 10;
`;

export const ContentContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  position: relative;
  width: max-content;
  height: max-content;
  cursor: pointer;
`;

export const Text = styled.div`
  font-size: 14px;
  color: var(--text);
`;

export const NotificationBox = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  margin-left: 10px;
  font-size: 14px;
`;

export const CardWrapper = styled.div`
  position: relative;
  min-width: 250px;
  width: max-content;
  height: 60px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  padding: 5px;

  container-name: muse-card;
  container-type: size;

  &:hover {
    background-color: var(--accent);
  }

  &.end {
    height: 40px;
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  height: 100%;

  &.more-items-box {
    justify-content: center;
  }
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;
