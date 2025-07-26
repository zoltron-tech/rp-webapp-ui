import { Avatar as AvatarCommon, Button, Pill } from "@/components/common";
import {
  BLUR_FILTER,
  BORDER_TOP,
  DEV_MODE_BORDER,
  NO_SCROLLBAR,
  Z_INDEX,
} from "@/theme";
import styled, { css } from "styled-components";
import { Badge } from "../../tiers/styles";
import { Container } from "@novelist-world/ui";

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

export const EditProfile = styled.div`
  position: absolute;
  top: 100px;
  right: 30px;
  z-index: ${Z_INDEX.AVATAR};

  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }: any) => theme.textPrimary};
  font-size: 24px;
`;

export const Content = styled.div`
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  max-width: 1400px;
  margin-inline: auto;
  width: 100cqw;
  height: max-content;
  display: flex;
  position: relative;
  z-index: ${Z_INDEX.DEFAULT};

  container-name: profile-content;
  container-type: inline-size;

  ${DEV_MODE_BORDER("green")}
`;

export const ContentRight = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  flex-direction: column;
  align-items: center;

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
    margin-top: 10px;
  }
`;

export const ContentInner = styled(Container)`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  flex-direction: column;
  align-items: center;

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
    margin-top: 10px;
    border-radius: 0px;
  }
`;

export const ButtonsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--border-radius);
  transform: translate(200px, 30px);

  @container (max-width: 800px) {
    & {
      transform: translate(200px, -10px);
      font-size: 12px;
    }
  }

  @container (max-width: 600px) {
    & {
      transform: translate(40px, -10px);
      font-size: 12px;
    }
  }
`;

export const PartitionContainer = styled.div`
  width: 50cqw;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  overflow-x: auto;
  padding-bottom: 10px;

  @container (max-width: 1000px) {
    & {
      width: 90cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 700px) {
    & {
      width: 85cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 600px) {
    & {
      width: 86cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 550px) {
    & {
      width: 85.5cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 460px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 430px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 415px) {
    & {
      width: 81cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 400px) {
    & {
      width: 80cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 360px) {
    & {
      width: 78cqw;
      font-size: 18px;
    }
  }
`;

export const ContentContainer = styled(Container)`
  width: 95%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 5px;
`;

export const SubText = styled.div`
  width: 80%;
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 300;
  margin-top: 30px;
  margin-bottom: 10px;
  font-style: italic;

  @container (max-width: 1000px) {
    & {
      font-size: 18px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 16px;
    }
  }

  @container (max-width: 300px) {
    & {
      font-size: 12px;
    }
  }
`;

export const SeeMoreLink = styled.div`
  font-size: 20px;
  font-weight: 300;
  margin-block: 10px;
  font-style: italic;
  font-weight: 700;
  color: ${({ theme }: any) => theme.primary};

  &:hover {
    cursor: pointer;
    color: ${({ theme }: any) => theme.primaryHover};
  }

  @container (max-width: 600px) {
    & {
      font-size: 16px;
    }
  }
`;

export const InfoTextBold = styled.div`
  font-size: 14px;
  font-weight: 600;
  font-style: italic;
  text-align: center;

  @container (max-width: 300px) {
    & {
      font-size: 12px;
    }
  }
`;

export const InfoText = styled.div`
  font-size: 14px;
  font-weight: 300;
  font-style: italic;
  text-align: center;

  @container (max-width: 300px) {
    & {
      font-size: 12px;
    }
  }
`;

export const Avatar = styled(AvatarCommon)`
  margin-top: 30px;

  @container profile-content (max-width: 800px) {
    & {
      display: none;
    }
  }
`;

export const AvatarMobile = styled(AvatarCommon)`
  margin-top: 30px;
  display: none;

  @container profile-content (max-width: 800px) {
    & {
      display: block;
    }
  }
`;

export const ExtendedBadge = styled(Badge)`
  width: 30px;
  height: 30px;
  position: relative;
  left: -90px;
  cursor: pointer;

  & svg {
    width: 30px;
    height: 30px;
  }
  &:hover {
    & svg {
      transform: scale(1.1);
    }
  }

  @container profile-content (max-width: 800px) {
    & {
      left: -50px;
    }
  }
`;

const NameFontStyles = css`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.498);
`;

export const NameMobile = styled.div`
  ${NameFontStyles};

  color: ${({ theme }: any) => theme.text};
  margin-top: 50px;
  font-size: 36px;
  width: 100%;
  text-align: center;

  @container profile-content (max-width: 800px) {
    & {
      font-size: 24px;
    }
  }
`;

export const UsernameContainer = styled.div`
  margin-block: 5px;
  & > div {
    text-align: center;
    font-size: 24px;
  }
  max-width: 100%;

  @container profile-content (max-width: 800px) {
    & > div {
      font-size: 20px;
    }
  }
`;

export const NoteContainer = styled(Pill)`
  width: 80%;
  margin-top: 15px;
  word-break: break-word;
  border-radius: 20px;
  border-bottom: 1px solid dimgray;
  border-right: 1px solid dimgray;
  padding: 10px 30px 10px;

  @container profile-content (max-width: 200px) {
    & {
      display: none;
    }
  }
`;

export const MusePillContainer = styled.div`
  width: 100%;
  margin-inline: auto;
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @container profile-content (max-width: 1024px) {
    & {
      margin-top: 0px;
      margin-bottom: 0px;
      gap: 0rem;
    }
  }
`;

export const MuseList = styled.div`
  width: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`;
