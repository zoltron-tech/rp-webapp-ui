import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

/* The old "background mesh" (one scaled tile per muse with filter: blur(25px)
   across a full-page absolute layer) is gone for good: live blur layers under
   scrolling content are the iOS 26 compositor-regression trigger — with
   enough muses the page rendered only what was on screen and blanked
   everything else. Plain --bg-2 instead. */
export const Container = styled.div`
  background-color: var(--bg-2);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin-inline: auto;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 14px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    border-color: var(--accent);
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    appearance: none;
  }
`;

export const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--text-secondary);
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 8px;
  max-width: 800px;
  margin-inline: auto;
  padding-inline: 10px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  color: var(--text-secondary);

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    font-size: var(--font-size);
    font-weight: var(--font-weight-regular);
    font-family: var(--font);
    line-height: 1.4;
    color: var(--text);
  }

  input[type="checkbox"] {
    all: unset;
    width: 20px;
    height: 20px;
    aspect-ratio: 1;
    border-radius: 4px;
    margin: 0;
    overflow: hidden;
    accent-color: var(--accent);
    outline-offset: 2px;
    background-color: var(--bg-3);
    border: 1px solid var(--bg-6);
    cursor: pointer;

    &:checked {
      background-color: var(--accent);
      border: 1px solid var(--accent-hover);

      &::before {
        content: "✓";
        display: block;
        color: var(--text);
        text-align: center;
        line-height: 20px;
        font-weight: var(--font-weight-bold);
      }
    }

    &:not(:checked) {
      background-color: var(--bg-5);
      border: 1px solid var(--bg-6);
    }

    &:hover {
      outline: 1px solid var(--accent);
    }

    &:focus {
      outline: 2px solid var(--accent);
    }

    &[disabled] {
      background-color: var(--bg-6);
      cursor: not-allowed;
      color: var(--text-secondary);
    }
  }
`;

export const MuseListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  justify-content: center;
  margin-top: 10px;
  gap: 0.3rem;

  @container (max-width: 800px) {
    & {
      gap: 0.2rem;
    }
  }
`;

export const UsernameLink = styled.span`
  font-size: var(--font-size-h5);
  cursor: pointer;
  color: var(--accent);

  &:hover {
    opacity: 0.8;
  }
`;

export const Maintext = styled.span`
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  font-style: italic;
  text-align: center;

  @media (max-width: 800px) {
      font-size: var(--font-size-h6);
      padding-left: 20px;
      text-align: left;
      font-size: 22px;
  }
`;

/* Fandom filter chips — one per fandom present in the novelist's roster.
   No selection means "show every fandom", so the row starts unfiltered. */
export const FandomFilterRow = styled.div`
  width: 100%;
  max-width: 800px;
  align-self: center;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  padding-inline: 8px;
`;

export const FandomFilterLabel = styled.span`
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-right: 2px;
`;

export const FandomChip = styled.button<{ $color: string; $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  white-space: nowrap;
  background: ${({ $color, $active }) => ($active ? $color : "var(--bg-3)")};
  color: ${({ $active }) => ($active ? "#fff" : "var(--text-secondary)")};
  border: 1px solid
    ${({ $color, $active }) => ($active ? $color : "var(--bg-6)")};
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${({ $color, $active }) =>
      $active ? "rgba(255, 255, 255, 0.85)" : $color};
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .count {
    opacity: 0.7;
  }

  &:hover {
    color: ${({ $active }) => ($active ? "#fff" : "var(--text)")};
    border-color: ${({ $color }) => $color};
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const FandomChipReset = styled.button`
  all: unset;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  text-decoration: underline;

  &:hover {
    color: var(--text);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const FandomGroupHeader = styled.h2<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding-inline: 4px;
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text);

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${({ $color }) => $color};
  }

  .count {
    font-weight: var(--font-weight-regular);
    letter-spacing: normal;
    text-transform: none;
    color: var(--text-secondary);
  }
`;

/** Centres the no-matches art over the message, matching the empty-state
 *  treatment used across the muse profile sections. */
export const EmptyResultWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 10px;
  padding-block: 24px;
`;

export const EmptyResult = styled.p`
  width: 100%;
  margin: 24px 0;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
`;

/* Controls row: group-by toggle on the left, grid/list view toggle right */
export const ViewToggleRow = styled.div`
  width: 100%;
  max-width: 800px;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  @media screen and (max-width: 800px) {
    padding-inline: 8px;
  }
`;

export const ToggleButton = styled.button<{ $active?: boolean }>`
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-3)")};
  color: ${(p) => (p.$active ? "#fff" : "var(--text)")};
  border: none;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:focus {
    outline: 2px solid var(--accent);
  }
`;

export const ListWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  align-self: center;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;

  @media screen and (max-width: 800px) {
    border-radius: 0;
  }
`;

export const GroupByLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text);

  input[type="checkbox"] {
    all: unset;
    width: 18px;
    height: 18px;
    aspect-ratio: 1;
    border-radius: 4px;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: var(--accent);
    background-color: var(--bg-5);
    border: 1px solid var(--bg-6);

    &:checked {
      background-color: var(--accent);
      border: 1px solid var(--accent-hover);

      &::before {
        content: "¹3";
        display: block;
        color: var(--text);
        text-align: center;
        line-height: 18px;
        font-weight: var(--font-weight-bold);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }
`;

export const ViewToggleButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

/* One bucket per fandom when "Group by fandom" is on: a tinted card whose
   gradient and hairline border are mixed from that fandom's own colour, so
   the buckets read as distinct without shouting. */
export const FandomGroup = styled.section<{ $color: string }>`
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  padding: 12px 10px 14px;
  border-radius: 14px;
  border: 1px solid
    ${({ $color }) => `color-mix(in srgb, ${$color} 26%, transparent)`};
  background: ${({ $color }) => `linear-gradient(
    160deg,
    color-mix(in srgb, ${$color} 13%, transparent) 0%,
    color-mix(in srgb, ${$color} 5%, transparent) 42%,
    transparent 80%
  )`};

  ${MuseListContainer} {
    margin-top: 8px;
  }

  /* The list view goes square-edged full-bleed on phones; inside a rounded
     bucket it needs its corners back. */
  ${ListWrapper} {
    border-radius: 10px;
  }

  @media screen and (max-width: 800px) {
    width: calc(100% - 12px);
    padding: 10px 6px 12px;
    border-radius: 12px;
  }
`;
