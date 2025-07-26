import styled from "styled-components";

export const Container = styled.div`
  font-size: 18px;
  font-weight: 600;
  cursor: copy;

  color: ${({ theme }: any) => theme.text};
  &.primary {
    color: ${({ theme }: any) => theme.primary};
    font-style: italic;
  }

  &::before {
    content: "@";
    margin-left: 5px;
  }
`;
