import styled from "styled-components";

export const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
`;

export const Select = styled.select`
  cursor: pointer;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);

  &:focus {
    outline: 1.5px solid var(--accent);
  }
`;
