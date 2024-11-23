import * as Common from "@/components/common";
import { Z_INDEX, CARD_BORDER, BORDER_RADIUS } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import { Container } from "@novelist-world/ui";
import styled from "styled-components";

export const ParentContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0px;
  padding: 0px;
  border-radius: 0px;
  border: none;

  @container content-container (max-width: 1400px) {
    flex-direction: column;
    justify-content: center;
    border-radius: 0px;
    padding: 0px;
    border: none;
  }
`;

export const RepliesContainer = styled(Container)`
  margin-bottom: 80px;
  margin-left: 150px;

  @container content-container (max-width: 600px) {
    margin-bottom: 50px;
    margin-left: 40px;
  }
`;

export const CommentsHeader = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-block: 10px;
  margin-left: 100px;
  text-align: left;
  width: 100%;

  @container content-container (max-width: 1400px) {
    font-size: 16px;
    font-weight: 400;
  }

  @container content-container (max-width: 800px) {
    font-size: 14px;
    font-weight: 400;
  }

  @container content-container (max-width: 400px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

export const CommentsContainer = styled(Container)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 0px;
  border: none;
  height: 92vh;

  @container content-container (max-width: 1400px) {
    height: max-content;
  }
`;

export const ScrollableContent = styled.div`
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  height: inherit;

  transition-property: scrollbar-color;
  transition-timing-function: ease-in-out;
  transition-duration: 200ms;

  &:hover {
    scrollbar-color: ${({ theme }) => setOpacity(theme.primary, 0.5)}
      transparent;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 20px;
  width: 100%;

  @container (max-width: 800px) {
    & {
      padding-left: unset;
    }
  }
`;

export const Avatar = styled(Common.Avatar)`
  margin-block: 10px;

  @container (max-width: 500px) {
    & {
      margin-top: 10px;
      --size: 30px;
    }
  }
`;

export const SourceName = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  cursor: pointer;

  &.reply {
    font-size: 16px;
    font-weight: 400;
  }

  @container (max-width: 1000px) {
    & {
      font-size: 14px;
    }

    &.reply {
      font-size: 14px;
      font-weight: 400;
    }
  }

  @container (max-width: 800px) {
    & {
      font-size: 12px;
    }

    &.reply {
      font-size: 12px;
      font-weight: 400;
    }
  }

  @container (max-width: 700px) {
    & {
      font-size: 10px;
    }

    &.reply {
      font-size: 10px;
      font-weight: 400;
    }
  }

  @container (max-width: 500px) {
    & {
      font-size: 8px;
    }

    &.reply {
      font-size: 8px;
      font-weight: 400;
    }
  }
`;

export const PromptText = styled.div`
  font-size: 14px;
  font-weight: 200;
  max-width: 60%;
  padding-left: 25px;
  font-style: italic;
  white-space: pre-wrap;

  @container (max-width: 800px) {
    & {
      padding-left: unset;
      font-size: 12px;
    }
  }

  @container (max-width: 700px) {
    & {
      padding-left: unset;
      font-size: 10px;
    }
  }

  @container (max-width: 500px) {
    & {
      padding-left: unset;
      font-size: 8px;
    }
  }
`;

export const Date = styled.div`
  font-size: 12px;
  font-weight: 200;

  @container (max-width: 1400px) {
    & {
      font-size: 10px;
    }
  }

  @container (max-width: 800px) {
    & {
      font-size: 8px;
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

  background-image: url(${(props): string => props.banner});
  background-size: cover;
  transition-timing-function: ease-out;
  transition-duration: 300ms;
  transition-property: scale;
  background-repeat: no-repeat;
  background-position: center center;
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 450px;
  height: 450px;
  margin-inline: 20px;
  border-radius: 3%;
  margin-block: 10px;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: card;
  container-type: size;

  &.reply {
    width: 400px;
    height: 400px;
    margin-inline: 20px;
  }

  @container (max-width: 800px) {
    & {
      width: 400px;
      height: 400px;
    }

    &.reply {
      width: 300px;
      height: 300px;
      margin-inline: unset;
    }
  }

  @container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
    }

    &.reply {
      width: 280px;
      height: 280px;
      margin-inline: unset;
    }
  }

  @container (max-width: 500px) {
    & {
      width: 300px;
      height: 300px;
    }

    &.reply {
      width: 250px;
      height: 250px;
      margin-inline: unset;
    }
  }

  @container (max-width: 400px) {
    & {
      width: 250px;
      height: 250px;
    }

    &.reply {
      width: 200px;
      height: 200px;
      margin-inline: unset;
    }
  }

  @container (max-width: 350px) {
    & {
      width: 200px;
      height: 200px;
    }

    &.reply {
      width: 150px;
      height: 150px;
      margin-inline: unset;
    }
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;
