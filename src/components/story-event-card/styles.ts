import styled from "styled-components";
import { pSBC } from "@/lib/pSBC";
import { CARD_BORDER, Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: url(${(props): string => props.banner});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
`;

export const Title = styled.div`
  position: relative;
  bottom: -40px;
  font-size: 18px;
  font-weight: 600;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: var(--text);
  text-align: end;
  transform: translateY(160px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &.new {
    bottom: -110px;
    right: 70px;
  }

  &.profile {
    bottom: -160px;
    right: -10;
  }

  @container content-container (max-width: 1000px) {
    &.new {
      bottom: -80px;
      right: 50px;
      font-size: 16px;
    }
    bottom: 10px;
    font-size: 12px;
  }
`;

export const Description = styled.div`
  position: relative;
  bottom: -50px;
  right: 10px;
  font-size: 16px;
  font-weight: 300;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: var(--text);
  text-align: end;
  opacity: 0;
  transform: translateY(250px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &.new {
    bottom: -160px;
    right: 90px;
  }

  &.profile {
    bottom: -160px;
    right: -10;
  }

  @container content-container (max-width: 1000px) {
    &.new {
      bottom: -20px;
      right: 50px;
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
  height: 250px;
  min-width: 250px;
  min-height: 250px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};

  &.own {
    border: 3px solid var(--accent);
  }

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: story-card;
  container-type: size;

  &.profile {
    width: 180px;
    height: 180px;
    min-width: 180px;
    min-height: 180px;
  }

  @container content-container (max-width: 1000px) {
    & {
      width: 200px;
      height: 200px;
      min-width: 200px;
      min-height: 200px;
    }
  }

  @container content-container (min-width: 1000px) {
    &:hover {
      z-index: ${Z_INDEX.MODAL};
      transform: scale(1.2);
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
    fill: var(--text);
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

export const CardFooter = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: end;
  font-size: 14px;
  font-weight: 600;
  padding: 20px;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;
  background: linear-gradient(
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
  );

  @container content-container (max-width: 1000px) {
    & {
      height: 30px;
      font-size: 8px;
      padding: 10px;
      opacity: 1;
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
  background: linear-gradient(
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
  );
  cursor: pointer;

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

  @container content-container (min-width: 1000px) {
    &:hover {
      background: linear-gradient(
        ${({ theme }: any): string =>
          theme.cardDarkerBackgroundGradient.join(", ")}
      );
      & ${Title} {
        transform: translateY(0);
      }

      & ${Description} {
        transform: translateY(0);
      }

      & ${Description}, ${CardFooter}, ${Button} {
        opacity: 1;
      }
    }
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
