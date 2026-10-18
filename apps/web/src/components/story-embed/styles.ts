import type { ImageCropFilter } from "@nw/types";
import { cropBackgroundStyle } from "@nw/utils/image";
import styled from "styled-components";
import { FOCUS_RING, MATERIAL_CARD } from "@/theme";

/**
 * A story, unfurled from its link, drawn as a book on a shelf.
 *
 * The cover stands on the left at its 6:9 proportion with a spine shadow,
 * the way the library draws it; beside it the jacket copy — title, who wrote
 * it, the blurb, how many chapters — then genres and fandom as the sticker
 * row, and the cast of muses along the bottom. The card's tone is the
 * story's own: its fandom's colour, else its first genre's, else the page's.
 */

const COVER_W = 78;
const COVER_H = Math.round((COVER_W * 9) / 6);

export const Frame = styled.a<{ $tone: string | null }>`
  --tone: ${(p) => p.$tone ?? "var(--accent)"};
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
    var(--tone),
    color-mix(in srgb, var(--tone) 45%, white)
  );
  box-shadow: 0 18px 36px -26px rgb(0 0 0 / 0.8);
  cursor: pointer;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  container-name: story-embed;
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
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px 10px;
  border-radius: 16px;
  overflow: hidden;
  ${MATERIAL_CARD}
  background-color: var(--bg-2);

  /* A wash of the story's tone rising from the shelf, behind the cover. */
  &::before {
    content: "";
    position: absolute;
    inset: auto 0 0 0;
    height: 70%;
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--tone) 12%, transparent),
      transparent
    );
    pointer-events: none;
  }

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

  @container story-embed (max-width: 300px) {
    gap: 8px;
    padding: 10px 10px 8px;
  }
`;

export const Jacket = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;

  @container story-embed (max-width: 300px) {
    gap: 10px;
  }
`;

/** The book itself: cover art at 6:9, a spine down its left edge. */
export const Book = styled.div<{ $src: string; $crop: ImageCropFilter | null }>`
  position: relative;
  flex-shrink: 0;
  width: ${COVER_W}px;
  height: ${COVER_H}px;
  border-radius: 3px 8px 8px 3px;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--tone) 35%, var(--bg-4));
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: ${({ $crop }) => cropBackgroundStyle($crop).backgroundSize};
  background-position: ${({ $crop }) =>
    cropBackgroundStyle($crop).backgroundPosition};
  background-repeat: no-repeat;
  box-shadow:
    0 10px 20px -8px rgb(0 0 0 / 0.7),
    0 0 0 1px rgb(255 255 255 / 0.08);
  transform: perspective(600px) rotateY(6deg);
  transform-origin: left center;

  /* The spine: a dark fold and a thin highlight where the cover bends. */
  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 7px;
    background: linear-gradient(
      to right,
      rgb(0 0 0 / 0.45),
      rgb(0 0 0 / 0.1) 60%,
      rgb(255 255 255 / 0.12) 85%,
      transparent
    );
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgb(255 255 255 / 0.14) 0%,
      transparent 35%,
      rgb(0 0 0 / 0.25) 100%
    );
  }

  @container story-embed (max-width: 300px) {
    width: 66px;
    height: 99px;
  }
`;

/** A story with no art gets its title set on a plain cloth cover. */
export const BookTitle = styled.span`
  position: absolute;
  inset: 10px 8px 10px 12px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: var(--font);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  line-height: 1.25;
  letter-spacing: 0.02em;
  color: rgb(255 255 255 / 0.9);
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.5);
  overflow: hidden;
  border-top: 1px solid rgb(255 255 255 / 0.25);
  border-bottom: 1px solid rgb(255 255 255 / 0.25);
`;

export const Copy = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Band = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tone);

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
`;

export const Visibility = styled.span<{ $public: boolean }>`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: ${(p) => (p.$public ? "#3ddc97" : "var(--text-secondary, var(--text))")};
  background: ${(p) =>
    p.$public
      ? "rgb(61 220 151 / 0.12)"
      : "color-mix(in srgb, var(--text) 9%, transparent)"};
  border: 1px solid
    ${(p) =>
      p.$public
        ? "rgb(61 220 151 / 0.3)"
        : "color-mix(in srgb, var(--text) 14%, transparent)"};

  svg {
    width: 10px;
    height: 10px;
  }
`;

export const Title = styled.div`
  font-family: var(--font);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

export const Byline = styled.div`
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
    color: var(--tone);
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/** Co-authors' faces, stacked after the byline. */
export const Authors = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  > span.avatar {
    width: 18px;
    height: 18px;
    font-size: 8px;
    border: 1.5px solid var(--bg-2);
    box-sizing: content-box;
    margin-left: -6px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export const Blurb = styled.p<{ $lines: number }>`
  margin: 2px 0 0;
  font-family: var(--font);
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: ${(p) => p.$lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

export const BlurbEmpty = styled.span`
  font-style: italic;
  color: var(--text-secondary, var(--text));
`;

export const Facts = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  min-width: 0;
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--text-secondary, var(--text));
`;

export const Fact = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  color: ${(p) => (p.$active ? "var(--tone)" : "inherit")};

  svg {
    width: 12px;
    height: 12px;
  }

  strong {
    font-weight: var(--font-weight-bold);
    color: ${(p) => (p.$active ? "var(--tone)" : "var(--text)")};
  }
`;

/** Genre and fandom stickers on the jacket. */
export const Stickers = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;

  @container story-embed (max-width: 300px) {
    > :nth-child(n + 4) {
      display: none;
    }
  }
`;

export const Sticker = styled.span<{
  $color?: string | null;
  $fandom?: boolean;
}>`
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
  background: color-mix(in srgb, ${(p) => p.$color ?? "var(--tone)"} 16%, transparent);
  border: 1px solid color-mix(in srgb, ${(p) => p.$color ?? "var(--tone)"} 32%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: ${(p) => (p.$fandom ? "1px" : "50%")};
    transform: ${(p) => (p.$fandom ? "rotate(45deg)" : "none")};
    background: ${(p) => p.$color ?? "var(--tone)"};
    flex-shrink: 0;
  }
`;

/** The cast: muse faces along the bottom shelf. */
export const Cast = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const CastLabel = styled.span`
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary, var(--text));
  opacity: 0.8;
`;

export const CastFaces = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const CastFace = styled.span<{
  $src: string;
  $crop: ImageCropFilter | null;
  $accent: string | null;
}>`
  display: inline-block;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--bg-2);
  margin-left: -9px;
  background-color: color-mix(in srgb, ${(p) => p.$accent ?? "var(--tone)"} 30%, var(--bg-4));
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: ${({ $crop }) => cropBackgroundStyle($crop).backgroundSize};
  background-position: ${({ $crop }) =>
    cropBackgroundStyle($crop).backgroundPosition};
  background-repeat: no-repeat;
  box-shadow:
    0 0 0 1px ${(p) => p.$accent ?? "transparent"},
    0 2px 6px rgb(0 0 0 / 0.35);
  color: #fff;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  line-height: 26px;
  text-align: center;

  &:first-child {
    margin-left: 0;
  }
`;

export const CastMore = styled.span`
  flex-shrink: 0;
  margin-left: 6px;
  font-size: 11px;
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary, var(--text));
`;

export const CastNames = styled.span`
  min-width: 0;
  margin-left: 4px;
  font-size: 11.5px;
  color: var(--text-secondary, var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @container story-embed (max-width: 300px) {
    display: none;
  }
`;

export const Footer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--tone) 18%, var(--material-edge));
  font-size: 12px;
  color: var(--text-secondary, var(--text));
`;

export const LatestChapter = styled.span`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;

  svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    opacity: 0.75;
  }

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }
`;

export const Open = styled.span`
  margin-left: auto;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  color: var(--tone);
  transition: transform 0.18s ease;

  svg {
    width: 13px;
    height: 13px;
  }

  ${Frame}:hover & {
    transform: translateX(2px);
  }
`;
