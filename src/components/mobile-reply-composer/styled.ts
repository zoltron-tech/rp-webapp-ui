import styled from "styled-components";

/** Bottom reply bar — hidden on desktop, natural flex child at the bottom of
 * the thread's fixed-height column on mobile. */
export const ComposerRoot = styled.div`
  @media (min-width: 801px) {
    display: none;
  }

  flex-shrink: 0;
  background: var(--bg-2);
  border-top: 1px solid var(--bg-6);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.22);
  /* Respect notch/home-indicator on iOS */
  /* padding-bottom: env(safe-area-inset-bottom, 0px); */
  padding-bottom: 20px;
  /* Allow the bar itself to scroll if content grows very tall */
  max-height: 65dvh;
  overflow-y: auto;
`;

/**
 * Top row: sender selector on the left, GIF + Image buttons on the right.
 */
export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 4px;
  border-bottom: 1px solid var(--bg-6);
  background: var(--bg-3);
`;

/**
 * Wraps PromptMuseSelect.
 * Hides only the form label and validation message; name stays visible.
 */
export const MuseWrap = styled.div`
  .form-label {
    display: none;
  }
  .form-message {
    display: none;
  }
`;

/** Pushes media buttons to the right edge of the meta row. */
export const MediaWrap = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
`;

/** Icon button for GIF / Image — matches ToolButton from prompt-input/styles.ts. */
export const MediaIconBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text);
  background-color: var(--accent);
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background-color: var(--accent-hover);
  }

  &:active {
    background-color: var(--accent-active);
  }
`;

/**
 * Rich-text editor area — wraps the full PromptTextField (toolbar + content).
 * Using position:relative + overflow:hidden keeps the scrollable toolbar
 * clipped inside the rounded border. The send button is absolutely positioned
 * at the bottom-right of the content area.
 */
export const EditorArea = styled.div`
  position: relative;
  margin: 8px 12px 4px;
  border-radius: 12px;
  border: 1px solid var(--bg-6);
  overflow: hidden;

  /* Reserve right-side space for just the send button. */
  div[contenteditable] {
    padding-right: 52px;
  }
`;

/** Trailing slot — send button only. */
export const SubmitTrailing = styled.div`
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 2px;
`;

/** Circular send icon button inside the editor area. */
export const SendIconBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text);
  transition: background 0.15s ease;

  &:not(:disabled):hover {
    background: var(--accent-hover);
  }

  &:not(:disabled):active {
    background: var(--accent-active);
  }

  &:disabled {
    background: var(--bg-4);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;
