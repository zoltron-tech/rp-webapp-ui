import * as Common from "@/components/common";
import { Z_INDEX, CARD_BORDER, BORDER_RADIUS } from "@/theme";
import styled from "styled-components";

export const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 60px;
  margin-block: 5px;
  padding-top: 10px;
  background-color: ${({ theme }) => theme.background};

  border-radius: ${BORDER_RADIUS};
  ${CARD_BORDER};

  @container content-container (max-width: 600px) {
    padding-inline: 10px;
    margin-block: 0px;
    width: 100%;
    border-radius: 0px;
    border: none;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
  width: 100%;
  margin-block: 20px;
  padding-inline: 10px;
  // border-radius: ${BORDER_RADIUS};
  // ${CARD_BORDER};
  border-bottom: 1px solid slategray;
  gap: 0.5em;

  @container content-container (max-width: 1000px) {
    margin-bottom: 10px;
  }

  @container content-container (max-width: 600px) {
    padding-inline: 5px;
    margin-bottom: 5px;
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

export const ActivityText = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 300;
  margin-left: 20px;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 800px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 700px) {
    & {
      font-size: 10px;
    }
  }

  @container (max-width: 500px) {
    & {
      font-size: 8px;
    }
  }
`;

export const Date = styled.div`
  font-size: 16px;
  font-weight: 200;

  @container (max-width: 1400px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 800px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 8px;
    }
  }
`;

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
  font-size: 30px;
  font-weight: 600;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: white;
  text-align: center;

  @container content-container (max-width: 800px) {
    font-size: 20px;
  }

  @container content-container (max-width: 600px) {
    font-size: 18px;
  }

  @container content-container (max-width: 500px) {
    font-size: 16px;
  }

  @container content-container (max-width: 400px) {
    font-size: 14px;
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 500px;
  height: 500px;
  min-width: 500px;
  min-height: 500px;
  margin-inline: 100px;
  border-radius: 5%;
  margin-bottom: 50px;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @container content-container (max-width: 1000px) {
    & {
      margin-inline: 40px;
    }
  }

  @container content-container (max-width: 800px) {
    & {
      width: 400px;
      height: 400px;
      min-width: 400px;
      min-height: 400px;
      margin-inline: 20px;
      margin-bottom: 30px;
    }
  }

  @container content-container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
      min-width: 350px;
      min-height: 350px;
      margin-inline: 10px;
      margin-bottom: 20px;
    }
  }

  @container content-container (max-width: 500px) {
    & {
      width: 300px;
      height: 300px;
      min-width: 300px;
      min-height: 300px;
      margin-inline: 0px;
      margin-bottom: 10px;
    }
  }

  @container content-container (max-width: 400px) {
    & {
      width: 250px;
      height: 250px;
      min-width: 250px;
      min-height: 250px;
      margin-bottom: 10px;
    }
  }

  @container content-container (max-width: 350px) {
    & {
      width: 200px;
      height: 200px;
      min-width: 200px;
      min-height: 200px;
      margin-bottom: 0px;
    }
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

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
  background: linear-gradient(
    ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
  );
  cursor: pointer;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 50px;
`;

export const ActivityInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;
