import { styled } from "styled-components";
import * as Common from "@/components/common";
import { CARD_BORDER, Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

export const CardWrapper = styled.div`
  position: relative;
  width: 300px;
  min-width: 300px;
  height: 300px;
  min-height: 300px;

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};
  border-radius: 8px;
  overflow: hidden;
  ${CARD_BORDER}

  .avatar {
    width: 130px;
    height: 130px;
  }

  @media (max-width: 800px) {

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
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  line-height: 1.2;

  @media (max-width: 800px) {
    font-size: var(--font-size-small);
  }
`;

export const UsernameStyled = styled(Common.Username)`
  font-size: var(--font-size-small) !important;
  color: var(--text-secondary);

  @media (max-width: 800px) {
    font-size: var(--font-size-xsmall) !important;
  }
`;

export const ButtonContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
`;
