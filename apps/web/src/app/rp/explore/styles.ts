import styled, { keyframes } from "styled-components";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { FilterSearch } from "@/components/filter-search";
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
    color: var(--accent-11, var(--accent));
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

/* The feed switcher: a hairline shelf either side of a segmented control. */
export const ModeSwitcher = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px auto 14px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--material-edge));
  }

  &::after {
    background: linear-gradient(to left, transparent, var(--material-edge));
  }

  @media (max-width: 800px) {
    padding-inline: 12px;
    gap: 10px;
  }
`;

/* Two options only, so equal-width tabs keep the thumb a steady size. */
export const ModeSegment = styled(SegmentedTabs)`
  [role="tab"] {
    min-width: 112px;

    @media (max-width: 600px) {
      min-width: 96px;
    }
  }
` as typeof SegmentedTabs;

/* The prompt cards carry their own width and phone inset, so the list adds
   none of its own. */
export const PromptListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 6px;
  width: 100%;
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

/**
 * The prompt search: the character directory's field and chips, in the
 * feed's 800px column. Even air either side — 16px from the composer above
 * and to the first card below (the list adds 6px and a card its own 10px
 * margin, so this keeps none of its own at the foot); 12px of each on phones,
 * where the list's and cards' margins are 6px each.
 */
export const PromptSearch = styled(FilterSearch)`
  width: 100%;
  max-width: 800px;
  margin: 16px auto 0;

  @media screen and (max-width: 800px) {
    width: calc(100% - 16px);
    margin-top: 12px;
  }
`;

export const SearchEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 2rem auto;
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
`;

export const RetryButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  padding: 8px 18px;
  min-height: 36px;
  border-radius: 999px;
  border: 1px solid var(--material-edge);
  background: var(--material-fill);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);

  &:hover {
    background: var(--fill-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }
`;
