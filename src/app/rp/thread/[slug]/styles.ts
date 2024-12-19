import * as Common from "@/components/common";
import { Z_INDEX, CARD_BORDER } from "@/theme";
import { Container } from "@novelist-world/ui";
import styled from "styled-components";

export const ParentContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  z-index: ${Z_INDEX.CARD};
  background-color: transparent;

  @container content-container (max-width: 1400px) {
    flex-direction: column;
    justify-content: center;
    border-radius: 0px;
    padding: 0px;
    border: none;
  }
`;

export const RepliesContainer = styled(Container)`
  max-width: 60%;
  margin-bottom: 80px;
  margin-left: 50px;
  width: 100%;
  contain: unset;
  margin: 0px;
  padding: 0px;
  border-radius: 0px;
  z-index: ${Z_INDEX.CARD_EXPAND};
  border: none;
  background-color: transparent;

  @container content-container (max-width: 600px) {
    max-width: 100%;
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

  @container (max-width: 1000px) {
    & {
      font-size: 16px;
    }
  }

  @container (max-width: 800px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 700px) {
    & {
      font-size: 12px;
    }
  }
`;

export const PromptText = styled.div`
  font-size: 16px;
  font-weight: 300;
  max-width: 60%;
  padding-left: 25px;
  white-space: pre-wrap;

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

  @container (max-width: 800px) {
    & {
      width: 400px;
      height: 400px;
    }
  }

  @container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
    }
  }

  @container (max-width: 500px) {
    & {
      width: 250px;
      height: 250px;
    }
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;
