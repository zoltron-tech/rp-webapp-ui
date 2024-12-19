import * as Common from "@/components/common";
import PromptInput from "@/components/prompt-input";
import { Z_INDEX, CARD_BORDER } from "@/theme";
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
  z-index: ${Z_INDEX.CARD};

  @container content-container (max-width: 1400px) {
    justify-content: center;
    border-radius: 0px;
    padding: 0px;
    border: none;
  }
`;

export const CommentsHeader = styled.div`
  margin-bottom: 10px;
  margin-left: 40px;
  text-align: left;
  width: 100%;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 500;
  font-style: italic;

  &.mobile {
    margin-block: unset;
    font-size: 14px;
    font-weight: 400;
  }

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

export const PromptContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 0px;
  border: none;
  height: 93vh;
  width: 100%;

  @container content-container (max-width: 800px) {
    height: 87vh;
  }
`;

export const ThreadsContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 0px;
  border: none;
  margin-top: 20px;
  height: 90vh;
  width: 20%;
  border-left: 1px solid dimgray;

  @container content-container (max-width: 800px) {
    display: none;
  }
`;

export const ThreadsContainerMobile = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  border-radius: 0px;
  border: none;
  border-radius: 5%;
  padding: unset;
  margin: unset;

  @container content-container (min-width: 800px) {
    display: none;
  }
`;

export const ScrollableContentHorzontal = styled(Container)`
  width: 100vw;
  display: flex;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 0px;
  border: none;
  margin: unset;
  padding-block: unset;
`;

export const ScrollableContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
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

export const ThreadBox = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid dimgray;
  padding-bottom: 20px;

  &.mobile {
    display: flex;
    border-top: 1px solid dimgray;
    padding-bottom: 5px;
    border-bottom-left-radius: 20%;
    min-width: 150px;
    margin-top: unset;
  }
`;

export const ToggleThread = styled.div`
  display: flex;
  padding: 1rem;
  text-align: center;
  background-color: transparent;
  margin-bottom: 10px;
  border-top: 1px solid dimgray;

  &.expanded {
    margin-bottom: unset;
    padding: 5px;
  }
`;

export const StyledPromptInput = styled(PromptInput)`
  transform: translateY(100%);
  opacity: 0;
  visibility: hidden;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out smooth;

  &.visible {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
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
      --size: 20px;
    }
  }
`;

export const SourceName = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 500;
  font-style: italic;
  text-align: right;
  cursor: pointer;

  &.reply {
    font-size: 14px;
    font-weight: 600;
  }

  &.action {
    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }

  @container (max-width: 1000px) {
    & {
      font-size: 16px;
    }

    &.reply {
      font-size: 12px;
      font-weight: 400;
    }
  }

  @container (max-width: 800px) {
    & {
      font-size: 14px;
    }

    &.reply {
      font-size: 8px;
      font-weight: 300;
    }
  }
`;

export const PromptText = styled.div`
  font-size: 16px;
  font-weight: 300;
  max-width: 60%;
  padding: 10px 0px 0px 0px;
  white-space: pre-wrap;

  &.mobile {
    padding: unset;
  }
  @container (max-width: 800px) {
    & {
      padding-left: unset;
      font-size: 14px;
    }
  }

  @container (max-width: 700px) {
    & {
      padding-left: unset;
      font-size: 12px;
    }
  }

  @container (max-width: 500px) {
    & {
      padding-left: unset;
      font-size: 10px;
    }
  }
`;

export const Date = styled.div`
  font-size: 1px;
  font-weight: 200;

  &.reply {
    font-size: 10px;
  }

  &.mobile {
    font-size: 8px;
  }

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
    width: 200px;
    height: 200px;
    margin-inline: 20px;
    border-radius: 30%;
  }

  &.mobile {
    width: 100px;
    height: 100px;
    margin-inline: 20px;
    border-radius: 30%;
    margin-block: 5px;
  }

  @container (max-width: 800px) {
    & {
      width: 400px;
      height: 400px;
    }

    &.reply {
      width: 180px;
      height: 180px;
      margin-inline: unset;
    }
  }

  @container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
    }

    &.reply {
      width: 130px;
      height: 130px;
      margin-inline: unset;
    }
  }

  @container (max-width: 500px) {
    & {
      width: 250px;
      height: 250px;
    }

    &.reply {
      width: 50px;
      height: 50px;
      margin-inline: unset;
    }
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;
