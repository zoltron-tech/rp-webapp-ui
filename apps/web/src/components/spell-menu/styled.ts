import styled from "styled-components";
import { GLASS } from "@/theme";

/**
 * The word popover. Floating chrome, so it sits on the glass tier like the
 * other menus. Positioned in viewport coordinates by the component and
 * portaled to <body>, which keeps it clear of the scaled manuscript page.
 */
export const Menu = styled.div`
  position: fixed;
  z-index: 2100;
  box-sizing: border-box;
  /* Fixed, not max-content: the contents change while the menu is open and
     a width that followed them would make the whole menu jitter. */
  width: min(20rem, calc(100vw - 2rem));
  max-height: min(18rem, calc(100vh - 2rem));
  overflow-y: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--glass-edge, var(--bg-6));
  color: var(--text);
  font-family: var(--font);
  font-size: 0.875rem;
  padding: 4px;
  ${GLASS("panel")}

  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6, #e5e4e7);
    border-radius: 3px;
  }
`;

export const Word = styled.div<{ $flagged?: boolean }>`
  padding: 4px 10px 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-decoration: ${({ $flagged }) =>
    $flagged ? "underline wavy var(--spell-underline, #e5484d)" : "none"};
  text-decoration-skip-ink: none;
  text-underline-offset: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Suggestion = styled.button<{ $focused?: boolean }>`
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border: none;
  border-radius: 0.5rem;
  background: ${({ $focused }) =>
    $focused
      ? "color-mix(in srgb, var(--accent) 20%, transparent)"
      : "transparent"};
  color: var(--text);
  font: inherit;
  font-weight: var(--font-weight-medium, 500);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;

export const Empty = styled.div`
  padding: 7px 10px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
`;

export const Divider = styled.div`
  height: 1px;
  margin: 4px 6px;
  background: var(--bg-6, rgba(128, 128, 128, 0.25));
`;

export const SectionLabel = styled.div`
  padding: 4px 10px;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Synonym chips, or the empty / loading line, in a block of fixed height:
 *  three chip rows (eight short words at most), so swapping between synonym
 *  sets of different sizes never changes the menu's height. The previous set
 *  is shown dimmed while the next one loads. */
export const SynonymsBox = styled.div<{ $stale?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 6px;
  padding: 2px 8px 6px;
  height: 104px;
  box-sizing: border-box;
  overflow: hidden;
  opacity: ${({ $stale }) => ($stale ? 0.5 : 1)};
  transition: opacity 0.15s ease;

  > ${Empty} {
    padding-left: 2px;
  }
`;

export const Chip = styled.button`
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--bg-6, rgba(128, 128, 128, 0.3));
  background: var(--material-fill, transparent);
  color: var(--text);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--bg-6, rgba(128, 128, 128, 0.25));
`;

export const Action = styled.button`
  flex: 1 1 0;
  min-width: 0;
  padding: 7px 8px;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;
