import styled from "styled-components";

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

  /* On a 375px screen the title and both actions cannot share a line without
     squeezing the buttons below a comfortable tap target — give the actions
     their own row and let them share its width. */
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

  /* Sharing one row on a 375px screen, the labels wrap onto a second line at
     the full size — drop a step and hold them on one. */
  @media (max-width: 480px) {
    gap: 0.25rem;
    padding: 0.4rem 0.6rem;
    font-size: var(--font-size-xsmall);
    white-space: nowrap;
  }
`;

/** Category tab pills. Scroll sideways rather than wrapping on a phone. */
export const TabRow = styled.div`
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  -webkit-overflow-scrolling: touch;
  /* The row is scrolled to the active tab, so keep it clear of the edges. */
  scroll-padding-inline: 0.75rem;

  /* A scrollbar under the pills only adds noise; the fade below carries the
     "there is more" signal instead. */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

/** Wraps [TabRow] so the overflowing edge can fade — the cue that the tabs
 *  keep going past the screen, which matters most at 375px. The fade only
 *  appears while there is actually more to scroll to. */
export const TabScroller = styled.div<{ $fade?: boolean }>`
  position: relative;
  min-width: 0;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 2rem;
    pointer-events: none;
    opacity: ${(p) => (p.$fade ? 1 : 0)};
    transition: opacity 0.2s ease;
    background: linear-gradient(to right, transparent, var(--bg-1));
  }
`;

export const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  min-height: 36px;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  white-space: nowrap;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-3)")};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};

  &:hover {
    color: ${(p) => (p.$active ? "#fff" : "var(--text)")};
  }

  .count {
    font-size: 0.7rem;
    opacity: 0.75;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;

  /* iPhone SE baseline — one card per row rather than a squeezed pair. */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div<{ $color?: string | null }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-left: 3px solid ${(p) => p.$color || "var(--accent)"};
  min-width: 0;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--bg-6));
    border-left-color: ${(p) => p.$color || "var(--accent)"};
  }
`;

/**
 * The card's own body is the button that opens the entry for reading — the
 * whole block, so the tap target is the card rather than a 24px icon. The edit
 * action and the chapter chips stay outside it: a button cannot nest.
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

export const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const CardIcon = styled.span<{ $color?: string | null }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: ${(p) => p.$color || "var(--accent)"};
  background: color-mix(
    in srgb,
    ${(p) => p.$color || "var(--accent)"} 16%,
    transparent
  );
`;

export const CardThumb = styled.img`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
`;

export const CardName = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** An icon action inside a row — the category manager's edit button. */
export const RowAction = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

/** Sits over the card's top-right corner, clear of the open button beneath. */
export const CardAction = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-2);
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

/** Clamped rich-text preview — the full description lives in the sheet. */
export const CardBody = styled.div`
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ChapterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
`;

export const ChapterChip = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  font-size: 0.7rem;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    border-color: var(--accent);
    color: var(--text);
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

/** A quiet aside under content — not an empty state, so it stays left-aligned. */
export const Note = styled.p`
  margin: 0;
  padding: 0.25rem 0;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text-secondary);
`;

/** Placeholder cards while the codex loads, so the grid doesn't pop in. */
export const Skeleton = styled.div`
  height: 104px;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  opacity: 0.6;
`;

// ── Characters tab (the derived cast — read-only) ──────────────────────────

export const CastRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const CastChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 38px;
  padding: 0.3rem 0.7rem 0.3rem 0.3rem;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  cursor: pointer;
  max-width: 100%;

  &:hover {
    border-color: var(--accent);
  }
`;

export const CastAvatar = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const CastAvatarFallback = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg-5);
  color: var(--text-secondary);
  font-size: 0.75rem;
  flex-shrink: 0;
`;

// ── Entry reader ───────────────────────────────────────────────────────────

export const ReaderHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
`;

export const ReaderThumb = styled.img`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
`;

export const ReaderMeta = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

export const ReaderName = styled.span`
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ReaderCategory = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

// ── Category manager ───────────────────────────────────────────────────────

export const ManagerRow = styled.div<{ $dragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  background: var(--bg-3);
  border: 1px solid ${(p) => (p.$dragging ? "var(--accent)" : "var(--bg-6)")};
  box-shadow: ${(p) => (p.$dragging ? "0 6px 18px rgba(0,0,0,0.3)" : "none")};
`;

export const DragHandle = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.35rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

export const ManagerName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-small);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ManagerCount = styled.span`
  flex-shrink: 0;
  font-size: 0.7rem;
  color: var(--text-secondary);

  /* The row has a handle, an icon, a name and an edit button to fit into
     375px — the word goes, the number stays. */
  @media (max-width: 420px) {
    .unit {
      display: none;
    }
  }
`;

/** "Description" plus its attach / GIF actions, on one line. */
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
