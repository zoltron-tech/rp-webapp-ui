import { NO_SCROLLBAR, Z_INDEX } from "@/theme";
import { styled } from "styled-components";

export const PageContainer = styled.main`
  min-height: 100vh;
  max-height: max-content;
  width: 100vw;
  position: relative;
  contain: paint;
  z-index: ${Z_INDEX.BACKGROUND};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  scroll-behavior: smooth;
  overflow-y: auto;

  container-name: page-container;
  container-type: size;

  ${NO_SCROLLBAR}
`;
