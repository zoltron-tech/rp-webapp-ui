import { pSBC } from "@/lib/pSBC";
import { Z_INDEX, CARD_BORDER } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import styled from "styled-components";

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: url(${(props): string => props.banner});
  background-size: cover;
  transition-timing-function: ease-out;
  transition-duration: 300ms;
  transition-property: scale;
  background-repeat: no-repeat;
  background-position: center center;
`;

export const Title = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  font-size: 20px;
  font-weight: 600;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: ${({ theme }) => theme.text};
  text-align: end;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &.new {
    bottom: 140px;
    right: 100px;
  }

  @container content-container (max-width: 800px) {
    &.new {
      bottom: 85px;
      right: 60px;
      font-size: 16px;
    }

    font-size: 12px;
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  min-width: 300px;
  min-height: 300px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @container content-container (max-width: 800px) {
    & {
      width: 200px;
      height: 200px;
      min-width: 200px;
      min-height: 200px;
    }
  }

  &.new {
    border: solid silver 2px;
    border-radius: 60%;
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;

type CardProps = {
  banner: string;
};

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
  z-index: ${Z_INDEX.MODAL};
  transition: background-color 0.1s ease-in-out;
  opacity: 0;
  transition: opacity 0.5s ease;
  cursor: pointer;

  & svg {
    width: 15px;
    height: 15px;
    fill: ${({ theme }) => theme.text};
    transition: transform 0.2s ease-in-out;

    pointer-events: none;
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

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;

  &.new {
    background: linear-gradient(
      ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
    );
    & ${Title} {
      transform: translateY(0);
      opacity: 1;
    }

    &:hover ${Title} {
      scale: 1.1;
    }
  }

  &:hover {
    background: linear-gradient(
      ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
    );

    & ${Title} {
      transform: translateY(0);
    }

    & ${Title}, ${Button} {
      opacity: 1;
    }
    cursor: pointer;
  }
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;

export const MuseInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: end;
  font-size: 14px;
`;
