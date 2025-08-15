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

  &.jade {
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

    --accent-1: var(--jade-1);
    --accent-a1: var(--jade-a1);
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
    --accent-a10: var(--jade-a10);
    --accent-11: var(--jade-11);
    --accent-a11: var(--jade-a11);
    --accent-12: var(--jade-12);
    --accent-a12: var(--jade-a12);
  }

  &.crimson {
    --bg-1: var(--mauve-1);
    --bg-2: var(--mauve-2);
    --bg-3: var(--mauve-3);
    --bg-4: var(--mauve-4);
    --bg-5: var(--mauve-5);
    --bg-6: var(--mauve-6);
    --bg-7: var(--mauve-7);
    --bg-8: var(--mauve-8);
    --bg-9: var(--mauve-9);
    --bg-10: var(--mauve-10);
    --bg-11: var(--mauve-11);
    --bg-12: var(--mauve-12);

    --accent-a1: var(--crimson-a1);
    --accent-a2: var(--crimson-a2);
    --accent-a3: var(--crimson-a3);
    --accent-a4: var(--crimson-a4);
    --accent-a5: var(--crimson-a5);
    --accent-a6: var(--crimson-a6);
    --accent-a7: var(--crimson-a7);
    --accent-a8: var(--crimson-a8);
    --accent-a9: var(--crimson-a9);
    --accent-a10: var(--crimson-a10);
    --accent-a11: var(--crimson-a11);
    --accent-a12: var(--crimson-a12);
    --accent-1: var(--crimson-1);
    --accent-2: var(--crimson-2);
    --accent-3: var(--crimson-3);
    --accent-4: var(--crimson-4);
    --accent-5: var(--crimson-5);
    --accent-6: var(--crimson-6);
    --accent-7: var(--crimson-7);
    --accent-8: var(--crimson-8);
    --accent-9: var(--crimson-9);
    --accent-10: var(--crimson-10);
    --accent-11: var(--crimson-11);
    --accent-12: var(--crimson-12);
  }

  &.iris {
    --bg-1: var(--slate-1);
    --bg-2: var(--slate-2);
    --bg-3: var(--slate-3);
    --bg-4: var(--slate-4);
    --bg-5: var(--slate-5);
    --bg-6: var(--slate-6);
    --bg-7: var(--slate-7);
    --bg-8: var(--slate-8);
    --bg-9: var(--slate-9);
    --bg-10: var(--slate-10);
    --bg-11: var(--slate-11);
    --bg-12: var(--slate-12);

    --accent-a1: var(--iris-a1);
    --accent-a2: var(--iris-a2);
    --accent-a3: var(--iris-a3);
    --accent-a4: var(--iris-a4);
    --accent-a5: var(--iris-a5);
    --accent-a6: var(--iris-a6);
    --accent-a7: var(--iris-a7);
    --accent-a8: var(--iris-a8);
    --accent-a9: var(--iris-a9);
    --accent-a10: var(--iris-a10);
    --accent-a11: var(--iris-a11);
    --accent-a12: var(--iris-a12);
    --accent-1: var(--iris-1);
    --accent-2: var(--iris-2);
    --accent-3: var(--iris-3);
    --accent-4: var(--iris-4);
    --accent-5: var(--iris-5);
    --accent-6: var(--iris-6);
    --accent-7: var(--iris-7);
    --accent-8: var(--iris-8);
    --accent-9: var(--iris-9);
    --accent-10: var(--iris-10);
    --accent-11: var(--iris-11);
    --accent-12: var(--iris-12);
  }

  --accent: var(--accent-6);
  --accent-hover: var(--accent-7);
  --accent-active: var(--accent-5);

  --text: var(--bg-12);
  --text-secondary: var(--bg-11);
`;
