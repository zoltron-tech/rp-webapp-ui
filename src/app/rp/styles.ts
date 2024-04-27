import { NO_SCROLLBAR, Z_INDEX } from "@/theme";
import { styled } from "styled-components";

export const PageContainer = styled.main`
  min-height: 100vh;
  max-height: max-content;
  width: 100vw;
  position: relative;
  z-index: ${Z_INDEX.BACKGROUND};
  background-color: ${({ theme }) => theme.background};
  background-image: url(https://cli.github.com/assets/images/light-glow.svg);
  color: ${({ theme }) => theme.text};

  scroll-behavior: smooth;
  overflow-y: auto;

  container-name: page-container;
  container-type: size;

  ${NO_SCROLLBAR}
`;
