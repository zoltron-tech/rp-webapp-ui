import styled from "styled-components";
import { noteBorder, noteSurface } from "./colors";

export const Root = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  /* On a 375px screen the title and the actions cannot share a line without
     squeezing the buttons below a comfortable tap target. */
  @media (max-width: 480px) {
    button {
      flex: 1;
      justify-content: center;
    }
  }
`;

export const Title = styled.h2`
  margin: 0;
  font-size: var(--font-size);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const Spacer = styled.span`
  flex: 1;
`;

export const ToolButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 36px;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$primary ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$primary ? "var(--accent)" : "var(--bg-3)")};
  border: 1px solid ${(p) => (p.$primary ? "var(--accent)" : "var(--bg-6)")};
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: ${(p) => (p.$primary ? "#fff" : "var(--text)")};
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }

  @media (max-width: 480px) {
    gap: 0.25rem;
    padding: 0.4rem 0.6rem;
    font-size: var(--font-size-xsmall);
    white-space: nowrap;
  }
`;

/** The composer bar and the shortcuts that sit beside it, as Keep does. */
export const ComposerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

/** "Ask a poll instead" — the composer's second way in. */
export const ComposerAction = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--bg-2);
  border: 1px solid var(--bg-6);

  &:hover {
    border-color: var(--accent);
    color: var(--text);
  }
`;

/** Google Keep's "Take a note…" bar — the board's primary way in. */
export const Composer = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 46px;
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  text-align: left;
  cursor: text;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  background: var(--bg-2);
  border: 1px solid var(--bg-6);

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--bg-6));
  }
`;

export const SearchRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 12rem;

  svg {
    position: absolute;
    left: 0.6rem;
    color: var(--text-secondary);
    pointer-events: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  min-height: 36px;
  padding: 0.4rem 0.6rem 0.4rem 2rem;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  /* Storyboard inputs use the shared input size. */
  font-size: var(--font-size-input);
  outline: none;

  &:focus {
    border-color: var(--accent);
  }
`;

/** "Pinned" / "Others", the way Keep splits its board. */
export const SectionLabel = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  /* Bottom room for the pins standing proud of the first row of cards. */
  margin: 0.25rem 0 0.4rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  align-items: start;
  gap: 0.75rem;

  /* iPhone SE baseline — one sticky per row rather than a squeezed pair. */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div<{ $color?: string | null; $dragging?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.7rem;
  border-radius: 12px;
  min-width: 0;
  background: ${(p) => noteSurface(p.$color)};
  border: 1px solid ${(p) => noteBorder(p.$color)};
  box-shadow: ${(p) => (p.$dragging ? "0 10px 24px rgba(0, 0, 0, 0.35)" : "none")};
  opacity: ${(p) => (p.$dragging ? 0.9 : 1)};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${(p) =>
      p.$color
        ? `color-mix(in srgb, ${p.$color} 70%, var(--bg-6))`
        : "color-mix(in srgb, var(--accent) 45%, var(--bg-6))"};
  }
`;

/**
 * The card's body is the button that opens the note. The pin and the footer
 * actions stay outside it — a button cannot nest inside a button.
 */
export const CardOpen = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  min-width: 0;
`;

export const CardTitle = styled.span`
  /* Room for the pin floating in the corner. */
  padding-right: 2rem;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Clamped plain-text preview — the full note is read in its editor. */
export const CardBody = styled.div<{ $titled?: boolean }>`
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
  /* An untitled note has nothing above it, so the pin needs the room here. */
  padding-right: ${(p) => (p.$titled ? 0 : "2rem")};
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

/** The first image or GIF in the note — a picture note still shows a picture. */
export const CardThumb = styled.img`
  width: 100%;
  max-height: 140px;
  border-radius: 8px;
  object-fit: cover;
`;

/** Sits over the card's top-right corner, clear of the open button beneath. */
/**
 * The pin, and the only control on the card.
 *
 * Pinned, it is a physical object: oversized, driven in at an angle, and
 * hanging off the card's top-right corner so the card reads as being held up
 * by it. Nothing clips it — the card sets no overflow, and the grid leaves
 * room above for it to stand proud.
 *
 * Unpinned, it retreats: small, tipped back, and drained of colour, so it is
 * an affordance sitting on the card rather than something stuck through it.
 */
export const PinButton = styled.button<{ $active?: boolean }>`
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  /*
   * The pinned pin breaks the card's bounds; the unpinned one sits inside.
   *
   * The sideways overhang is the constrained one. On the storyboard page the
   * card's right edge is only 12px from the viewport at 375px, and between
   * grid columns there is a 12px gap — so 6px stands the pin proud while
   * still clearing both by 6px. The overhang upward has the row gap and the
   * section label's margin to fall into, so it can be deeper.
   */
  top: ${(p) => (p.$active ? "-10px" : "0.4rem")};
  right: ${(p) => (p.$active ? "-6px" : "0.4rem")};
  width: ${(p) => (p.$active ? "38px" : "32px")};
  height: ${(p) => (p.$active ? "38px" : "32px")};
  transition: top 0.18s ease, right 0.18s ease, width 0.18s ease,
    height 0.18s ease, background 0.15s ease;

  svg {
    /* Driven in at an angle, and casting onto the card it holds. */
    transform: ${(p) =>
      p.$active ? "rotate(34deg)" : "scale(0.66) rotate(-26deg)"};
    transform-origin: 50% 62%;
    filter: ${(p) =>
      p.$active
        ? "drop-shadow(-2px 3px 2.5px rgba(0, 0, 0, 0.34))"
        : "grayscale(0.85)"};
    opacity: ${(p) => (p.$active ? 1 : 0.45)};
    transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
  }

  /* Hover previews going in, without committing to it. */
  &:hover[aria-pressed="false"] {
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }

  &:hover[aria-pressed="false"] svg {
    filter: none;
    opacity: 1;
    transform: scale(0.72) rotate(10deg);
  }
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
`;

export const Byline = styled.span`
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BylineAvatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

/** Archive / drag handle — small, quiet, and always visible (touch has no hover). */
export const CardAction = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: color-mix(in srgb, var(--text) 8%, transparent);
    color: var(--text);
  }
`;

export const DragHandle = styled(CardAction)`
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  text-align: center;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text-secondary);
`;

/** Placeholder stickies while the board loads, so the grid doesn't pop in. */
export const Skeleton = styled.div`
  height: 120px;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  opacity: 0.6;
`;

// ── Read-only sheet ────────────────────────────────────────────────────────

/**
 * The opened sticky: the note as written, on its own colour. Opening a note
 * reads it — editing is a deliberate second step, from the header.
 */
export const ViewCard = styled.div<{ $color?: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem;
  border-radius: 12px;
  min-width: 0;
  background: ${(p) => noteSurface(p.$color)};
  border: 1px solid ${(p) => noteBorder(p.$color)};
`;

export const ViewTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow-wrap: anywhere;
`;

/** Holds the rich-text body, which brings its own typography. */
export const ViewBody = styled.div`
  min-width: 0;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text);
  overflow-wrap: anywhere;

  img,
  video,
  iframe {
    max-width: 100%;
  }
`;

export const ViewEmpty = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  font-style: italic;
  color: var(--text-secondary);
`;

/** Pinned / Archived state, shown as read-only chips rather than toggles. */
export const ViewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

/** Attribution line, sat quietly at the foot of the sticky itself. */
export const ViewByline = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.15rem;
  font-size: 0.68rem;
  color: var(--text-secondary);
`;

export const ViewTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
`;

// ── Editor sheet ───────────────────────────────────────────────────────────

/** "Note" plus its attach / GIF actions, on one line. */
export const EditorLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const EditorTools = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

/** Attach and GIF buttons. Rendered as a <label> for the file input, so this
 *  carries no button-only styling. */
export const EditorTool = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 30px;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.72rem;
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-6);

  &:hover {
    border-color: var(--accent);
    color: var(--text);
  }
`;

export const EditorError = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--tomato-9, #e5484d);
`;

/** Rich-text editor wrapper inside a sheet — keeps it from swallowing the tray. */
export const EditorArea = styled.div`
  border-radius: 0.5rem;
  /* Deliberately not clipped: the editor's floating image controls sit above
     the image they belong to, and a clipping ancestor cuts them off for an
     image on the first line — z-index cannot escape an overflow clip. */

  /* The editor manages its own scrolling; cap it so the sheet's own actions
     stay reachable on a 375×667 screen. */
  [contenteditable] {
    max-height: 34svh;
  }
`;

// ── Polls ──────────────────────────────────────────────────────────────────
// A poll is a type of sticky, so it borrows the note's card and sheet whole.
// What it adds is a ballot: one row per choice, filled to the share of the
// vote it holds.

/** The result rows, in the sheet and (read-only) on the card alike. */
export const Ballot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
`;

/**
 * One choice. A button in the sheet, where a co-author votes; rendered as a
 * plain div on the card, which is itself one big button and cannot nest one.
 */
export const Choice = styled.button<{ $mine?: boolean; $locked?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 40px;
  padding: 0.45rem 0.6rem;
  border-radius: 0.5rem;
  overflow: hidden;
  text-align: left;
  font-size: var(--font-size-small);
  color: var(--text);
  background: var(--bg-3);
  border: 1px solid ${(p) => (p.$mine ? "var(--accent)" : "var(--bg-6)")};
  cursor: ${(p) => (p.$locked ? "default" : "pointer")};
  transition: border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent);
  }
`;

/**
 * The share of the vote this choice holds, drawn behind its label. Width is
 * the only thing that carries the number, so the count sits beside it in text
 * as well — a bar alone is not readable to everyone.
 */
export const ChoiceBar = styled.span<{ $share: number; $mine?: boolean }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${(p) => Math.max(0, Math.min(100, p.$share))}%;
  background: color-mix(
    in srgb,
    var(--accent) ${(p) => (p.$mine ? 26 : 14)}%,
    transparent
  );
  transition: width 0.25s ease;
  pointer-events: none;
`;

/** Everything drawn over the bar needs its own stacking context. */
export const ChoiceLabel = styled.span`
  position: relative;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const ChoiceCount = styled.span`
  position: relative;
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
`;

/** The tick against the choice this co-author holds. */
export const ChoiceMark = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  color: var(--accent);
`;

/** Who voted for this choice — a shared board has no secret ballot. */
export const Voters = styled.span`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding-left: 0.15rem;
`;

export const VoterAvatar = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--bg-2);
  margin-left: -0.35rem;

  &:first-child {
    margin-left: 0;
  }
`;

/** A voter with no picture — their initial, in the same 18px circle. */
export const VoterInitial = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.6rem;
  color: var(--text-secondary);
  background: var(--bg-4);
  border: 1px solid var(--bg-2);
  margin-left: -0.35rem;

  &:first-child {
    margin-left: 0;
  }
`;

/** "3 votes · Closed", plus the retract link. */
export const BallotFoot = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.68rem;
  color: var(--text-secondary);
`;

export const LinkAction = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.68rem;
  color: var(--text-secondary);
  text-decoration: underline;

  &:hover:not(:disabled) {
    color: var(--text);
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

// ── Poll editor ────────────────────────────────────────────────────────────

export const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

/** Ballot lines are plain text — no rich-text editor, deliberately. */
export const OptionInput = styled.input`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.5rem 0.6rem;
  border-radius: 0.4rem;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  /* Storyboard inputs use the shared input size. */
  font-size: var(--font-size-input);
  outline: none;

  &:focus {
    border-color: var(--accent);
  }
`;

export const OptionRemove = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--tomato-9, #e5484d);
    color: var(--tomato-9, #e5484d);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/**
 * A note carrying votes warns before its ballot is rewritten: dropping a
 * choice drops the votes on it, and there is no undo for that.
 */
export const BallotWarning = styled.p`
  margin: 0;
  font-size: 0.68rem;
  line-height: 1.5;
  color: var(--text-secondary);
`;

/** The plain swatch — a ring, since it has no colour of its own to show. */
export const PlainSwatch = styled.button<{ $active?: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  background: var(--bg-3);
  border: 2px solid
    ${(p) => (p.$active ? "var(--text)" : "rgba(255, 255, 255, 0.18)")};
`;
