import styled from "styled-components";

export const Container = styled.div`
  font-size: 16px;
  font-weight: 500;
  cursor: copy;

  color: ${({ theme }) => theme.text};
  &.primary {
    color: ${({ theme }) => theme.primary};
    font-style: italic;
  }

  &::before {
    content: "@";
    margin-left: 5px;
  }
`;
