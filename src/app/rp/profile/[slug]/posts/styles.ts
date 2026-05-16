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
  transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};

  .compose-fp-inner {
    top: 0 !important;
    height: 100% !important;
  }

  @media screen and (min-width: 801px) {
    display: none;
  }
`;
