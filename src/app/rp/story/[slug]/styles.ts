import styled, { css } from "styled-components";
import { BLUR_FILTER, CARD_BORDER, Z_INDEX } from "@/theme";

interface BannerProps {
  /* Transient: this renders a <div>. `src` is a valid HTML attribute name, so
     un-prefixed it is forwarded to the DOM and React warns on an empty one. */
  $src: string;
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

  ${({ $src }) => $src && css`background-image: url(${$src});`}
  background-repeat: no-repeat;
  background-size: cover;
  contain: paint;

  ${BLUR_FILTER}
`;

/**
 * Cover and title, side by side.
 *
 * It used to stack on narrow containers, which cost a 225px-tall cover *plus*
 * the whole title block before anything else on the page — most of a 375x667
 * screen spent on a header. Staying a row at every width, with a cover scaled
 * to match, is what buys the chapters and codex below their room back.
 */
export const HeroRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 16px;
  width: 100%;

  @container (max-width: 500px) {
    align-items: flex-start;
    gap: 12px;
  }
`;

/* 6:9 (2:3) portrait ratio, matching the Storyboard cover avatar. */
export const HeroCover = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 148px;
  height: 222px;
  border-radius: 10px;
  overflow: hidden;
  ${CARD_BORDER};
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);

  @container (max-width: 500px) {
    & {
      width: 96px;
      height: 144px;
    }
  }
`;

export const HeroInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

/* Fandom and genres share one wrapping row. They used to be stacked blocks,
   which read well but spent a line each — at 375px that is two lines of
   header for a handful of chips that fit on one. */
export const MetaStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin-top: 8px;

  @container (max-width: 500px) {
    gap: 5px 6px;
    margin-top: 6px;
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
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  white-space: nowrap;

  svg {
    width: 12px;
    height: 12px;
    color: var(--accent);
    flex-shrink: 0;
  }

  b {
    font-weight: 600;
  }

  @container (max-width: 500px) {
    padding: 4px 9px;
    font-size: var(--font-size-xsmall);
  }
`;

/* Colored pill for a curated genre; tinted with the genre's own color. */
export const GenrePill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, ${(p) => p.$color} 18%, transparent);
  color: ${(p) => p.$color};
  border: 1px solid color-mix(in srgb, ${(p) => p.$color} 40%, transparent);
  font-size: var(--font-size-small);
  font-weight: 600;
  white-space: nowrap;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => p.$color};
    flex-shrink: 0;
  }

  @container (max-width: 500px) {
    padding: 4px 8px;
    font-size: var(--font-size-xsmall);
  }
`;

export const Name = styled.div`
  ${NameFontStyles}
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  text-align: left;
  font-size: clamp(17px, 3vw, 26px);
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
  gap: 5px;
  padding: 4px 10px;
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
    width: 13px;
    height: 13px;
    color: var(--tomato-9);
  }

  &:active {
    transform: scale(0.94);
  }

  @container (max-width: 500px) {
    padding: 4px 9px;
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
   the engagement row. */
export const DescriptionSection = styled.div`
  width: 100%;
  margin: 12px 0 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.5;

  @container (max-width: 500px) {
    margin: 10px 0 0;
    font-size: var(--font-size-xsmall);
  }
`;

export const CreatedByRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: 6px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  @container (max-width: 500px) {
    font-size: var(--font-size-xsmall);
    margin-top: 6px;
  }
`;

/**
 * Co-authors and cast, stacked.
 *
 * One column at every width, desktop included. They were briefly a side-by-side
 * pair on wide containers, which saved a little height but read as two
 * competing panels — and the cast strip scrolls horizontally, so halving its
 * width just meant scrolling it sooner. Full width each, in a column, is the
 * same order on every device; the space they used to cost was taken out of
 * their own sizing instead.
 */
export const PeopleGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  margin-top: 12px;

  @container (max-width: 500px) {
    gap: 10px;
    margin-top: 10px;
  }
`;

/* Engagement row (likes, share, more) sitting just above the co-authors
   card — a distinct action bar, separate from the fandom/genre meta above. */
export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin: 12px 0 0;

  @container (max-width: 500px) {
    margin: 10px 0 0;
    gap: 6px;
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
  gap: 5px;
  padding: 4px 10px;
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
  /* Clears the BackButton (top 16 + 40px tall) and no more. */
  padding-top: 60px;
  min-height: 100vh;
  padding-inline: 24px;
  padding-bottom: 24px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @container (max-width: 500px) {
    & {
      /* The button sits at top 12 on narrow containers. */
      padding-top: 56px;
      padding-inline: 12px;
      padding-bottom: 16px;
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
