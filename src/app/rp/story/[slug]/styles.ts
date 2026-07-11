import styled, { css } from "styled-components";
import { BLUR_FILTER, CARD_BORDER, Z_INDEX } from "@/theme";

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

export const HeroRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 20px;
  width: 90%;
  margin-left: 8%;


  @container (max-width: 500px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

/* 6:9 (2:3) portrait ratio, matching the Storyboard cover avatar. */
export const HeroCover = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 250px;
  height: 336px;
  border-radius: 10px;
  overflow: hidden;
  ${CARD_BORDER};
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);

  @container (max-width: 500px) {
    & {
      width: 150px;
      height: 225px;
    }
  }
`;

export const HeroInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Name = styled.div`
  ${NameFontStyles}
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  text-align: left;
  font-size: clamp(18px, 4vw, 36px);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text);
  word-break: break-word;
  z-index: ${Z_INDEX.DEFAULT};
`;

export const CreatedByRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: 10px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  @container (max-width: 500px) {
    font-size: var(--font-size-xsmall);
    margin-top: 6px;
  }
`;

export const SectionName = styled.div`
  ${NameFontStyles}
  text-transform: uppercase;
  text-align: left;
  font-size: clamp(16px, 4vw, 22px);
  color: var(--text);
  z-index: ${Z_INDEX.DEFAULT};
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  width: 100%;
  margin-top: 24px;
`;

export const VisibilityChip = styled.span<{ $public?: boolean }>`
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: ${Z_INDEX.CARD_EXPAND};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: var(--font-size-xsmall);
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  cursor: default;
  user-select: none;

  svg {
    flex-shrink: 0;
    color: ${({ $public }) => ($public ? "var(--grass-9)" : "var(--gray-9)")};
  }

  @container (max-width: 500px) {
    top: 12px;
    right: 16px;
    padding: 5px 10px;
    font-size: 10px;
    gap: 4px;
  }
`;

export const SolidBackground = styled.div`
  position: absolute;
  top: clamp(270px, 30cqw, 290px);
  bottom: 0px;
  width: 100cqw;
  background-color: var(--bg-1);
  z-index: ${Z_INDEX.BACKGROUND};
  box-shadow: 0px -2px 4px 2px rgba(0, 0, 0, 0.498);
  contain: paint;
`;

/* Clears the top-left BackButton (top:16 + 40px tall) at every breakpoint,
   since on narrow containers this content spans edge-to-edge. */
export const StoryContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 900px;
  padding-top: 64px;
  min-height: 100vh;
  padding-inline: 24px;
  padding-bottom: 50px;
  margin-inline: auto;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @container (max-width: 500px) {
    & {
      padding-inline: 16px;
      gap: 0.2rem;
      margin-bottom: 0px;
    }
  }
`;

export const BackButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: 16px;
  left: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: ${Z_INDEX.CARD_EXPAND};
  transition: background-color 0.15s ease;

  @container (max-width: 500px) {
    top: 12px;
    left: 16px;
  }

  @media (hover: hover) {
    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.6);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

