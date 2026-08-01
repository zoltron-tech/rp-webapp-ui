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

export const ToolButton = styled.button<{
  $primary?: boolean;
  $active?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$primary || p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) =>
    p.$primary || p.$active ? "var(--accent)" : "var(--bg-3)"};
  border: 1px solid
    ${(p) => (p.$primary || p.$active ? "var(--accent)" : "var(--bg-6)")};
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: ${(p) => (p.$primary || p.$active ? "#fff" : "var(--text)")};
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

/** Map switcher tabs, shown once a story has more than one map. */
export const TabRow = styled.div`
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  -webkit-overflow-scrolling: touch;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  white-space: nowrap;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-3)")};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};

  .count {
    font-size: 0.7rem;
    opacity: 0.75;
  }
`;

export const Stage = styled.div<{ $placing?: boolean; $grabbing?: boolean }>`
  position: relative;
  flex: 1;
  min-width: 0;
  height: 60svh;
  min-height: 320px;
  border-radius: 12px;
  border: 1px solid var(--bg-6);
  background: var(--bg-1);
  overflow: hidden;
  touch-action: none;
  cursor: ${(p) =>
    p.$placing ? "crosshair" : p.$grabbing ? "grabbing" : "grab"};
`;

/** The pan/zoom layer — the image and its pins move as one. */
export const Viewport = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
`;

export const MapImage = styled.img`
  display: block;
  max-width: none;
  user-select: none;
  -webkit-user-drag: none;
`;

/** Sits exactly over the image, so pins can be placed by percentage. */
export const PinLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

/**
 * A pin counter-scales against the viewport transform, so it stays the same
 * size on screen — legible at 0.5× and not gigantic at 4×.
 */
export const Pin = styled.button<{ $selected?: boolean; $draggable?: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem 0.2rem 0.3rem;
  border-radius: 999px;
  white-space: nowrap;
  pointer-events: auto;
  cursor: ${(p) => (p.$draggable ? "grab" : "pointer")};
  touch-action: none;
  font-size: 0.72rem;
  color: var(--text);
  background: var(--bg-2);
  border: 1px solid ${(p) => (p.$selected ? "var(--accent)" : "var(--bg-6)")};
  box-shadow: ${(p) =>
    p.$selected
      ? "0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent), 0 4px 12px rgba(0,0,0,0.35)"
      : "0 2px 8px rgba(0, 0, 0, 0.35)"};
  /* Anchored by its dot, which sits at the pin's exact coordinate. */
  transform-origin: 6px 50%;

  &:active {
    cursor: ${(p) => (p.$draggable ? "grabbing" : "pointer")};
  }

  .dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) =>
      p.$selected ? "var(--accent)" : "var(--tomato-9, #e5484d)"};
  }
`;

/**
 * The selected pin's chip, expanded in place into a small card: what's here,
 * straight on the map, with the edit affordance alongside. Counter-scaled like
 * the pins so it reads the same at every zoom level.
 */
export const PinCard = styled.div`
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 232px;
  padding: 0.6rem;
  border-radius: 12px;
  text-align: left;
  cursor: default;
  pointer-events: auto;
  touch-action: none;
  font-size: var(--font-size-small);
  color: var(--text);
  background: var(--bg-2);
  border: 1px solid var(--accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  /* Anchored by its dot, top-left, sitting on the pin's exact coordinate. */
  transform-origin: 6px 12px;

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;

    &:hover {
      background: var(--bg-4);
      color: var(--text);
    }
  }

  .preview {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

/** Floating zoom / reset controls, bottom-right of the stage. */
export const StageControls = styled.div`
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;
`;

export const StageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--bg-2);
  border: 1px solid var(--bg-6);

  &:hover:not(:disabled) {
    color: var(--text);
    border-color: var(--accent);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/** Current zoom, between the zoom buttons. 100% is the map's full resolution. */
export const ZoomReadout = styled.span`
  min-width: 32px;
  padding: 0.15rem 0.2rem;
  border-radius: 6px;
  text-align: center;
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  user-select: none;
`;

/** Banner across the top of the stage while "add pin" mode is armed. */
export const PlacingBanner = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  color: var(--text);
  background: var(--bg-2);
  border: 1px solid var(--accent);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  max-width: calc(100% - 1rem);
`;

// ── Pin card innards ───────────────────────────────────────────────────────

export const DetailHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const DetailIcon = styled.span<{ $color?: string | null }>`
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

export const DetailName = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DetailCategory = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const DetailBody = styled.div`
  font-size: var(--font-size-small);
  line-height: 1.55;
  color: var(--text-secondary);
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
  padding: 0.15rem 0.45rem;
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

// ── Empty state ────────────────────────────────────────────────────────────

export const EmptyCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 3rem 1.25rem;
  border-radius: 12px;
  border: 1px dashed var(--bg-6);
  text-align: center;
`;

export const EmptyGlyph = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
`;

export const EmptyTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const EmptyText = styled.span`
  font-size: var(--font-size-small);
  line-height: 1.55;
  max-width: 34ch;
  color: var(--text-secondary);
`;

// ── Sheet-local bits ───────────────────────────────────────────────────────

/** Scrollable result list for the codex entry picker. */
export const PickerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 34svh;
  overflow-y: auto;
`;

export const PickerItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-small);
  color: var(--text);
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--accent) 14%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};

  .category {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 0.68rem;
    color: var(--text-secondary);
  }
`;

export const UploadPreview = styled.img`
  width: 100%;
  max-height: 26svh;
  object-fit: contain;
  border-radius: 0.5rem;
  background: var(--bg-1);
  border: 1px solid var(--bg-6);
`;

export const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-6);

  &:hover {
    border-color: var(--accent);
    color: var(--text);
  }

  input {
    display: none;
  }
`;
