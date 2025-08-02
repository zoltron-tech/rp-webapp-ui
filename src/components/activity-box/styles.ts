import * as Common from "@/components/common";
import { Z_INDEX, CARD_BORDER, BORDER_RADIUS } from "@/theme";
import styled from "styled-components";

export const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 800px;
  padding-inline: 60px;
  margin-block: 5px;
  padding-top: 10px;

  @container content-container (max-width: 800px) {
    padding-inline: 10px;
    margin-block: 0px;
    width: 100%;
  }

  @container content-container (max-width: 500px) {
    padding-inline: 0px;
    margin-block: 0px;
    width: 100%;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-inline: 10px;
  border-bottom: 1px solid var(--bg-6);
  gap: 0.3em;

  @container content-container (max-width: 1000px) {
    margin-bottom: 10px;
  }

  @container content-container (max-width: 600px) {
    width: 90%;
    padding-inline: 5px;
    margin-bottom: 5px;
  }
`;

export const Avatar = styled(Common.Avatar)`
  margin-block: 10px;

  @container (max-width: 500px) {
    & {
      margin-inline: unset;
      --size: 40px;
    }
  }
`;

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  gap: 0.5em;
  margin-top: 10px;
  border-top: 1px solid var(--bg-6);

  @container content-container (max-width: 1000px) {
    margin-bottom: 10px;
  }

  @container content-container (max-width: 600px) {
    width: 90%;
    padding-inline: 5px;
    margin-bottom: 5px;
  }
`;

export const SourceName = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  margin-left: 3px;
  cursor: pointer;

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
`;

export const ActivityText = styled.div`
  font-size: 14px;
  font-weight: 200;
  font-style: italic;
  text-align: left;
  margin-left: 3px;

  @container (max-width: 800px) {
    & {
      font-size: 11px;
      font-weight: 400;
    }
  }
`;

export const ViewMoreText = styled(ActivityText)`
  font-weight: 500;
  cursor: pointer;
`;

export const PromptText = styled(ActivityText)`
  text-transform: unset;
  font-style: unset;
  text-align: unset;
  max-width: 60%;
  margin-top: 30px;
  white-space: pre-wrap;
`;

export const PromptFooterText = styled.div`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  text-align: center;
  margin-block: 20px;
  cursor: pointer;

  @container (max-width: 800px) {
    & {
      font-size: 10px;
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
      font-weight: 300;
      font-size: 10px;
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
  margin-inline: 100px;
  border-radius: 10px;
  margin-block: 20px;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @container content-container (max-width: 800px) {
    & {
      width: 400px;
      height: 400px;
      margin-inline: 20px;
      margin-bottom: 30px;
    }
  }

  @container content-container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
      margin-inline: 10px;
      margin-bottom: 20px;
    }
  }

  @container content-container (max-width: 500px) {
    & {
      width: 300px;
      height: 300px;
      margin-inline: unset;
      margin-bottom: 10px;
    }
  }

  @container content-container (max-width: 400px) {
    & {
      width: 200px;
      height: 200px;
      margin-inline: 0px;
      margin-bottom: 10px;
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
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
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

export const Video = styled.video`
  width: 100%;
  height: 100%;
  border-radius: ${BORDER_RADIUS};
  object-fit: contain;
  background-color: black;
`;

export const Audio = styled.audio`
  width: 100%;
  height: 100%;
  border-radius: ${BORDER_RADIUS};
  object-fit: contain;
  background-color: black;
`;
