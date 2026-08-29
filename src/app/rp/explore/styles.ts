import styled, { keyframes } from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const FeedLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0 8px;

  svg {
    font-size: 1.75rem;
    color: var(--accent);
    animation: ${spin} 0.8s linear infinite;
  }
`;

export const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

export const ModeSwitcher = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-block: 8px;
  margin-inline: auto;
  padding-inline: 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
    opacity: 0.8;
  }

  @media (max-width: 800px) {
    & {
      padding-inline: 5px;
    }
  }
`;

export const ModeTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 112px;
  padding: 6px 16px;
  border: 1px solid
    ${({ $active }) => ($active ? "var(--accent-hover)" : "var(--accent-4)")};
  border-radius: 50px;
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 30%, transparent)"
      : "color-mix(in srgb, var(--accent) 10%, transparent)"};
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-semi-bold);
  font-style: italic;
  color: ${({ $active }) => ($active ? "var(--accent-hover)" : "var(--accent-6)")};
  white-space: nowrap;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }

  @media (max-width: 600px) {
    & {
      font-size: var(--font-size);
      font-weight: var(--font-weight-semi-bold);
    }
  }
`;

export const PromptListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  padding-inline: 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  gap: 0rem;
  width: 100%;

  @media (max-width: 800px) {
    & {
      padding-inline: 5px;
      gap: 0.5rem;
    }
  }
`;

/** Slide-up compose sheet — same pattern as the profile page. */
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
