import { css, keyframes, styled } from "styled-components";
import { spin } from "@/theme/animations";

const eq = keyframes`
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
`;

/**
 * Centered on desktop; full-width and tighter on mobile. Slim = right-aligned,
 * compact. Block = fills its parent (used stacked above the About section).
 */
export const Wrapper = styled.div<{ $slim?: boolean; $block?: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${({ $slim, $block }) =>
    $block ? "none" : $slim ? "260px" : "360px"};
  margin-inline: ${({ $slim, $block }) =>
    $block ? "0" : $slim ? "0 0" : "auto"};
  margin-left: ${({ $slim, $block }) =>
    !$block && $slim ? "auto" : undefined};

  @media screen and (max-width: 800px) {
    max-width: ${({ $slim, $block }) =>
      $block ? "none" : $slim ? "230px" : "300px"};
  }

  margin-bottom: -18px;
`;

/** The whole pill is one horizontal row; stays compact on a 375px viewport. */
export const Pill = styled.div<{
  $slim?: boolean;
  $block?: boolean;
  $flushBottom?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ $slim }) => ($slim ? "8px" : "10px")};
  width: 100%;
  padding: ${({ $slim }) => ($slim ? "4px 4px 4px 4px" : "6px 6px 6px 6px")};
  /* Material with an accent wash from the leading edge — translucent, so it
     sits on sheets, dialogs and the canvas alike. */
  background-color: var(--material-fill);
  background-image: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 18%, transparent) 0%,
    color-mix(in srgb, var(--accent) 6%, transparent) 55%,
    transparent 100%
  );
  border: 1px solid
    color-mix(in srgb, var(--accent) 26%, var(--material-edge));
  border-radius: ${({ $block }) => ($block ? "16px" : "999px")};

  ${({ $flushBottom }) =>
    $flushBottom &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}

  @media screen and (max-width: 800px) {
    gap: 8px;
    padding: 4px 12px 4px 4px;

    ${({ $block }) =>
      $block &&
      css`
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-top-color: var(--material-edge);
        border-bottom-color: var(--material-edge);
      `}
  }
`;

export const Art = styled.span<{ $slim?: boolean }>`
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $slim }) => ($slim ? "30px" : "40px")};
  height: ${({ $slim }) => ($slim ? "30px" : "40px")};
  overflow: hidden;
  border-radius: 50%;
  background: var(--fill-pressed);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media screen and (max-width: 800px) {
    width: ${({ $slim }) => ($slim ? "28px" : "32px")};
    height: ${({ $slim }) => ($slim ? "28px" : "32px")};
  }
`;

/** Circular play/pause control parked in the pill's right corner. */
export const PlayButton = styled.button<{ $slim?: boolean }>`
  all: unset;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $slim }) => ($slim ? "30px" : "38px")};
  height: ${({ $slim }) => ($slim ? "30px" : "38px")};
  border-radius: 50%;
  color: #fff;
  background: var(--accent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 45%, transparent);
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  &:not(:disabled):hover {
    filter: brightness(1.08);
    transform: scale(1.06);
  }

  @media screen and (max-width: 800px) {
    width: ${({ $slim }) => ($slim ? "28px" : "34px")};
    height: ${({ $slim }) => ($slim ? "28px" : "34px")};
  }
`;

export const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

export const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

export const Title = styled.div`
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Artist = styled.div`
  color: var(--text-secondary);
  font-size: var(--font-size-xsmall);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Slim seek bar under the title/artist. */
export const Progress = styled.div`
  margin-top: 5px;
  height: 3px;
  border-radius: 999px;
  background: var(--fill-pressed);
  cursor: pointer;
`;

export const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 80%, transparent),
    0 0 2px var(--accent);
  transition: width 0.2s linear;
`;

/** Overlays the album art while playing — animated bars over a dark scrim. */
export const Equalizer = styled.span`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(1px);

  span {
    display: block;
    width: 3px;
    height: 60%;
    border-radius: 2px;
    background: #fff;
    transform-origin: center;
    animation: ${eq} 0.9s ease-in-out infinite;
  }
  span:nth-child(2) {
    animation-delay: 0.15s;
  }
  span:nth-child(3) {
    animation-delay: 0.3s;
  }
`;

/** Off-screen host for the real Spotify iframe — collapsed to a 1px, fully
    transparent, non-interactive pixel so it drives playback without ever being
    visible (no masking dot needed). */
export const HiddenEmbed = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -9999;
`;
