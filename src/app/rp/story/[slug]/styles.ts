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

/* Stacks fandom, genres and the like chip on their own lines so each group
   reads as a distinct block instead of blending into one chip soup — still
   compact down to the 375×667 baseline. */
export const MetaStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;

  @container (max-width: 500px) {
    gap: 8px;
    margin-top: 8px;
  }
`;

/* Wrapping row for the genre pills only. */
export const GenreRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
`;

/* Accent-tinted chip announcing the story's fandom. */
export const FandomChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  white-space: nowrap;

  svg {
    width: 13px;
    height: 13px;
    color: var(--accent);
    flex-shrink: 0;
  }

  b {
    font-weight: 600;
  }

  @container (max-width: 500px) {
    padding: 5px 11px;
    font-size: var(--font-size-xsmall);
  }
`;

/* Colored pill for a curated genre; tinted with the genre's own color. */
export const GenrePill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, ${(p) => p.$color} 18%, transparent);
  color: ${(p) => p.$color};
  border: 1px solid color-mix(in srgb, ${(p) => p.$color} 40%, transparent);
  font-size: var(--font-size-small);
  font-weight: 600;
  white-space: nowrap;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${(p) => p.$color};
    flex-shrink: 0;
  }

  @container (max-width: 500px) {
    padding: 5px 10px;
    font-size: var(--font-size-xsmall);
  }
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

/* Heart reaction chip, styled to match VisibilityChip but interactive. */
export const HeartChip = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--tomato-9) 20%, transparent)"
      : "color-mix(in srgb, var(--text-secondary) 12%, transparent)"};
  color: ${(p) => (p.$active ? "var(--tomato-9)" : "var(--text-secondary)")};

  b {
    color: ${(p) => (p.$active ? "var(--tomato-9)" : "var(--text)")};
  }

  svg {
    width: 15px;
    height: 15px;
    color: var(--tomato-9);
  }

  &:active {
    transform: scale(0.94);
  }

  @container (max-width: 500px) {
    padding: 5px 11px;
    font-size: var(--font-size-xsmall);
  }
`;

export const HeartCountText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

/* Optional story flavor text, rendered below the hero cover/meta and above
   the engagement row. Matches HeroRow/ActionRow's width and left offset. */
export const DescriptionSection = styled.div`
  width: 90%;
  margin: 16px 0 0 8%;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.5;

  @container (max-width: 500px) {
    width: 100%;
    margin: 12px 0 0;
  }
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

/* Cast strip: muses with at least one dialog anywhere in the story. */
export const CastSection = styled.div`
  width: 90%;
  margin: 18px 0 0 8%;
  z-index: ${Z_INDEX.DEFAULT};
`;

export const CastRow = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  margin-top: 14px;
  padding: 4px 2px 6px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CastChip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  width: 64px;
`;

export const CastAvatar = styled.img`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-4);
  border: 2px solid var(--bg-2);
`;

export const CastAvatarFallback = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 70%);
  color: #fff;
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  border: 2px solid var(--bg-2);
`;

export const CastName = styled.span`
  max-width: 64px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Engagement row (likes, share, more) sitting just above the co-authors
   card — a distinct action bar, separate from the fandom/genre meta above. */
export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 90%;
  margin: 20px 0 16px 8%;

  @container (max-width: 500px) {
    width: 100%;
    margin: 14px 0 12px;
    gap: 8px;
  }
`;

/* Pushes the more-menu trigger to the row's far edge. */
export const ActionRowSpacer = styled.div`
  flex: 1 1 auto;
`;

export const ShareButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 600;
  white-space: nowrap;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--text-secondary) 12%, transparent);
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: var(--text);
  }

  &:active {
    transform: scale(0.94);
  }

  @container (max-width: 500px) {
    padding: 5px 11px;
    font-size: var(--font-size-xsmall);
  }
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

