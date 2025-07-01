import { Avatar as AvatarCommon, Pill } from "@/components/common";
import { BLUR_FILTER, DEV_MODE_BORDER, Z_INDEX } from "@/theme";
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

export const SolidBackground = styled.div`
  position: absolute;
  top: clamp(270px, 30cqw, 300px);
  bottom: 0px;
  width: 100cqw;
  background-color: ${({ theme }) => theme.navbar};
  z-index: ${Z_INDEX.DEFAULT};
  box-shadow: 0px -2px 4px 2px rgba(0, 0, 0, 0.498);
  padding: 40px;
  contain: paint;
`;

export const EditProfile = styled.div`
  position: absolute;
  top: 100px;
  right: 30px;
  z-index: ${Z_INDEX.AVATAR};

  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 24px;
`;

export const Content = styled.div`
  max-width: 1400px;
  margin-inline: auto;
  width: 100cqw;
  height: max-content;
  display: flex;
  flex-direction: row;
  position: relative;
  z-index: ${Z_INDEX.DEFAULT};

  container-name: profile-content;
  container-type: inline-size;

  ${DEV_MODE_BORDER("green")}

  @container (max-width: 1300px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
`;

export const ContentLeft = styled.div`
  max-width: 650px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;

  ${DEV_MODE_BORDER("red")}

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
  }
`;

export const ContentRight = styled.div`
  ${DEV_MODE_BORDER("blue")}
  flex-grow: 3;
  display: flex;
  flex-direction: column;

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
    margin-top: 10px;
  }
`;

export const PartitionContainer = styled.div`
  width: 40cqw;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  overflow-x: auto;

  @container (max-width: 1200px) {
    & {
      width: 92cqw;
      font-size: 18px;
    }
  }

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

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @container profile-content-right (max-width: 600px) {
    & {
      padding-inline: 0px;
    }
  }
`;

export const SubText = styled.div`
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 300;
  margin-top: 30px;
  margin-bottom: 10px;
  font-style: italic;
  text-align: center;

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
`;

export const ExtendedBadge = styled(Badge)`
  width: 30px;
  height: 30px;
  position: relative;
  left: -80px;
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
`;

const NameFontStyles = css`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.498);
`;

export const Name = styled.div`
  ${NameFontStyles}
  width: 100%;
  text-align: center;
  text-align: center;
  margin-top: 100px;
  margin-bottom: 10px;
  font-size: clamp(36px, 5vw, 52px);
  color: ${({ theme }) => theme.textPrimary};
  z-index: ${Z_INDEX.DEFAULT};
  margin-bottom: 25px;

  @container profile-content (max-width: 1300px) {
    display: none;
  }
`;

export const NameMobile = styled.div`
  ${NameFontStyles};

  color: ${({ theme }) => theme.text};
  display: none;
  margin-top: 40px;
  font-size: 36px;
  width: 100%;
  text-align: center;

  @container (max-width: 1300px) {
    display: block;
  }
`;

export const UsernameContainer = styled.div`
  margin-block: 10px;
  & > div {
    text-align: center;
    font-size: 24px;
  }

  max-width: 100%;
  margin-top: 20px;

  @container (max-width: 1024px) {
    margin-top: 10px;
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
