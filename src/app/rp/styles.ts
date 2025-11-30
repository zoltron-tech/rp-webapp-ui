import { styled } from "styled-components";
import { NO_SCROLLBAR, Z_INDEX } from "@/theme";

export const PageContainer = styled.main`
  min-height: 100dvh;
  max-height: max-content;
  width: 100vw;
  position: relative;
  z-index: ${Z_INDEX.BACKGROUND};
  background-color: var(--bg-1);
  color: var(--text);

  scroll-behavior: smooth;
  overflow-y: auto;

  container-name: page-container;
  container-type: size;

  ${NO_SCROLLBAR}
`;
