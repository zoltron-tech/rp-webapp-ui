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
  gap: 4px;
  width: 100%;
  background: var(--bg-2);
  border-bottom: 1px solid var(--bg-6);
  padding-block: 6px;
  padding-inline: 8px;

  @media screen and (max-width: 800px) {
    position: sticky;
    top: 0;
    z-index: 10;
    flex-shrink: 0;
  }
`;

/** Left-side back arrow button — prominent circular button. */
export const BackButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-4);
    }
  }
  &:active {
    background-color: var(--bg-5);
  }
  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

/**
 * Wraps PromptHeader inside the sticky top bar.
 * Scales down avatars, name and date for the compact overlay header.
 */
export const HeaderPromptWrap = styled.div`
  flex: 1;
  min-width: 0;
  padding-block: 2px;

  /* Compact avatar */
  .avatar {
    width: 36px !important;
    height: 36px !important;
  }

  /* Smaller source name */
  h1 {
    font-size: var(--font-size);
    font-weight: var(--font-weight-semi-bold);
    line-height: 1.3;
  }

  /* Slightly smaller date/meta text */
  time {
    font-size: var(--font-size-xsmall);
  }
`;
