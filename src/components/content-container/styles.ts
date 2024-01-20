import { NO_SCROLLBAR } from "@/theme";

import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  position: relative;
  background-color: ${({ theme }) => theme.background};

  container-name: content-container;
  container-type: inline-size;

  ${NO_SCROLLBAR}

  @media (max-width: 650px) {
    & {
      margin-top: 60px;
    }
  }
`;
