import styled from "styled-components";

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

/* Both rows are full width, so the date row and the time row line up exactly. */
export const Row = styled.div`
  display: flex;
  align-items: stretch;
  gap: 6px;
  width: 100%;
`;

export const EraToggle = styled.div`
  display: flex;
  flex-shrink: 0;
  border: 1.5px solid var(--bg-6);
  border-radius: 6px;
  overflow: hidden;
`;

export const EraOption = styled.label<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 12px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  text-align: center;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--text)" : "var(--text-secondary)")};
  background-color: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-3)")};
  transition: background-color 0.15s, color 0.15s;

  &:hover {
    background-color: ${(p) =>
      p.$active ? "var(--accent-hover)" : "var(--bg-4)"};
  }

  &:has(:focus-visible) {
    outline: 1.5px solid var(--accent);
    outline-offset: -1.5px;
  }

  & + & {
    border-left: 1.5px solid var(--bg-6);
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

/* Free-text date/time input (AD mode). Grows to fill its row. */
export const TextInput = styled.input<{ $optional?: boolean }>`
  flex: 1 1 auto;
  min-width: 0;
  box-sizing: border-box;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1.5px ${(p) => (p.$optional ? "dashed" : "solid")} var(--bg-6);
  background: ${(p) => (p.$optional ? "transparent" : "var(--bg-3)")};
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  transition: border-color 0.18s;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
  }

  &:hover {
    border-color: var(--bg-8);
  }

  &:focus {
    border-color: var(--accent);
    outline: none;
  }

  &[aria-invalid="true"] {
    border-color: var(--tomato-9);
  }
`;

/* Checkbox that shows/hides the time inputs — time is optional, so it starts
   hidden and only appears once the user opts in. */
export const TimeToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: pointer;

  input {
    accent-color: var(--accent);
    cursor: pointer;
  }
`;

export const ErrorText = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--tomato-9);
`;

/* Compact numeric input for BC day/month/year/hour/minute. Shares row space
   evenly; the year gets a wider share so up to six digits stay readable. */
export const NumberInput = styled.input<{
  $optional?: boolean;
  $wide?: boolean;
}>`
  flex: ${(p) => (p.$wide ? "1.6 1 0" : "1 1 0")};
  min-width: 0;
  box-sizing: border-box;
  padding: 6px;
  border-radius: 6px;
  border: 1.5px ${(p) => (p.$optional ? "dashed" : "solid")} var(--bg-6);
  background: ${(p) => (p.$optional ? "transparent" : "var(--bg-3)")};
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  text-align: center;
  transition: border-color 0.18s;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
  }

  &:hover {
    border-color: var(--bg-8);
  }

  &:focus {
    border-color: var(--accent);
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  appearance: textfield;
`;
