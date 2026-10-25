import { css, styled } from "styled-components";
import { FOCUS_RING, MATERIAL, MATERIAL_CARD } from "@/theme";
import { shimmerMove } from "@/theme/animations";

/* Shared visuals for the bookshelf: spines, face-out covers, the grid card
 * and the plank they stand on (BOOKSHELF_PLAN.md §1.3, §4). Everything here is
 * material — no glass inside content. */

/** Fill for the small accent markers (ribbon, heart tab, status chip). The
 *  palette's solid step mixed 25% towards black: white 11px text then clears
 *  4.5:1 on every accent (step 9 alone is 3.0:1 on cyan, 3.15 on jade). */
export const MARKER_FILL =
  "color-mix(in srgb, var(--accent-9, var(--accent)) 75%, #000)";

export const SPINE_FONT = `Georgia, "Times New Roman", serif`;

const CARD_WIDTH = "180px";
const CARD_WIDTH_MOBILE = "150px";

export const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--bg-3) 25%,
    var(--bg-4) 50%,
    var(--bg-3) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

// ── Grid card (picker + Books tab) ─────────────────────────────────────────

export const Card = styled.div<{ $selected?: boolean }>`
  position: relative;
  ${MATERIAL_CARD}
  outline: ${({ $selected }) =>
    $selected
      ? "2px solid var(--accent-11, var(--accent))"
      : "2px solid transparent"};
  outline-offset: -2px;
  width: ${CARD_WIDTH};
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
  color: inherit;
  transition: transform 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: translateY(-2px);
      border-color: color-mix(
        in srgb,
        var(--accent-11, var(--accent)) 40%,
        transparent
      );
    }
  }

  &:has(> button:active) {
    transform: scale(0.99);
  }

  @media screen and (max-width: 800px) {
    width: ${CARD_WIDTH_MOBILE};
  }
`;

/** The clickable face of a card. A sibling of the quick-add chip, never its
 *  parent — a button may not contain a button. */
export const CardButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  color: inherit;
  border-radius: 14px 14px 0 0;

  ${FOCUS_RING}
`;

export const Cover = styled.div`
  position: relative;
  flex-shrink: 0;
  aspect-ratio: 2 / 3;
  width: 100%;
  overflow: hidden;
  background: var(--bg-3);

  /* Absolute so a tall scan can't stretch the box past 2:3. */
  img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CoverFallback = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  overflow: hidden;
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  min-width: 0;
`;

const oneLine = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BookTitle = styled.div`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Author = styled.div`
  ${oneLine}
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const Year = styled.div`
  font-size: var(--font-size-small);
  color: var(--text-tertiary, var(--text-secondary));
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  min-width: 0;
`;

export const Tag = styled.span`
  ${MATERIAL}
  ${oneLine}
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 11px;
  color: var(--text-secondary);
`;

/** Status / favorite marker on a card's cover corner. */
export const CornerChip = styled.span<{ $tone?: "accent" | "neutral" }>`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: calc(100% - 16px);
  padding: 3px 8px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: #fff;
  background-color: ${({ $tone }) =>
    $tone === "accent" ? MARKER_FILL : "rgb(0 0 0 / 0.58)"};
  border: 1px solid rgb(255 255 255 / 0.16);
  ${oneLine}

  svg {
    flex-shrink: 0;
  }
`;

export const FavoriteCorner = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background-color: rgb(0 0 0 / 0.58);
  border: 1px solid rgb(255 255 255 / 0.16);
`;

/** Visitor quick-add ("Add to my Bookshelf") on another novelist's card. */
export const QuickAdd = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 0 10px 10px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 50px;
  border: 1px solid var(--material-edge);
  background: var(--material-fill);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 20px);
  transition: color 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--accent-11, var(--accent));
      border-color: color-mix(
        in srgb,
        var(--accent-11, var(--accent)) 40%,
        transparent
      );
    }
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  ${FOCUS_RING}
`;

export const CardShimmer = styled.div`
  width: ${CARD_WIDTH};
  aspect-ratio: 2 / 3.9;
  border-radius: 14px;
  ${shimmer}

  @media screen and (max-width: 800px) {
    width: ${CARD_WIDTH_MOBILE};
  }
`;

// ── Spines and face-out covers (teaser row, favorites shelf) ───────────────

export const SPINE_HEIGHT = 128;
export const SPINE_HEIGHT_MOBILE = 110;

/**
 * A spine: the cover peeks through at the head and foot, a solid band in the
 * cover's colour carries the title between them. Width comes from the book's
 * page count so a row isn't a picket fence.
 */
export const Spine = styled.button<{ $color: string; $width: number }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  width: ${({ $width }) => $width}px;
  height: ${SPINE_HEIGHT}px;
  border-radius: 3px 3px 2px 2px;
  background: ${({ $color }) => $color};
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.25),
    inset 0 -2px 0 rgb(0 0 0 / 0.25),
    1px 0 0 rgb(0 0 0 / 0.25);
  transition: transform 0.18s ease;

  /* A 22px spine is below the 28pt touch floor; the tap area grows past the
     drawn edges while neighbours keep their own 3px gap. */
  &::before {
    content: "";
    position: absolute;
    inset: 0 -3px;
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: translateY(-6px);
    }
  }

  &:active {
    transform: translateY(1px);
  }

  ${FOCUS_RING}

  @media screen and (max-width: 800px) {
    height: ${SPINE_HEIGHT_MOBILE}px;
  }
`;

/** The cover, cropped to the spine's width; only its edges stay visible. */
export const SpineCover = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

/**
 * The colour band over the cover: solid where the title sits, open at the
 * head and foot so the art shows, with the usual rounded-spine shading.
 */
export const SpineBand = styled.span<{ $color: string }>`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgb(255 255 255 / 0.18),
      rgb(255 255 255 / 0) 30%,
      rgb(0 0 0 / 0) 70%,
      rgb(0 0 0 / 0.22)
    ),
    linear-gradient(
      to bottom,
      color-mix(in srgb, ${({ $color }) => $color} 30%, transparent) 0,
      ${({ $color }) => $color} 15%,
      ${({ $color }) => $color} 85%,
      color-mix(in srgb, ${({ $color }) => $color} 30%, transparent) 100%
    );
`;

/** A favorite that didn't make the face-out pair: a small heart tab. */
export const SpineHeart = styled.span`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 18px;
  border-radius: 0 0 4px 4px;
  background: ${MARKER_FILL};
  color: #fff;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.35);
`;

export const SpineLabel = styled.span<{ $narrow: boolean }>`
  position: absolute;
  /* Inside the solid band (SpineBand's 15–85%), with a little air. */
  inset: 17% 0 16%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* Reads top-down like a spine on a shop shelf, so a long title starts
     legibly and fades out at the foot of the band. */
  writing-mode: vertical-rl;
  font-family: ${SPINE_FONT};
  font-size: ${({ $narrow }) => ($narrow ? "11px" : "12px")};
  letter-spacing: 0.02em;
  color: rgb(255 255 255 / 0.92);
  text-shadow: 0 1px 1px rgb(0 0 0 / 0.45);
  white-space: nowrap;
  overflow: hidden;
  /* Fade rather than clip a long title. */
  mask-image: linear-gradient(
    to bottom,
    #000 calc(100% - 14px),
    transparent 100%
  );
`;

/** A cover standing face-out, tilted like a shop window. */
export const FaceOut = styled.button<{ $tilt: number }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  width: ${Math.round((SPINE_HEIGHT * 2) / 3)}px;
  height: ${SPINE_HEIGHT}px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-3);
  box-shadow:
    0 10px 24px -12px rgb(0 0 0 / 0.7),
    0 0 0 1px rgb(0 0 0 / 0.2);
  transform: rotate(${({ $tilt }) => $tilt}deg);
  transition: transform 0.18s ease;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: rotate(0deg) translateY(-6px) scale(1.03);
      z-index: 2;
    }
  }

  &:active {
    transform: rotate(${({ $tilt }) => $tilt}deg) scale(0.98);
  }

  ${FOCUS_RING}

  @media screen and (max-width: 800px) {
    width: ${Math.round((SPINE_HEIGHT_MOBILE * 2) / 3)}px;
    height: ${SPINE_HEIGHT_MOBILE}px;
  }
`;

/** A cover-less favorite: the title and author on toned paper. */
export const PaperCover = styled.span<{ $color: string }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  text-align: center;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(0 0 0 / 0.12)),
    ${({ $color }) => $color};
  color: rgb(255 255 255 / 0.95);
  font-family: ${SPINE_FONT};

  strong {
    font-size: 11px;
    line-height: 1.25;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  small {
    font-size: 11px;
    opacity: 0.8;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export const RibbonChip = styled.span`
  position: absolute;
  top: 0;
  right: 8px;
  padding: 8px 5px 5px;
  border-radius: 0 0 4px 4px;
  background: ${MARKER_FILL};
  color: #fff;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  writing-mode: vertical-rl;
  letter-spacing: 0.06em;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
`;

/** The plank the books stand on, with the books overlapping its top edge. */
export const Shelf = styled.div`
  position: relative;
  width: 95%;
  padding: 12px 14px 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  /* The app's scrollbar (globals.css): a 6px accent thumb. Declared here as
     well because 'scrollbar-width' on this element would switch Chromium to
     its default thin bar and ignore the webkit rules. */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: var(--accent-6);
  }

  @supports not selector(::-webkit-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: var(--accent-6) transparent;
  }

  @media screen and (max-width: 800px) {
    width: 92%;
    padding-inline: 10px;
  }
`;

export const ShelfRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  width: max-content;
  min-width: 100%;
  padding-bottom: 14px;
  /* The books cast onto the plank below. */
  background:
    linear-gradient(
        180deg,
        transparent calc(100% - 14px),
        var(--material-fill-strong) calc(100% - 14px),
        var(--material-fill-strong) calc(100% - 4px),
        rgb(0 0 0 / 0.25) calc(100% - 4px)
      )
      no-repeat;
  border-bottom: 1px solid var(--material-edge);
`;

export const FaceOutGroup = styled.div`
  display: flex;
  align-items: flex-end;
  margin-right: 14px;
  padding-left: 4px;

  > * + * {
    margin-left: -10px;
  }
`;

export const SpineGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
`;

export const ShelfShimmer = styled.div`
  width: 95%;
  height: ${SPINE_HEIGHT + 28}px;
  border-radius: 14px;
  ${shimmer}

  @media screen and (max-width: 800px) {
    width: 92%;
    height: ${SPINE_HEIGHT_MOBILE + 28}px;
  }
`;

/**
 * The empty shelf, at exactly the height a shelf with books takes, so the
 * profile doesn't jump when the first book lands: art left, copy right, on
 * the same plank line.
 */
export const EmptyShelf = styled.div`
  box-sizing: border-box;
  width: 95%;
  height: ${SPINE_HEIGHT + 28}px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 14px 14px;
  border-bottom: 1px solid var(--material-edge);

  @media screen and (max-width: 800px) {
    width: 92%;
    height: ${SPINE_HEIGHT_MOBILE + 28}px;
    gap: 12px;
    padding-inline: 10px;
  }
`;

export const EmptyShelfArtWrap = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;

  /* The scene's own frame is 148×113; the row is shorter than that. */
  svg {
    width: auto;
    height: ${SPINE_HEIGHT - 20}px;
  }

  @media screen and (max-width: 800px) {
    svg {
      height: ${SPINE_HEIGHT_MOBILE - 24}px;
    }
  }
`;

export const EmptyShelfText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;

  > button {
    margin-top: 6px;
  }
`;

export const EmptyShelfTitle = styled.p`
  margin: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const EmptyShelfSubtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.45;
  color: var(--text-secondary);
`;

/** Owner-only line when the shelf is switched off the profile. */
export const HiddenNote = styled.div`
  width: 95%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 0 14px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  @media screen and (max-width: 800px) {
    width: 92%;
  }
`;

export const HiddenNoteLink = styled.button`
  all: unset;
  cursor: pointer;
  font-weight: var(--font-weight-bold);
  color: var(--accent-11, var(--accent));
  border-radius: 4px;

  ${FOCUS_RING}
`;

/** Selection circle on a card's cover (multi-select on the Books tab). */
export const SelectMark = styled.span<{ $selected: boolean }>`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  background: ${({ $selected }) =>
    $selected ? "var(--accent-11, var(--accent))" : "rgb(0 0 0 / 0.5)"};
  border: 2px solid
    ${({ $selected }) =>
      $selected
        ? "var(--accent-11, var(--accent))"
        : "rgb(255 255 255 / 0.85)"};
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
`;
