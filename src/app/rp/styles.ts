import { styled } from "styled-components";
import { Z_INDEX } from "@/theme";

/* NOT a scroll container — the document scrolls (see the html rule in
 * globals.css). This element used to be a nested 100dvh overflow-y:auto
 * scroller, which on iOS Safari only gets a viewport-sized layer instead of
 * the document scroller's tiled backing store: under iOS 26 that meant
 * content blanked out while scrolling and repainted seconds later. JS that
 * scrolls the page targets document.scrollingElement, not this element.
 *
 * Also deliberately NOT a container-query container: container-type implies
 * layout containment, which would make this the containing block for the
 * position:fixed LeftNav/RightSidebar — they must attach to the viewport.
 * The `page-container` class stays: portals target it for theme/accent CSS
 * variables. */
export const PageContainer = styled.main`
  min-height: 100dvh;
  width: 100%;
  position: relative;
  /* The negative z-index is deliberate, and body's isolation:isolate (see
     globals.css) is what keeps the app above body's #000 background despite
     it. Beyond stacking, it has a compositing side effect we RELY on: WebKit
     promotes the negative-z subtree into a single retained composited layer,
     and on iOS 26 that retained backing store is what keeps off-screen
     content painted while scrolling. An experiment with z-index: 0 (paint
     order identical, "simpler") put content back into lazily-painted root
     tiles and the iOS scroll-blanking returned immediately. Also a stacking
     context, which pages' internal negative-z backdrops (story/muse) resolve
     against. */
  z-index: ${Z_INDEX.BACKGROUND};
  /* Deliberately NO overflow-x: clip (or any overflow value) here. Clip
     semantics on this element license WebKit to skip painting content past
     the clip edge — same machinery family as the body contain:paint bug —
     and adding it here brought back the iOS blanking of off-screen content
     during scroll. Sideways overflow is handled by the html rule (backstop)
     and clipped at its sources: the novelist carousel's own paint
     containment and the muse marquee wrapper's overflow:hidden. */
  background-color: var(--bg-1);
  color: var(--text);
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
