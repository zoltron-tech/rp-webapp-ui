import { Container } from "@novelist-world/ui";
import styled from "styled-components";
import { Avatar as AvatarCommon } from "@/components/common";
import {
  BACKGROUND_BLUR,
  BLUR_FILTER,
  BORDER_RADIUS,
  CARD_BORDER,
  Z_INDEX,
} from "@/theme";

interface BannerProps {
  src: string | null;
}

export const Banner = styled.div<BannerProps>`
  width: 100cqw;
  /* height: clamp(
    var(--profile-banner-height-min),
    30cqw,
    var(--profile-banner-height-max)
  ); */
  top: 0px;
  height: 80dvh;
  z-index: ${Z_INDEX.BACKGROUND};
  position: absolute;

  background-image: url(${({ src }) => src});
  filter: grayscale(40%) brightness(40%) blur(25px);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  contain: paint;

  @container (max-width: 950px) {
    & {
      top: 0px;
      height: 92vh;
    }
  }

  /* ${BLUR_FILTER} */
`;

export const MuseContainer = styled.div`
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;

  @media (max-width: 350px) {
    & {
      padding-top: 0px;
      padding-inline: 0px;
      gap: 0.2rem;
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
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
`;

export const CardWrapper = styled(Container)`
  width: 326px;
  height: 580px;
  padding: 0px !important;
  &.open {
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  &.closed {
    border-radius: var(--border-radius);
  }

  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;
/* 
  @media (min-width: 2569px) {
    margin-top: 40px;
    width: 652px;
    height: 1160px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  } 
 
  @media (min-width: 2047px) and (max-width: 2559px) {
    margin-top: 40px;

    width: 489px;
    height: 870px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }  */

 @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 422px;
    height: 750px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }

  @media (min-width: 350px) and (max-width: 950px) {
    &.open {
      border-radius: 0px;
      display: none;
    }
  }

  @media (max-width: 350px) {
    margin-top: 0px;
    width: 100%;
    height: 70vh;

    &.open {
      border-radius: 0px;
      display: none;
    }

    &.closed {
      border-radius: 0px;
    }
  }
`;

export const CardExpandedWrapper = styled.div`
  position: relative;
  width: 326px;
  height: 580px;
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  /* @media (min-width: 2559px) {
    margin-top: 40px;
    width: 652px;
    height: 1160px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }

  @container (min-width: 2047px) and (max-width: 2559px) {
    margin-top: 40px;

    width: 489px;
    height: 870px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  } */

  @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 422px;
    height: 750px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }

  @media (min-width: 350px) and (max-width: 1024px) {
    &.open {
      border-radius: 0px;
      display: none;
    }
  }

  @media (max-width: 350px) {
    margin-top: 0px;
    width: 100%;
    height: 70vh;
    border-radius: 0px;
  }
`;

type CardProps = {
  banner: string;
};

export const Title = styled.div`
  margin-bottom: 10px;
  position: relative;
  align-self: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 200;
  color: var(--text);
  text-align: center;
`;

export const NoteContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS};

  ${BACKGROUND_BLUR()}

  padding: 10px 20px 20px;
`;

export const MenuText = styled.div`
  opacity: 1;
  margin-top: 5px;
  font-size: 12px;

  @container (max-height: 100px) {
    display: none;
    margin-top: 0px;
  }
`;

export const SideMenu = styled.div`
  position: relative;
  width: 100px;
  height: 580px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 0.8rem;
  margin-left: 10px;

  container-name: side-menu;
  container-type: size;

  /* @container (min-width: 2559px) {
    margin-top: 40px;
    width: 150px;
    height: 1160px;
  }

  @container (min-width: 2047px) and (max-width: 2559px) {
    margin-top: 40px;

    width: 140px;
    height: 870px;
  } */

  @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 100px;
    height: 725px;
  } 

  @media (min-width: 600px) and (max-width: 1024px) {
    margin-top: unset;
    width: 100px;
    height: 540px;
  } 

  @media (max-width: 600px) {
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    flex-direction: row;
    width: 400px;
    height: 50px;
    margin-left: unset;
  }
`;

export const MenuButton = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 50px;
  height: 70px;
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  justify-content: center;
  align-items: center;

  &.stick-top {
    position: absolute;
    top: 0px;
  }

  @container (max-width: 400px) and (max-height: 100px) {
    justify-content: normal;
    width: 50px;
    height: 40px;

    &.stick-top {
      position: relative;
    }
  }
`;

export const MenuButtonIcon = styled.div`
  position: relative;
  display: flex;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};
  background-color: ${({ theme }: any) => `${theme.modalBackground}98`};
  cursor: pointer;
  justify-content: center;
  align-items: center;

  ${CARD_BORDER};

  @container (min-height: 100px) {
    &:hover {
      scale: 1.1;
      background-color: var(--accent);
    }
  }

  @container (max-width: 400px) and (max-height: 100px) {
    width: 40px;
    height: 40px;
  }

  &.selected {
    scale: 1.1;
    background-color: var(--accent);
  }
`;

export const ConnectionsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS};
  height: 100%;
`;

export const Text = styled.div`
  font-size: 12px;
  font-weight: 200;
  padding-inline: 20px;
  color: var(--text);
  text-align: center;
  height: max-content;
`;

export const MuseName = styled.div`
  position: absolute;
  bottom: 15px;
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text);
  text-align: end;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease;

  @container content-container (max-width: 1000px) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

export const AuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;

  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease;

  .avatar {
    height: 30px;
    width: 30px;
    margin-right: 0.4rem;
  }

  @container content-container (max-width: 1000px) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

export const UsernameContainer = styled.div`
  & > div {
    text-align: center;
    font-size: var(--font-size-small);
  }

  .penned {
      font-size: var(--font-size-xsmall)
    }

  & > span {
    font-size: var(--font-size-small);
  }
`;

export const CardBack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
  background: linear-gradient(
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
  );

  & {
    ${BACKGROUND_BLUR()}
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

      & ${MuseName} {
        transform: translateY(0);
        opacity: 1;
      }

      & ${AuthorContainer} {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
`;

export const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover; /* This makes the video fill the container */
  transform: translate(-50%, -50%); /* This centers the video */
`;

export const InfoCardContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  height: 100%;
`;

export const VideoCardContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

export const ConnectionItem = styled.div`
  justify-content: flex-start;
  height: 60px;
  display: flex;
  flex-direction: row;
  width: inherit;
  font-size: var(--font-size-small);
  padding-inline: 20px;
  border-radius: ${BORDER_RADIUS};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  }
`;

export const ConnectionLabel = styled.span`
font-size: var(--font-size-small);
  font-weight: bold;
`;

export const ConnectionType = styled.span`
  text-transform: uppercase;
font-size: var(--font-size-small);
  font-style: italic;
`;

export const ScrollableContent = styled.div`
  margin-bottom: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  height: inherit;
  padding-bottom: 20px;

  transition-property: scrollbar-color;
  transition-timing-function: ease-in-out;
  transition-duration: 200ms;

  &:hover {
    scrollbar-color: var(--accent-6) transparent;
  }
`;

export const MuseInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: end;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

export const InfoContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  word-break: break-word;
  margin-top: 20px;
  gap: 0.5rem;
`;

export const InfoItem = styled.div`
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  width: inherit;
  font-size: 12px;
  padding-inline: 20px;
`;

export const InfoLabel = styled.span`
  width: 40%;
  font-weight: bold;
  text-align: start;
  vertical-align: middle;
`;

export const FandomValue = styled.span<{ color: string }>`
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-align: center;
  text-transform: uppercase; /* Title Vibe */
  vertical-align: middle;
  background-color: ${(props) => props.color};
  color: #fff; /* Ensures text stands out */
  border-radius: 999px; /* Fully rounded pill shape */
  padding: 6px 16px; /* Better padding for a sleek look */
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  /* Elegant text glow for depth */
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);

  /* Smooth hover effect */
  &:hover {
    filter: brightness(1.2); /* Slight brightening effect */
    transform: translateY(-1px); /* Subtle hover lift */
  }
`;

export const InfoValue = styled.span`
  width: inherit;
  text-align: end;
  vertical-align: middle;
`;

export const ExpandedContentInner = styled.div`
  display: flex;
  direction: column;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  width: 90cqw;
`;

export const Avatar = styled(AvatarCommon)`
  &.rotate {
    transform: rotate(90deg);
  }
  &.paddington {
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const PromptText = styled.div`
  font-size: 14px;
  font-weight: 200;
  max-width: 60%;
  font-style: italic;
  white-space: pre-wrap;
  margin-top: 20px;

  @container (max-width: 500px) {
    & {
      font-weight: 300;
    }
  }
`;

export const StyledDate = styled.div`
  font-size: 10px;
  font-weight: 300;
`;

export const PromptMedia = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 3%;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: card;
  container-type: size;

  @container (max-width: 400px) {
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

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid slategray;
  gap: 0.2em;
  padding-bottom: 10px;
  margin-bottom: 20px;
  padding-inline: 20px;

  @container content-container (max-width: 1000px) {
    margin-bottom: 10px;
  }

  @container content-container (max-width: 400px) {
    padding-inline: 5px;
    margin-bottom: 5px;
  }
`;

export const PromptFooterText = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 400;
  max-width: 80%;
  font-style: italic;
  text-align: center;
  cursor: pointer;
`;

export const ViewMoreText = styled.div`
  font-size: 12px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  cursor: pointer;
`;
