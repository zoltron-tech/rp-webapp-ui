import { Avatar as AvatarCommon, Pill } from "@/components/common";
import { BLUR_FILTER, DEV_MODE_BORDER, Z_INDEX } from "@/theme";
import styled, { css } from "styled-components";

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
  top: clamp(270px, 30cqw, 460px);
  bottom: 0px;
  width: 100cqw;
  background-color: ${({ theme }) => theme.cardBackgroundColor};
  z-index: ${Z_INDEX.DEFAULT};
  box-shadow: 0px -2px 4px 2px rgba(0, 0, 0, 0.498);
  padding: 40px;
  contain: paint;
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

  @container (max-width: 1024px) {
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
  padding: 25px;

  ${DEV_MODE_BORDER("red")}

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 40px;
  }
`;

export const ContentRight = styled.div`
  ${DEV_MODE_BORDER("blue")}
  flex-grow: 3;
  display: flex;
  flex-direction: column;
  align-items: center;

  container-name: profile-content-right;
  container-type: inline-size;

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
  }
`;

export const Avatar = styled(AvatarCommon)`
  --size: var(--profile-avatar-size);
  margin-top: 65px;
`;

const NameFontStyles = css`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.498);
`;

export const Name = styled.div`
  ${NameFontStyles}
  width: 100%;
  text-align: center;
  text-align: center;
  margin-top: 150px;
  margin-bottom: 200px;
  font-size: clamp(36px, 5vw, 76px);
  color: ${({ theme }) => theme.textPrimary};
  z-index: ${Z_INDEX.DEFAULT};

  @container profile-content (max-width: 1024px) {
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

  @container (max-width: 1024px) {
    display: block;
  }
`;

export const UsernameContainer = styled.div`
  & > div {
    text-align: center;
    font-size: 24px;
  }

  max-width: 100%;

  & > span {
    margin-left: 2rem;
  }
`;

export const AuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 60px;

  @container (max-width: 1024px) {
    margin-top: 10px;
  }
`;

export const NoteContainer = styled(Pill)`
  max-width: 460px;
  min-height: 200px;
  margin-top: 20px;
  word-break: break-all;
  border-radius: 20px;

  padding: 40px 20px 20px;

  &::before {
    content: "Note";
  }
`;

export const InfoContainer = styled(Pill)`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  min-height: 200px;
  margin-top: 50px;
  word-break: break-all;
  border-radius: 20px;

  padding: 40px 20px 20px;

  &::before {
    position: static;
    content: "Information";
    padding-bottom: 50px;
  }
`;

export const InfoItem = styled.div`
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  flex-direction: row;
  width: inherit;
  min-height: 50px;
`;

export const InfoLabel = styled.span`
  width: inherit;
  margin-left: 50px;
  font-weight: bold;
  text-align: start;
  vertical-align: middle;
`;

export const InfoValue = styled.span`
  width: inherit;
  margin-right: 50px;
  text-align: end;
  vertical-align: middle;
`;

export const MusePillContainer = styled.div`
  width: 100%;
  margin-inline: auto;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @container profile-content (max-width: 1024px) {
    & {
      margin-top: 0px;
    }
  }
`;
