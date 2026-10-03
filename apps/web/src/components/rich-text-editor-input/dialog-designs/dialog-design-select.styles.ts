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
  border-radius: 10px;
  border: 1px solid var(--field-edge, var(--bg-6));
  /* Opaque on purpose: a native <select> hands its background to the OS
     option list, which would render a translucent fill as a see-through menu. */
  background-color: var(--bg-2);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-9, var(--accent));
    box-shadow: 0 0 0 3px
      var(--accent-a5, color-mix(in srgb, var(--accent) 35%, transparent));
  }
`;
