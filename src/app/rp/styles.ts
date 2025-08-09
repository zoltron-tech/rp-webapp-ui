import { NO_SCROLLBAR, Z_INDEX } from "@/theme";
import { styled } from "styled-components";

export const PageContainer = styled.main`
  min-height: 100vh;
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

  --bg-1: var(--olive-1);
  --bg-2: var(--olive-2);
  --bg-3: var(--olive-3);
  --bg-3-e: var(--olive-3-e);
  --bg-4: var(--olive-4);
  --bg-4-e: var(--olive-4-e);
  --bg-5: var(--olive-5);
  --bg-6: var(--olive-6);
  --bg-7: var(--olive-7);
  --bg-8: var(--olive-8);
  --bg-9: var(--olive-9);
  --bg-10: var(--olive-10);
  --bg-11: var(--olive-11);
  --bg-12: var(--olive-12);

  --text: var(--bg-12);
  --text-color-light: #242424;
  --text-color-dark: var(--text);

  --accent-1: var(--cyan-1);
  --accent-1-e: var(--cyan-1-e);
  --accent-2: var(--cyan-2);
  --accent-2-e: var(--cyan-2-e);
  --accent-3: var(--cyan-3);
  --accent-3-e: var(--cyan-3-e);
  --accent-4: var(--cyan-4);
  --accent-4-e: var(--cyan-4-e);
  --accent-5: var(--cyan-5);
  --accent-5-e: var(--cyan-5-e);
  --accent-6: var(--cyan-6);
  --accent-6-e: var(--cyan-6-e);
  --accent-7: var(--cyan-7);
  --accent-7-e: var(--cyan-7-e);
  --accent-8: var(--cyan-8);
  --accent-8-e: var(--cyan-8-e);
  --accent-9: var(--cyan-9);
  --accent-9-e: var(--cyan-9-e);
  --accent-10: var(--cyan-10);
  --accent-10-e: var(--cyan-10-e);
  --accent-11: var(--cyan-11);
  --accent-11-e: var(--cyan-11-e);
  --accent-12: var(--cyan-12);

  --accent: var(--accent-6);
  --accent-hover: var(--accent-7);
  --accent-active: var(--accent-5);
`;
