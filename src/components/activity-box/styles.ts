import styled from "styled-components";
import { BORDER_RADIUS, CARD_BORDER, Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

export const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
  min-width: 0;
  overflow: hidden;
  padding-inline: 60px;
  margin-block: 5px;
  padding-top: 10px;

  @container content-container (max-width: 800px) {
    padding-inline: 10px;
    margin-block: 0px;
    width: 80%;
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
  border-bottom: 1px solid var(--bg-6);
  gap: 0.3em;

  @container content-container (max-width: 1000px) {
    margin-bottom: 10px;
  }

  @container content-container (max-width: 600px) {
    width: 98%;
    padding-inline: 5px;
    margin-bottom: 5px;
  }
`;

export const Avatar = styled(AvatarNew)`
  margin-block: 10px;
  height: 50px;
  width: 50px;

  @container (max-width: 500px) {
    & {
        margin-inline: unset;
        height: 30px;
        width: 30px;
    }
  }
`;

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 0.5em;
  margin-top: 5px;
  border-top: 1px solid var(--bg-6);

  @container content-container (max-width: 1000px) {
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
      font-size: 10px;
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

export const StyledDate = styled.div`
  font-size: 14px;
  font-weight: 200;

  @container (max-width: 1400px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 800px) {
    & {
      font-weight: 400;
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
  font-size: 24px;
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
  margin-inline: 10px;
  border-radius: 5px;
  margin-block: 10px;
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
    }
  }

  @container content-container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
    }
  }

  @container content-container (max-width: 500px) {
    & {
      width: 300px;
      height: 300px;
    }
  }

  @container content-container (max-width: 400px) {
    & {
      width: 200px;
      height: 200px;
    }
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;

export const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 5px;
  overflow: hidden;
`;

export const FallbackImageIcon = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.18);
  pointer-events: none;
`;

export const NSFWOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  color: #fff;
  text-align: center;
  font-size: var(--font-size-xsmall);
  border-radius: 5px;
  pointer-events: none;
`;

export const NSFWLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;

  @container muse-card (max-width: 320px) {
    font-size: 9px;
  }
`;

export const NSFWRevealButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 14px);
  z-index: 3;
  margin-top: 0;
  padding: 4px 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  background: transparent;
  color: #fff;
  font-size: var(--font-size-xsmall);
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: translate(-50%, 14px) scale(0.96);
  }

  @container muse-card (max-width: 320px) {
    font-size: 9px;
    padding: 2px 7px;
    transform: translate(-50%, -48px);

    &:active {
      transform: translate(-50%, -48px) scale(0.96);
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
  position: relative;
  height: 100%;
  z-index: 2;
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
  margin-bottom: 10px;
`;

export const ActivityInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
