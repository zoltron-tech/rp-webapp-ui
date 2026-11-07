import { css, styled } from "styled-components";
import { FOCUS_RING, MATERIAL } from "@/theme";
import { shimmerMove } from "@/theme/animations";

/* Book dialog — the book, the three shelf choices, a few lines about it;
 * everything else folded under "More details". On a 375 × 667 phone the
 * cover, the choices and the start of the description fit before scrolling. */

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  padding-right: 2px;

  @media screen and (max-width: 800px) {
    gap: 12px;
  }
`;

// ── Header ─────────────────────────────────────────────────────────────────

export const Top = styled.div`
  display: flex;
  gap: 12px;
  min-width: 0;
`;

export const Cover = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 88px;
  aspect-ratio: 2 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-3);
  box-shadow: 0 8px 20px -12px rgb(0 0 0 / 0.7);

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media screen and (max-width: 480px) {
    width: 72px;
  }
`;

export const CoverFallback = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  text-align: center;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

export const Subtitle = styled.div`
  font-size: var(--font-size-small);
  font-style: italic;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Authors = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
`;

/** An author's name, when the dialog can run an author search. */
export const AuthorLink = styled.button`
  all: unset;
  cursor: pointer;
  font: inherit;
  color: inherit;
  border-radius: 3px;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);

  @media (hover: hover) {
    &:hover {
      color: var(--accent-11, var(--accent));
      text-decoration-style: solid;
    }
  }

  ${FOCUS_RING}
`;

/** "★ 4.2 · 1937 · 310 pages" — the one line of facts under the author. */
export const Facts = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 0;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);

  & > * + *::before {
    content: "·";
    margin: 0 6px;
    color: var(--text-secondary);
  }
`;

export const RatingFact = styled.span`
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);

  span {
    color: var(--accent-11, var(--accent));
  }
`;

// ── Shelf control (BOOKSHELF_PLAN.md §4.2) ─────────────────────────────────

/**
 * No panel: the three choices are the control, the filled one is the state.
 * It sits in the summary column beside the cover, under the author and facts.
 */
export const Shelf = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
  min-width: 0;
`;

/**
 * One track for the three statuses — only one can hold — with a single
 * highlight (`StatusThumb`) under the options that slides to the chosen
 * one. Sits in the summary column beside the cover.
 */
const TRACK_PAD = 3;

export const StatusTrack = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 440px;
  padding: ${TRACK_PAD}px;
  border-radius: 14px;
  background: var(--field-fill, var(--bg-3));
  border: 1px solid var(--material-edge);
`;

/**
 * The highlight: a third of the track, moved by whole widths. Hidden (and
 * parked on the first option) until the book is on the shelf, so the first
 * choice fades in where it lands rather than sliding in from the left.
 */
export const StatusThumb = styled.span<{ $index: number }>`
  position: absolute;
  top: ${TRACK_PAD}px;
  bottom: ${TRACK_PAD}px;
  left: ${TRACK_PAD}px;
  width: calc((100% - ${TRACK_PAD * 2}px) / 3);
  border-radius: 11px;
  background: var(--accent);
  box-shadow:
    inset 0 0 0 1px var(--accent-11, var(--accent)),
    0 4px 12px -6px rgb(0 0 0 / 0.6);
  transform: translateX(${({ $index }) => Math.max($index, 0) * 100}%);
  opacity: ${({ $index }) => ($index < 0 ? 0 : 1)};
  transition:
    transform 0.32s cubic-bezier(0.3, 0.7, 0.2, 1),
    opacity 0.18s ease;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.18s ease;
  }
`;

export const StatusButton = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  min-height: 48px;
  padding: 6px 4px;
  border-radius: 11px;
  text-align: center;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  line-height: 1.15;
  /* The colour follows the thumb, a beat behind it so they land together. */
  color: ${({ $active }) => ($active ? "#fff" : "var(--text-secondary)")};
  transition: color 0.2s ease 0.06s;

  svg {
    flex-shrink: 0;
    color: ${({ $active }) =>
      $active ? "#fff" : "var(--accent-11, var(--accent))"};
    transition: color 0.2s ease 0.06s;
  }

  @media (hover: hover) {
    &:hover:not(:disabled):not([aria-pressed="true"]) {
      color: var(--text-primary);
    }
  }

  &:disabled {
    cursor: default;
  }

  ${FOCUS_RING}

  /* Beside a 72px cover on a phone each option is ~80px. */
  @media screen and (max-width: 480px) {
    min-height: 46px;
    padding: 5px 2px;
    font-size: 11px;
  }
`;

/** Favourite and Remove, under the track and as wide as it. */
export const ShelfRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 440px;
`;

export const HeartButton = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 50px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, var(--accent-11, var(--accent)) 55%, transparent)"
        : "var(--material-edge)"};
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent-11, var(--accent)) 16%, transparent)"
      : "var(--material-fill)"};
  color: ${({ $active }) =>
    $active ? "var(--accent-11, var(--accent))" : "var(--text-secondary)"};
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  svg {
    flex-shrink: 0;
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--accent-11, var(--accent));
    }
  }

  &:disabled {
    cursor: default;
  }

  ${FOCUS_RING}
`;

export const RemoveButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 0 6px;
  border-radius: 8px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  svg {
    flex-shrink: 0;
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--negative, #e5484d);
    }
  }

  &:disabled {
    cursor: default;
  }

  ${FOCUS_RING}
`;

// ── More details ───────────────────────────────────────────────────────────

export const MoreToggle = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 50px;
  ${MATERIAL}
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);

  svg {
    transition: transform 0.2s ease;
  }

  &[aria-expanded="true"] svg {
    transform: rotate(180deg);
  }

  @media (hover: hover) {
    &:hover {
      color: var(--text-primary);
    }
  }

  ${FOCUS_RING}
`;

export const MoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--material-edge);
`;

// ── Sections ───────────────────────────────────────────────────────────────

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const Prose = styled.p<{ $clamp?: number }>`
  margin: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
  font-size: var(--font-size-small);
  line-height: 1.55;
  color: var(--text-primary);
  ${({ $clamp }) =>
    $clamp &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: ${$clamp};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `}
`;

export const MoreButton = styled.button`
  all: unset;
  cursor: pointer;
  align-self: flex-start;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-11, var(--accent));
  border-radius: 4px;

  ${FOCUS_RING}
`;

export const Quote = styled.blockquote`
  margin: 0;
  padding-left: 10px;
  border-left: 2px solid var(--accent-11, var(--accent));
  font-size: var(--font-size-small);
  font-style: italic;
  line-height: 1.5;
  color: var(--text-primary);
`;

export const Muted = styled.div`
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
  overflow-wrap: anywhere;

  b {
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
`;

export const Chip = styled.span<{ $more?: boolean }>`
  ${MATERIAL}
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $more }) =>
    $more ? "var(--accent-11, var(--accent))" : "var(--text-secondary)"};
`;

export const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const AuthorPhoto = styled.img`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-3);
`;

export const AuthorName = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
`;

export const Links = styled.ul`
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: var(--font-size-small);

  a {
    color: var(--accent-11, var(--accent));
    overflow-wrap: anywhere;
    border-radius: 4px;
    ${FOCUS_RING}
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 2px;
`;

/** The book's own page on openlibrary.org, in a new tab — and the credit. */
export const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      color: var(--accent-11, var(--accent));
    }
  }

  ${FOCUS_RING}
`;

const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--bg-3) 25%,
    var(--bg-4) 50%,
    var(--bg-3) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Line = styled.div<{ $short?: boolean }>`
  height: 10px;
  width: ${({ $short }) => ($short ? "60%" : "100%")};
  border-radius: 5px;
  ${shimmer}
`;

/** Read by screen readers only (e.g. "opens in a new tab"). */
export const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

/**
 * In-place confirmation inside the shelf control, replacing the action rows
 * — no second modal stacked over the dialog (modality: one at a time).
 */
export const ConfirmRow = styled.div`
  ${MATERIAL}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin-top: 6px;
  padding: 10px;
  border-radius: 12px;
`;

export const ConfirmText = styled.p`
  flex: 1 1 200px;
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.45;
  color: var(--text-primary);
`;

export const ConfirmActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

export const ConfirmButton = styled.button<{
  $tone: "neutral" | "negative" | "accent";
}>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 50px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  border: 1px solid var(--material-edge);
  background: ${({ $tone }) =>
    $tone === "negative"
      ? "var(--negative, #e5484d)"
      : $tone === "accent"
        ? "var(--accent-11, var(--accent))"
        : "var(--material-fill)"};
  color: ${({ $tone }) => ($tone === "neutral" ? "var(--text-secondary)" : "#fff")};

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  ${FOCUS_RING}
`;

/** The phone sheet's scrolling area: the sheet itself is capped at 85vh. */
export const SheetScroll = styled.div`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: calc(85vh - 110px);
  padding: 4px 2px 12px;
  /* The shared sheet turns selection off for drag handles; prose should select. */
  user-select: text;
  -webkit-user-select: text;
`;
