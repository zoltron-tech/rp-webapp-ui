import { css, styled } from "styled-components";
import { FOCUS_RING, MATERIAL } from "@/theme";
import { shimmerMove } from "@/theme/animations";

/* Book dialog — compact by design: the 375 × 667 budget leaves ~560px, and
 * the header, the shelf control and the first paragraph should all fit
 * before scrolling. */

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding-right: 2px;

  @media screen and (max-width: 800px) {
    gap: 10px;
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

export const Rating = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

/** Five stars, filled to the average with a clipped gradient. */
export const Stars = styled.span<{ $value: number }>`
  font-size: 13px;
  letter-spacing: 1px;
  line-height: 1;

  &::before {
    content: "★★★★★";
    background: linear-gradient(
      90deg,
      var(--accent-11, var(--accent)) ${({ $value }) => ($value / 5) * 100}%,
      var(--material-edge) 0
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

/** "1938 · 482 editions · ~310 pages" — one muted line instead of a grid. */
export const MetaLine = styled.div`
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
`;

/**
 * Open Library's own reader counts. Labelled and dimmed so nobody reads
 * them as this novelist's shelf — the shelf control right below uses the
 * same three words.
 */
export const OpenLibraryReaders = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-secondary);

  svg {
    flex-shrink: 0;
    opacity: 0.8;
  }

  b {
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }
`;

export const ReadersSource = styled.span`
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

// ── Shelf control (BOOKSHELF_PLAN.md §4.2) ─────────────────────────────────

export const ShelfBox = styled.div`
  ${MATERIAL}
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
`;

export const ShelfHeading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

export const ShelfTitle = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const ShelfState = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Three equal buttons in one track: the status is a choice, not three chips. */
export const StatusTrack = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 3px;
  border-radius: 12px;
  background: var(--field-fill, var(--bg-3));
  border: 1px solid var(--material-edge);
`;

export const StatusButton = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 6px;
  border-radius: 9px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  color: ${({ $active }) => ($active ? "#fff" : "var(--text-secondary)")};
  background: ${({ $active }) =>
    $active ? "var(--accent-11, var(--accent))" : "transparent"};
  box-shadow: ${({ $active }) =>
    $active ? "0 4px 12px -6px rgb(0 0 0 / 0.6)" : "none"};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  svg {
    flex-shrink: 0;
  }

  @media (hover: hover) {
    &:hover:not(:disabled):not([aria-pressed="true"]) {
      color: var(--text-primary);
      background: var(--fill-hover);
    }
  }

  &:disabled {
    cursor: default;
  }

  ${FOCUS_RING}

  @media screen and (max-width: 480px) {
    gap: 4px;
    padding: 0 4px;
    font-size: 11px;
  }
`;

export const ShelfRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeartButton = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
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
  min-height: 32px;
  padding: 0 8px;
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
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 2px;
`;

export const Credit = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
`;

/** The book's own page on openlibrary.org, in a new tab. */
export const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 50px;
  ${MATERIAL}
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      color: var(--accent-11, var(--accent));
      border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 40%, transparent);
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 2px 2px 0;
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
