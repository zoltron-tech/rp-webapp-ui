import { styled } from "styled-components";

import * as Common from "@/components/common";
import { Z_INDEX, CARD_BORDER } from "@/theme";
import { Container, Flex } from "@novelist-world/ui";
import { pSBC } from "@/lib/pSBC";
import { setOpacity } from "@/utils/helpers/theme";

export const LocalContainer = styled(Container)`
  border-radius: 0px;
  padding: 0px;
  border: none;
`;

export const ListContainer = styled.div`
  height: 75dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-thumb,
  &::-webkit-scrollbar {
    visibility: hidden;
    width: 0.35em;
  }

  &:hover {
    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-thumb,
    &::-webkit-scrollbar {
      visibility: visible;
    }
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  min-height: 80px;
  padding-inline: 30px;

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: friend-list-card;
  container-type: size;

  @container page-container (max-width: 600px) {
    & {
      height: 60px;
      min-height: 60px;
      padding-inline: 10px;
    }
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  height: 100%;
  contain: paint;
  gap: 1em;
  border-bottom: 1px solid dimgray;
`;

export const Avatar = styled(Common.Avatar)`
  margin-top: 15px;
  @container friend-list-card (max-width: 600px) {
    margin-top: 10px;
    --size: 40px;
  }
`;

export const Info = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  font-size: 16px;

  @container friend-list-card (max-width: 100px) {
    & {
      font-size: 12px;
      display: none;
    }
  }
`;

export const username = styled(Common.Username)`
  font-size: 16px !important;

  @container friend-list-card (max-width: 400px) {
    & {
      font-size: 14px !important;
    }
  }
`;

export const Button = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  margin-top: 15px;
  z-index: ${Z_INDEX.MODAL};
  cursor: pointer;

  & svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.text};
    transition: transform 0.2s ease-in-out;

    pointer-events: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hoverGrey};
  }

  @container (max-width: 500px) {
    width: 20px;
    height: 20px;

    & svg {
      width: 10px;
      height: 10px;
    }
  }
`;

export const MakeAdminButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.warning, 0.8))};
  }
`;

export const RemoveMemberButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
  }
`;

export const AddMemberButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
  }
`;
