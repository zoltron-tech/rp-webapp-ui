import { Popover, Toolbar } from "radix-ui";
import styled, { css, keyframes } from "styled-components";
import {
  editorMentionTagCss,
  mentionChildrenCss,
  savedMentionTagCss,
} from "./mention-chip";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const Container = styled.div<{ $fullPage?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  ${(p) =>
    p.$fullPage &&
    `
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  `}
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  width: 90%;
  background-color: var(--bg-3);
  border-radius: 0.5rem;
`;

export const EmptyText = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

export const ToolbarWrapper = styled.div`
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
`;

export const ToolbarRoot = styled(Toolbar.Root)`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  padding-bottom: 0.625rem;
  margin-bottom: 1px;
  background-color: var(--bg-4);
  border: 2px solid var(--border, var(--bg-6, #e5e4e7));
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
  box-sizing: border-box;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ToolbarScrollOverlay = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3.5rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: linear-gradient(to right, transparent, var(--bg-4) 65%);
  z-index: 30;
`;

export const ToolbarScrollOverlayLeft = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3.5rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(to left, transparent, var(--bg-4) 65%);
  z-index: 30;
`;

export const ToolbarScrollBtn = styled.button`
  pointer-events: all;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  color: var(--text);
  cursor: pointer;
  margin-right: 0.3rem;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);

  &:hover {
    background-color: var(--bg-5);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;

export const ToolbarScrollBtnLeft = styled(ToolbarScrollBtn)`
  margin-right: 0;
  margin-left: 0.3rem;
`;

export const ToolbarSection = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-shrink: 0;
  gap: 0.375rem;
  align-items: center;
`;

interface ToolbarSelectWrapProps {
  $nested?: boolean;
}

export const ToolbarSelectWrap = styled.div<ToolbarSelectWrapProps>`
  display: flex;
  align-items: center;
  border: ${(p) => (p.$nested ? "none" : "1px solid var(--bg-6, #e5e4e7)")};
  border-radius: ${(p) => (p.$nested ? "0" : "0.375rem")};
  background-color: ${(p) => (p.$nested ? "transparent" : "var(--bg-3, #fff)")};
  overflow: hidden;
  flex-shrink: 0;
  min-height: 40px;

  &:hover {
    background-color: ${(p) => (p.$nested ? "transparent" : "var(--bg-5, #f3f4f6)")};
  }
`;

export const ChevronBox = styled.div`
  width: 32px;
  flex-shrink: 0;
  height: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--bg-6, #e5e4e7);
  color: var(--text);
  pointer-events: none;
`;

export const FontSelectRoot = styled.div`
  position: relative;

  .font-select-dropdown-icon {
    position: absolute;
    height: 20px;
    width: 20px;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-55%);
    color: var(--text);
    pointer-events: none;
  }
`;

export const FontSelect = styled.select`
  box-sizing: content-box;
  padding: 0.5rem 0.75rem;
  min-width: 0;
  width: 6.5rem;
  border: none;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  color: var(--text);
  font-size: inherit;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
  }
`;

/* Radix Popover dropdown – shared by all toolbar dropdowns, opaque bg */
export const DropdownPopoverContent = styled(Popover.Content)`
  position: relative;
  isolation: isolate;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 0.5rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28), 0 4px 10px rgba(0, 0, 0, 0.12);
  z-index: 2147483647;
  padding: 0.75rem;
  animation: ${fadeIn} 0.15s ease-out;

  &:focus {
    outline: none;
  }
`;

export const DropdownTriggerBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--bg-6);
  border-radius: 0.375rem;
  background-color: var(--bg-3);
  cursor: pointer;
  min-height: 40px;
  padding: 0;
  overflow: hidden;
  flex-shrink: 0;

  &:hover {
    background-color: var(--bg-5);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;

export const DropdownTriggerValue = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  padding: 0 0.375rem;
  color: var(--text);
  font-size: 1.25rem;
`;

export const DropdownTriggerChevron = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  min-height: 40px;
  border-left: 1px solid var(--bg-6);
  color: var(--text);
  flex-shrink: 0;
`;

export const ListOptionGroup = styled.div`
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  border: 2px solid var(--bg-6);
  border-radius: 0.5rem;
  overflow: visible;
  background-color: var(--bg-4);
`;

export const ListOptionMain = styled.div`
  display: flex;
  align-items: center;
  border-radius: 0.35rem 0 0 0.35rem;
  overflow: hidden;
`;

export const ListOptionSub = styled.div`
  display: flex;
  align-items: center;
  border-left: 2px solid var(--bg-6);
  background-color: var(--bg-3);
  border-radius: 0 0.35rem 0.35rem 0;
  overflow: hidden;
`;

export const ListSubTriggerBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  min-height: 40px;
  padding: 0;
  color: var(--text);
  flex-shrink: 0;

  &:hover {
    background-color: var(--bg-5);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`;

interface OrderedListItemProps {
  $selected?: boolean;
}

export const OrderedListDropdownItem = styled.button<OrderedListItemProps>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.95rem;
  border: none;
  background-color: ${(p) => (p.$selected ? "color-mix(in srgb, var(--accent) 25%, transparent)" : "transparent")};
  color: var(--text);
  font-weight: ${(p) => (p.$selected ? "600" : "normal")};

  &:hover {
    background-color: var(--accent);
  }
`;

export const BulletSelectorButton = styled.button`
  box-sizing: content-box;
  padding: 0.3rem 0.02rem 0.1rem 0.1rem;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text);
  font-size: 1.25rem;
  min-width: 2.5rem;
  text-align: center;
  position: relative;
  min-height: 30px;

  &:hover {
    background-color: var(--bg-5);
  }
`;

export const BulletDropdownContainer = styled.div`
  position: relative;
`;

export const BulletDropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 0.50rem);
  left: -40px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  padding: 0.75rem;
  max-height: 140px;
  overflow-y: auto;
  animation: ${fadeIn} 0.15s ease-out;
  min-width: 100px;
`;

export const BulletCategoryGroup = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const BulletCategoryTitle = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const BulletGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.2rem;
`;

interface BulletItemProps {
  $selected?: boolean;
}

export const BulletGridItem = styled.button<BulletItemProps>`
  padding: 0.5rem;
  min-height: 44px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-6, #e5e4e7)")};
  border-radius: 0.375rem;
  background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-4, #f9fafb)")};
  color: ${(props) => (props.$selected ? "var(--text)" : "var(--text-secondary)")};
  cursor: pointer;
  font-size: 1.35rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-5, #f3f4f6)")};
    border-color: var(--accent);
    transform: scale(1.05);
  }
`;

export const Divider = styled.div`
  flex-shrink: 0;
  width: 1px;
  height: 2rem;
  background-color: var(--bg-6, #e5e4e7);
  margin: 0 0.125rem;
`;

// Quotation Mark Selector Styles
export const QuotationSelectorButton = styled.button`
  box-sizing: content-box;
  padding: 0.3rem 0.02rem 0.1rem 0.1rem;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text);
  font-size: 1.25rem;
  min-width: 2.5rem;
  text-align: center;
  position: relative;
  min-height: 30px;

  &:hover {
    background-color: var(--bg-5);
  }
`;

export const QuotationDropdownContainer = styled.div`
  position: relative;
`;

interface QuotationDropdownPanelProps {
  $alignRight?: boolean;
  $openUpward?: boolean;
}

export const QuotationDropdownPanel = styled.div<QuotationDropdownPanelProps>`
  position: absolute;
  top: ${(props) => (props.$openUpward ? "auto" : "calc(100% + 0.50rem)")};
  bottom: ${(props) => (props.$openUpward ? "calc(100% + 0.50rem)" : "auto")};
  left: ${(props) => (props.$alignRight ? "auto" : "-40px")};
  right: ${(props) => (props.$alignRight ? "0" : "auto")};
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  padding: 0.75rem;
  max-height: 140px;
  max-width: min(18rem, calc(100vw - 1rem));
  overflow-y: auto;
  overflow-x: hidden;
  animation: ${fadeIn} 0.15s ease-out;
  min-width: 100px;
`;

export const QuotationCategoryGroup = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const QuotationCategoryTitle = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const QuotationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.2rem;
`;

interface QuotationItemProps {
  $selected?: boolean;
}

export const QuotationGridItem = styled.button<QuotationItemProps>`
  padding: 0.5rem;
  min-height: 44px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-6, #e5e4e7)")};
  border-radius: 0.375rem;
  background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-4, #f9fafb)")};
  color: ${(props) => (props.$selected ? "var(--text)" : "var(--text-secondary)")};
  cursor: pointer;
  font-size: 1.35rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-5, #f3f4f6)")};
    border-color: var(--accent);
    transform: scale(1.05);
  }
`;

// Alignment Selector Styles
export const AlignmentSelectorButton = styled.button`
  box-sizing: content-box;
  padding: 0.3rem 0.2rem 0.3rem 0.5rem;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text);
  font-size: 1.25rem;
  min-width: 2.5rem;
  text-align: center;
  position: relative;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--bg-5);
  }
`;

export const AlignmentDropdownContainer = styled.div`
  position: relative;
`;

export const AlignmentDropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 0.50rem);
  left: -40px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  padding: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  animation: ${fadeIn} 0.15s ease-out;
  min-width: 150px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem;
`;

interface AlignmentItemProps {
  $selected?: boolean;
}

export const AlignmentGridItem = styled.button<AlignmentItemProps>`
  padding: 0.5rem;
  min-height: 44px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-6, #e5e4e7)")};
  border-radius: 0.375rem;
  background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-4, #f9fafb)")};
  color: ${(props) => (props.$selected ? "var(--text)" : "var(--text-secondary)")};
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-5, #f3f4f6)")};
    border-color: var(--accent);
    transform: scale(1.05);
  }
`;

export const ToggleGroup = styled(Toolbar.ToggleGroup)`
  display: flex;
  flex-shrink: 0;
  gap: 0.25rem;
`;

const toggleItemBase = css`
  padding: 0.5rem;
  min-width: 40px;
  min-height: 40px;
  border-radius: 0.375rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ToggleItemProps {
  $active?: boolean;
}

export const ToggleItem = styled(Toolbar.ToggleItem)<ToggleItemProps>`
  ${toggleItemBase}
  background-color: ${(props) => (props.$active ? "var(--accent)" : "var(--bg-4, #f9fafb)")};
  color: ${(props) => (props.$active ? "var(--text)" : "var(--text-secondary)")};

  &:hover {
    background-color: ${(props) => (props.$active ? "var(--accent)" : "var(--bg-5, #f3f4f6)")};
  }
`;

export const EditorWrapper = styled.div<{ $fullPage?: boolean }>`
  position: relative;
  box-sizing: border-box;
  ${(p) =>
    p.$fullPage &&
    `
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  `}
`;

const richTextContentBase = css`
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: var(--font-size-input);

  ul,
  ol {
    padding-left: 1.25rem;
    margin-left: 0;
  }

  li {
    margin-left: 0;
  }

  /* Custom bullet styles - disable default numbering */
  ul[style*="list-style-type: bullet"],
  ul[style*="list-style-type: middle-dot"],
  ul[style*="list-style-type: white-circle"],
  ul[style*="list-style-type: black-circle"],
  ul[style*="list-style-type: fisheye"],
  ul[style*="list-style-type: circled-dot"],
  ul[style*="list-style-type: circled-ring"],
  ul[style*="list-style-type: circled-asterisk"],
  ul[style*="list-style-type: dotted-circle"],
  ul[style*="list-style-type: circle-vertical-fill"],
  ul[style*="list-style-type: bullseye"],
  ul[style*="list-style-type: white-bullet"],
  ul[style*="list-style-type: sun"],
  ul[style*="list-style-type: circled-white"],
  ul[style*="list-style-type: circled-black"],
  ul[style*="list-style-type: hyphen-bullet"],
  ul[style*="list-style-type: left-bullet"],
  ul[style*="list-style-type: right-bullet"],
  ul[style*="list-style-type: black-diamond"],
  ul[style*="list-style-type: white-diamond"],
  ul[style*="list-style-type: white-diamond-black"],
  ul[style*="list-style-type: black-star"],
  ul[style*="list-style-type: white-star"],
  ul[style*="list-style-type: black-square"],
  ul[style*="list-style-type: white-square"],
  ul[style*="list-style-type: small-square-filled"],
  ul[style*="list-style-type: small-filled"],
  ul[style*="list-style-type: inverse-bullet"],
  ul[style*="list-style-type: ballot-box"],
  ul[style*="list-style-type: ballot-box-check"],
  ul[style*="list-style-type: ballot-box-x"],
  ul[style*="list-style-type: check-mark"],
  ul[style*="list-style-type: heavy-check-mark"],
  ul[style*="list-style-type: rotated-heavy-heart"],
  ul[style*="list-style-type: rotated-floral-heart"],
  ul[style*="list-style-type: reversed-floral-heart"],
  ul[style*="list-style-type: dharma-wheel"],
  ul[style*="list-style-type: asterisk-four-spoke"],
  ul[style*="list-style-type: heavy-asterisk"],
  ul[style*="list-style-type: open-asterisk"],
  ul[style*="list-style-type: small-triangle"],
  ul[style*="list-style-type: white-small-triangle"],
  ul[style*="list-style-type: triangle-right"],
  ul[style*="list-style-type: white-triangle-right"],
  ul[style*="list-style-type: pointer"],
  ul[style*="list-style-type: white-pointer"],
  ul[style*="list-style-type: triangular-bullet"],
  ul[style*="list-style-type: arrow-two-head"],
  ul[style*="list-style-type: arrow-tail"],
  ul[style*="list-style-type: arrow-bar"],
  ul[style*="list-style-type: arrow-loop"],
  ul[style*="list-style-type: arrow-triple"],
  ul[style*="list-style-type: arrow-squiggle"],
  ul[style*="list-style-type: arrow-dashed"],
  ul[style*="list-style-type: arrow-white"],
  ul[style*="list-style-type: arrow-heavy"],
  ul[style*="list-style-type: arrow-heavy-right"],
  ul[style*="list-style-type: arrow-drafting"],
  ul[style*="list-style-type: arrow-round"],
  ul[style*="list-style-type: arrow-triangle-head"],
  ul[style*="list-style-type: arrow-triangle-heavy"],
  ul[style*="list-style-type: arrow-triangle-dashed"],
  ul[style*="list-style-type: arrow-triangle-heavy-dashed"],
  ul[style*="list-style-type: arrow-black"],
  ul[style*="list-style-type: arrow-top-light"],
  ul[style*="list-style-type: arrow-bottom-light"],
  ul[style*="list-style-type: arrowhead-black"],
  ul[style*="list-style-type: arrow-curved-down"],
  ul[style*="list-style-type: arrow-curved-up"],
  ul[style*="list-style-type: arrow-squat"],
  ul[style*="list-style-type: arrow-concave"],
  ul[style*="list-style-type: arrow-shadowed"],
  ul[style*="list-style-type: arrow-notched"],
  ul[style*="list-style-type: arrow-circled"],
  ul[style*="list-style-type: arrow-feathered"],
  ul[style*="list-style-type: arrow-feathered-black"],
  ul[style*="list-style-type: arrow-feathered-heavy"],
  ul[style*="list-style-type: arrow-wedge"],
  ul[style*="list-style-type: arrow-wedge-heavy"],
  ul[style*="list-style-type: arrow-open-outline"],
  ul[style*="list-style-type: arrow-simple"],
  ul[style*="list-style-type: arrow-open-head"],
  ul[style*="list-style-type: arrow-double"] {
    list-style: none !important;
    padding-left: 1.25rem;
  }

  /* Basic Bullets */
  ul[style*="list-style-type: bullet"] li::before { content: "• "; }
  ul[style*="list-style-type: middle-dot"] li::before { content: "· "; }
  ul[style*="list-style-type: white-circle"] li::before { content: "○ "; }
  ul[style*="list-style-type: black-circle"] li::before { content: "● "; }
  ul[style*="list-style-type: fisheye"] li::before { content: "◉ "; }

  /* Circle Variants */
  ul[style*="list-style-type: circled-dot"] li::before { content: "⊙ "; }
  ul[style*="list-style-type: circled-ring"] li::before { content: "⊚ "; }
  ul[style*="list-style-type: circled-asterisk"] li::before { content: "⊛ "; }
  ul[style*="list-style-type: dotted-circle"] li::before { content: "◌ "; }
  ul[style*="list-style-type: circle-vertical-fill"] li::before { content: "◍ "; }
  ul[style*="list-style-type: bullseye"] li::before { content: "◎ "; }
  ul[style*="list-style-type: white-bullet"] li::before { content: "◦ "; }
  ul[style*="list-style-type: sun"] li::before { content: "☉ "; }
  ul[style*="list-style-type: circled-white"] li::before { content: "⦾ "; }
  ul[style*="list-style-type: circled-black"] li::before { content: "⦿ "; }

  /* Dashes & Special */
  ul[style*="list-style-type: hyphen-bullet"] li::before { content: "⁃ "; }
  ul[style*="list-style-type: left-bullet"] li::before { content: "⁌ "; }
  ul[style*="list-style-type: right-bullet"] li::before { content: "⁍ "; }

  /* Diamonds */
  ul[style*="list-style-type: black-diamond"] li::before { content: "◆ "; }
  ul[style*="list-style-type: white-diamond"] li::before { content: "◇ "; }
  ul[style*="list-style-type: white-diamond-black"] li::before { content: "◈ "; }

  /* Stars */
  ul[style*="list-style-type: black-star"] li::before { content: "★ "; }
  ul[style*="list-style-type: white-star"] li::before { content: "☆ "; }

  /* Squares & Boxes */
  ul[style*="list-style-type: black-square"] li::before { content: "■ "; }
  ul[style*="list-style-type: white-square"] li::before { content: "□ "; }
  ul[style*="list-style-type: small-square-filled"] li::before { content: "◾ "; }
  ul[style*="list-style-type: small-filled"] li::before { content: "▪ "; }
  ul[style*="list-style-type: inverse-bullet"] li::before { content: "◘ "; }

  /* Checkmarks & Boxes */
  ul[style*="list-style-type: ballot-box"] li::before { content: "☐ "; }
  ul[style*="list-style-type: ballot-box-check"] li::before { content: "☑ "; }
  ul[style*="list-style-type: ballot-box-x"] li::before { content: "☒ "; }
  ul[style*="list-style-type: check-mark"] li::before { content: "✓ "; }
  ul[style*="list-style-type: heavy-check-mark"] li::before { content: "✔ "; }

  /* Decorative */
  ul[style*="list-style-type: rotated-heavy-heart"] li::before { content: "❥ "; }
  ul[style*="list-style-type: rotated-floral-heart"] li::before { content: "❧ "; }
  ul[style*="list-style-type: reversed-floral-heart"] li::before { content: "☙ "; }
  ul[style*="list-style-type: dharma-wheel"] li::before { content: "☸ "; }
  ul[style*="list-style-type: asterisk-four-spoke"] li::before { content: "✤ "; }
  ul[style*="list-style-type: heavy-asterisk"] li::before { content: "✱ "; }
  ul[style*="list-style-type: open-asterisk"] li::before { content: "✲ "; }

  /* Triangles & Pointers */
  ul[style*="list-style-type: small-triangle"] li::before { content: "▸ "; }
  ul[style*="list-style-type: white-small-triangle"] li::before { content: "▹ "; }
  ul[style*="list-style-type: triangle-right"] li::before { content: "▶ "; }
  ul[style*="list-style-type: white-triangle-right"] li::before { content: "▷ "; }
  ul[style*="list-style-type: pointer"] li::before { content: "► "; }
  ul[style*="list-style-type: white-pointer"] li::before { content: "▻ "; }
  ul[style*="list-style-type: triangular-bullet"] li::before { content: "‣ "; }

  /* Arrows */
  ul[style*="list-style-type: arrow-two-head"] li::before { content: "↠ "; }
  ul[style*="list-style-type: arrow-tail"] li::before { content: "↣ "; }
  ul[style*="list-style-type: arrow-bar"] li::before { content: "↦ "; }
  ul[style*="list-style-type: arrow-loop"] li::before { content: "↬ "; }
  ul[style*="list-style-type: arrow-triple"] li::before { content: "⇛ "; }
  ul[style*="list-style-type: arrow-squiggle"] li::before { content: "⇝ "; }
  ul[style*="list-style-type: arrow-dashed"] li::before { content: "⇢ "; }
  ul[style*="list-style-type: arrow-white"] li::before { content: "⇨ "; }
  ul[style*="list-style-type: arrow-heavy"] li::before { content: "➔ "; }
  ul[style*="list-style-type: arrow-heavy-right"] li::before { content: "➙ "; }
  ul[style*="list-style-type: arrow-drafting"] li::before { content: "➛ "; }
  ul[style*="list-style-type: arrow-round"] li::before { content: "➜ "; }
  ul[style*="list-style-type: arrow-triangle-head"] li::before { content: "➝ "; }
  ul[style*="list-style-type: arrow-triangle-heavy"] li::before { content: "➞ "; }
  ul[style*="list-style-type: arrow-triangle-dashed"] li::before { content: "➟ "; }
  ul[style*="list-style-type: arrow-triangle-heavy-dashed"] li::before { content: "➠ "; }
  ul[style*="list-style-type: arrow-black"] li::before { content: "➡ "; }
  ul[style*="list-style-type: arrow-top-light"] li::before { content: "➢ "; }
  ul[style*="list-style-type: arrow-bottom-light"] li::before { content: "➣ "; }
  ul[style*="list-style-type: arrowhead-black"] li::before { content: "➤ "; }
  ul[style*="list-style-type: arrow-curved-down"] li::before { content: "➥ "; }
  ul[style*="list-style-type: arrow-curved-up"] li::before { content: "➦ "; }
  ul[style*="list-style-type: arrow-squat"] li::before { content: "➧ "; }
  ul[style*="list-style-type: arrow-concave"] li::before { content: "➨ "; }
  ul[style*="list-style-type: arrow-shadowed"] li::before { content: "➮ "; }
  ul[style*="list-style-type: arrow-notched"] li::before { content: "➱ "; }
  ul[style*="list-style-type: arrow-circled"] li::before { content: "➲ "; }
  ul[style*="list-style-type: arrow-feathered"] li::before { content: "➳ "; }
  ul[style*="list-style-type: arrow-feathered-black"] li::before { content: "➵ "; }
  ul[style*="list-style-type: arrow-feathered-heavy"] li::before { content: "➸ "; }
  ul[style*="list-style-type: arrow-wedge"] li::before { content: "➼ "; }
  ul[style*="list-style-type: arrow-wedge-heavy"] li::before { content: "➽ "; }
  ul[style*="list-style-type: arrow-open-outline"] li::before { content: "➾ "; }
  ul[style*="list-style-type: arrow-simple"] li::before { content: "→ "; }
  ul[style*="list-style-type: arrow-open-head"] li::before { content: "⇾ "; }
  ul[style*="list-style-type: arrow-double"] li::before { content: "⇒ "; }

  ${mentionChildrenCss}

  .inline-image-container {
    display: inline-block;
    position: relative;
    vertical-align: middle;
    margin: 0 4px;
  }

  .inline-image {
    max-width: 300px;
    max-height: 300px;
    min-width: 100px;
    min-height: 100px;
    width: auto;
    height: auto;
    border-radius: 4px;
    object-fit: contain;
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: scale(1.02);
    }
  }
`;

interface EditorContentProps {
  $dropdownOpen?: boolean;
  $fullPage?: boolean;
}

export const EditorContent = styled.div<EditorContentProps>`
  box-sizing: border-box;
  width: 100%;
  min-height: ${(p) => (p.$fullPage ? "0" : "10rem")};
  max-height: ${(p) => (p.$fullPage ? "none" : "20dvh")};
  ${(p) => p.$fullPage && "flex: 1;"}
  background-color: var(--bg-3);
  padding: 1rem;
  outline: none;
  overflow: auto;
  ${richTextContentBase}
  ${editorMentionTagCss}

  &:focus {
    outline: none;
    box-shadow: ${(p) =>
      p.$dropdownOpen ? "none" : "inset 0 0 0 2px var(--accent)"};
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }
`;

export const FadeOverlay = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 3rem;
  pointer-events: none;

  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    var(--bg-3) 90%
  );
`;

export const ContentWrapper = styled.div<{ $animating: boolean }>`
  position: relative;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;

  ${({ $animating }) => $animating && "will-change: max-height;"}
`;

export const Toggle = styled.button`
    padding: 2px 12px;
    border: 1px solid var(--accent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: var(--font-size-h6);
    font-weight: 700;
    font-style: italic;
    color: var(--accent);
    white-space: nowrap;
    transition: all 0.2s ease;

  &:hover {
    cursor: pointer;
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }

  @container (max-width: 600px) {
    & {
      font-size: var(--font-size-input);
    }
  }
`;

export const SavedContent = styled.div`
  width: 100%;
  outline: none;
  overflow: auto;
  ${richTextContentBase}
  ${savedMentionTagCss}
`;

export const PopoverAnchor = styled(Popover.Anchor)`
  position: absolute;
`;

export const PopoverContent = styled(Popover.Content)`
  width: 20rem;
  background-color: var(--bg-3);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--bg-6);
  z-index: 50;
  animation: ${fadeIn} 0.15s ease-out;
`;

export const SaveButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--accent);
  color: var(--text);
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
  background-color: var(--accent-hover);
  }
`;
