import { Popover, Tabs, Toolbar } from "radix-ui";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import styled, { css, keyframes } from "styled-components";

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

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingWrapper = styled.div`
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Spinner = styled(AiOutlineLoading3Quarters)`
  animation: ${spin} 0.8s linear infinite;
  font-size: 1.5rem;
  opacity: 0.7;
`;

export const Container = styled.div`
  width: 100%;
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

export const ToolbarRoot = styled(Toolbar.Root)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.25rem;
  background-color: var(--bg-4);
  border: 1px solid var(--bg-6);
`;

export const ToolbarSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
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
  padding: 0.5rem;
  padding-right: 2rem;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text);
  -moz-appearance: none; /* Firefox */
  -webkit-appearance: none; /* Safari and Chrome */
  appearance: none;
  max-height: 200px;
  overflow-y: auto;

  &:hover {
    background-color: var(--bg-5);
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
  padding: 0px;
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-6)")};
  border-radius: 0.25rem;
  background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-4)")};
  color: ${(props) => (props.$selected ? "var(--text)" : "var(--text-secondary)")};
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;

  &:hover {
    background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-5)")};
    border-color: var(--accent);
    transform: scale(1.05);
  }
`;

export const Divider = styled.div`
  width: 1px;
  height: 2rem;
  background-color: var(--bg-6);
  margin: 0 0.25rem;
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

export const QuotationDropdownPanel = styled.div`
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
  padding: 0px;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-4);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;

  &:hover {
    background-color: var(--bg-5);
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
  border: 1px solid ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-6)")};
  border-radius: 0.25rem;
  background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-4)")};
  color: ${(props) => (props.$selected ? "var(--text)" : "var(--text-secondary)")};
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  justify-content: center;
  aspect-ratio: 1;

  span {
    font-size: 0.65rem;
    text-align: center;
    line-height: 1;
  }

  &:hover {
    background-color: ${(props) => (props.$selected ? "var(--accent)" : "var(--bg-5)")};
    border-color: var(--accent);
    transform: scale(1.05);
  }
`;

export const ToggleGroup = styled(Toolbar.ToggleGroup)`
  display: flex;
  gap: 0.25rem;
`;

const toggleItemBase = css`
  padding: 0.5rem;
  border-radius: 0.25rem;
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
  background-color: ${(props) => (props.$active ? "var(--accent)" : "var(--text-background)")};
  color: ${(props) => (props.$active ? "var(--text)" : "var(--text-secondary)")};

  &:hover {
    background-color: ${(props) => (props.$active ? "var(--accent)" : "var(--hover-background)")};
  }
`;

export const EditorWrapper = styled.div`
  position: relative;
`;

export const EditorContent = styled.div`
  width: 100%;
  min-height: 10rem;
  max-height: 20dvh;
  padding: 1rem;
  border-left: 1px solid var(--bg-6);
  border-right: 1px solid var(--bg-6);
  border-bottom: 1px solid var(--bg-6);
  outline: none;
  overflow: auto;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: var(--font-size-input);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accent);
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }

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

.mention-tag {
  display: inline-flex;
  align-items: center;
  min-width: 70px;
  position: relative;
  top: 6px;
  gap: 4px; /* 👈 space between avatar and text */

  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-hover) 70%
  );
  color: var(--text, var(--text));
  padding: 1px 6px 1px 2px;
  border-radius: 999px;
  font-weight: var(--font-weight-semi-bold);
  user-select: none;
  font-size: var(--font-size);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--accent-hover) 0%,
      var(--accent-active, var(--accent-hover)) 100%
    );
  }
}

.mention-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.mention-text {
  white-space: nowrap;
}

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
  /* border: 2px solid var(--bg-6); */
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

.mention-tag {
  display: inline-flex;
  align-items: center;
  position: relative;
  top: 6px;
  min-width: 70px;
  gap: 6px; /* 👈 space between avatar and text */
  cursor: pointer;

  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-hover) 70%
  );
  color: var(--text, var(--text));
  padding: 1px 6px 1px 2px;
  border-radius: 999px;
  font-weight: var(--font-weight-bold);
  margin: 2px;
  user-select: none;
  font-size: var(--font-size);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--accent-hover) 0%,
      var(--accent-active, var(--accent-hover)) 100%
    );
  }
}

.mention-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.mention-text {
  white-space: nowrap;
}

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
  border-radius: 0.5rem;
  border: 2px solid var(--bg-6);
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

export const TabsList = styled(Tabs.List)`
  display: flex;
  border-bottom: 1px solid var(--bg-6);
`;

export const TabsTrigger = styled(Tabs.Trigger)`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;

  &:hover {
    color: var(--text);
    background-color: var(--accent);
  }

  &[data-state='active'] {
    color: var(--text);
    background-color: var(--accent);
  }
`;

export const TabsContent = styled(Tabs.Content)`
  max-height: 16rem;
  overflow-y: auto;
`;

interface MenuItemProps {
  $focused?: boolean;
}

export const MentionItem = styled.button<MenuItemProps>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem;
  transition: all 0.2s;
  text-align: left;
  border: none;
  cursor: pointer;
  background-color: ${(props) => (props.$focused ? "var(--accent)" : "var(--text-background)")};
  color: ${(props) => (props.$focused ? "var(--text)" : "var(--text-secondary)")};

  &:hover {
    background-color: var(--accent);
  }

  .avatar {
    height: 30px;
    width: 30px;
  }
`;

export const MentionIcon = styled.span`
  font-size: 1.5rem;
`;

export const MentionName = styled.span`
  color: var(--text);
`;

export const EmptyMessage = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  color: #6b7280;
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
