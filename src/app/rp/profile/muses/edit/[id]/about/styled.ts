import styled, { keyframes } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100dvh - var(--topbar-height, 56px));
  padding-bottom: 3rem;
`;

/* ── Top bar ─────────────────────────────────────────────────────────── */
export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 740px;
  padding: 0.75rem 1rem;

  .icon {
    color: var(--accent);
    flex-shrink: 0;
  }
`;

export const BackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  min-width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s;

  &:hover,
  &:active {
    background-color: var(--bg-5);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const PageTitle = styled.h1`
  flex: 1;
  margin: 0;
  font-size: var(--font-size-h5, 1.25rem);
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* ── Hero / description ──────────────────────────────────────────────── */
export const HeroSection = styled.div`
  width: 100%;
  max-width: 740px;
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Description = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.6;
`;

/* ── Actions row (add button + count) ───────────────────────────────── */
export const ActionsRow = styled.div`
  width: 100%;
  max-width: 740px;
  padding: 0 1rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SectionCount = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: 600;
`;

export const AddButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0.5rem 1.1rem;
  border: 1.5px solid var(--accent);
  border-radius: 50px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 700;
  color: var(--accent);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover,
  &:active {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
  }
`;

/* ── Section list ────────────────────────────────────────────────────── */
export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 740px;
  padding: 0 1rem;
  gap: 0.875rem;
`;

export const SectionCard = styled.div`
  background-color: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
  }
`;

export const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  background-color: var(--bg-3);
  border-bottom: 1px solid var(--bg-6);
`;

export const SectionOrdinal = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: var(--bg-5);
  border-radius: 999px;
  padding: 2px 9px;
`;

export const SectionCardBody = styled.div`
  padding: 0.75rem 0.875rem;
`;

export const SectionImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 280px;
  border-radius: 6px;
  object-fit: contain;
  margin-bottom: 0.75rem;
  cursor: zoom-in;
`;

/* ── Empty state ─────────────────────────────────────────────────────── */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 3rem 1.5rem;
  color: var(--text-secondary);
  text-align: center;
  width: 100%;
  max-width: 740px;

  svg {
    opacity: 0.25;
    width: 56px;
    height: 56px;
  }

  h3 {
    margin: 0;
    font-size: var(--font-size-h6, 1rem);
    font-weight: 700;
    color: var(--text);
    opacity: 0.6;
  }

  p {
    margin: 0;
    font-size: var(--font-size-small);
    line-height: 1.5;
  }
`;

/* ── Bottom sheet (mobile) / inline form panel (desktop) ─────────────────── */

const sheetSlideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

const sheetSlideDown = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
`;

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const overlayFadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const desktopExpandDown = keyframes`
  from { max-height: 0; opacity: 0; }
  to   { max-height: 800px; opacity: 1; }
`;

const desktopCollapseUp = keyframes`
  from { max-height: 800px; opacity: 1; }
  to   { max-height: 0; opacity: 0; }
`;

/**
 * Dark backdrop shown on mobile only when the form sheet is open.
 */
export const SheetOverlay = styled.div<{ $closing?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 499;
  background: rgba(0, 0, 0, 0.55);
  animation: ${({ $closing }) => ($closing ? overlayFadeOut : overlayFadeIn)}
    0.28s ease forwards;

  /* Hide on desktop — no overlay needed for inline form */
  @media (min-width: 769px) {
    display: none;
  }
`;

/**
 * The form container.
 * Mobile  → fixed bottom sheet that slides up / down.
 * Desktop → static block rendered above the section list (inside the page flow).
 */
export const SheetPanel = styled.div<{ $closing?: boolean }>`
  /* ── Mobile ── */
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 500;
    height: calc(100dvh - var(--topbar-height) - 2px);
    border-radius: 16px 16px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.45);
    animation: ${({ $closing }) => ($closing ? sheetSlideDown : sheetSlideUp)}
      0.28s ease forwards;
  }

  /* ── Desktop ── */
  @media (min-width: 769px) {
    width: 100%;
    max-width: 740px;
    padding: 0 1rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: ${({ $closing }) =>
      $closing ? desktopCollapseUp : desktopExpandDown}
      0.28s ease forwards;
  }
`;

/**
 * Visual drag-handle pill shown at the top of the sheet on mobile.
 */
export const SheetHandle = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--bg-5);
  margin: 10px auto 6px;

  /* Not needed on desktop */
  @media (min-width: 769px) {
    display: none;
  }
`;

/* ── Favorite Quote block ────────────────────────────────────────────── */
export const QuoteBlock = styled.div`
  width: 100%;
  max-width: 740px;
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const QuoteLabel = styled.label`
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--text-secondary);
  font-family: var(--font);
  font-style: italic;
`;

export const QuoteTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-3);
  border: 1.5px solid var(--bg-6);
  border-radius: 6px;
  padding: 8px 10px;
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);
  resize: none;
  line-height: 1.5;
  transition: border-color 0.15s;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
    font-style: italic;
  }

  &:hover {
    border-color: var(--bg-8);
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

export const QuoteFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const QuoteCharCount = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-family: var(--font);

  &.warn {
    color: var(--amber-9);
  }
`;

export const QuoteSaveButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.35rem 1rem;
  border-radius: 50px;
  background: var(--accent);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 700;
  color: #fff;
  transition: opacity 0.15s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
