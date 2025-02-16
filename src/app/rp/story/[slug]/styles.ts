import { Avatar as AvatarCommon } from "@/components/common";
import { BLUR_FILTER, CARD_BORDER, Z_INDEX } from "@/theme";
import styled, { css } from "styled-components";

interface BannerProps {
  src: string;
}

const NameFontStyles = css`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.498);
`;

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

export const Avatar = styled(AvatarCommon)`
  margin-top: 10px;
`;

export const Name = styled.div`
  ${NameFontStyles}
  width: 100%;
  text-align: center;
  text-align: center;
  margin-top: 10px;
  font-size: clamp(18px, 5vw, 42px);
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary};
  z-index: ${Z_INDEX.DEFAULT};
`;

export const SectionName = styled.div`
  ${NameFontStyles}
  width: 100%;
  text-transform: uppercase;
  text-align: center;
  text-align: center;
  margin-top: 20px;
  font-size: clamp(18px, 5vw, 24px);
  color: ${({ theme }) => theme.textPrimary};
  z-index: ${Z_INDEX.DEFAULT};
`;

export const SolidBackground = styled.div`
  position: absolute;
  top: clamp(270px, 30cqw, 290px);
  bottom: 0px;
  width: 100cqw;
  background-color: ${({ theme }) => theme.navbar};
  z-index: ${Z_INDEX.BACKGROUND};
  box-shadow: 0px -2px 4px 2px rgba(0, 0, 0, 0.498);
  padding: 40px;
  contain: paint;
`;

export const StoryContainer = styled.div`
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  margin-bottom: 50px;

  @container (max-width: 500px) {
    & {
      padding-top: 0px;
      padding-inline: 0px;
      gap: 0.2rem;
      margin-bottom: 0px;
    }
  }
`;

export const PillContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
