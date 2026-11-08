import type { ImageCropFilter } from "@nw/types";
import { cropBackgroundStyle } from "@nw/utils/image";
import styled, { css, keyframes } from "styled-components";
import { FOCUS_RING, MATERIAL_CARD, MEDIA_CHIP } from "@/theme";

/**
 * A muse, unfurled from its link.
 *
 * Landscape rather than the portrait preview card: it sits inside prose and
 * chat bubbles, where a 420px-tall poster would swallow the message around
 * it. Cover art across the top, the avatar breaking the cover's bottom edge,
 * name and author beside it — the same hierarchy as the muse page's own
 * header, at a glance.
 *
 * Sized for the 375px baseline: full width of whatever holds it, capped so it
 * does not stretch into a banner on a desktop thread.
 */

const COVER_HEIGHT = 104;
const AVATAR_SIZE = 60;

export const Frame = styled.a<{ $accent: string | null }>`
  --embed-accent: ${(p) => p.$accent ?? "var(--accent)"};
  position: relative;
  display: block;
  width: 100%;
  max-width: 380px;
  /* A real floor, in pixels. Two of the places this sits are shrink-to-fit
     (a centred comment column, a chat bubble stack), and the inline-size
     containment below makes the card contribute no width of its own there —
     without a floor it collapsed to its padding. */
  min-width: 280px;
  margin: 8px 0;
  padding: 2px;
  border-radius: 18px;
  text-decoration: none;
  color: var(--text);
  background: linear-gradient(
    135deg,
    var(--embed-accent),
    color-mix(in srgb, var(--embed-accent) 45%, white)
  );
  box-shadow: 0 18px 36px -26px rgb(0 0 0 / 0.8);
  cursor: pointer;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  container-name: muse-embed;
  container-type: inline-size;
  ${FOCUS_RING}

  /* Saved prose underlines every anchor, and an underline set
     on an anchor propagates to everything inside it, so it has to be cleared
     on the anchor itself — with the doubled class to outrank that rule. */
  && {
    text-decoration: none;
  }

  @media (max-width: 400px) {
    min-width: 250px;
  }

  @media (min-width: 801px) {
    min-width: 340px;
  }

  @media (hover: hover) {
    &:hover {
      box-shadow: 0 24px 44px -24px rgb(0 0 0 / 0.85);
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: scale(0.99);
  }

  /* Opened from a post header: the card is a preview, not a link. Only the
     Visit profile button inside it routes, so the frame drops the pointer and
     the lift. Inside a popover it also has no surrounding prose to clear. */
  &[data-preview] {
    margin: 0;
    cursor: default;
    user-select: text;

    &:hover,
    &:active {
      transform: none;
    }
  }
`;

export const Card = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  ${MATERIAL_CARD}
  /* Opaque on top of the gradient frame: the fill's translucency would let
     the accent bleed through the whole card instead of only its edge. */
  background-color: var(--bg-2);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.18),
      inset 0 0 0 1px rgb(255 255 255 / 0.05);
  }
`;

export const Cover = styled.div<{
  $src: string;
  $bgSize?: string;
  $bgPosition?: string;
}>`
  position: relative;
  height: ${COVER_HEIGHT}px;
  background-color: color-mix(in srgb, var(--embed-accent) 22%, var(--bg-3));
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: ${({ $bgSize }) => $bgSize ?? "cover"};
  background-position: ${({ $bgPosition }) => $bgPosition ?? "center 30%"};
  background-repeat: no-repeat;

  /* Fade the art into the card so the avatar and name sit on something
     calm, whatever the cover is. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgb(0 0 0 / 0.1) 0%,
      rgb(0 0 0 / 0) 35%,
      color-mix(in srgb, var(--bg-2) 70%, transparent) 100%
    );
  }
`;

/** Art-less muses get a woven accent texture instead of a flat block. */
export const CoverPattern = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.55;
  background-image:
    radial-gradient(
      circle at 20% 30%,
      color-mix(in srgb, var(--embed-accent) 60%, transparent) 0,
      transparent 42%
    ),
    radial-gradient(
      circle at 80% 70%,
      color-mix(in srgb, var(--embed-accent) 45%, white) 0,
      transparent 40%
    ),
    repeating-linear-gradient(
      -45deg,
      transparent 0 10px,
      rgb(255 255 255 / 0.05) 10px 11px
    );
`;

export const CoverChips = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
`;

export const FandomTag = styled.span<{ $color?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${MEDIA_CHIP}
  ${(p) =>
    p.$color
      ? css`
          background-color: color-mix(in srgb, ${p.$color} 78%, black);
        `
      : ""}

  &::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.85);
    flex-shrink: 0;
  }
`;

export const Body = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0 14px 12px 14px;
  min-width: 0;

  /* A chat bubble on a phone: tighter, smaller face, fewer chips. */
  @container muse-embed (max-width: 300px) {
    gap: 10px;
    padding: 0 10px 10px 10px;
  }
`;

export const Avatar = styled.div<{
  $src: string;
  $crop: ImageCropFilter | null;
}>`
  position: relative;
  flex-shrink: 0;
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  margin-top: -${AVATAR_SIZE / 2}px;
  border-radius: 50%;
  border: 3px solid var(--bg-2);
  box-shadow:
    0 0 0 1.5px var(--embed-accent),
    0 6px 16px rgb(0 0 0 / 0.45);
  background-color: color-mix(in srgb, var(--embed-accent) 30%, var(--bg-4));
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: ${({ $crop }) => cropBackgroundStyle($crop).backgroundSize};
  background-position: ${({ $crop }) =>
    cropBackgroundStyle($crop).backgroundPosition};
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: var(--font-weight-bold);
  font-size: 22px;
  text-shadow: 0 1px 4px rgb(0 0 0 / 0.5);

  @container muse-embed (max-width: 300px) {
    width: 48px;
    height: 48px;
    margin-top: -24px;
    font-size: 18px;
  }
`;

export const Text = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 8px;
`;

export const Name = styled.div`
  font-family: var(--font);
  font-size: var(--font-size-normal, 15px);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--text);
  /* Two lines before the ellipsis: a long name in a narrow bubble is still
     read whole, and a short one costs nothing. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

export const PennedBy = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
  color: var(--text-secondary, var(--text));
  overflow: hidden;
  white-space: nowrap;

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--embed-accent);
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Quote = styled.p`
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.35;
  font-style: italic;
  color: var(--text-secondary, var(--text));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;

  &::before {
    content: "❝ ";
    color: var(--embed-accent);
    opacity: 0.8;
    font-style: normal;
  }
`;

export const Nicknames = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;

  @container muse-embed (max-width: 300px) {
    & > :nth-child(n + 3) {
      display: none;
    }
  }
`;

export const Nickname = styled.span`
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  background: color-mix(in srgb, var(--embed-accent) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--embed-accent) 28%, transparent);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Same footer as the prompt and novelist cards: a hairline, then the action
   pinned bottom-right. */
export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin: 0 14px;
  padding: 8px 0 10px;
  border-top: 1px solid
    color-mix(in srgb, var(--embed-accent) 18%, var(--material-edge));
  font-size: 12px;
  color: var(--text-secondary, var(--text));

  @container muse-embed (max-width: 300px) {
    margin: 0 10px;
  }
`;

/** A span inside the link card; a real anchor (the only route) in a preview. */
export const Open = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  color: var(--embed-accent);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.18s ease;
  ${FOCUS_RING}

  && {
    text-decoration: none;
  }

  svg {
    width: 13px;
    height: 13px;
  }

  ${Frame}:not([data-preview]):hover &,
  &:is(a):hover {
    transform: translateX(2px);
  }
`;

/* ─── Unavailable, in a preview ───────────────────────────────────────── */

/** Where the quote sits on a loaded card. */
export const UnavailableMessage = styled.p`
  margin: 2px 0 0;
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--text-secondary, var(--text));
  word-break: break-word;
`;

/** Stands in for Visit profile, which has nowhere to go. */
export const FooterNote = styled.span`
  margin-left: auto;
  font-size: 12px;
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  color: var(--text-secondary, var(--text));
`;

/* ─── Loading ─────────────────────────────────────────────────────────── */

const shimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const shimmerBlock = css`
  position: relative;
  overflow: hidden;
  background: rgb(127 127 127 / 0.12);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgb(255 255 255 / 0.08) 40%,
      rgb(255 255 255 / 0.16) 50%,
      rgb(255 255 255 / 0.08) 60%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

export const SkeletonCover = styled.div`
  height: ${COVER_HEIGHT}px;
  ${shimmerBlock}
`;

export const SkeletonAvatar = styled.div`
  flex-shrink: 0;
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  margin-top: -${AVATAR_SIZE / 2}px;
  border-radius: 50%;
  border: 3px solid var(--bg-2);
  ${shimmerBlock}
`;

export const SkeletonLine = styled.div<{ $width: string; $height?: string }>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height ?? "12px"};
  border-radius: 6px;
  ${shimmerBlock}
`;

/* ─── Unavailable ─────────────────────────────────────────────────────── */

export const Unavailable = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 380px;
  min-width: 0;
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--text);
  ${MATERIAL_CARD}
  ${FOCUS_RING}

  && {
    text-decoration: none;
  }

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--material-edge));
  }
`;

export const UnavailableIcon = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
`;

export const UnavailableText = styled.span`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 13px;
    font-weight: var(--font-weight-semi-bold);
  }

  span {
    font-size: 11px;
    color: var(--text-secondary, var(--text));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
