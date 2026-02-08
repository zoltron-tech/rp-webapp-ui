import { Container } from "@novelist-world/ui";
import styled from "styled-components";
import * as Common from "@/components/common";
import { BORDER_RADIUS, CARD_BORDER, Z_INDEX } from "@/theme";

export const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: ${Z_INDEX.CARD};
  background-color: var(--bg-1);
  padding-block: 20px;

  @container content-container (max-width: 800px) {
    flex-direction: column;
    justify-content: center;
    border-radius: 0px;
    padding: 0px;
    border: none;
  }
`;

export const RepliesContainer = styled(Container)`
  max-width: 800px;
  margin-left: 50px;
  width: 100%;
  contain: unset;
  z-index: ${Z_INDEX.CARD_EXPAND};
  background-color: var(--bg-2);
  padding-top: unset;

  @container content-container (max-width: 800px) {
    max-width: 100%;
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
  width: 100%;
  margin-bottom: 30px;
  border-bottom: 1px solid dimgray;
`;

export const Avatar = styled(Common.Avatar)`
  margin-top: 10px;

  @container (max-width: 500px) {
    & {
      --size: 35px;
    }
  }
`;

export const Name = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 700;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 16px;
    }
  }
`;

export const HeaderInfoFlex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 500px;
  gap: 0.2em;
  margin-left: auto;

  @container (max-width: 1000px) {
    & {
      font-size: 16px;
    }
  }
`;

export const PromptText = styled.div`
  font-size: 16px;
  font-weight: 300;
  max-width: 90%;
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

export const DialoguetText = styled.div`
  width: 300px;
  font-size: 16px;
  font-weight: 300;
  padding: 10px;
  white-space: pre-wrap;
  background-color: var(--bg-2);
  ${CARD_BORDER}
  border-radius: ${BORDER_RADIUS};
  text-align: center;

  @container (max-width: 700px) {
    & {
      width: 200px;
      font-size: 12px;
      font-weight: 400;
    }
  }
`;

export const AuthorName = styled.div`
  margin-bottom: 20px;
  font-size: 12px;
  font-weight: 400;
  color: gray;
  align-self: flex-end;
  margin-right: 30px;

  @container (max-width: 1400px) {
    & {
      font-size: 10px;
      font-weight: 600;
    }
  }
`;

export const MuseName = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: gray;
  align-self: flex-end;
  margin: 0px 20px 30px 0px;

  @container (max-width: 1400px) {
    & {
      font-size: 10px;
      font-weight: 600;
    }
  }
`;

export const StyledDate = styled.div`
  font-size: 12px;
  font-weight: 200;
  width: 400px;

  @container (max-width: 1400px) {
    & {
      font-size: 10px;
      font-weight: 300;
      width: 200px;
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
  ${CARD_BORDER};

  &.reply {
    width: 350px;
    height: 350px;
  }

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: card;
  container-type: size;

  @container (max-width: 700px) {
    & {
      width: 350px;
      height: 350px;

      &.reply {
        width: 250px;
        height: 250px;
      }
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
