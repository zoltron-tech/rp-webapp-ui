import { Container, ContainerClasses } from "@novelist-world/ui";
import styled, { css } from "styled-components";
import { Avatar as AvatarCommon, Pill } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import { BLUR_FILTER, DEV_MODE_BORDER, Z_INDEX } from "@/theme";
import { Badge } from "../../tiers/styles";

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

  @container (max-width: 800px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
  }
`;

export const ProfileDropdownMenuContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  gap: 6px;
  position: absolute;
  right: 10px;
  top: -80px
`;

export const ProfileMoreDropdownMenu = styled.div`
  ${DEV_MODE_BORDER("blue")}
  position: relative;
`;

export const ContentInner = styled.div`
  ${DEV_MODE_BORDER("blue")}
    position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bg-4);
  align-items: center;
  background-color: var(--bg-2);
  width: 100%;
  max-width: 800px;

  @container (max-width: 1024px) {
    width: 100%;
    padding-inline: 0px;
    margin-top: 10px;
    border-radius: 0px;
    border-right: unset;
    border-left: unset;
    border-bottom: unset;
  }
`;

export const ButtonsContainer = styled.div`
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--border-radius);

  @container (max-width: 800px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 600px) {
    & {
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

  @media (max-width: 900px) {
    & {
      width: 90cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 700px) {
    & {
      width: 85cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 600px) {
    & {
      width: 86cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 550px) {
    & {
      width: 85.5cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 460px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 430px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 415px) {
    & {
      width: 81cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 400px) {
    & {
      width: 80cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 360px) {
    & {
      width: 78cqw;
      font-size: 18px;
    }
  }
`;

export const ContentContainer = styled(Container)`
  width: 95%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: unset;
  padding-block: 4px;
  background-color: var(--bg-3);
  margin-bottom: 10px;
`;

export const ActivitiesContainer = styled.div`
  width: 95%;
  border-radius: 5px;
  display: flex;
  border: 1px solid var(--bg-6);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-2);
  margin-top: 10px;
`;

export const AboutContainer = styled(Container)`
  width: 95%;
  border-radius: 5px;
  min-height: 200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: var(--bg-3);
  white-space: pre-wrap; /* preserve line breaks + spaces */
  word-break: break-word; /* prevent overflow on long words */
  font-family: inherit;
`;

export const Wrapper = styled.div<{ $animating: boolean }>`
  white-space: pre-wrap;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
  ${({ $animating }) => $animating && "will-change: max-height;"}
`;

export const Toggle = styled.span`
  font-size: var(--font-size-h6);
  font-weight: 300;
  margin-top: 10px;
  margin-inline-start: 10px;
  font-style: italic;
  font-weight: 700;
  color: var(--accent);

  &:hover {
    cursor: pointer;
    color: var(--accent-hover);
  }

  @container (max-width: 600px) {
    & {
      font-size: var(--font-size-input);
    }
  }
`;

export const SubText = styled.div`
  width: 85%;
  font-size: 20px;
  font-weight: var(--font-weight-semi-bold);
  margin-top: 25px;
  margin-bottom: 4px;

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
  color: var(--accent);

  &:hover {
    cursor: pointer;
    color: var(--accent-hover);
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

export const Avatar = styled(AvatarNew)`
  /* border: 8px solid var(--bg-2); */
  /* background-color: var(--bg-2); */
  margin-top: 30px;
  height: 250px;
  width: 250px;
  z-index: 100;

  @container profile-content (max-width: 800px) {
    & {
      display: none;
    }
  }

    .avatar-fallback {
    font-size: calc(2*var(--font-size-h1));
  }
`;

export const AvatarMobile = styled(AvatarNew)`
  /* border: 5px solid var(--bg-2); */
  /* background-color: var(--bg-2); */
  margin-top: 20px;
  height: 130px;
  width: 130px;
  z-index: 100;
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
  margin-bottom: 5px;
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

export const NameMobile = styled.div`
  ${NameFontStyles};

  color: var(--text);
  margin-top: 60px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
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

export const NoteContainer = styled(Container)`
  width: unset;
  right: 50px;
  bottom: -80px;
  background: linear-gradient(
    135deg,
    var(--accent-4) 0%,
    var(--accent-3) 100%
  );

  opacity: 95%;
  word-break: break-word;
  border-radius: 20px;
  border-top-left-radius: 0%;
  padding-inline: 10px;
  z-index: 100;
  font-size: var(--font-size);

  @container profile-content (max-width: 800px) {
    & {
      font-size: var(--font-size-xsmall);
      width: unset;
      right: 40px;
      bottom: -50px;
    }
  }

  @container profile-content (max-width: 300px) {
    & {
      display: none;
    }
  }
`;

export const MusePillContainer = styled.div`
  width: 95%;
  margin-inline: auto;
  margin-top: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @container profile-content (max-width: 1024px) {
    & {
      gap: 0rem;
    }
  }
`;

export const MuseList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`;
