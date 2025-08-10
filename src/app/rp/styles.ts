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
  --bg-4: var(--olive-4);
  --bg-5: var(--olive-5);
  --bg-6: var(--olive-6);
  --bg-7: var(--olive-7);
  --bg-8: var(--olive-8);
  --bg-9: var(--olive-9);
  --bg-10: var(--olive-10);
  --bg-11: var(--olive-11);
  --bg-12: var(--olive-12);

  --text: var(--bg-12);
  --text-secondary: var(--bg-11);

  --accent-1: var(--jade-1);
  --accent-2: var(--jade-2);
  --accent-a2: var(--jade-a2);
  --accent-3: var(--jade-3);
  --accent-a3: var(--jade-a3);
  --accent-4: var(--jade-4);
  --accent-a4: var(--jade-a4);
  --accent-5: var(--jade-5);
  --accent-a5: var(--jade-a5);
  --accent-6: var(--jade-6);
  --accent-a6: var(--jade-a6);
  --accent-7: var(--jade-7);
  --accent-a7: var(--jade-a7);
  --accent-8: var(--jade-8);
  --accent-a8: var(--jade-a8);
  --accent-9: var(--jade-9);
  --accent-a9: var(--jade-a9);
  --accent-10: var(--jade-10);
  --accent-10-e: var(--jade-10-e);
  --accent-11: var(--jade-11);
  --accent-11-e: var(--jade-11-e);
  --accent-12: var(--jade-12);

  --accent: var(--accent-6);
  --accent-hover: var(--accent-7);
  --accent-active: var(--accent-5);
`;
