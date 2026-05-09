import { styled } from "styled-components";
import * as Common from "@/components/common";
import { CARD_BORDER, Z_INDEX } from "@/theme";
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
  width: 300px;
  min-width: 300px;
  height: 300px;
  min-height: 300px;

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};
  border-radius: 12px;
  overflow: hidden;
  ${CARD_BORDER}

  .avatar {
    width: 130px;
    height: 130px;
  }

  @media (max-width: 400px) {

    width: 160px;
    min-width: 160px;
    height: 220px;
    min-height: 220px;
    
    .avatar {
      width: 80px;
      height: 80px;
    }
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
  contain: paint;
  gap: 8px;
  padding: 16px;
`;

export const Avatar = styled(AvatarNew)`
  .avatar {
    width: 80px;
    height: 80px;
  }
`;

export const Info = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
`;

export const Title = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
`;

export const UsernameStyled = styled(Common.Username)`
  font-size: 14px !important;
  color: var(--text-secondary);
`;

export const ButtonContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
`;
