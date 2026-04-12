import styled from "styled-components";
import { CARD_BORDER, Z_INDEX } from "@/theme";

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: url(${(props): string => props.banner});
  background-color: var(--bg-2);
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
  font-size: var(--font-size);
  font-weight: 600;
  max-width: 80%;
  color: var(--text);
  text-align: end;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &:not(.new) {
    word-wrap: break-word;
    white-space: wrap;
  }

  &.new {
    bottom: -150px;
    text-align: center;
    opacity: 1;
    transform: translateY(0);
    width: 100%;
    max-width: 100%;
  }

  @container content-container (max-width: 1000px) {
    bottom: -180px;
  font-size: var(--font-size-xsmall);
    opacity: 1;
    transform: none;
    &.new {
      bottom: -100px;
    }
  }
`;

export const CardWrapper = styled.div`
  width: 169px;
  min-width: 169px;
  min-height: 300px;
  height: 300px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  &.hero {
    height: 200px;
    width: 113px;
    min-width: 113px;
    min-height: 200px;
  }

  &.hero ${Title} {
    font-size: 12px;
    right: -5px;
    bottom: -190px;
  }

  @container content-container (max-width: 1000px) {
    & {
      width: 113px;
      height: 200px;
      min-width: 113px;
      min-height: 200px;
    }

    &.hero {
      height: 120px;
      width: 68px;
      min-height: 120px;
      min-width: 68px;
    }

    &.hero ${Title} {
      font-size: 6px;
      bottom: -110px;
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

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-3);
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  width: 100%;
`;

export const ButtonLabel = styled.span;

export const Button = styled.button`
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  font-size: var(--font-size-xsmall);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;

  & svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    pointer-events: none;
  }

  &:active {
    transform: scale(0.96);
  }

  @container (max-height: 200px) {
    height: 26px;
    font-size: var(--font-size-xsmall);

    & svg {
      width: 8px;
      height: 8px;
    }
  }
`;

export const EditButton = styled(Button)`
  background-color: var(--bg-3);
  border-top-left-radius: 6px;
  color: #fff;

  &:hover {
    background-color: var(--accent);
  }
`;

export const DeleteButton = styled(Button)`
  background-color: rgb(86, 25, 25);
  border-top-right-radius: 6px;
  color: #fff;

  &:hover {
    background-color: rgb(134, 41, 41);
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

      &:not(.new) ${Title} {
        transform: translateY(0);
      }

      & ${Title}, ${Button} {
        opacity: 1;
      }
      cursor: pointer;
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
