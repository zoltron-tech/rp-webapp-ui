import * as Common from "@/components/common";
import { pSBC } from "@/lib/pSBC";
import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import styled from "styled-components";

export const CardWrapper = styled.div`
  position: relative;
  width: 450px;
  height: 200px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @container (max-width: 800px) {
    & {
      height: 100px;
    }
  }
`;

type CardProps = {
  banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: linear-gradient(
      ${({ theme }) => theme.cardBackgroundTint},
      ${({ theme }) => theme.cardBackgroundTint}
    ),
    url(${(props): string => props.banner});

  background-position: center;
  background-size: cover;

  filter: blur(20px);
  -webkit-filter: blur(20px);
  -moz-filter: blur(20px);
  -o-filter: blur(20px);
  -ms-filter: blur(20px);
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  background: linear-gradient(
    ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
  );
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;

export const Button = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  z-index: ${Z_INDEX.CARD_EXPAND};
  transition: background-color 0.1s ease-in-out;
  cursor: pointer;

  & svg {
    width: 15px;
    height: 15px;
    fill: ${({ theme }) => theme.text};
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hoverGrey};
  }

  @container (max-height: 200px) {
    & {
      top: 5px;
      right: 0px;
      width: 30px;
      height: 30px;
    }

    & svg {
      width: 15px;
      height: 15px;
    }
  }
`;

export const EditButton = styled(Button)`
  top: 10px;
  right: 50px;
`;

export const DeleteButton = styled(Button)`
  top: 10px;
  right: 10px;

  background-color: ${({ theme }) => setOpacity(theme.error, 0.5)};

  &:hover {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
  }
`;

export const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

export const Avatar = styled(Common.Avatar)`
  --size: 160px;

  @container (max-height: 150px) {
    & {
      --size: 80px;
    }
  }
`;

export const MuseInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  font-size: 14px;
`;

export const Quote = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-top: 5px;
  word-break: break-word;

  &::before {
    content: "❝ ";
    font-weight: 400;
    font-size: 16px;
  }

  &::after {
    content: " ❞";
    font-weight: 400;
    font-size: 16px;
  }

  @container (max-height: 180px) {
    & {
      display: none;
    }
  }
`;
