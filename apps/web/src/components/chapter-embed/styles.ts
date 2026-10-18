import type { ImageCropFilter } from "@nw/types";
import { cropBackgroundStyle } from "@nw/utils/image";
import styled, { css } from "styled-components";
import { FOCUS_RING, MATERIAL_CARD } from "@/theme";

/**
 * A chapter, unfurled from its link, drawn as a page held open in its book.
 *
 * The story's cover stands at the left as a thin spine with a ribbon
 * bookmark hanging over it — this is one chapter of that book. Beside it the
 * chapter's own header: its number in the story, its title, where and when
 * it happens, its overture. Below, the opening passage and who wrote it,
 * and along the bottom a progress rule showing how far into the story this
 * chapter sits. Flashbacks get the striped ribbon the timeline uses.
 */

const SPINE_W = 54;
const SPINE_H = 81;

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
  container-name: chapter-embed;
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

  /* Paper: a faint ruled texture, like a page under the chapter header. */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to bottom,
        color-mix(in srgb, var(--tone) 12%, transparent),
        transparent 45%
      ),
      repeating-linear-gradient(
        to bottom,
        transparent 0 23px,
        color-mix(in srgb, var(--text) 4%, transparent) 23px 24px
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

  @container chapter-embed (max-width: 300px) {
    gap: 8px;
    padding: 10px 10px 8px;
  }
`;

export const Head = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;

  @container chapter-embed (max-width: 300px) {
    gap: 10px;
  }
`;

/** The book this chapter is in: cover art as a slim spine. */
export const Spine = styled.div<{
  $src: string;
  $crop: ImageCropFilter | null;
}>`
  position: relative;
  flex-shrink: 0;
  width: ${SPINE_W}px;
  height: ${SPINE_H}px;
  margin-top: 2px;
  border-radius: 3px 6px 6px 3px;
  overflow: visible;
  background-color: color-mix(in srgb, var(--tone) 35%, var(--bg-4));
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: ${({ $crop }) => cropBackgroundStyle($crop).backgroundSize};
  background-position: ${({ $crop }) =>
    cropBackgroundStyle($crop).backgroundPosition};
  background-repeat: no-repeat;
  box-shadow:
    0 8px 16px -6px rgb(0 0 0 / 0.7),
    0 0 0 1px rgb(255 255 255 / 0.08);

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 6px;
    border-radius: 3px 0 0 3px;
    background: linear-gradient(
      to right,
      rgb(0 0 0 / 0.45),
      rgb(0 0 0 / 0.1) 60%,
      rgb(255 255 255 / 0.12) 85%,
      transparent
    );
  }
`;

/** The ribbon bookmark hanging over the cover, striped for a flashback. */
export const Ribbon = styled.span<{ $flashback: boolean }>`
  position: absolute;
  top: -6px;
  right: 8px;
  width: 12px;
  height: ${SPINE_H * 0.62}px;
  background: ${(p) =>
    p.$flashback
      ? css`repeating-linear-gradient(
          -45deg,
          var(--tone) 0 4px,
          color-mix(in srgb, var(--tone) 45%, black) 4px 8px
        )`
      : "var(--tone)"};
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.45);
`;

export const Copy = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
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

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Flashback = styled.span`
  flex-shrink: 0;
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-secondary, var(--text));
  background: color-mix(in srgb, var(--text) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
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

/** "of <story>" — the book's name under the chapter's. */
export const Of = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  font-size: 12px;
  color: var(--text-secondary, var(--text));
  white-space: nowrap;
  overflow: hidden;

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }
`;

export const Setting = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px 10px;
  min-width: 0;
  margin-top: 1px;
  font-size: 11.5px;
  font-style: italic;
  color: var(--text-secondary, var(--text));

  > span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    max-width: 100%;
  }

  /* The words sit in their own box: an ellipsis needs a block container,
     and text straight inside an inline-flex has none. */
  > span > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
    width: 11px;
    height: 11px;
    opacity: 0.8;
  }
`;

export const Overture = styled.p<{ $lines: number }>`
  position: relative;
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

/** The first passage, set like a pull-quote with a drop cap. */
export const Opening = styled.blockquote`
  position: relative;
  margin: 0;
  padding: 8px 12px 8px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--tone) 8%, var(--bg-3));
  border-left: 3px solid var(--tone);
  min-width: 0;
`;

export const OpeningText = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;

  &::first-letter {
    font-size: 1.9em;
    font-weight: var(--font-weight-bold);
    line-height: 0.9;
    float: left;
    margin: 3px 4px 0 0;
    color: var(--tone);
  }
`;

/** Who wrote the opening, as a byline under it rather than beside it. */
export const OpeningBy = styled.footer`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-secondary, var(--text));

  &::before {
    content: "—";
    opacity: 0.6;
  }

  > span.avatar {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    font-size: 8px;
    box-shadow: 0 0 0 1px var(--tone);
  }

  > em {
    font-style: normal;
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

export const Facts = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  min-width: 0;
  font-size: 11.5px;
  color: var(--text-secondary, var(--text));
`;

export const Fact = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
  }

  strong {
    font-weight: var(--font-weight-bold);
    color: var(--text);
  }

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Song = styled(Fact)`
  max-width: 100%;
  color: var(--tone);

  strong {
    color: var(--tone);
  }
`;

/**
 * The chapters either side of this one, so the card reads as a page in a
 * sequence: what came before, what comes next, and the way in.
 */
export const Nav = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--tone) 18%, var(--material-edge));

  /* In a phone bubble the names need the whole line; the button goes under. */
  @container chapter-embed (max-width: 300px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Neighbours = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 11px;
  color: var(--text-secondary, var(--text));
`;

export const Neighbour = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;

  svg {
    flex-shrink: 0;
    width: 11px;
    height: 11px;
    opacity: 0.7;
  }

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  i {
    font-style: normal;
    opacity: 0.75;
  }

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }

  em {
    font-style: italic;
    opacity: 0.8;
  }
`;

export const Open = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  color: #fff;
  background: var(--tone);
  box-shadow: 0 6px 14px -6px var(--tone);
  transition: transform 0.18s ease, filter 0.18s ease;

  svg {
    width: 13px;
    height: 13px;
  }

  ${Frame}:hover & {
    transform: translateX(2px);
    filter: brightness(1.08);
  }

  @container chapter-embed (max-width: 300px) {
    justify-content: center;
  }
`;
