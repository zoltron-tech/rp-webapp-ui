import { DropdownMenu } from "radix-ui";
import styled from "styled-components";
import { FOCUS_RING, MATERIAL, MATERIAL_CARD } from "@/theme";

/* Same canvas as the Characters list: cards straight on the ambient page. */
export const Container = styled.div`
  padding-top: 20px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

export const Favorites = styled.section`
  ${MATERIAL_CARD}
  width: min(100% - 24px, 800px);
  border-radius: 18px;
  padding: 12px 14px 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
`;

export const FavoritesHeader = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);

  svg {
    color: var(--accent-11, var(--accent));
  }
`;

export const FavoritesHint = styled.span`
  margin-left: auto;
  font-weight: normal;
  letter-spacing: 0;
  text-transform: none;
  font-size: 11px;
`;

export const FavoritesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px 8px;
  padding: 6px 2px 10px;
  touch-action: pan-y;
`;

export const FavoriteSlot = styled.div<{
  $dragging: boolean;
  $target: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  z-index: ${({ $dragging }) => ($dragging ? 3 : "auto")};
  opacity: ${({ $dragging }) => ($dragging ? 0.85 : 1)};
  transition: ${({ $dragging }) => ($dragging ? "none" : "transform 0.15s ease")};
  outline: ${({ $target }) =>
    $target
      ? "2px dashed color-mix(in srgb, var(--accent-11, var(--accent)) 60%, transparent)"
      : "none"};
  outline-offset: 2px;
  user-select: none;
  -webkit-user-select: none;
`;

export const MoveButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const MoveButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border-radius: 8px;
  ${MATERIAL}
  font-size: 11px;
  color: var(--text-secondary);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--accent-11, var(--accent));
    }
  }

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }

  ${FOCUS_RING}
`;

export const Controls = styled.div`
  width: min(100% - 24px, 800px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
`;

/** The whole pill is the trigger: icon, "Sort", the current choice, chevron. */
export const SortTrigger = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 10px 0 12px;
  border-radius: 50px;
  ${MATERIAL}
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  transition: border-color 0.15s ease, background-color 0.15s ease;

  > span {
    font-weight: var(--font-weight-bold);
  }

  > b {
    font-weight: var(--font-weight-bold);
    color: var(--accent-11, var(--accent));
  }

  > svg:last-child {
    transition: transform 0.15s ease;
  }

  @media (hover: hover) {
    &:hover {
      background: var(--fill-hover);
    }
  }

  &[data-state="open"] {
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 55%, transparent);

    > svg:last-child {
      transform: rotate(180deg);
    }
  }

  ${FOCUS_RING}
`;

/** One sort option in the glass menu; the check marks the current one. */
export const SortItem = styled(DropdownMenu.RadioItem)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-width: 160px;
  padding: 9px 12px;
  margin-block: 1px;
  border-radius: 10px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  color: var(--text);
  cursor: pointer;
  outline: none;
  transition: background-color 0.1s ease;

  &:hover,
  &:focus,
  &[data-highlighted] {
    background-color: var(--fill-hover);
  }

  &[data-state="checked"] {
    color: var(--accent-11, var(--accent));
    font-weight: var(--font-weight-bold);
  }

  svg {
    flex-shrink: 0;
  }
`;

export const Grid = styled.div`
  width: min(100% - 24px, 800px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 4px;

  @media screen and (max-width: 800px) {
    gap: 10px;
  }
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 1.5rem;
`;

/** "Select" / "Done" pill beside the sort menu. */
export const SelectToggle = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
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

  &[aria-pressed="true"] {
    color: var(--accent-11, var(--accent));
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 55%, transparent);
  }

  ${FOCUS_RING}
`;

/** Sticks to the bottom of the viewport while books are being picked. */
export const BulkBar = styled.div`
  position: sticky;
  bottom: 12px;
  z-index: 5;
  width: min(100% - 24px, 800px);
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 16px;
  ${MATERIAL_CARD}
  background-color: var(--bg-2);
  margin-top: 8px;
`;

export const BulkCount = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const BulkButton = styled.button<{ $tone?: "negative" }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 50px;
  border: 1px solid var(--material-edge);
  background: ${({ $tone }) =>
    $tone === "negative" ? "var(--negative, #e5484d)" : "var(--material-fill)"};
  color: ${({ $tone }) => ($tone === "negative" ? "#fff" : "var(--text-secondary)")};
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  ${FOCUS_RING}
`;
