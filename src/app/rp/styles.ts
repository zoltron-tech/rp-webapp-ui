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

/** Holds the page content, centered the same way LeftNav/RightSidebar
 * compute their own fixed left/right offsets (max-width 1400, 16px edge
 * padding) — the two never need to talk to each other directly. LeftNav/
 * RightSidebar themselves are position:fixed and live outside this element
 * entirely (see rp/layout.tsx), so they never scroll with the page; this
 * just reserves the horizontal room for them via extra padding so
 * ContentContainer's text doesn't render underneath them. */
export const AppGrid = styled.div<{
  $leftReserve: number;
  $rightReserve: number;
  $fullBleed?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  min-width: 0;
  padding-left: ${({ $leftReserve }) => 16 + $leftReserve}px;
  padding-right: ${({ $rightReserve }) => 16 + $rightReserve}px;
  transition: padding-left 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    padding-right 0.32s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 600px) {
    padding-inline: 0;
  }

  /* Full-bleed pages (e.g. the /rp/novelists landing) span the whole viewport
     instead of the centered, sidebar-reserved content column — no max-width,
     no edge padding, so their hero/carousels reach both edges. Sidebar
     mount/visibility is unchanged; only this container's geometry drops. */
  ${({ $fullBleed }) =>
    $fullBleed &&
    `
      max-width: none;
      padding-left: 0;
      padding-right: 0;
    `}
`;
