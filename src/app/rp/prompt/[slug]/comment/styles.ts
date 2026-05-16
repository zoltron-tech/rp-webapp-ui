import { Container } from "@novelist-world/ui";
import styled, { css, keyframes } from "styled-components";

const slideInFromRight = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOutToRight = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

/**
 * Outer shell — full-viewport fixed column on mobile so the composer is
 * always pinned at the bottom and only the prompt body scrolls.
 */
export const PageContainer = styled(Container)<{ $closing?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  z-index: 50;
  background-color: transparent;
  border-radius: unset !important;
  border: none !important;

  @media screen and (max-width: 800px) {
    position: fixed;
    top: var(--topbar-height);
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    justify-content: flex-start;
    align-items: stretch;
    background-color: var(--bg-2);
    ${({ $closing }) =>
      $closing
        ? css`animation: ${slideOutToRight} 0.26s ease both;`
        : css`animation: ${slideInFromRight} 0.28s ease both;`}
  }
`;

/**
 * Scrollable prompt body — grows to fill available height between the
 * sticky header and the fixed composer.
 */
export const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 16px;

  @media screen and (min-width: 801px) {
    max-width: 800px;
    width: 100%;
    margin-inline: auto;
  }
`;

/**
 * Sticky header row — contains the back button and the prompt's
 * source / meta info (rendered by PromptHeader).
 */
export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  background: var(--bg-2);
  border-bottom: 1px solid var(--bg-6);

  @media screen and (max-width: 800px) {
    position: sticky;
    top: 0;
    z-index: 10;
    flex-shrink: 0;
  }
`;

/** Left-side back arrow button. */
export const BackButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  padding-left: 10px;
  color: var(--text);
  font-size: 1.1rem;
`;

/**
 * Wraps PromptHeader inside the sticky top bar.
 * Hides the dropdown menu (…) since this is a read-only header view.
 */
export const HeaderPromptWrap = styled.div`
  flex: 1;
  min-width: 0;
  padding: 6px 0;

  /* Scale down avatars slightly for the compact header. */
  .avatar {
    width: 40px !important;
    height: 40px !important;
  }
`;
