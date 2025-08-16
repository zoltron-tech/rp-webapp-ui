import { Container, Flex } from "@novelist-world/ui";
import { styled } from "styled-components";
import * as Common from "@/components/common";
import { pSBC } from "@/lib/pSBC";
import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers/theme";

export const LocalContainer = styled(Container)`
  border-radius: 0px;
  padding: 0px;
  border: none;
`;

export const HeaderFlex = styled(Flex)`
  margin-bottom: 20px;
  padding-left: 30px;

  @container page-container (max-width: 600px) {
    & {
      padding-left: 10px;
      margin-bottom: 10px;
    }
  }
`;

export const ListContainer = styled.div`
  height: 77dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
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
  background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  margin-top: 15px;
  z-index: ${Z_INDEX.MODAL};
  cursor: pointer;

  & svg {
    width: 20px;
    height: 20px;
    fill: var(--text);
    transition: transform 0.2s ease-in-out;

    pointer-events: none;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.hoverGrey};
  }
`;

export const MakeAdminButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
  }
  @container (max-width: 600px) {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
    width: 30px;
    height: 30px;

    & svg {
      width: 15px;
      height: 15px;
    }
  }
`;

export const RemoveMemberButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
  }
  @container (max-width: 600px) {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
    width: 30px;
    height: 30px;

    & svg {
      width: 15px;
      height: 15px;
    }
  }
`;

export const RemoveAdminButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.warning, 0.8))};
  }
  @container (max-width: 600px) {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.warning, 0.8))};

    width: 30px;
    height: 30px;

    & svg {
      width: 15px;
      height: 15px;
    }
  }
`;

export const AddMemberButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
  }
  @container (max-width: 500px) {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};

    width: 30px;
    height: 30px;

    & svg {
      width: 15px;
      height: 15px;
    }
  }
`;
