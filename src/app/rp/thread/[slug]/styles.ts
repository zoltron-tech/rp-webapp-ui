import { Container } from "@novelist-world/ui";
import styled from "styled-components";
import * as Common from "@/components/common";
import { CARD_BORDER, Z_INDEX } from "@/theme";

export const ParentContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  z-index: ${Z_INDEX.CARD};
  background-color: transparent;
  border-radius: unset !important;
  border: none !important;

  @container content-container (max-width: 1400px) {
    flex-direction: column;
    justify-content: center;
    border-radius: 0px;
    padding: 0px;
    border: none;
  }
`;

export const RepliesContainer = styled.div`
  max-width: 800px;
  margin-top: 40px;

  width: 100%;
  padding: 20px;
  z-index: ${Z_INDEX.CARD_EXPAND};
  background-color: var(--bg-2);
  border: 0.85px solid var(--bg-6);

  @container content-container (max-width: 800px) {
    max-width: 100%;
    margin-bottom: 50px;
    margin-left: unset;
    border: none;
    border-radius: unset;
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
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 20px;
  width: 100%;
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
`;

export const PromptText = styled.div`
  font-size: 16px;
  font-weight: 300;
  max-width: 60%;
  padding-left: 25px;
  white-space: pre-wrap;

  @container (max-width: 700px) {
    & {
      padding-left: unset;
      font-size: 12px;
      font-weight: 400;
    }
  }
`;

export const StyledDate = styled.div`
  font-size: 12px;
  font-weight: 200;

  @container (max-width: 1400px) {
    & {
      font-size: 10px;
      font-weight: 300;
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
