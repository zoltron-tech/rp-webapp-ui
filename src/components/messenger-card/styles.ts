import { styled } from "styled-components";

import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";
import Input from "../common/input";

export const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;

  margin-top: 10px;
  height: calc(100vh - 60px - 1rem);

  background-color: ${({ theme }) => theme.modalBackground};
`;

export const username = styled(Common.Username)`
  font-size: 13px;
`;

export const Title = styled.div`
  font-size: 16px;
  text-transform: uppercase;
  white-space: nowrap;
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 20px;
  width: 100%;

  & > svg {
    width: 25px;
    height: 25px;
  }

  &.expanded {
    & .expand {
      display: none;
    }
  }

  &.collapsed {
    justify-content: center;
    & > span {
      display: none;
    }
    & .collapse {
      display: none;
    }
  }
`;

export const Contacts = styled.div`
  width: 20%;
  height: 100%;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.modalBackground};

  transition-property: width;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;

  &.expanded {
    min-width: 250px;
    width: 20%;
  }

  &.collapsed {
    width: 70px;
  }
`;

export const Menu = styled.div`
  position: relative;
  top: 18px;
  left: 0px;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: fit-content;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity, width, height;

  &.open {
    opacity: 1;
    pointer-events: all;
  }
`;

export const NotificationBox = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
  align-items: start;
  justify-content: start;
  margin-left: 20px;
  font-size: 14px;
`;

export const MenuContainer = styled.div`
  position: absolute;
  bottom: 75px;
  right: 40px;

  & em-emoji-picker {
    height: 350px;
    width: 300px;
  }
`;

export const MenuItemBox = styled.div`
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TitleBox = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
  align-items: start;
  justify-content: start;
  margin-left: 20px;
  font-size: 20px;
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

export const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 50px;
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  padding: 5px 5px 5px 20px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.primary};
  }

  &.selected {
    background-color: ${({ theme }) => theme.primary};
  }

  &.collapsed {
    padding: 5px;
    & ${NotificationBox} {
      display: none;
    }

    & ${Card} {
      justify-content: center;
    }
  }
`;

export const ChatTitleContainer = styled.div`
  position: relative;
  min-width: 250px;
  width: 100%;
  height: 60px;
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  padding: 5px 5px 5px 20px;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;

export const ChatContainer = styled.div`
  width: 100%;
  min-width: 250px;
  height: 100%;
  /* min-height: 550px; */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

export const ChatBoxParent = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  background-color: ${({ theme }) => theme.inputBackground};
`;

export const ChatBox = styled.div`
  width: 100%;
  height: max-content;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 1rem;
  padding: 10px 0px;
  background-color: ${({ theme }) => theme.inputBackground};
`;

export const ChatRow = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  padding-inline: 30px;
`;

export const ChatInput = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-inline: 20px;
`;

export const MessageInput = styled(Input)`
  margin-top: 5px;
  width: 100%;
  margin-inline: 1px;
`;

type ProfileBackgroundFilterProps = {
  banner: string;
};
