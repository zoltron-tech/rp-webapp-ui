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
  position: absolute;
  bottom: -280px;
  right: 10px;
  font-size: 20px;
  font-weight: 600;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: ${({ theme }: any) => theme.text};
  text-align: end;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &.new {
    bottom: -160px;
    right: 60px;
  }

  &.profile {
    bottom: -180px;
    right: -10;
  }

  @container content-container (max-width: 1000px) {
    &.new {
      bottom: -100px;
      right: 30px;
      font-size: 16px;
    }
    bottom: -180px;
    font-size: 12px;
    opacity: 1;
    transform: none;
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 250px;
  min-width: 250px;
  min-height: 300px;
  height: 300px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};

  &.own {
    border: 3px solid ${({ theme }: any) => theme.primary};
  }

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: story-card;
  container-type: size;

  &.profile {
    height: 200px;
    width: 170px;
    min-width: 170px;
    min-height: 200px;
  }

  @container content-container (max-width: 1000px) {
    & {
      width: 170px;
      height: 200px;
      min-width: 170px;
      min-height: 200px;
    }
  }

  &.new {
    border: solid silver 2px;
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
  background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
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
    fill: ${({ theme }: any) => theme.text};
    transition: transform 0.2s ease-in-out;

    pointer-events: none;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.hoverGrey};
  }

  @container content-container (max-width: 1000px) {
    opacity: 1;
    transform: none;
    transition: none;
  }

  @container (max-height: 200px) {
    & {
      top: 5px;
      right: 0px;
      width: 25px;
      height: 25px;
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

  @container content-container (max-width: 1000px) {
    right: 35px;
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.processing, 0.8))};
  }

  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.processing, 0.8))};
  }
`;

export const DeleteButton = styled(Button)`
  top: 10px;
  right: 10px;

  background-color: ${({ theme }: any) => setOpacity(theme.error, 0.5)};

  @container content-container (max-width: 1000px) {
    right: 5px;
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
  }

  &:hover {
    background-color: ${({ theme }: any) =>
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
      ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
    );
    & ${Title} {
      transform: translateY(0);
      opacity: 1;
    }

    &:hover ${Title} {
      scale: 1.1;
    }
  }

  @container content-container (max-width: 1000px) {
    background: linear-gradient(
      ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
    );
  }

  @container content-container (min-width: 1000px) {
    &:hover {
      background: linear-gradient(
        ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
      );

      & ${Title} {
        transform: translateY(0);
      }

      & ${Title}, ${Button} {
        opacity: 1;
      }
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
