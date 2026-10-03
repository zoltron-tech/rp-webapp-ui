import styled, { keyframes } from "styled-components";
import { spin } from "@/theme/animations";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Page shell ──────────────────────────────────────────────────────────────

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
  padding: 40px 20px 64px;
  box-sizing: border-box;
  gap: 32px;
  animation: ${fadeUp} 0.35s ease both;
  position: relative;
  isolation: isolate;
  /* clip (not hidden) so we don't accidentally create a scroll container,
     which would make the content scroll inside Root instead of the page */
  overflow-x: clip;

  @media (max-width: 800px) {
    padding: 24px 12px 48px;
    gap: 24px;
  }
`;

/** Full-page backdrop layer — two are rendered and cross-faded.
 *
 * Rendered at 1/5 resolution and scaled back up, rather than as a
 * full-viewport blur. A fixed, viewport-sized layer carrying a very large
 * blur radius under scrolling content is the iOS 26 compositor-regression
 * trigger — the same shape as Apple's own repro (FB21749211) and as the muse
 * mesh that was blanking /rp/profile/[slug]/muses. Blurring a 20%-size layer
 * by 18px and scaling it 5x is visually equivalent to blurring the
 * full-size layer by 90px, but the convolution runs over 1/25th the pixels
 * and the radius stays far below the pathological range.
 *
 * Note the blur is NOT baked into the image server-side here (the approach
 * used for one-off card art): these sources are small "feed"-sized images
 * blown up to viewport scale, and an upscaled pre-baked blur reads as blocky
 * smearing rather than a smooth wash. */
export const BackdropLayer = styled.div<{ $img: string; $visible: boolean }>`
  position: fixed;
  /* 20% box anchored slightly off-origin, then scaled 5.75x (5 to fill the
     viewport + the old 1.15 edge bleed) so the softened edges stay out of
     view. transform-origin must be the top-left corner for the maths to
     land. */
  top: -1.5%;
  left: -1.5%;
  width: 20%;
  height: 20%;
  transform-origin: 0 0;
  transform: scale(5.75);
  z-index: -1;
  pointer-events: none;
  background-image:
    /* top-to-bottom gradient: dark at top (text area), slightly lighter at bottom */
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.55) 60%,
      rgba(0, 0, 0, 0.4) 100%
    ),
    url(${({ $img }) => $img});
  background-size: cover;
  background-position: center;
  /* 18px here ≈ 90px once scaled up. Saturation/brightness stay in CSS —
     they are per-pixel colour maths, not a large-radius convolution, so they
     carry none of the compositor cost that the blur did. */
  filter: blur(18px) saturate(0.7) brightness(0.5);
  opacity: ${({ $visible }) => ($visible ? 0.7 : 0)};
  transition: opacity 0.7s ease;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  max-width: 540px;
  padding-block: 20px;
`;

export const Eyebrow = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent-8, var(--accent));
  opacity: 0.9;
`;

export const Title = styled.h1`
  margin-top: 20px;
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;

  @media (max-width: 800px) {
    font-size: var(--font-size-h3);
  }
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  max-width: 400px;
  line-height: 1.6;
`;

// ─── Carousel ────────────────────────────────────────────────────────────────

export const CarouselWrapper = styled.div`
  width: 100%;
  max-width: 1080px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

/** Clips the card track horizontally but allows vertical overflow for the scale effect */
export const TrackViewport = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  /* enough vertical room so scaled-down cards aren't clipped */
  padding-block: 12px;
  margin-block: -12px;
  /* Fade cards out softly at both edges instead of cutting abruptly */
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
`;

export const Track = styled.div<{ $offset: number }>`
  display: flex;
  gap: 16px;
  transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(${({ $offset }) => $offset}px);
  /* allow scale-up of active card to show outside tight clip */
  overflow: visible;

  @media (max-width: 800px) {
    gap: 10px;
  }
`;

/** Adds bigger scale + accent glow on the active card */
export const CardSlot = styled.div<{ $active: boolean }>`
  flex-shrink: 0;
  border-radius: 14px;
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.35s ease,
    box-shadow 0.35s ease;
  transform: ${({ $active }) => ($active ? "scale(1.04)" : "scale(0.92)")};
  opacity: ${({ $active }) => ($active ? 1 : 0.55)};
  box-shadow: ${({ $active }) =>
    $active
      ? `0 0 0 2px var(--accent),
         0 0 22px 6px color-mix(in srgb, var(--accent) 55%, transparent),
         0 12px 32px rgba(0,0,0,0.35)`
      : "none"};
`;

/** Arrow nav button */
export const ArrowButton = styled.button<{ $hidden?: boolean }>`
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  pointer-events: ${({ $hidden }) => ($hidden ? "none" : "auto")};
  transition: background 0.15s, opacity 0.2s, transform 0.1s;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--bg-4);
  }

  &:active {
    transform: scale(0.92);
  }
`;

// ─── Dot pagination ──────────────────────────────────────────────────────────

export const Dots = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
`;

export const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "20px" : "8px")};
  height: 8px;
  border-radius: 9999px;
  border: none;
  background: ${({ $active }) => ($active ? "var(--accent)" : "var(--bg-6)")};
  cursor: pointer;
  padding: 0;
  transition: width 0.25s, background 0.2s;
`;

// ─── States ───────────────────────────────────────────────────────────────────

export const LoadingSpinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid var(--bg-5);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
  margin: 48px auto;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--text-secondary);
  font-size: var(--font-size);
  text-align: center;

  span {
    font-size: 40px;
  }
`;

export const ErrorText = styled.p`
  color: var(--tomato-a9);
  font-size: var(--font-size-small);
  text-align: center;
  margin: 0;
`;

// ─── Footer actions ───────────────────────────────────────────────────────────

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 360px;
`;

export const SkipButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: var(--accent-8, var(--accent));
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;

export const FooterHint = styled.p`
  margin: 0;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  text-align: center;
  opacity: 0.55;
  max-width: 300px;
  line-height: 1.5;
`;
