import type { ImageCropFilter } from "@nw/types";
import { cropBackgroundStyle } from "@nw/utils/image";
import styled from "styled-components";
import { FOCUS_RING, MATERIAL_CARD, MEDIA_CHIP } from "@/theme";

/**
 * A novelist, unfurled from their `/@handle` link.
 *
 * An author card: their banner across the top with the level stamped on it,
 * the face breaking the banner's edge, name and handle, their note if they
 * left one, then the shelf — a row of their muses' faces, the fandoms they
 * write in, the badges they have earned. The whole card takes the novelist's
 * own palette, the way their profile does.
 */

const BANNER_HEIGHT = 92;
const AVATAR = 60;

export const Frame = styled.a`
  position: relative;
  display: block;
  width: 100%;
  max-width: 380px;
  /* Same floor as the other cards; see muse-embed on shrink-to-fit parents. */
  min-width: 280px;
  margin: 8px 0;
  padding: 2px;
  border-radius: 18px;
  text-decoration: none;
  color: var(--text);
  background: linear-gradient(
    135deg,
    var(--accent),
    color-mix(in srgb, var(--accent) 45%, white)
  );
  box-shadow: 0 18px 36px -26px rgb(0 0 0 / 0.8);
  cursor: pointer;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  container-name: novelist-embed;
  container-type: inline-size;
  ${FOCUS_RING}

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

  /* Opened from a post header: a preview, not a link (see muse-embed). */
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

export const Banner = styled.div<{
  $src: string;
  $crop: ImageCropFilter | null;
  /** True when the banner is the avatar standing in, which gets blurred. */
  $standIn: boolean;
}>`
  position: relative;
  height: ${BANNER_HEIGHT}px;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--accent) 22%, var(--bg-3));

  &::before {
    content: "";
    position: absolute;
    inset: ${(p) => (p.$standIn ? "-20px" : "0")};
    background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
    background-size: ${({ $crop, $standIn }) =>
      $standIn ? "cover" : cropBackgroundStyle($crop).backgroundSize};
    background-position: ${({ $crop, $standIn }) =>
      $standIn ? "center" : cropBackgroundStyle($crop).backgroundPosition};
    background-repeat: no-repeat;
    filter: ${(p) => (p.$standIn ? "blur(14px) saturate(1.2)" : "none")};
    opacity: ${(p) => (p.$standIn ? 0.7 : 1)};
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgb(0 0 0 / 0.08) 0%,
      rgb(0 0 0 / 0) 35%,
      color-mix(in srgb, var(--bg-2) 70%, transparent) 100%
    );
  }
`;

/** Art-less banners get a woven accent texture instead of a flat block. */
export const BannerPattern = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image:
    radial-gradient(
      circle at 15% 40%,
      color-mix(in srgb, var(--accent) 60%, transparent) 0,
      transparent 45%
    ),
    radial-gradient(
      circle at 85% 60%,
      color-mix(in srgb, var(--accent) 45%, white) 0,
      transparent 40%
    ),
    repeating-linear-gradient(
      -45deg,
      transparent 0 10px,
      rgb(255 255 255 / 0.05) 10px 11px
    );
`;

export const BannerChips = styled.div`
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

export const Kind = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  ${MEDIA_CHIP}

  svg {
    width: 11px;
    height: 11px;
  }
`;

export const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 14px 12px;
  min-width: 0;

  @container novelist-embed (max-width: 300px) {
    gap: 7px;
    padding: 0 10px 10px;
  }
`;

export const Identity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;

  @container novelist-embed (max-width: 300px) {
    gap: 10px;
  }
`;

export const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  margin-top: -${AVATAR / 2}px;

  > span.avatar {
    width: ${AVATAR}px;
    height: ${AVATAR}px;
    font-size: 22px;
    border: 3px solid var(--bg-2);
    box-sizing: content-box;
    box-shadow:
      0 0 0 1.5px var(--accent),
      0 6px 16px rgb(0 0 0 / 0.45);
  }

  @container novelist-embed (max-width: 300px) {
    margin-top: -24px;

    > span.avatar {
      width: 48px;
      height: 48px;
      font-size: 18px;
    }
  }
`;

export const Verified = styled.span`
  position: absolute;
  right: -2px;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #fff;
  background: var(--accent);
  border: 2px solid var(--bg-2);

  svg {
    width: 11px;
    height: 11px;
  }
`;

export const Text = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
`;

export const Name = styled.div`
  font-family: var(--font);
  font-size: var(--font-size-normal, 15px);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

export const Handle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12px;
  color: var(--text-secondary, var(--text));
  white-space: nowrap;
  overflow: hidden;

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--accent);
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Since = styled.span`
  flex-shrink: 0;
  opacity: 0.85;

  /* The handle is the identity; in a phone bubble it keeps the room. */
  @container novelist-embed (max-width: 300px) {
    display: none;
  }

  &::before {
    content: "·";
    margin-right: 6px;
    opacity: 0.6;
  }
`;

/** The status note a novelist leaves on their profile, emoji and all. */
export const Note = styled.div<{ $color: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  width: fit-content;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.3;
  color: var(--text);
  background: color-mix(in srgb, ${(p) => p.$color ?? "var(--accent)"} 16%, transparent);
  border: 1px solid color-mix(in srgb, ${(p) => p.$color ?? "var(--accent)"} 30%, transparent);

  > span:first-child {
    flex-shrink: 0;
    font-size: 13px;
  }

  > span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  font-size: 12px;
  color: var(--text-secondary, var(--text));
`;

export const Stat = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;

  strong {
    font-size: 13px;
    font-weight: var(--font-weight-bold);
    color: var(--text);
  }
`;

/** Their muses' faces, side by side on a shelf. */
export const Shelf = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const ShelfLabel = styled.span`
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary, var(--text));
  opacity: 0.8;
`;

export const MuseFaces = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;

  > span.avatar {
    width: 26px;
    height: 26px;
    font-size: 10px;
    border: 2px solid var(--bg-2);
    box-sizing: content-box;
    margin-left: -9px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export const MuseFace = styled.span<{
  $src: string;
  $crop: ImageCropFilter | null;
}>`
  display: inline-block;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--bg-2);
  margin-left: -9px;
  background-color: color-mix(in srgb, var(--accent) 30%, var(--bg-4));
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: ${({ $crop }) => cropBackgroundStyle($crop).backgroundSize};
  background-position: ${({ $crop }) =>
    cropBackgroundStyle($crop).backgroundPosition};
  background-repeat: no-repeat;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
  color: #fff;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  line-height: 26px;
  text-align: center;

  &:first-child {
    margin-left: 0;
  }
`;

export const MoreMuses = styled.span`
  flex-shrink: 0;
  margin-left: 6px;
  font-size: 11px;
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary, var(--text));
`;

export const Fandoms = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;

  @container novelist-embed (max-width: 300px) {
    > :nth-child(n + 3) {
      display: none;
    }
  }
`;

export const Fandom = styled.span<{ $color?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 150px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text);
  background: color-mix(in srgb, ${(p) => p.$color ?? "var(--accent)"} 16%, transparent);
  border: 1px solid color-mix(in srgb, ${(p) => p.$color ?? "var(--accent)"} 32%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${(p) => p.$color ?? "var(--accent)"};
    flex-shrink: 0;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--accent) 18%, var(--material-edge));
  font-size: 12px;
  color: var(--text-secondary, var(--text));
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
  color: var(--accent);
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
