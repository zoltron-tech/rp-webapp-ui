export const PennedByAccentLink = styled.a<{ accent?: string | null }>`
  color: ${({ accent }) => (accent && accent.trim() !== "" ? accent : "var(--accent)")};
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
  &:hover {
    text-decoration: underline;
    color: ${({ accent }) => (accent && accent.trim() !== "" ? `color-mix(in srgb, ${accent} 70%, black)` : "var(--accent-8)")};
  }
`;

export const PennedByChip = styled.button<{ accent?: string | null }>`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px 2px 2px;
  border-radius: 999px;
  background: ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 22%, transparent)`
      : "var(--accent)"};
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
`;

export const PennedByMiniAvatar = styled.div<{ $src?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const PennedByRow = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
`;

import { Container } from "@novelist-world/ui";
import styled from "styled-components";
import { Avatar as AvatarCommon } from "@/components/common";
import {
  BACKGROUND_BLUR,
  BLUR_FILTER,
  BORDER_RADIUS,
  CARD_BORDER,
  Z_INDEX,
} from "@/theme";
import type { ImageFilter } from "@/types";

interface BannerProps {
  src: string | null;
  filterValues: ImageFilter | null;
}

export const Banner = styled.div<BannerProps>`
  width: 100cqw;
  /* height: clamp(
    var(--profile-banner-height-min),
    30cqw,
    var(--profile-banner-height-max)
  ); */
  top: 0px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${Z_INDEX.BACKGROUND};

  background-image: url(${({ src }) => src});
  /* Apply dynamic filters */
  filter: ${({ filterValues }) =>
    `grayscale(${filterValues?.greyscale ?? 0}%)
     brightness(${filterValues?.brightness ?? 100}%)
     blur(${filterValues?.blur ?? 0}px)`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  contain: paint;

  @container (max-width: 950px) {
    & {
      top: 0px;
    }
  }

  /* ${BLUR_FILTER} */
`;

export const MuseContainer = styled.div`
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;

  @media (max-width: 350px) {
    & {
      padding-top: 0px;
      padding-inline: 0px;
      gap: 0.2rem;
    }
  }
`;

export const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: var(--border-radius);
  overflow: hidden;
`;

export const NSFWOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  color: #fff;
  text-align: center;
  font-size: var(--font-size-xsmall);
  border-radius: var(--border-radius);
  pointer-events: none;
`;

export const NSFWLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;

  @container muse-card (max-width: 120px) {
    font-size: 9px;
  }
`;

export const NSFWRevealButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 14px);
  z-index: 3;
  margin-top: 0;
  padding: 4px 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  background: transparent;
  color: #fff;
  font-size: var(--font-size-xsmall);
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: translate(-50%, 14px) scale(0.96);
  }

  @container muse-card (max-width: 120px) {
    font-size: 9px;
    padding: 2px 7px;
    transform: translate(-50%, -48px);

    &:active {
      transform: translate(-50%, -48px) scale(0.96);
    }
  }
`;

export const BannerNSFWOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 40px;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  text-align: center;
  font-size: var(--font-size-xsmall);
  pointer-events: none;
`;

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: url(${(props): string => props.banner});
  transition-timing-function: ease-out;
  transition-duration: 300ms;
  transition-property: scale;
  background-repeat: no-repeat;
  background-size: ${({ $bgSize }) => $bgSize ?? "cover"};
  background-position: ${({ $bgPosition }) => $bgPosition ?? "center center"};
`;

export const CardWrapper = styled(Container)`
  position: relative;
  width: 326px;
  aspect-ratio: 9 / 16;
  padding: 0px !important;
  border-radius: 8px;
  background: transparent;
  backdrop-filter: unset;
  border: none;

  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  &:hover .card-bg-remove {
    opacity: 1;
  }

 @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 422px;
  }

  @media (max-width: 950px) {
    display: none;
  }
`;

export const CardExpandedWrapper = styled.div`
  position: relative;
  width: 326px;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  &:hover .card-bg-remove {
    opacity: 1;
  }

  @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 422px;

    &:hover {
      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }

  @media (min-width: 350px) and (max-width: 1024px) {
    &.open {
      border-radius: 0px;
      display: none;
    }
  }

  @media (max-width: 350px) {
    margin-top: 0px;
    width: 100%;
    height: 70vh;
    border-radius: 0px;
  }
`;

type CardProps = {
  banner: string;
  /** CSS background-size computed from crop data. Falls back to 'cover'. */
  $bgSize?: string;
  /** CSS background-position computed from crop data. Falls back to 'center center'. */
  $bgPosition?: string;
};

export const Title = styled.div`
  margin-bottom: 10px;
  position: relative;
  align-self: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 200;
  color: var(--text);
  text-align: center;
`;

export const NoteContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  margin-top: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 22px 18px 16px 22px;
  overflow: visible;

  /* Decorative large opening quote */
  &::before {
    content: '"';
    position: absolute;
    top: -2px;
    left: 10px;
    font-size: 4.5rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: normal;
    color: rgba(255, 255, 255, 0.08);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }

  /* Decorative closing quote */
  &::after {
    content: '"';
    position: absolute;
    bottom: 2px;
    right: 10px;
    font-size: 3rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: normal;
    color: rgba(255, 255, 255, 0.05);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }

  /* Reveal action buttons on hover (desktop) */
  &:hover .note-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const NoteQuote = styled.p`
  margin: 0;
  font-size: 0.8rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.7;
  letter-spacing: 0.018em;
  word-break: break-word;
  text-align: left;
  position: relative;
  z-index: 1;
`;

export const NoteControlRow = styled.div`
  position: absolute;
  top: -12px;
  right: -10px;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;

  &.always-visible {
    opacity: 1;
    pointer-events: auto;
  }

  @media (hover: none) {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const NoteControlBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(18, 18, 18, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.14s, color 0.14s, border-color 0.14s;
  &:hover {
    background: rgba(50, 50, 50, 0.95);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }
  &.danger:hover {
    background: rgba(140, 20, 20, 0.6);
    color: rgba(255, 160, 160, 0.95);
    border-color: rgba(200, 50, 50, 0.4);
  }
  &.success {
    color: rgba(80, 200, 120, 0.85);
    border-color: rgba(60, 160, 100, 0.28);
  }
  &.success:hover {
    background: rgba(20, 100, 50, 0.55);
    color: rgba(160, 255, 190, 0.95);
    border-color: rgba(50, 180, 100, 0.5);
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

export const NoteAddBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.72rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  margin-top: 8px;
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.75);
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const NoteEditWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const NoteCharCount = styled.span<{ $near: boolean; $atLimit: boolean }>`
  align-self: flex-end;
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  color: ${({ $atLimit, $near }) =>
    $atLimit
      ? "rgba(220, 60, 60, 0.9)"
      : $near
        ? "rgba(220, 160, 40, 0.85)"
        : "rgba(255, 255, 255, 0.28)"};
  transition: color 0.15s;
`;

export const NoteEditTextarea = styled.textarea`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  padding: 6px 4px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.8rem;
  font-style: italic;
  font-family: var(--font);
  line-height: 1.7;
  letter-spacing: 0.018em;
  resize: none;
  overflow: hidden;
  display: block;
  &::placeholder {
    color: rgba(255, 255, 255, 0.28);
    font-style: italic;
  }
  @media (hover: none) {
    font-size: var(--font-size-input);
  }
`;

export const NoteEditBtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const NoteEditCancelBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.85);
  }
`;

export const NoteEditSaveBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 5px 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.12s;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const MenuText = styled.div`
  opacity: 1;
  margin-top: 5px;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);

  @container (max-height: 100px) {
    display: none;
    margin-top: 0px;
  }
`;

export const SideMenu = styled.div`
  position: relative;
  width: 100px;
  height: 580px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: center;
  gap: 0.8rem;

  container-name: side-menu;
  container-type: size;

  /* @container (min-width: 2559px) {
    margin-top: 40px;
    width: 150px;
    height: 1160px;
  }

  @container (min-width: 2047px) and (max-width: 2559px) {
    margin-top: 40px;

    width: 140px;
    height: 870px;
  } */

  @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
    width: 100px;
    height: 725px;
  } 

  @media (min-width: 600px) and (max-width: 1024px) {
    margin-top: unset;
    width: 100px;
    height: 540px;
  } 

  @media (max-width: 600px) {
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    flex-direction: row;
    width: 100%;
    max-width: 400px;
    height: 60px;
    margin-left: unset;
    padding-bottom: 8px;
    gap: 0.3rem; /* reduced gap between MenuButton items on mobile */
  }
`;

export const MenuButton = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 50px;
  height: 70px;
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  justify-content: center;
  align-items: center;

  &.stick-top {
    position: absolute;
    top: 0px;
  }

  @container (max-width: 400px) and (max-height: 100px) {
    justify-content: normal;
    width: 50px;
    height: 40px;

    &.stick-top {
      position: relative;
    }
  }
`;

export const MenuButtonIcon = styled.div<{
  accent?: string | null;
}>`
  position: relative;
  display: flex;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};
  background-color: ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 10%, var(--bg-2) 90%)`
      : "var(--bg-2)"};

  cursor: pointer;
  justify-content: center;
  align-items: center;

  ${CARD_BORDER};

  @container (min-height: 100px) {
  &:hover {
      scale: 1.1;
      background-color: ${({ accent }) =>
        accent && accent.trim() !== ""
          ? `color-mix(in srgb, ${accent} 70%, black)` // ~30% darker
          : "var(--accent)"};

    }
  }

  @container (max-width: 400px) and (max-height: 100px) {
    width: 40px;
    height: 40px;
  }

  &.selected {
    scale: 1.1;
    background-color: ${({ accent }) =>
      accent && accent.trim() !== ""
        ? `color-mix(in srgb, ${accent} 70%, black)` // ~30% darker
        : "var(--accent)"};

  }
`;

export const ConnectionsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS};
  height: 100%;
`;

export const Text = styled.div`
  font-size: 12px;
  font-weight: 200;
  padding-inline: 20px;
  color: var(--text);
  text-align: center;
  height: max-content;
`;

export const MuseName = styled.div`
  position: absolute;
  bottom: 15px;
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text);
  text-align: end;
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease;

  @container content-container (max-width: 1000px) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

export const AuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;

  opacity: 0;
  transform: translateY(100px);
  transition: opacity 0.5s ease, transform 0.5s ease;

  .avatar {
    height: 30px;
    width: 30px;
    margin-right: 0.4rem;
  }

  @container content-container (max-width: 1000px) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

export const UsernameContainer = styled.div`
  & > div {
    text-align: center;
    font-size: var(--font-size-small);
  }

  .penned {
      font-size: var(--font-size-xsmall)
    }

  & > span {
    font-size: var(--font-size-small);
  }
`;

export const CardMainBack = styled.div<{ accent?: string | null }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
`;

export const CardBack = styled.div<{ accent?: string | null }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
  background: ${({ accent }: any) => {
    if (accent && accent.trim() !== "") {
      return `linear-gradient(
      to bottom,
      ${accent}18,  /* accent with 80% opacity */
      black          /* solid black at bottom */
    )`;
    }

    return "linear-gradient(to bottom, transparent, black)"; // fallback if no accent
  }};



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
  z-index: 2;
  contain: paint;
`;

export const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover; /* This makes the video fill the container */
  transform: translate(-50%, -50%); /* This centers the video */
`;

export const InfoCardContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

export const VideoCardContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

export const ConnectionItem = styled.div`
  justify-content: flex-start;
  height: 60px;
  display: flex;
  flex-direction: row;
  width: inherit;
  font-size: var(--font-size-small);
  padding-inline: 20px;
  border-radius: ${BORDER_RADIUS};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  }
`;

export const ConnectionLabel = styled.span`
font-size: var(--font-size-small);
  font-weight: bold;
`;

export const ConnectionType = styled.span`
  text-transform: uppercase;
font-size: var(--font-size-small);
  font-style: italic;
`;

export const ScrollableContent = styled.div<{ accent?: string | null }>`
  margin-bottom: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  height: inherit;
  width: 100%;
  padding-bottom: 20px;
  padding-inline: 10px;

  transition-property: scrollbar-color;
  transition-timing-function: ease-in-out;
  transition-duration: 200ms;

  &:hover {
    scrollbar-color: ${({ accent }) =>
      accent && accent.trim() !== ""
        ? `color-mix(in srgb, ${accent} 80%, black)` /* darkened scrollbar */
        : "var(--accent-6)"} transparent;
  }
`;

export const MuseInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: end;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

export const InfoContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  word-break: break-word;
  margin-top: 20px;
  gap: 0.5rem;
`;

export const InfoItem = styled.div`
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  width: inherit;
  font-size: 12px;
  padding-inline: 20px;

  @media (max-width: 1024px) {
    padding-inline: 5px;
  }
`;

export const InfoLabel = styled.span`
  width: 40%;
  font-weight: bold;
  text-align: start;
  vertical-align: middle;
`;

export const FandomValue = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  background: ${(props) => props.color};
  padding: 3px 10px 3px 7px;
  border-radius: 4px;

  &::before {
    content: "";
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }
`;

export const InfoValue = styled.span`
  width: inherit;
  text-align: end;
  vertical-align: middle;
`;

export const ExpandedContentInner = styled.div`
  display: flex;
  direction: column;
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

export const PromptVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const StyledDate = styled.div`
  font-size: 10px;
  font-weight: 300;
`;

export const PromptMedia = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 8px;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: card;
  container-type: size;

  @container (max-width: 400px) {
    & {
      width: 200px;
      height: 200px;
    }
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid slategray;
  gap: 0.2em;
  padding-bottom: 10px;
  margin-bottom: 20px;
  padding-inline: 20px;

  @container content-container (max-width: 1000px) {
    margin-bottom: 10px;
  }

  @container content-container (max-width: 400px) {
    padding-inline: 5px;
    margin-bottom: 5px;
  }
`;

export const PromptFooterText = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 400;
  max-width: 80%;
  font-style: italic;
  text-align: center;
  cursor: pointer;
`;

export const AboutSectionImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  object-fit: contain;
  margin-bottom: 0.75rem;
  cursor: zoom-in;
`;

/* ── Info panel revamp ───────────────────────────────────────────────────── */

export const InfoPrivacyCorner = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  z-index: 2;
`;

export const InfoScrollBody = styled.div<{ accent?: string | null }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 12px 0;
  overflow: hidden;
`;

export const InfoCardAvatar = styled.div<{ $src: string }>`
  width: 82px;
  height: 82px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  background-color: rgba(255, 255, 255, 0.08);

  @media (max-width: 600px) {
    width: 72px;
    height: 72px;
  }
`;

export const AvatarWrapper = styled.div`
  position: relative;
  width: 82px;
  height: 82px;
  flex-shrink: 0;

  &:hover .avatar-remove {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 600px) {
    width: 72px;
    height: 72px;
  }
`;

export const AvatarEditBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(14, 14, 14, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  backdrop-filter: blur(4px);
  transition: background 0.14s, color 0.14s, border-color 0.14s;
  &:hover {
    background: rgba(50, 50, 50, 0.96);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.38);
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const AvatarRemoveBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(14, 14, 14, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s, background 0.12s, color 0.12s, border-color 0.12s;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(140, 20, 20, 0.72);
    color: rgba(255, 160, 160, 0.95);
    border-color: rgba(200, 50, 50, 0.45);
  }

  @media (hover: none) {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const InfoHeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 6px;
`;

export const InfoMuseName = styled.h2`
  margin: 0;
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  text-align: center;
`;

export const InfoNicknamesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

export const InfoNicknamePill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  font-size: 0.68rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.03em;
`;

export const InfoFandomSection = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

export const InfoDivider = styled.div<{ $accent?: string | null }>`
  width: 100%;
  height: 1px;
  margin-block: 10px;
  flex-shrink: 0;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 28%, transparent)`
      : "rgba(255, 255, 255, 0.1)"};
`;

export const InfoDetailsSection = styled.div<{ $accent?: string | null }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.2s ease;

  &:hover {
    scrollbar-color: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 70%, black)`
        : "var(--accent-6)"} transparent;
  }
`;

export const InfoSectionLabel = styled.div`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.38);
  font-weight: 700;
  margin-bottom: 10px;
`;

export const InfoAttributesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
`;

export const InfoAttributeCard = styled.div<{ accent?: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 12%, rgba(0,0,0,0.35))`
      : "rgba(255,255,255,0.07)"};
  border: 1px solid ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 30%, transparent)`
      : "rgba(255,255,255,0.12)"};
  backdrop-filter: blur(4px);
  overflow: hidden;
`;

export const InfoAttributeKey = styled.span`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InfoAttributeValue = styled.span`
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
`;

export const InfoAttrLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.38);
  font-weight: 700;
`;

export const InfoAttrAddBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.68rem;
  cursor: pointer;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const InfoAttrCardWrap = styled.div<{ accent?: string | null }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 12%, rgba(0,0,0,0.35))`
      : "rgba(255,255,255,0.07)"};
  border: 1px solid
    ${({ accent }) =>
      accent && accent.trim() !== ""
        ? `color-mix(in srgb, ${accent} 30%, transparent)`
        : "rgba(255,255,255,0.12)"};
  backdrop-filter: blur(4px);
  overflow: hidden;
  .attr-actions {
    opacity: 0;
    transition: opacity 0.15s;
  }
  &:hover .attr-actions {
    opacity: 1;
  }
  @media (hover: none) {
    .attr-actions {
      opacity: 1;
    }
  }
`;

export const InfoAttrCardActions = styled.div`
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  gap: 2px;
`;

export const InfoAttrIconBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover {
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const InfoAttrForm = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

export const InfoAttrInputRow = styled.div`
  display: flex;
  gap: 6px;
`;

export const InfoAttrInput = styled.input`
  all: unset;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  padding: 5px 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.78rem;
  width: 100%;
  transition: border-color 0.15s;
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
    outline: none;
  }
  @media (hover: none) {
    font-size: var(--font-size-input);
  }
`;

export const InfoAttrBtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
`;

export const InfoAttrSaveBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 4px 12px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const InfoAttrCancelBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 4px 10px;
  border-radius: 5px;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.72rem;
  cursor: pointer;
  transition: color 0.15s;
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

export const InfoTagsSection = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 4px;
`;

/* ── Fandom inline picker ────────────────────────────────────────────────── */

export const InfoFandomSearchWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  animation: fandomFadeIn 0.2s ease;
  @keyframes fandomFadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const InfoFandomSearchIcon = styled.span`
  position: absolute;
  left: 11px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--text-secondary);
`;

export const InfoFandomInput = styled.input`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 38px 8px 34px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  transition: border-color 0.2s ease;
  &::placeholder {
    color: var(--text-secondary);
  }
  &:focus {
    border-color: var(--accent);
    outline: none;
  }
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    appearance: none;
  }
`;

export const InfoFandomCancelBtn = styled.button`
  all: unset;
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1.3rem;
  line-height: 1;
  transition: color 0.15s;
  &:hover {
    color: var(--text);
  }
`;

export const InfoFandomDropdown = styled.div`
  background: rgba(18, 18, 18, 0.97);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  overflow: hidden;
  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
`;

export const InfoFandomOption = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.82);
  cursor: pointer;
  transition: background 0.1s;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

/* ── Nickname owner pills ─────────────────────────────────────────────────── */

/* Defined first so InfoNicknameOwnerPill can reference it via interpolation */
export const InfoNicknameDeleteBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  height: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.56rem;
  cursor: pointer;
  transition: max-width 0.18s ease, opacity 0.18s ease, color 0.12s;
  &:hover {
    color: rgba(220, 38, 38, 0.9);
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

export const InfoNicknameDeleteTrash = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  @media (hover: none) {
    display: none;
  }
`;

export const InfoNicknameDeleteCross = styled.span`
  display: none;
  align-items: center;
  justify-content: center;
  color: rgba(220, 38, 38, 0.85);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  @media (hover: none) {
    display: inline-flex;
  }
`;

export const InfoNicknameOwnerPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 10px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.68rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.03em;
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  user-select: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.32);
  }

  /* Reveal delete button smoothly on hover (desktop) */
  &:hover ${InfoNicknameDeleteBtn} {
    max-width: 14px;
    opacity: 1;
  }

  /* On mobile: delete always visible, no hover needed */
  @media (hover: none) {
    padding-right: 4px;

    ${InfoNicknameDeleteBtn} {
      max-width: 14px;
      opacity: 1;
    }
  }
`;

export const InfoNicknameIconBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.58rem;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  &:hover {
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

export const InfoNicknameEditWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

export const InfoNicknameInput = styled.input`
  all: unset;
  box-sizing: border-box;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.68rem;
  width: 88px;
  transition: border-color 0.15s;
  &::placeholder {
    color: rgba(255, 255, 255, 0.38);
  }
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    outline: none;
  }
  @media (hover: none) {
    font-size: var(--font-size-input);
  }
`;

export const InfoNicknameAddBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px dashed rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.68rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  &:hover {
    border-color: rgba(255, 255, 255, 0.48);
    color: rgba(255, 255, 255, 0.8);
  }
`;

/* ── Privacy dropdown ─────────────────────────────────────────────────────── */

export const InfoPrivacyDropdownWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const InfoPrivacyBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

export const InfoPrivacyDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  background: rgba(18, 18, 18, 0.97);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  overflow: hidden;
  min-width: 150px;
`;

export const InfoPrivacyOption = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-size: 0.75rem;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.62)"};
  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.07)" : "transparent"};
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }
`;

/* ── Gallery ─────────────────────────────────────────────────────────────── */

export const GalleryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  padding: 4px 0;
  align-content: flex-start;
`;

export const GalleryItem = styled.div`
  flex-shrink: 0;
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  ${CARD_BORDER};
  cursor: zoom-in;
`;

export const GalleryBadgeRow = styled.div`
  position: absolute;
  bottom: 5px;
  left: 5px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  pointer-events: none;
`;

export const GalleryBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  backdrop-filter: blur(4px);
  pointer-events: none;
  user-select: none;
  line-height: 1.4;
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.2s ease;

  ${GalleryItem}:hover & {
    transform: scale(1.04);
  }
`;

export const GalleryDeleteBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 4;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;

  ${GalleryItem}:hover & {
    opacity: 1;
  }

  @media (max-width: 600px) {
    opacity: 1;
  }

  &:hover {
    background: rgb(185, 28, 28);
    color: #fff;
  }
`;

export const GalleryVideo = styled.video`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  cursor: pointer;
`;

export const SectionEmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

export const SectionEmpty = styled.div`
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.82rem;
  font-style: italic;
  padding: 24px 0 8px;
`;

export const SectionEmptyCta = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.13);
    border-color: rgba(255, 255, 255, 0.35);
    color: rgba(255, 255, 255, 0.9);
  }
`;

export const GalleryPlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.28);
  transition: background 0.2s ease;
  pointer-events: none;

  ${GalleryItem}:hover & {
    background: rgba(0, 0, 0, 0.1);
  }
`;

export const GalleryPlayCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  ${GalleryItem}:hover & {
    transform: scale(1.1);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.55);
  }
`;

/* ── Shimmer loading skeletons ────────────────────────────────────────────── */

export const ShimmerBase = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 40%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.08) 60%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmerSlide 1.4s ease-in-out infinite;
  }

  @keyframes shimmerSlide {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
`;

export const ShimmerLine = styled(ShimmerBase)<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 4px;
`;

export const ShimmerBlock = styled(ShimmerBase)<{ $height?: string; $width?: string }>`
  width: ${({ $width }) => $width ?? "100%"};
  height: ${({ $height }) => $height ?? "80px"};
  border-radius: 8px;
`;

export const ShimmerGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
`;

export const ShimmerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
`;

export const MoreMenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  width: 100%;
`;

export const MoreMenuItem = styled.button<{ $variant?: "danger" | "warn" }>`
  all: unset;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  border-radius: 8px;
  font-size: var(--font-size);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.05);
  color: ${({ $variant }) =>
    $variant === "danger"
      ? "var(--tomato-9)"
      : $variant === "warn"
        ? "var(--amber-9)"
        : "var(--text)"};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "danger"
        ? "rgba(229,72,77,0.15)"
        : $variant === "warn"
          ? "rgba(245,166,35,0.12)"
          : "rgba(255,255,255,0.1)"};
  }
`;

export const SectionMiniHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 10px;
  width: 100%;
  flex-shrink: 0;

  .avatar {
    width: 18px;
    height: 18px;
  }
`;

export const SectionMiniName = styled.div`
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  margin-bottom: 5px;
`;

export const InfoLevelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const InfoLevelBadge = styled.span<{ accent?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 8px;
  border-radius: 999px;
  background: ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 22%, rgba(0,0,0,0.35))`
      : "rgba(255,255,255,0.1)"};
  border: 1px solid ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `color-mix(in srgb, ${accent} 52%, transparent)`
      : "rgba(255,255,255,0.28)"};
  backdrop-filter: blur(8px);
  box-shadow: ${({ accent }) =>
    accent && accent.trim() !== ""
      ? `0 0 12px color-mix(in srgb, ${accent} 22%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)`
      : "0 0 8px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.07)"};
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
`;

export const InfoLevelXP = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.58);
  white-space: nowrap;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.75;
  }
`;

export const InfoRankBadgeShimmer = styled.span`
  display: inline-flex;
  width: 80px;
  height: 25px;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(251, 191, 36, 0.06) 0%,
      rgba(251, 191, 36, 0.22) 40%,
      rgba(255, 236, 153, 0.45) 50%,
      rgba(251, 191, 36, 0.22) 60%,
      rgba(251, 191, 36, 0.06) 100%
    );
    background-size: 200% 100%;
    animation: goldShimmer 1.6s ease-in-out infinite;
  }

  @keyframes goldShimmer {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
`;

export const InfoRankBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 8px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.18) 0%,
    rgba(245, 158, 11, 0.12) 100%
  );
  border: 1px solid rgba(251, 191, 36, 0.45);
  backdrop-filter: blur(8px);
  box-shadow:
    0 0 10px rgba(251, 191, 36, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(251, 191, 36, 0.95);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s, box-shadow 0.15s;

  &:hover {
    opacity: 0.85;
    box-shadow:
      0 0 16px rgba(251, 191, 36, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

export const AvatarCropBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;

  @media (max-width: 480px) {
    padding: 4px 2px;
  }
`;

export const CardBgCropBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 8px;
`;

export const CardBgEditBtn = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.78);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CardBgRemoveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  font-size: 13px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: background 0.15s, opacity 0.15s;

  &:hover {
    background: rgba(180, 30, 30, 0.75);
  }

  @media (hover: none) {
    opacity: 1;
  }
`;
