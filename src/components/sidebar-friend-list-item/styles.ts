import { styled } from "styled-components";
import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

type CardProps = {
  banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }: any) => theme.background};
`;

export const CardWrapper = styled.div`
  position: relative;
  min-height: 80px;
  height: 80px;
  padding-inline: 10px;

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: friend-list-card;
  container-type: size;

  @container page-container (max-width: 1200px) {
    & {
      height: 60px;
      min-height: 60px;
      padding-inline: 0px;
    }
  }

  @container page-container (max-width: 600px) {
    & {
      width: 80px;
      height: 60px;
      min-width: 80px;
      min-height: 60px;
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
  border-bottom: 1px solid var(--bg-6);
  justify-content: center;
  align-items: flex-start;

  .avatar {
    height: 45px;
    width: 45px;
  }
`;

export const Avatar = styled(AvatarNew)`
  margin-top: 15px;
  @container friend-list-card (max-width: 160px) {
    & {
      margin-top: 10px;
    }
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
