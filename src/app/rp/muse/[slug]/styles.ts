import { Avatar as AvatarCommon } from "@/components/common";
import { BACKGROUND_BLUR, BLUR_FILTER, BORDER_RADIUS, Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import styled from "styled-components";

interface BannerProps {
  src: string;
}

export const Banner = styled.div<BannerProps>`
  width: 100cqw;
  height: clamp(
    var(--profile-banner-height-min),
    30cqw,
    var(--profile-banner-height-max)
  );
  z-index: ${Z_INDEX.BACKGROUND};
  position: absolute;

  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-size: cover;
  contain: paint;

  ${BLUR_FILTER}
`;

export const MuseContainer = styled.div`
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  gap: 0.5rem;

  @container (max-width: 800px) {
    & {
      padding-top: 10px;
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  border-radius: ${BORDER_RADIUS};
  background-image: url(${(props): string => props.banner});
  background-size: cover;
  transition-timing-function: ease-out;
  transition-duration: 300ms;
  transition-property: scale;
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 350px;
  height: 580px;
  border: 1px solid gray;
  border-radius: var(--border-radius);

  cursor: pointer;

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @container (min-width: 2559px) {
    margin-top: 40px;
    width: 700px;
    height: 1160px;
  }

  @container (min-width: 2047px) and (max-width: 2559px) {
    margin-top: 40px;

    width: 525px;
    height: 870px;
  }

  @container (min-width: 1023px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 437.5px;
    height: 725px;
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

export const Title = styled.div`
  margin-bottom: 10px;
  position: relative;
  align-self: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 200;
  color: ${({ theme }) => theme.text};
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

export const ConnectionsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS};
  height: 100%;

  padding: 10px 20px 20px;
`;

export const Text = styled.div`
  font-size: 12px;
  font-weight: 200;
  padding-inline: 20px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  height: max-content;
`;

export const MuseName = styled.div`
  position: fixed;
  bottom: 100px;
  right: 10px;
  font-size: 30px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: end;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease;
`;

export const AuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;

  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease;
`;

export const UsernameContainer = styled.div`
  & > div {
    text-align: center;
    font-size: 20px;
  }

  max-width: 100%;

  & > span {
    font-size: 14px;
    margin-left: 1rem;
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
    ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
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

  &:hover {
    background: linear-gradient(
      ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
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
    scrollbar-color: ${({ theme }) => setOpacity(theme.primary, 0.5)}
      transparent;
  }
`;

export const MuseInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: end;
  font-size: 14px;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: absolute;
  bottom: 30px;
  right: 10px;
`;

export const InfoContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  word-break: break-word;
  margin-top: 20px;
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
  width: inherit;
  font-weight: bold;
  text-align: start;
  vertical-align: middle;
`;

export const InfoValue = styled.span`
  width: inherit;
  text-align: end;
  vertical-align: middle;
`;

export const ExpandedContentInner = styled.div`
  display: flex;
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
