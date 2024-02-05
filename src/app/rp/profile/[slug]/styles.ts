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
  margin-top: clamp(270px, 30cqw, 460px);
  width: 100cqw;
  height: 100%;
  background-color: ${({ theme }) => theme.cardBackgroundColor};
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
  height: max(100cqh, 100%);
  display: flex;
  flex-direction: row;
  position: relative;
  z-index: ${Z_INDEX.DEFAULT + 1};

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

  container-name: profile-content-right;
  container-type: inline-size;

  @container (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
  }
`;

export const Avatar = styled(AvatarCommon)`
  width: var(--profile-avatar-size);
  height: var(--profile-avatar-size);
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
    font-size: 36px;
  }

  max-width: 100%;
  margin-top: 75px;

  @container (max-width: 1024px) {
    margin-top: 10px;
  }
`;

export const NoteContainer = styled(Pill)`
  max-width: 460px;
  min-height: 200px;
  margin-top: 50px;
  word-break: break-all;

  padding: 40px 20px 20px;

  &::before {
    content: "Note";
  }
`;

export const MusePillContiner = styled.div`
  width: 100%;
  margin-inline: auto;
  margin-top: 250px;

  @container profile-content (max-width: 1024px) {
    & {
      margin-top: 0px;
    }
  }
`;
