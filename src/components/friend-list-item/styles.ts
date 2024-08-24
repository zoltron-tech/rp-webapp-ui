import { styled } from "styled-components";
import * as Common from "@/components/common";
import { Z_INDEX, CARD_BORDER } from "@/theme";

type CardProps = {
  banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.background};
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
    }
  }

  @container page-container (max-width: 600px) {
    & {
      width: 60px;
      height: 60px;
      min-width: 60px;
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
  border-bottom: 1px solid dimgray;
`;

export const Avatar = styled(Common.Avatar)`
  margin-top: 15px;
  @container friend-list-card (max-width: 160px) {
    & {
      margin-top: 10px;
      --size: 40px;
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
