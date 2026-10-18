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

export const PennedByChip = styled.button<{
  accent?: string | null;
  $textColor?: string | null;
}>`
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
  color: ${({ $textColor }) => $textColor || "var(--text)"};
  font-weight: 700;
  cursor: pointer;

  /* Matches the muse card's smallest size (e.g. the 240px card at 375px
     viewports) — tighten the chip so it doesn't crowd the header. */
  @container muse-card (max-width: 300px) {
    gap: 5px;
    padding: 1px 6px 1px 1px;
    font-size: var(--font-size-xsmall);
  }
`;

export const PennedByName = styled.span<{ $textColor?: string | null }>`
  color: ${({ $textColor }) => $textColor || "var(--text)"};
  font-weight: 700;
  max-width: 24ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @container muse-card (max-width: 360px) {
    max-width: 18ch;
  }

  @container muse-card (max-width: 300px) {
    max-width: 12ch;
  }
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

  @container muse-card (max-width: 300px) {
    width: 16px;
    height: 16px;
  }
`;

export const PennedByRow = styled.span<{ $textColor?: string | null }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${({ $textColor }) => $textColor || "var(--text-secondary)"};
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
`;

import { Container } from "@novelist-world/ui";
import type { ImageCropFilter, ImageFilter } from "@nw/types";
import { cropBackgroundStyle } from "@nw/utils";
import styled, { css } from "styled-components";
import { Avatar as AvatarCommon } from "@/components/common";
import {
  BACKGROUND_BLUR,
  BLUR_FILTER,
  BORDER_RADIUS,
  CARD_BORDER,
  Z_INDEX,
} from "@/theme";

interface BannerProps {
  /* Transient: this renders a <div>. `src` is a valid HTML attribute name, so
     un-prefixed it is forwarded to the DOM and React warns on an empty one. */
  $src: string | null;
  $filterValues: ImageFilter | null;
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

  ${({ $src }) => $src && css`background-image: url(${$src});`}
  /* Apply dynamic filters */
  filter: ${({ $filterValues }) =>
    `grayscale(${$filterValues?.greyscale ?? 0}%)
     brightness(${$filterValues?.brightness ?? 100}%)
     blur(${$filterValues?.blur ?? 0}px)`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  contain: paint;

  @container (max-width: 950px) {
    & {
      top: 0px;
    }
  }

  /* Crossfade/shift-in for prev/next muse navigation. The incoming wallpaper
     is stacked on top of the previous one and slides in from the direction
     of navigation; the old layer beneath covers any edge gaps. */
  &.banner-enter {
    animation: bannerFadeIn 0.7s ease both;
  }
  &.banner-enter-next {
    animation: bannerShiftNext 0.7s ease both;
  }
  &.banner-enter-prev {
    animation: bannerShiftPrev 0.7s ease both;
  }

  @keyframes bannerFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes bannerShiftNext {
    from { opacity: 0; transform: translateX(3%) scale(1.06); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes bannerShiftPrev {
    from { opacity: 0; transform: translateX(-3%) scale(1.06); }
    to { opacity: 1; transform: translateX(0) scale(1); }
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

  background-image: url(${(props): string => props.$banner});
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

/* ── Prev/next muse nav tabs (mobile) ────────────────────────────────────────
   Touch counterpart of the desktop peek cards: slim edge-docked tabs showing
   the neighbor's portrait behind a chevron and vertical name; tap navigates.
   Unknown neighbors show the shimmer inside the tab while loading. */

export const MuseNavTab = styled.button<{
  $side: "left" | "right";
  $accent?: string | null;
}>`
  all: unset;
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 0;" : "right: 0;")}
  transform: translateY(-50%);
  z-index: ${Z_INDEX.SCROLL_JUMP};
  width: 36px;
  height: 118px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  ${({ $side }) =>
    $side === "left"
      ? "border-left: none; border-radius: 0 12px 12px 0;"
      : "border-right: none; border-radius: 12px 0 0 12px;"}
  box-shadow: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `0 6px 20px color-mix(in srgb, ${$accent} 30%, rgba(0, 0, 0, 0.5))`
      : "0 6px 18px rgba(0, 0, 0, 0.5)"};
  transition: transform 0.15s ease;

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.94);
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  /* Desktop shows the peek cards instead */
  @media (min-width: 951px) {
    display: none;
  }
`;

export const MuseNavTabImage = styled.div<{ $src: string }>`
  position: absolute;
  inset: 0;
  background-image: url(${({ $src }) => $src});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center top;
  filter: saturate(0.8) brightness(0.85);
`;

export const MuseNavTabVeil = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  inset: 0;
  background: ${({ $side }) =>
    $side === "left"
      ? "linear-gradient(to right, rgba(6, 6, 10, 0.35), rgba(6, 6, 10, 0.75))"
      : "linear-gradient(to left, rgba(6, 6, 10, 0.35), rgba(6, 6, 10, 0.75))"};
`;

export const MuseNavTabContent = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-block: 8px;
`;

export const MuseNavTabChevron = styled.span<{ $accent?: string | null }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 55%, black)`
      : "rgba(0, 0, 0, 0.55)"};
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
`;

export const MuseNavTabName = styled.span`
  writing-mode: vertical-rl;
  max-height: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.8);
`;

/* ── Prev/next muse nav cards (desktop) ──────────────────────────────────────
   Edge-docked "peek" cards: at rest only a slim rail with the chevron and the
   neighbor's name is visible at the screen edge; hovering (or keyboard focus)
   slides the full portrait card into view. */

const NAV_CARD_PEEK = 44;

export const MuseNavCard = styled.button<{
  $side: "left" | "right";
  $accent?: string | null;
}>`
  all: unset;
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 0;" : "right: 0;")}
  z-index: ${Z_INDEX.SCROLL_JUMP};
  width: 150px;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  cursor: pointer;
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  ${({ $side }) =>
    $side === "left"
      ? "border-left: none; border-radius: 0 14px 14px 0;"
      : "border-right: none; border-radius: 14px 0 0 14px;"}
  box-shadow: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `0 10px 34px color-mix(in srgb, ${$accent} 30%, rgba(0, 0, 0, 0.55))`
      : "0 10px 30px rgba(0, 0, 0, 0.55)"};
  transform: ${({ $side }) =>
    $side === "left"
      ? `translateY(-50%) translateX(calc(${NAV_CARD_PEEK}px - 100%))`
      : `translateY(-50%) translateX(calc(100% - ${NAV_CARD_PEEK}px))`};
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-50%) translateX(0);
    border-color: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 60%, rgba(255, 255, 255, 0.4))`
        : "rgba(255, 255, 255, 0.42)"};
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) translateX(0) scale(0.985);
  }

  &:disabled {
    cursor: default;
  }

  @media (max-width: 950px) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const MuseNavCardImage = styled.div<{
  $src: string;
  $bgSize?: string;
  $bgPosition?: string;
}>`
  position: absolute;
  inset: 0;
  background-image: url(${({ $src }) => $src});
  background-repeat: no-repeat;
  background-size: ${({ $bgSize }) => $bgSize ?? "cover"};
  background-position: ${({ $bgPosition }) => $bgPosition ?? "center center"};
  transform: scale(1.03);
  filter: saturate(0.8) brightness(0.9);
  transition:
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s ease;

  ${MuseNavCard}:hover &,
  ${MuseNavCard}:focus-visible & {
    transform: scale(1.09);
    filter: saturate(1) brightness(1);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* Moody dark veil over the resting sliver; lifts once the card slides out */
export const MuseNavCardVeil = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  inset: 0;
  background: ${({ $side }) =>
    $side === "left"
      ? "linear-gradient(to right, rgba(6, 6, 10, 0.4) 40%, rgba(6, 6, 10, 0.85))"
      : "linear-gradient(to left, rgba(6, 6, 10, 0.4) 40%, rgba(6, 6, 10, 0.85))"};
  transition: opacity 0.4s ease;

  ${MuseNavCard}:hover &,
  ${MuseNavCard}:focus-visible & {
    opacity: 0;
  }
`;

/* The always-visible strip at the screen edge: chevron + vertical name */
export const MuseNavCardRail = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ $side }) => ($side === "left" ? "right: 0;" : "left: 0;")}
  width: ${NAV_CARD_PEEK}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-block: 14px;
`;

export const MuseNavCardRailName = styled.span`
  writing-mode: vertical-rl;
  max-height: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
  transition: opacity 0.3s ease;

  ${MuseNavCard}:hover &,
  ${MuseNavCard}:focus-visible & {
    opacity: 0;
  }
`;

export const MuseNavCardChevron = styled.span<{ $accent?: string | null }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  backdrop-filter: blur(4px);
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;

  ${MuseNavCard}:hover &,
  ${MuseNavCard}:focus-visible & {
    background: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 65%, black)`
        : "var(--accent)"};
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.08);
  }
`;

/* Bottom info revealed once the card slides out */
export const MuseNavCardFooter = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: ${({ $side }) => ($side === "right" ? "flex-end" : "flex-start")};
  text-align: ${({ $side }) => ($side === "right" ? "right" : "left")};
  padding: 26px 12px 12px;
  background: linear-gradient(
    to top,
    rgba(4, 4, 8, 0.92),
    rgba(4, 4, 8, 0.45) 60%,
    transparent
  );
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.35s ease 0.08s,
    transform 0.35s ease 0.08s;

  ${MuseNavCard}:hover &,
  ${MuseNavCard}:focus-visible & {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.35s ease;
    transform: none;
  }
`;

export const MuseNavCardEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
`;

export const MuseNavCardKbd = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding-inline: 3px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  font-family: inherit;
  font-size: 0.6rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
`;

export const MuseNavCardName = styled.span`
  max-width: 100%;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardExpandedWrapper = styled.div<{ $hideChrome?: boolean }>`
  position: relative;
  width: 326px;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  ${({ $hideChrome }) => ($hideChrome ? "border: none;" : CARD_BORDER)};

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

  @media (max-width: 1024px) {
    border: none;
  }

  @media (min-width: 350px) and (max-width: 1024px) {
    &.open {
      border-radius: 0px;
      display: none;
    }
  }

  /* Slim phones (down to iPhone SE, 375px): same 9/16 ratio, smaller card so
     the 36px edge nav tabs on both sides never overlap it */
  @media (min-width: 350px) and (max-width: 380px) {
    width: min(240px, calc(100vw - 120px));
  }

  /* Slightly wider phones (e.g. 390px, iPhone 12/13/14): a touch bigger than
     the smallest variant above rather than hitting the same 240px cap */
  @media (min-width: 381px) and (max-width: 420px) {
    width: min(280px, calc(100vw - 110px));
  }

  @media (max-width: 350px) {
    margin-top: 0px;
    width: 95%;
    height: 60vh;
    border-radius: 8px;
  }
`;

type CardProps = {
  /** Transient: `banner` is not an HTML attribute, so left un-prefixed
   *  styled-components forwards it to the DOM and React errors on it. */
  $banner: string;
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

/* ── Section navigation rail ─────────────────────────────────────────────────
   Same glass design language as the prev/next peek cards: one docked rail,
   accent-aware selected pill with an indicator bar. Vertical column beside
   the card on desktop, horizontal pill bar below the content on mobile. */

export const SideMenu = styled.nav<{
  /** Advanced appearance: custom rail background colour. */
  $bgColor?: string | null;
  /** Advanced appearance: strip background, border, blur and shadow. */
  $hideChrome?: boolean;
}>`
  position: relative;
  z-index: ${Z_INDEX.CARD};
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  height: max-content;
  padding: 10px 8px;
  margin-left: 14px;
  border-radius: 18px;
  background: ${({ $bgColor, $hideChrome }) =>
    $hideChrome ? "transparent" : $bgColor || "rgba(10, 10, 14, 0.7)"};
  backdrop-filter: ${({ $hideChrome }) =>
    $hideChrome ? "none" : "blur(10px)"};
  border: ${({ $hideChrome }) =>
    $hideChrome ? "none" : "1px solid rgba(255, 255, 255, 0.16)"};
  box-shadow: ${({ $hideChrome }) =>
    $hideChrome ? "none" : "0 10px 30px rgba(0, 0, 0, 0.45)"};

  @media (min-width: 1024px) and (max-width: 2047px) {
    margin-top: 20px;
  }

  @media (max-width: 600px) {
    flex-direction: row;
    align-items: center;
    margin-left: unset;
    margin-top: 12px;
    width: max-content;
    max-width: calc(100% - 16px);
    /* Concentric radii: parent radius ≈ item radius (10px) + padding (8px),
       so the selected/hover pill sits evenly inset inside the bar */
    padding: 8px;
    gap: 4px;
    border-radius: 18px;
  }

  @media (max-width: 380px) {
    padding: 6px;
    gap: 2px;
  }

  @media (min-width: 381px) and (max-width: 420px) {
    padding: 7px;
    gap: 3px;
  }
`;

export const MenuButton = styled.button<{
  $accent?: string | null;
  $textColor?: string | null;
}>`
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 64px;
  padding: 10px 6px 8px;
  border-radius: 12px;
  cursor: pointer;
  color: ${({ $textColor }) =>
    $textColor
      ? `color-mix(in srgb, ${$textColor} 70%, transparent)`
      : "rgba(255, 255, 255, 0.6)"};
  transition: background 0.25s ease, color 0.25s ease;

  /* Accent indicator bar: hugs the rail's inner-left edge on desktop,
     the bottom edge on mobile */
  &::before {
    content: "";
    position: absolute;
    left: -8px;
    top: 50%;
    width: 3px;
    height: 55%;
    border-radius: 999px;
    background: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 80%, white)`
        : "var(--accent)"};
    transform: translateY(-50%) scaleY(0);
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: ${({ $textColor }) =>
      $textColor
        ? `color-mix(in srgb, ${$textColor} 92%, transparent)`
        : "rgba(255, 255, 255, 0.92)"};
  }

  /* Fill/glow live on the sliding MenuHighlight pill behind the buttons (see
     below) so the active state can animate its position between sections;
     this class only carries the parts that don't need to move. */
  &.selected {
    color: ${({ $textColor }) => $textColor || "#fff"};

    &::before {
      transform: translateY(-50%) scaleY(1);
    }
  }

  /* CARD section only exists on screens where the main card is hidden */
  &.card-image-mobile-only {
    display: none;

    @media (max-width: 950px) {
      display: flex;
    }
  }

  @media (max-width: 600px) {
    width: auto;
    flex: 1;
    padding: 8px 10px 6px;
    border-radius: 10px;

    &::before {
      left: 50%;
      top: auto;
      bottom: -8px;
      width: 55%;
      height: 3px;
      transform: translateX(-50%) scaleX(0);
    }

    &.selected::before {
      transform: translateX(-50%) scaleX(1);
    }
  }

  @media (max-width: 380px) {
    padding: 6px 6px 4px;
    gap: 2px;
  }

  @media (min-width: 381px) and (max-width: 420px) {
    padding: 7px 8px 5px;
    gap: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &::before {
      transition: none;
    }
  }
`;

/* Sliding "active section" pill, positioned/sized in JS from the selected
   MenuButton's own layout box (see page.tsx) and painted behind the buttons
   (DOM order, not z-index) so it reads as one highlight gliding between
   them — vertically on desktop, horizontally on mobile — instead of each
   button just flipping its own background on and off. */
export const MenuHighlight = styled.div<{ $accent?: string | null }>`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 12px;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 26%, rgba(255, 255, 255, 0.04))`
      : "color-mix(in srgb, var(--accent) 40%, transparent)"};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `0 0 14px color-mix(in srgb, ${$accent} 25%, transparent)`
        : "0 0 12px color-mix(in srgb, var(--accent) 30%, transparent)"};
  pointer-events: none;
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;

  @media (max-width: 600px) {
    border-radius: 10px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.2s ease;
  }
`;

export const MenuButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);

  ${MenuButton}:hover &,
  ${MenuButton}.selected & {
    transform: scale(1.12);
  }

  @media (max-width: 380px) {
    width: 16px;
    height: 16px;
  }

  @media (min-width: 381px) and (max-width: 420px) {
    width: 19px;
    height: 19px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const MenuText = styled.span`
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;

  @media (max-width: 600px) {
    font-size: 0.5rem;
    letter-spacing: 0.1em;
  }

  @media (max-width: 380px) {
    font-size: 0.4rem;
    letter-spacing: 0.08em;
  }

  @media (min-width: 381px) and (max-width: 420px) {
    font-size: 0.46rem;
    letter-spacing: 0.09em;
  }
`;

export const ConnectionsContainer = styled.div`
  display: flex;
  /* Column so the inner ScrollableContent is a flex-column child: its
     overflow-y:auto then auto-applies min-height:0 and it shrinks to the
     remaining space and scrolls — the same pattern the Prompts section uses.
     The old rigid height:100% ignored SectionMiniHeader above it and pushed
     the scroll area's bottom below the card's clipped edge, unreachable. */
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: ${BORDER_RADIUS};
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

export const CardBack = styled.div<{
  accent?: string | null;
  /** Advanced appearance: drop the panel's gradient + blur entirely. */
  $hideBackground?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
  background: ${({ accent, $hideBackground }: any) => {
    if ($hideBackground) return "transparent";

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
    ${({ $hideBackground }: any) =>
      $hideBackground ? "backdrop-filter: none;" : BACKGROUND_BLUR()}
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
  /* Explicitly clip X — with only overflow-y set, the CSS spec promotes the
     visible X axis to auto, which produced a stray horizontal scrollbar on
     mobile whenever a child overflowed. These lists only ever scroll on Y. */
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  height: inherit;
  width: 100%;
  box-sizing: border-box;
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
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
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

/* ── Prompts (interactions) list ─────────────────────────────────────────────
   Glass cards in the same design language as the nav rail/cards: hairline
   border, accent-aware tint, fluid width so they scale from the desktop card
   down to the slim-phone (iPhone SE) card size. */

export const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding-block: 2px 8px;
`;

export const PromptCard = styled.article<{ $accent?: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 10%, rgba(0, 0, 0, 0.35))`
      : "rgba(255, 255, 255, 0.06)"};
  border: 1px solid
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 26%, transparent)`
        : "rgba(255, 255, 255, 0.12)"};
  backdrop-filter: blur(6px);
  transition: border-color 0.25s ease;

  &:hover {
    border-color: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 45%, transparent)`
        : "rgba(255, 255, 255, 0.24)"};
  }
`;

export const PromptCardDate = styled.span<{ $accent?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);

  &::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 80%, white)`
        : "var(--accent)"};
  }
`;

export const PromptCardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

/* Privacy pill in the card's top-right corner. For CUSTOM privacy it becomes
   an interactive chip holding the shared-with avatar stack; otherwise it's a
   static icon + label. */
export const PromptPrivacyChip = styled.button<{
  $accent?: string | null;
  $interactive?: boolean;
}>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  max-width: 62%;
  flex-shrink: 0;
  cursor: ${({ $interactive }) => ($interactive ? "pointer" : "default")};
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  .privacy-icon {
    font-size: 0.72rem;
    flex-shrink: 0;
  }

  .shared-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ${({ $interactive, $accent }) =>
    $interactive &&
    css`
      &:hover {
        color: rgba(255, 255, 255, 0.85);
        background: ${
          $accent && $accent.trim() !== ""
            ? `color-mix(in srgb, ${$accent} 30%, rgba(0, 0, 0, 0.3))`
            : "color-mix(in srgb, var(--accent) 40%, transparent)"
        };
        border-color: ${
          $accent && $accent.trim() !== ""
            ? `color-mix(in srgb, ${$accent} 55%, transparent)`
            : "rgba(255, 255, 255, 0.32)"
        };
      }
    `}
`;

export const PromptSharedAvatars = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;

  .shared-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid rgba(15, 15, 15, 0.9);

    &:not(:first-child) {
      margin-left: -7px;
    }
  }
`;

/* Media hugs the image/video's own aspect ratio — never cropped; very tall
   media is scaled down to fit the max-height, letterboxed on the dark bg */
export const PromptCardMedia = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.35);
  line-height: 0;
`;

export const PromptCardImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-height: 360px;
  object-fit: contain;
  cursor: zoom-in;
  transition: transform 0.25s ease;

  ${PromptCardMedia}:hover & {
    transform: scale(1.02);
  }
`;

export const PromptCardVideo = styled.video`
  display: block;
  width: 100%;
  height: auto;
  max-height: 360px;
  object-fit: contain;
`;

export const PromptCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

export const PromptCommentsBtn = styled.button<{ $accent?: string | null }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 30%, rgba(0, 0, 0, 0.3))`
        : "color-mix(in srgb, var(--accent) 40%, transparent)"};
    border-color: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 55%, transparent)`
        : "rgba(255, 255, 255, 0.32)"};
    color: #fff;
  }
`;

export const PromptCardStat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.66rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

/* ── Muse connection cards ("bonds") ─────────────────────────────────────────
   Same glass/accent design language as PromptCard above: translucent
   accent-tinted fill, soft border that brightens on hover, backdrop blur.
   The header row (avatar stack + title + actions) is squeezed via
   `@container muse-card` so it still fits on the smallest card (240px) even
   with a connection at its 10-muse cap — only the first 3 muses ever render
   as avatars (see connections-section.tsx), so width only grows with the
   overflow badge, never with the muse count itself. */
export const ConnectionCard = styled.div<{ $accent?: string | null }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 10%, rgba(0, 0, 0, 0.35))`
      : "rgba(255, 255, 255, 0.06)"};
  border: 1px solid
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 26%, transparent)`
        : "rgba(255, 255, 255, 0.12)"};
  backdrop-filter: blur(6px);
  transition: border-color 0.25s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 45%, transparent)`
        : "rgba(255, 255, 255, 0.24)"};
  }
`;

export const ConnectionCardHeader = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  @container muse-card (max-width: 300px) {
    padding: 8px 10px;
    gap: 6px;
  }
`;

export const ConnectionAvatarStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  & > * {
    margin-left: -8px;
    border: 2px solid rgba(10, 10, 14, 0.9);
  }

  & > *:first-child {
    margin-left: 0;
  }
`;

export const ConnectionAvatar = styled.span<{ $src?: string | null }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.08);
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: cover;
  background-position: center;

  @container muse-card (max-width: 300px) {
    width: 20px;
    height: 20px;
  }
`;

export const ConnectionOverflowBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 5px;
  margin-left: -8px;
  border: 2px solid rgba(10, 10, 14, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;

  @container muse-card (max-width: 300px) {
    min-width: 20px;
    height: 20px;
    font-size: 0.55rem;
  }
`;

export const ConnectionCardTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;

  @container muse-card (max-width: 300px) {
    font-size: 0.74rem;
  }
`;

export const ConnectionCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @container muse-card (max-width: 300px) {
    gap: 4px;
  }
`;

/* Shared shape for the edit/delete icon buttons — mirrors PromptCommentsBtn's
   hover treatment (accent-tinted, or red for the destructive variant). */
export const ConnectionIconButton = styled.button<{ $variant?: "danger" }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "danger"
        ? "rgba(239, 68, 68, 0.16)"
        : "rgba(255, 255, 255, 0.12)"};
    border-color: ${({ $variant }) =>
      $variant === "danger"
        ? "rgba(239, 68, 68, 0.5)"
        : "rgba(255, 255, 255, 0.32)"};
    color: ${({ $variant }) =>
      $variant === "danger" ? "rgb(239, 68, 68)" : "#fff"};
  }

  @container muse-card (max-width: 300px) {
    width: 22px;
    height: 22px;
  }
`;

export const ConnectionReactButton = styled.button<{
  $variant: "accept" | "decline";
}>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  background: ${({ $variant }) =>
    $variant === "accept" ? "var(--grass-9)" : "rgb(185, 28, 28)"};
  transition: filter 0.15s ease, transform 0.1s ease, opacity 0.15s ease;

  &:hover {
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @container muse-card (max-width: 300px) {
    width: 22px;
    height: 22px;
  }
`;

export const ConnectionChevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.5);
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

export const ConnectionCardBody = styled.div`
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const ConnectionsBottomSpacer = styled.div`
  flex: 0 0 100%;
  width: 100%;
  height: 48px;
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

export const InfoCardAvatar = styled.div<{
  $src: string;
  /** The avatar's stored crop, when the src being shown is the avatar's own. */
  $crop?: ImageCropFilter | null;
}>`
  width: 82px;
  height: 82px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
  background-image: url(${({ $src }) => $src});
  background-size: ${({ $crop }) => cropBackgroundStyle($crop).backgroundSize};
  background-position: ${({ $crop }) => cropBackgroundStyle($crop).backgroundPosition};
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

export const InfoMuseName = styled.h2<{ $textColor?: string | null }>`
  margin: 0;
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-semi-bold);
  color: ${({ $textColor }) => $textColor || "var(--text)"};
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

export const InfoSongWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2px;

  & > * {
    width: 100%;
    max-width: 340px;
  }
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
  /* A fixed box the art centres inside, rather than one that stretches to the
     section's full height. Sections give this wrap wildly different heights --
     a short row-flex parent in connections, a tall scroller in story and
     prompts -- and stretching made the gap above the art differ in each. A
     fixed min-height keeps that gap identical everywhere. */
  justify-content: center;
  min-height: 260px;
  gap: 10px;
  width: 100%;
  padding-block: 24px;
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

export const ShimmerLine = styled(ShimmerBase)<{
  $width?: string;
  $height?: string;
}>`
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 4px;
`;

export const ShimmerBlock = styled(ShimmerBase)<{
  $height?: string;
  $width?: string;
}>`
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

export const ShimmerCircle = styled(ShimmerBase)<{ $size?: string }>`
  width: ${({ $size }) => $size ?? "40px"};
  height: ${({ $size }) => $size ?? "40px"};
  border-radius: 50%;
  flex-shrink: 0;
`;

export const CardBackgroundShimmer = styled(ShimmerBase)`
  position: absolute;
  inset: 0;
  border-radius: 0;
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

export const SectionMiniName = styled.div<{ $textColor?: string | null }>`
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-semi-bold);
  color: ${({ $textColor }) => $textColor || "var(--text)"};
  margin-bottom: 5px;
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

/* ── Verse header ─────────────────────────────────────────────────────────────
   Compact bar rendered above the muse card to flip between alternative
   verses of the same muse (and, for the owner, create a new one). A stylized
   "Verses" label anchors the left edge; the verse numbers live in small
   circular badges that scroll horizontally as a single row, so a character
   with many verses never grows taller than one line — the constraint that
   matters most on mobile, where vertical space is scarce.

   MuseContainer is a flex-wrap row, and the card (and its section panels)
   are all narrower than the viewport on desktop — so a narrow verse bar
   would happily sit *beside* the card instead of above it once there's
   enough horizontal room. `flex-basis: 100%` on this outer element claims
   the full row regardless of its own content width, forcing the card onto
   the next line; `max-width` lives on the inner element instead; combining
   both on one element would clamp the flex-basis straight back down to
   `max-width` and defeat the whole trick. */
/* ── Byline: "From the pen of …" above the verses ─────────────────────────
   A chapter divider closing on a signature. The rules are the muse's accent
   fading out to nothing; the signature is one button, so the face, the lead
   and the name are one target. Same width steps as VerseHeaderInner so the
   two lines stack flush. */
export const BylineBar = styled.div`
  position: relative;
  z-index: ${Z_INDEX.CARD};
  width: 100%;
  flex-basis: 100%;
  display: flex;
  justify-content: center;
`;

export const BylineInner = styled.div`
  width: 100%;
  max-width: 326px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 8px;

  @media (min-width: 1024px) and (max-width: 2047px) {
    max-width: 422px;
  }

  @media (max-width: 950px) {
    max-width: 440px;
    padding-inline: 16px;
  }
`;

export const BylineRule = styled.span<{ $accent?: string | null }>`
  flex: 1;
  height: 1px;
  min-width: 12px;
  background: ${({ $accent }) => {
    const tint =
      $accent && $accent.trim() !== "" ? $accent : "var(--accent, #fff)";
    return `linear-gradient(90deg, transparent, color-mix(in srgb, ${tint} 55%, transparent))`;
  }};

  &:last-child {
    background: ${({ $accent }) => {
      const tint =
        $accent && $accent.trim() !== "" ? $accent : "var(--accent, #fff)";
      return `linear-gradient(270deg, transparent, color-mix(in srgb, ${tint} 55%, transparent))`;
    }};
  }
`;

export const Byline = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 80%;
  min-height: 28px;
  padding: 2px 4px;
  border-radius: 999px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.7);
  transition: opacity 0.15s;

  &:active {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent, #fff);
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:hover ${() => BylineChip} {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.35);
    }
    &:hover ${() => BylineChevron} {
      transform: translateX(3px);
      color: #fff;
    }
  }
`;

/* The name in the same chip the card's PennedBy uses — accent at 22%, a
   hairline of it round — so it reads as a control, and as the same control. */
export const BylineChip = styled.span<{ $accent?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 2px 6px 2px 3px;
  border-radius: 999px;
  border: 1px solid
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 40%, transparent)`
        : "rgba(255, 255, 255, 0.2)"};
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 22%, transparent)`
      : "rgba(255, 255, 255, 0.1)"};
  transition: background-color 0.15s, border-color 0.15s;
`;

export const BylinePen = styled.span<{ $accent?: string | null }>`
  display: inline-flex;
  flex-shrink: 0;
  color: ${({ $accent }) =>
    $accent && $accent.trim() !== "" ? $accent : "var(--accent, #fff)"};

  svg {
    width: 11px;
    height: 11px;
  }
`;

export const BylineLead = styled.span`
  flex-shrink: 0;
  font-size: 0.7rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
`;

export const BylineAvatar = styled.span<{ $src: string }>`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
`;

export const BylineName = styled.span<{ $textColor?: string | null }>`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $textColor }) => $textColor || "#fff"};
`;

export const BylineChevron = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.15s, color 0.15s;
`;

export const VerseHeaderBar = styled.nav`
  position: relative;
  z-index: ${Z_INDEX.CARD};
  width: 100%;
  flex-basis: 100%;
  display: flex;
  justify-content: center;
`;

export const VerseHeaderInner = styled.div`
  width: 100%;
  max-width: 326px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 10px;

  @media (min-width: 1024px) and (max-width: 2047px) {
    max-width: 422px;
  }

  @media (max-width: 950px) {
    max-width: 440px;
    padding-inline: 16px;
  }
`;

export const VerseHeaderLabel = styled.span<{ $accent?: string | null }>`
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding-left: 9px;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.7);

  svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    color: ${({ $accent }) =>
      $accent && $accent.trim() !== "" ? $accent : "var(--accent, #fff)"};
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 1px;
    bottom: 1px;
    width: 2px;
    border-radius: 2px;
    background: ${({ $accent }) =>
      $accent && $accent.trim() !== "" ? $accent : "var(--accent, #fff)"};
  }
`;

export const VerseCircleTrack = styled.div<{
  $fade?: boolean;
  $accent?: string | null;
}>`
  /* Shrink (to scroll) when there's not enough room, but never grow beyond
     its own content — flex: 1 would keep claiming the row's full remaining
     width even with only a couple of circles left, leaving empty slack
     between the last one and the pinned "+" button once verses are deleted. */
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 3px 2px;

  &::-webkit-scrollbar {
    display: none;
  }

  /* Connecting track between verse circles — uses muse accent if available */
  & > button:not(:first-child)::before {
    background: ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 45%, rgba(255,255,255,0.22))`
        : "rgba(255, 255, 255, 0.22)"} !important;
  }

  /* Soft fade at the trailing edge hints there's more to scroll — the "+"
     button used to double as that visual stop, but it's now pinned outside
     the track (see VerseCircleNew) so it's always reachable. */
  ${({ $fade }) =>
    $fade &&
    `
    -webkit-mask-image: linear-gradient(to right, black calc(100% - 22px), transparent 100%);
    mask-image: linear-gradient(to right, black calc(100% - 22px), transparent 100%);
  `}
`;

export const VerseCircle = styled.button<{
  $active?: boolean;
  $accent?: string | null;
}>`
  all: unset;
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  width: ${({ $active }) => ($active ? "31px" : "28px")};
  height: ${({ $active }) => ($active ? "31px" : "28px")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $active }) => ($active ? "0.78rem" : "0.7rem")};
  font-weight: 800;
  cursor: pointer;
  color: #fff;
  background: ${({ $active, $accent }) =>
    $active
      ? $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 60%, rgba(10, 10, 14, 0.85))`
        : "var(--accent)"
      : "rgba(10, 10, 14, 0.55)"};
  backdrop-filter: blur(6px);
  border: ${({ $active }) => ($active ? "2px" : "1.5px")} solid
    ${({ $active }) =>
      $active ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.2)"};
  /* Halo ring makes the active verse readable at a glance, not just by
     its (subtle) background-color shift. */
  box-shadow: ${({ $active, $accent }) =>
    $active
      ? `0 0 0 3px ${
          $accent && $accent.trim() !== ""
            ? `color-mix(in srgb, ${$accent} 55%, transparent)`
            : "color-mix(in srgb, var(--accent) 55%, transparent)"
        }`
      : "none"};
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    width 0.15s ease,
    height 0.15s ease,
    font-size 0.15s ease,
    transform 0.15s ease;

  /* Thin connecting track between consecutive circles — a subtle "stepper"
     read that ties the numbers together as one sequence at a glance. */
  &:not(:first-child)::before {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 1.5px;
    background: rgba(255, 255, 255, 0.22);
  }

  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.94);
  }

  &:disabled {
    cursor: default;
  }
`;

/* Pinned beside (not inside) VerseCircleTrack — always one tap away instead
   of sitting at the tail of a scrollable list. Overrides the connecting
   "stepper" line it inherits from VerseCircle with its own divider, set a
   little further off since it now sits across the track's fade/gap rather
   than flush against a neighboring circle. */
export const VerseCircleNew = styled(VerseCircle)`
  flex-shrink: 0;
  border-style: dashed;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);

  &::before {
    right: auto;
    left: -9px;
    width: 6px;
  }

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.55);
  }
`;

/* ── Muse featured song ───────────────────────────────────────────────────────
   Rendered on its own full-width row between the verse header and the muse
   card. Same `flex-basis: 100%` trick as the verse bar so it always claims a
   full row and pushes the card below it, never sitting beside it. */
export const MuseSongBar = styled.div`
  position: relative;
  /* Below the card so the pill's tucked bottom edge (Spotify's negative margin)
     hides behind the card instead of painting over it. */
  z-index: ${Z_INDEX.AVATAR};
  width: 100%;
  flex-basis: 100%;
  display: flex;
  justify-content: center;
`;

export const MuseSongInner = styled.div<{ $spotify?: boolean }>`
  position: relative;
  width: 100%;
  max-width: 340px;
  padding: 0 6px 0;

  /* Small real gap between the pill and the card below — no overlap. (Neutralize
     the player Wrapper's own -18px About-section margin, which would otherwise
     pull the card up under the pill.)
     Spotify is the exception: its off-screen IFrame leaves a 1px host pixel at
     the pill's bottom edge, so tuck that edge a hair behind the card instead. */
  & > div {
    margin-bottom: ${({ $spotify }) => ($spotify ? "-10px" : "8px")};
  }

  /* Stronger accent-tinted gradient on the pill than the shared default, so the
     song reads as the muse's own. (Wrapper is the div child; its first child is
     the pill.) */
  & > div > *:first-child {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 34%, var(--bg-3)) 0%,
      color-mix(in srgb, var(--accent) 14%, var(--bg-3)) 55%,
      color-mix(in srgb, var(--accent) 6%, var(--bg-3)) 100%
    );
  }

  /* Desktop: keep a small gap, still no overlap (Spotify tucks its 1px edge). */
  @media (min-width: 951px) {
    & > div {
      margin-bottom: ${({ $spotify }) => ($spotify ? "-10px" : "8px")};
    }
  }

  @media (max-width: 950px) {
    max-width: 440px;
    padding-inline: 16px;

    /* A little more breathing room above the card on mobile (Spotify still
       tucks its 1px edge behind the card). */
    & > div {
      margin-bottom: ${({ $spotify }) => ($spotify ? "-10px" : "10px")};
    }

    /* The block player squares its corners and drops its side borders on
       mobile; round the top corners back and restore top/left/right borders so
       the song pill reads as its own framed element above the card. */
    & > div > *:first-child {
      border-radius: 12px;
      border-top: 1px solid
        color-mix(in srgb, var(--accent) 40%, var(--bg-5));
      border-left: 1px solid
        color-mix(in srgb, var(--accent) 40%, var(--bg-5));
      border-right: 1px solid
        color-mix(in srgb, var(--accent) 40%, var(--bg-5));
    }
  }

  /* On phones the muse card shrinks (see CardExpandedWrapper) so the edge nav
     tabs never overlap it. Clamp the song to the same width per breakpoint so
     it never sticks out wider than the card below it. */
  @media (min-width: 381px) and (max-width: 420px) {
    max-width: min(280px, calc(100vw - 110px));
    padding-inline: 0;
  }

  @media (min-width: 350px) and (max-width: 380px) {
    max-width: min(240px, calc(100vw - 120px));
    padding-inline: 0;
  }

  @media (max-width: 350px) {
    max-width: 95%;
    padding-inline: 0;
  }
`;

/* Owner controls: a compact vertical pill parked just off the right edge of the
   song player, clear of the play/pause button inside it. The two actions stack
   in one rounded container with a hairline divider so they read as one
   deliberate toolbar. */
export const MuseSongControls = styled.div`
  position: absolute;
  top: 50%;
  right: -30px;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(6px);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, rgba(255, 255, 255, 0.28));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);

  @media (max-width: 420px) {
    right: -26px;
  }
`;

export const MuseSongIconBtn = styled.button`
  width: 22px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  /* Hairline divider between the stacked segments. */
  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  &:hover {
    background: color-mix(in srgb, var(--accent) 40%, transparent);
    color: #fff;
  }

  &.remove:hover {
    background: rgba(180, 30, 30, 0.72);
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* Dashed "Add song" pill shown to the owner when no song is set. */
export const MuseSongAddBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1.5px dashed rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.55);
    background: rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
