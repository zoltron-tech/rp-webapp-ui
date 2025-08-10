import styled from "styled-components";

export const Container = styled.div`
  font-size: 18px;
  font-weight: 600;
  cursor: copy;

  color: var(--text);
  &.primary {
    color: var(--accent);
    font-style: italic;
  }

  &::before {
    content: "@";
    margin-left: 5px;
  }
`;
