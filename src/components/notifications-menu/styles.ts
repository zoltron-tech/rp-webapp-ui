import {
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  BACKGROUND_BLUR,
  Z_INDEX,
} from "@/theme";
import styled from "styled-components";

export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  position: absolute;
  margin-top: 8px;
  right: 4.7rem;
`;

export const Menu = styled.div`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 60px;
  right: 0px;

  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.modalBackground};
  width: max-content;
  height: max-content;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity, width, height;
  ${BASE_TRANSITION}
  ${BACKGROUND_BLUR()}

  border-radius: var(--border-radius);

  &.open {
    opacity: 1;
    pointer-events: all;
  }

  hr {
    height: 1px;
    opacity: 0.6;
  }
`;

export const NotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(10%, -10%);
  background-color: ${({ theme }) => theme.unreadBadge};
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 100%;
  padding: 6px;
  min-width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: ${({ theme }) => theme.text};
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
    background-color: ${({ theme }) => theme.primary};
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
