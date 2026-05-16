import { ToggleGroup } from "radix-ui";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 80%;
  max-width: 560px;
  margin-inline: auto;
  border-radius: 12px;
  border: 1px solid var(--accent-a5);
  background: color-mix(in srgb, var(--accent-a2) 70%, var(--bg-2));
  overflow: hidden;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px var(--accent-a3) inset;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: var(--accent-a7);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.2),
      0 0 0 1px var(--accent-a5) inset;
  }
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
`;

export const SearchIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--accent-8);
  transition: color 0.15s;

  svg {
    width: 17px;
    height: 17px;
  }

  ${Wrapper}:focus-within & {
    color: var(--accent-9);
  }
`;

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    appearance: none;
    -webkit-appearance: none;
  }
`;

export const ClearButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: var(--text-secondary);
  background: var(--bg-5);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-6);
    color: var(--text);
  }

  svg {
    width: 11px;
    height: 11px;
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 14px 11px;
  border-top: 1px solid var(--accent-a3);
`;

export const FiltersLabel = styled.span`
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-right: 2px;
`;

export const FilterChips = styled(ToggleGroup.Root)`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const FilterChip = styled(ToggleGroup.Item)`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-medium);
  background: var(--bg-4);
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-5);
    border-color: var(--accent-a6);
    color: var(--text);
  }

  &[data-state="on"] {
    background: var(--accent-a4);
    border-color: var(--accent-a7);
    color: var(--accent-11);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
`;
