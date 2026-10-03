import styled from "styled-components";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

export const PromptInputWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const PostList = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  margin-inline: auto;
  padding-inline: 10px;
  margin-top: 20px;
`;

export const ComposeSheet = styled.div<{ $open: boolean }>`
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  transform: translateY(${(p) => (p.$open ? "0" : "100%")});
  /* iOS Safari sizes position:fixed boxes against the shrunken visual
     viewport while the browser toolbars are showing, then grows the viewport
     when they retract at the bottom of the page: the off-screen
     translateY(100%) is left short by the toolbar height and a strip of the
     closed sheet paints over the content below it (the Load More button).
     visibility makes the closed state unpaintable whatever the geometry, and
     the 0.38s delay lets the slide-out animation finish before it applies. */
  visibility: ${(p) => (p.$open ? "visible" : "hidden")};
  transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s linear ${(p) => (p.$open ? "0s" : "0.38s")};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};

  .compose-fp-inner {
    top: 0 !important;
    height: 100% !important;
  }

  @media screen and (min-width: 801px) {
    display: none;
  }
`;
