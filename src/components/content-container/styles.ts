import { NO_SCROLLBAR } from "@/theme";

import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  position: relative;
  background-color: ${({ theme }) => theme.background};
  container-name: content-container;
  container-type: inline-size;
  overflow-y: auto;

  ${NO_SCROLLBAR}
`;
