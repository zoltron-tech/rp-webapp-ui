import styled from "styled-components";

export const Container = styled.span<{
  accent?: string | null;
}>`
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-bold);
  cursor: pointer;

  &.mini {
    font-size: var(--font-size-small);
  }

  &.medium {
      font-weight: var(--font-weight-medium);
  }

  color: var(--text);
  &.primary {
    color:  ${({ accent }) =>
      accent && accent.trim() !== "" ? accent : "var(--accent)"};
    font-style: italic;
  }

  &::before {
    content: "@";
    margin-left: 5px;
  }
`;
