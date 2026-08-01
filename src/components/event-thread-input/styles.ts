import { Avatar, Form, Select } from "radix-ui";
import styled from "styled-components";

export const EventThreadInputRoot = styled.div`
  width: 100%;
  margin: 0 auto;
  position: relative;
  background-color: var(--bg-2);
  /* Top room clears the top-right action row (media + insert dialog). */
  padding: 44px 16px 12px;

  /* On mobile drop the horizontal padding to give the input all the room. */
  @media (max-width: 680px) {
    padding: 42px 0 8px;
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: var(--font-size);
    font-family: var(--font);
    color: var(--text);
  }

  .prompt-input-privacy-select {
    position: absolute;
    top: 20px;
    right: 16px;
  }

  /* Inline (on-page) variant: the composer sits directly on a manuscript
     page, so it sheds the boxed chrome — transparent surface, no side
     padding, a shorter default editor — and reads as part of the page. */
  &.inline {
    background-color: transparent;
    padding: 40px 0 4px;

    @media (max-width: 680px) {
      padding: 40px 0 4px;
    }

    [data-placeholder] {
      min-height: 140px;
    }
  }
`;

export const TextInputContainer = styled(Form.Field)`
  display: flex;
  flex-direction: column;

  margin-block: 12px;

  /* Taller default editor surface so there is more room to write. Targets the
     editor surface only (it carries data-placeholder) — not the editable
     dialog lines inside it. Kept before the mobile query so that override wins
     on small screens. */
  [data-placeholder] {
    min-height: 260px;
  }

  /* Give the composer more vertical room on mobile and drop the block margin
     so the input reaches the container edges. */
  @media (max-width: 680px) {
    margin-block: 6px 0;

    [data-placeholder] {
      min-height: 220px;
      max-height: 42dvh;
    }
  }

  textarea {
    background-color: var(--bg-3);
    padding: 8px;
    border-radius: 4px;
    border: none;
    color: var(--text);
    font-size: var(--font-size-input);
    resize: none;
    min-height: 100px;

    &:focus {
      outline: 1.5px solid var(--accent);
    }

    &[data-invalid="true"] {
      outline: 1.5px solid var(--tomato-a9);
    }
  }

  .form-message {
    margin-top: 4px;
    font-size: var(--font-size-small);
  }
`;

const SelectBase = styled(Form.Field)`
  button {
    all: unset;
  }

  display: flex;
  flex-direction: row;
  align-items: center;

  .form-label {
    margin-right: 8px;
  }

  .select-trigger {
    min-width: 180px;
    background-color: var(--bg-3);
    border: 0.85px solid var(--bg-6);
    padding: 6px 8px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--text);
    font-size: var(--font-size);
    font-family: var(--font);
    user-select: none;

    &:focus {
      outline: 1.5px solid var(--accent);
    }

    .select-value {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-grow: 1;
      color: var(--text);
      font-size: var(--font-size);
      font-family: var(--font);
    }

    .select-icon {
      width: 16px;
      height: 16px;
      color: var(--text);
    }
  }
`;

const SelectPortalBase = styled(Select.Portal)`
  max-height: 200px;
  min-width: 220px;
  scroll-behavior: smooth;
  overflow: hidden;
  background-color: var(--bg-3);
  border: 0.85px solid var(--bg-6);
  border-radius: 2px;
  padding: 4px 4px;

  .select-viewport {
    display: flex;
    flex-direction: column;
    padding-top: 5px;

    .separator[data-orientation="horizontal"] {
      height: 1px;
      width: 100%;
      margin-block: 5px;
      background-color: var(--bg-6);
    }
  }

  .select-item {
    scroll-snap-align: start;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 4px 8px;
    position: relative;
    user-select: none;
    cursor: pointer;
    position: relative;
    color: var(--text);
    font-size: var(--font-size);
    font-family: var(--font);
    border-top: 0.85px solid transparent;

    &:hover {
      background-color: var(--bg-5);
      border-radius: 4px;

      & + .select-item {
        border-top: 0.85px solid transparent !important;
      }
    }

    &:focus {
      outline: none;
      background-color: var(--bg-5);
      border-radius: 4px;
    }

    &[data-state="unchecked"] {
      padding-left: 30px;
    }

    &:not(:first-child):not(:hover) {
      border-top: 0.85px solid var(--bg-5);
    }

    .select-item-indicator {
      width: 12px;
      display: flex;
      align-items: center;
      justify-content: start;

      svg {
        width: 10px;
        height: 10px;
        color: var(--accent-8);
      }
    }
  }
`;

export const MuseSelect = styled(SelectBase)`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  .form-label {
    margin-bottom: 4px;
  }
`;

export const MuseSelectPortal = styled(SelectPortalBase)``;

export const SelectGroupLabel = styled.div`
  padding: 6px;
  font-size: var(--font-size-xsmall);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  pointer-events: none;
`;

export const DialogueLabel = styled(SelectGroupLabel)`
  opacity: 0.7;
  margin-bottom: 4px;
`;

export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  font-size: var(--font-size-xsmall);
  letter-spacing: 0.08em;
  color: var(--text-muted);
  pointer-events: none;
  color: var(--text);

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
  }
`;

export const MuseAvatarRoot = styled(Avatar.Root)`
  display: inline-flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--bg-2);
    color: var(--text);
    font-size: var(--font-size-small);
  }
`;

export const DialogInsertSlot = styled.div`
  position: absolute;
  top: 6px;
  right: 16px;

  /* The inline page composer has no side padding to clear. */
  .inline & {
    right: 0;
  }
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

export const DialogInsertButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: fit-content;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size);
  font-family: var(--font);
  color: var(--text);
  padding: 0 10px;
  border-radius: 4px;
  background-color: var(--accent);

  &:hover {
    background-color: var(--accent-hover);
  }

  &:active {
    background-color: var(--accent-active);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  /* Collapse to an icon-only square on small screens so the media + insert
     cluster clears the centered collapse toggle. */
  @media (max-width: 480px) {
    width: 32px;
    padding: 0;
    justify-content: center;

    .label {
      display: none;
    }
  }
`;

export const DialogInsertPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(320px, calc(100vw - 2rem));
  padding: 12px;
  border-radius: 8px;
  background-color: var(--bg-3);
  border: 0.85px solid var(--bg-6);
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.35);
  z-index: 50;

  textarea {
    background-color: var(--bg-2);
    padding: 8px;
    border-radius: 4px;
    border: none;
    color: var(--text);
    font-size: var(--font-size-input);
    font-family: var(--font);
    resize: none;

    &:focus {
      outline: 1.5px solid var(--accent);
    }
  }
`;

export const DialogComposeToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const DialogFormatButton = styled.button<{ $active?: boolean }>`
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--text);
  background-color: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-5)")};

  &:hover {
    background-color: ${(p) => (p.$active ? "var(--accent-hover)" : "var(--bg-6)")};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const DialogFontSelect = styled.select`
  cursor: pointer;
  height: 28px;
  max-width: 140px;
  padding: 0 6px;
  border-radius: 4px;
  border: 0.85px solid var(--bg-6);
  background-color: var(--bg-5);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);

  &:focus {
    outline: 1.5px solid var(--accent);
  }
`;

export const DialogComposeEditable = styled.div`
  min-height: 60px;
  max-height: 160px;
  overflow-y: auto;
  background-color: var(--bg-2);
  padding: 8px;
  border-radius: 4px;
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  white-space: pre-wrap;
  word-break: break-word;
  outline: none;

  &:focus {
    outline: 1.5px solid var(--accent);
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: var(--text-muted, #9ca3af);
    pointer-events: none;
  }
`;

export const DialogInsertLabel = styled.span`
  font-size: var(--font-size-small);
  font-family: var(--font);
  color: var(--text);
  opacity: 0.8;
`;

export const DialogMuseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 160px;
  overflow-y: auto;
`;

export const DialogMuseOption = styled.button<{ $selected?: boolean }>`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  background-color: ${(p) => (p.$selected ? "var(--bg-5)" : "transparent")};
  outline: ${(p) => (p.$selected ? "1.5px solid var(--accent)" : "none")};

  &:hover {
    background-color: var(--bg-5);
  }

  .muse-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .anonymous-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: var(--bg-6);
    font-weight: var(--font-weight-bold);
  }
`;

export const DialogInsertActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    all: unset;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 2px;
    font-size: var(--font-size);
    font-family: var(--font);
    color: var(--text);

    &.cancel {
      background-color: var(--bg-5);

      &:hover {
        background-color: var(--bg-6);
      }
    }

    &.insert {
      background-color: var(--accent);

      &:hover:not(:disabled) {
        background-color: var(--accent-hover);
      }

      &:disabled {
        background-color: #555;
        cursor: not-allowed;
      }
    }
  }
`;

/* Save/Cancel row for the inline (on-page) composer — textual buttons in the
   page's corner instead of the floating circular send button. */
export const InlineActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;

  button {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 4px;
    font-size: var(--font-size-small);
    font-family: var(--font);
    color: var(--text);

    &.cancel {
      background-color: var(--bg-5);

      &:hover {
        background-color: var(--bg-6);
      }
    }

    &.save {
      background-color: var(--accent);

      &:hover:not(:disabled) {
        background-color: var(--accent-hover);
      }

      &:active:not(:disabled) {
        background-color: var(--accent-active);
      }

      &:disabled {
        opacity: 0.55;
        cursor: default;
      }
    }

    &:focus-visible {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
  }
`;

export const MediaActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ToolButton = styled.button`
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
    width: 18px;
    height: 18px;
  }

  &:hover {
    background-color: var(--accent-hover);
  }

  &:active {
    background-color: var(--accent-active);
  }
`;

export const MediaSelect = styled(Form.Field)`
  display: flex;
  flex-direction: column;

  .media-input {
    display: none;
  }

  .form-label {
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: var(--accent);
    color: var(--text);

    &:hover {
      background-color: var(--accent-hover);
    }

    &:active {
      background-color: var(--accent-active);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const MediaPreviewRoot = styled.div`
border: 1px solid red;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  position: relative;

  height: 150px;
  width: 150px;

  .media-preview-image {
    object-fit: contain;
    background-color: #000;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &.uploading {
      filter: grayscale(60%);
    }
  }

  .remove-media-button {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    color: var(--text);
    font-size: var(--font-size-small);
    background-color: var(--bg-4);
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 1;

    &:hover,
    &:focus {
      background-color: var(--tomato-5);
      & + .media-preview-image {
        outline: 1.5px solid var(--tomato-8);
      }
    }

    &:active {
      background-color: var(--tomato-6);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

/* Floating send button in the bottom-right corner of the input. It fades /
   scales in only when there is something to submit (IceBreaker-style). */
export const SubmitButton = styled.button<{ $visible?: boolean }>`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  bottom: 12px;
  right: 14px;
  z-index: 6;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  background-color: var(--accent);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transform: ${(p) => (p.$visible ? "scale(1)" : "scale(0.6)")};
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  transition: opacity 0.15s ease, transform 0.15s ease,
    background-color 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:not(:disabled) {
    &:hover {
      background-color: var(--accent-hover);
    }

    &:active {
      background-color: var(--accent-active);
      transform: scale(0.94);
    }
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: ${(p) => (p.$visible ? 0.65 : 0)};
    cursor: default;
  }

  @media (max-width: 680px) {
    right: 10px;
    bottom: 10px;
  }
`;
