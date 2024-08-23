import { styled } from "styled-components";
import * as Common from "@/components/common";
import { pSBC } from "@/lib/pSBC";
import { Z_INDEX, CARD_BORDER } from "@/theme";
import { setOpacity } from "@/utils/helpers";

type CardProps = {
  banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.background};

  /*background-image: linear-gradient(
      ${({ theme }) => theme.cardBackgroundTint},
      ${({ theme }) => theme.cardBackgroundTint}
    ),
    url(${(props): string => props.banner});
    */

  background-position: center;
  background-size: cover;

  /*filter: blur(20px);
  -webkit-filter: blur(20px);
  -moz-filter: blur(20px);
  -o-filter: blur(20px);
  -ms-filter: blur(20px);*/
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 300px;
  min-width: 300px;
  min-height: 300px;
  height: 300px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: stranger-card;
  container-type: size;

  @container content-container (max-width: 800px) {
    & {
      width: 200px;
      height: 200px;
      min-width: 200px;
      min-height: 200px;
    }
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
`;

export const Avatar = styled(Common.Avatar)`
  margin-top: 15px;
  @container (max-width: 200px) {
    & {
      margin-top: 10px;
      --size: 80px;
    }
  }
`;

export const Info = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  font-size: 14px;

  @container (max-width: 300px) {
    & {
      top: 100px;
      right: 0px;
      padding: 10px;
      font-size: 12px;
    }
  }
`;

export const Title = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 10px;

  @container (max-width: 200px) {
    & {
      font-size: 12px;
      margin-bottom: 0px;
    }
  }
`;

export const username = styled(Common.Username)`
  font-size: 16px !important;

  @container (max-width: 400px) {
    & {
      font-size: 14px !important;
    }
  }

  @container (max-width: 200px) {
    & {
      font-size: 10px !important;
    }
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  @container (max-width: 400px) {
    & {
      font-size: 12px !important;
    }
  }

  @container (max-width: 200px) {
    & {
      font-size: 10px !important;
    }
  }
`;
