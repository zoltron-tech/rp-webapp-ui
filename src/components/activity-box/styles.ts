import styled from "styled-components";
import { BORDER_RADIUS, CARD_BORDER, Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

export const ParentContainer = styled.article`
  background-color: var(--bg-2);
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  margin-block: 8px;
  border: 1px solid var(--bg-5);
  border-radius: 8px;
  overflow: hidden;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  @media screen and (max-width: 600px) {
    border-radius: 0;
    border-left: none;
    border-right: none;
    margin-block: 4px;
    border: none;
  }
`;

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--bg-4);
  gap: 0;
`;

export const Avatar = styled(AvatarNew)`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  cursor: pointer;

  @media screen and (max-width: 430px) {
    width: 36px;
    height: 36px;
  }
`;

/** Wraps SourceName + ActivityText in a vertical stack beside the avatar. */
export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
  flex: 1;
  min-width: 0;
`;

export const SourceName = styled.h2`
  all: unset;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media screen and (max-width: 600px) {
    font-size: var(--font-size-input);
  }
`;

export const ActivityText = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 1px;
`;

export const ViewMoreText = styled(ActivityText)`
  font-weight: 600;
  cursor: pointer;
`;

export const PromptText = styled(ActivityText)`
  display: block;
  white-space: pre-wrap;
`;

export const StyledDate = styled.time`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  opacity: 0.65;
  margin-left: auto;
  flex-shrink: 0;
  align-self: flex-start;
  padding-top: 2px;
`;

/** Main content area between header and footer. */
export const Body = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
`;

export const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 16px;
  border-top: 1px solid var(--bg-4);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  transition: background-color 0.15s ease, color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-3);
      color: var(--accent);
    }
  }

  @media screen and (max-width: 600px) {
    padding: 14px 8px;
  }
`;

export const PromptFooterText = styled.span`
  font-size: var(--font-size-small);
  font-weight: 600;
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

export const Title = styled.div`
  font-size: 20px;
  font-weight: 700;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 85%;
  color: white;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);

  @container muse-card (max-width: 400px) {
    font-size: 16px;
  }

  @container muse-card (max-width: 280px) {
    font-size: 13px;
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: min(480px, 100%);
  aspect-ratio: 1;
  border-radius: 8px;
  ${CARD_BORDER};

  transition: transform 0.25s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @media screen and (max-width: 520px) {
    width: 100%;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);

      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }
`;

export const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 8px;
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
  border-radius: 8px;
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
