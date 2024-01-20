import styled from "styled-components";

export const Username = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  &::before {
    content: "@";
    font-weight: 600;
    margin-left: 5px;
  }
`;
