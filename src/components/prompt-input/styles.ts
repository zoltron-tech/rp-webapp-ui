import { Avatar, Form, Select } from "radix-ui";
import styled from "styled-components";
import { Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

/* ─── Full-page prompt input layout ─────────────────────────────────────── */

export const FPRoot = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100dvh - var(--topbar-height) - 2px);
  width: 100%;
  background-color: var(--bg-2);
  overflow: hidden;
  z-index: ${Z_INDEX.PROMPT_OVERLAY};
`;

export const FPTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: var(--bg-3);
  border-bottom: 1px solid var(--bg-6);
  flex-shrink: 0;
`;

export const FPBackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--bg-5);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const FPTopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FPMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-3);
  border-bottom: 1px solid var(--bg-6);
  flex-shrink: 0;
  flex-wrap: wrap;
`;

export const FPMetaRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const FPEditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
`;

export const FPSharedWith = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const FPSubmitButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 2px;
  background-color: var(--accent);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-button);
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:disabled) {
    &:hover {
      background-color: var(--accent-hover);
    }

    &:active {
      background-color: var(--accent-active);
    }
  }

  &:focus {
    outline: 1.5px solid #fff;
    outline-offset: 1.5px;
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

/* ─── End full-page ─────────────────────────────────────────────────────── */

export const PromptTrigger = styled.button`
  all: unset;
  cursor: pointer;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 6px 12px;
  border-radius: 4px;

  .plus-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    border-radius: 50%;
    color: var(--text);
    background-color: var(--accent);
  }

  &:not(.open) {
    &:hover {
      /* background-color: var(--bg-3); */
      .plus-icon {
        background-color: var(--accent-hover);
      }
    }

    &:active {
      /* background-color: var(--bg-2); */
      .plus-icon {
        background-color: var(--accent-active);
      }
    }

    &:focus {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
  }

  &.open {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
    margin-top: 8px;
    padding: 6px;
    background-color: #000;
    color: var(--text);

    svg {
      transform: rotate(180deg);
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: var(--accent-hover);
    }

    &:focus {
      outline: 1.5px solid var(--accent);
    }
  }
`;

export const PrivacySelectedFriendAvatar = styled(AvatarNew)`
  height: 22px;
  width: 22px;
  margin-top: 20px;
  cursor: pointer;
`;

export const privacyAvatarMoreIcon = styled.div`
  display: flex;
  background-color: var(--bg-3);
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  width: 28px;
  height: 28px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

    @media screen and (max-width: 430px) {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
`;

export const PromptInputRoot = styled.div<{ $noShell?: boolean }>`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;

  transition-property: padding-top;
  transition-duration: 0.25s;
  transition-timing-function: ease-in-out;

  position: relative;

  /* Matches the Prompt card shell: flat bg-2 surface, soft rounded border.
     Suppressed via $noShell when embedded (thread list, profile) so the input
     blends into its container with no border/radius. */
  &.open {
    padding: 28px 16px 20px;
    background-color: var(--bg-2);

    ${({ $noShell }) =>
      !$noShell &&
      `
      border: 1px solid var(--bg-5);
      box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.85);

      @media screen and (max-width: 800px) {
        padding-inline: 12px;
      }
    `}
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
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
export const TextInputContainer = styled(Form.Field)<{ $fullPage?: boolean }>`
  display: flex;
  flex-direction: column;
  ${(p) => p.$fullPage && "flex: 1; min-height: 0;"}

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
  padding: 4px 8px;

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

export const PrivacySelect = styled(SelectBase)`

  .select-trigger {
    min-width: 34px;
    background-color: transparent;
    border: none;

    &:hover {
      background-color: var(--bg-3);
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

export const PrivacySelectPortal = styled(SelectPortalBase)`
  min-width: 120px;
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

export const MediaActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
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

export const UploadErrorBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.875rem;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--error, #e53e3e) 12%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--error, #e53e3e) 35%, transparent);
  color: var(--error, #e53e3e);
  font-size: var(--font-size-small);
  line-height: 1.4;
  margin-bottom: 0.5rem;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
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

export const SubmitButton = styled.button`
  all: unset;
  position: absolute;
  bottom: 20px;
  right: 16px;
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 2px;
  background-color: var(--accent);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-button);
  margin-right: auto;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:disabled) {
    &:hover {
      background-color: var(--accent-hover);
    }

    &:active {
      background-color: var(--accent-active);
    }
  }

  &:focus {
    outline: 1.5px solid #fff;
    outline-offset: 1.5px;
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

/** Top meta row: sender selector on the left, media buttons on the right. */
export const DesktopMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px 10px;
  border-radius: 4px 4px 0 0;
`;

/** Right side of meta row — media buttons flush right. */
export const DesktopMediaWrap = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
`;

/** Preview of the attached prompt song, with a remove control. */
export const PromptSongPreview = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin: 8px auto 0;
  width: 100%;
  max-width: 460px;

  & > *:first-child {
    flex: 1;
    min-width: 0;
  }

  /* Actual song pill (ProfileSongPlayer's inner Pill element). */
  & > *:first-child > *:first-child {
    padding: 8px;
    border: 1px solid var(--bg-6);
    border-radius: 12px;
  }
`;

export const PromptSongRemove = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--tomato-5);
    color: var(--text);
  }

  &:active {
    transform: scale(0.92);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

/** Wraps PromptTextField; position:relative so the inline send btn can anchor. */
export const DesktopEditorWrap = styled.div`
  position: relative;

  /* Reserve space for the inline circular send button. */
  div[contenteditable] {
    padding-right: 52px;
  }
`;

/** Inline send button — absolute bottom-right of the editor content area. */
export const DesktopSendIconBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 5;
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

// ── Muse-select trigger + dialog ─────────────────────────────────────────────

/** Sender control — makes the posting mode explicit. Muse = in character
 *  (accent), Novelist = out of character (iris), and the "Switch" chip signals
 *  the whole thing is a dropdown. */
export const MuseSelectTrigger = styled.button<{
  $novelist?: boolean;
  $locked?: boolean;
}>`
  && {
    --mode: ${({ $novelist }) => ($novelist ? "#b1a9ff" : "var(--accent)")};
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 5px 6px 5px 5px;
    border: 1px solid
      ${({ $locked }) =>
        $locked
          ? "var(--bg-6)"
          : "color-mix(in srgb, var(--mode) 34%, var(--bg-6))"};
    border-radius: 14px;
    background: ${({ $locked }) =>
      $locked ? "var(--bg-3)" : "color-mix(in srgb, var(--mode) 8%, var(--bg-3))"};
    cursor: ${({ $locked }) => ($locked ? "default" : "pointer")};
    transition: background 0.15s ease, border-color 0.15s ease;

    .mode-fixed {
      background: transparent;
      color: var(--text-secondary);
      font-style: italic;
    }

    .mode-avatar {
      position: relative;
      flex-shrink: 0;
      display: flex;
    }

    .mode-avatar .avatar {
      width: 34px;
      height: 34px;
      min-width: 34px;
      border-radius: 50%;
      box-shadow: 0 0 0 2px var(--bg-3), 0 0 0 3.5px var(--mode);
    }

    .mode-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .mode-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 9.5px;
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--mode);
      white-space: nowrap;
    }

    .mode-eyebrow svg {
      width: 11px;
      height: 11px;
    }

    .mode-name {
      font-size: var(--font-size-small);
      font-family: var(--font);
      font-weight: var(--font-weight-semi-bold);
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }

    .mode-switch {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      margin-left: 2px;
      padding: 3px 9px 3px 6px;
      border-radius: 999px;
      background: var(--bg-4);
      color: var(--text-secondary);
      font-size: var(--font-size-xsmall);
      font-weight: var(--font-weight-semi-bold);
      flex-shrink: 0;
    }

    .mode-switch svg {
      width: 13px;
      height: 13px;
    }

    &:not(:disabled):hover {
      background: color-mix(in srgb, var(--mode) 14%, var(--bg-3));
      border-color: color-mix(in srgb, var(--mode) 55%, var(--bg-6));
    }

    &:not(:disabled):hover .mode-switch {
      background: var(--bg-5);
      color: var(--text);
    }

    &:not(:disabled):focus-visible {
      outline: 1.5px solid var(--mode);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: default;
    }

    @media screen and (max-width: 600px) {
      gap: 8px;

      .mode-name {
        max-width: 108px;
      }

      .mode-switch span {
        display: none;
      }

      .mode-switch {
        padding: 4px;
      }
    }
  }
`;

export const MuseDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 4px;
`;

/** Wrapper that forces FilterSearch to fill the dialog width. */
export const MuseDialogSearchWrap = styled.div`
  padding: 0 2px 10px;

  /* Override FilterSearch's own width / centering constraints */
  > div {
    width: 100%;
    max-width: none;
    margin: 0;
    border-radius: 8px;
  }
`;

export const MuseDialogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  height: min(300px, 52dvh);
  overflow-y: auto;
  /* Explicitly claim vertical touch gestures so the browser starts the
     scroll immediately without deferring to any parent swipe handler. */
  touch-action: pan-y;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 0 2px 4px;

  scrollbar-width: thin;
  scrollbar-color: var(--bg-6) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6);
    border-radius: 4px;
  }
`;

export const MuseDialogListItem = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 8px 14px;
  border-radius: 8px;
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 11%, var(--bg-3))"
      : "transparent"};
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, var(--accent) 30%, transparent)"
        : "transparent"};
  cursor: pointer;
  width: 100%;
  transition:
    background 0.12s ease,
    border-color 0.12s ease;

  /* Left accent bar */
  &::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 22%;
    bottom: 22%;
    width: 3px;
    border-radius: 2px;
    background: ${({ $active }) => ($active ? "var(--accent)" : "transparent")};
    transition: background 0.12s ease;
  }

  .avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
    flex-shrink: 0;
  }

  &:hover {
    background: color-mix(in srgb, var(--accent) 7%, var(--bg-4));
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 1px;
  }
`;

export const MuseDialogSourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

export const MuseDialogSourceName = styled.span`
  font-size: var(--font-size-input);
  color: var(--text);
  font-weight: var(--font-weight-semi-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MuseDialogTypeBadge = styled.span<{ $novelist?: boolean }>`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-family: var(--font);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ $novelist }) =>
    $novelist
      ? "color-mix(in srgb, #b1a9ff 16%, var(--bg-4))"
      : "color-mix(in srgb, var(--accent) 16%, var(--bg-4))"};
  color: var(--text);
  border: 1px solid
    ${({ $novelist }) =>
      $novelist
        ? "color-mix(in srgb, #b1a9ff 35%, transparent)"
        : "color-mix(in srgb, var(--accent) 35%, transparent)"};
`;

export const MuseDialogSelectedMark = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text);
  flex-shrink: 0;
`;

/** Thin label row separating novelist from muse entries. */
export const MuseDialogSectionLabel = styled.div`
  padding: 10px 10px 4px;
  font-size: 10px;
  font-family: var(--font);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-secondary);
  pointer-events: none;
`;

export const MuseDialogEmptyText = styled.p`
  margin: 0;
  padding: 28px 16px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
`;

// ── "Who is posting?" confirm dialog ────────────────────────────────────────

export const NovelistConfirmHeaderBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NovelistConfirmHeaderTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-semi-bold, 600);
  color: var(--text);
`;

export const NovelistConfirmCloseButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }

  &:active {
    transform: scale(0.92);
  }
`;

export const NovelistConfirmBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
  width: 100%;
`;

export const NovelistConfirmOption = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 7%, var(--bg-4));
    border-color: color-mix(in srgb, var(--accent) 30%, var(--bg-6));
  }

  &:active {
    transform: scale(0.99);
  }

  .avatar {
    width: 42px;
    height: 42px;
  }
`;

export const NovelistConfirmOptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 14%, var(--bg-4));
  color: var(--accent-11, var(--accent));
  font-size: 20px;
`;

export const NovelistConfirmOptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
  padding-top: 1px;
`;

export const NovelistConfirmOptionTitle = styled.span`
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const NovelistConfirmOptionDesc = styled.span`
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--text-secondary);
`;

export const NovelistConfirmOptionChevron = styled.span`
  display: flex;
  align-items: center;
  align-self: center;
  flex-shrink: 0;
  color: var(--text-secondary);
`;

export const NovelistConfirmCreateWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
  width: 100%;
`;

export const NovelistConfirmCreateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NovelistConfirmCreateInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  outline: none;
  font-family: var(--font);
  font-size: var(--font-size-input);
  color: var(--text);

  &:focus {
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const NovelistConfirmCreateIconButton = styled.button<{
  $variant: "cancel" | "confirm";
}>`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
  background: ${({ $variant }) =>
    $variant === "confirm" ? "var(--accent)" : "var(--bg-3)"};
  color: ${({ $variant }) =>
    $variant === "confirm"
      ? "var(--text-on-accent, #fff)"
      : "var(--text-secondary)"};
  border: 1px solid
    ${({ $variant }) => ($variant === "confirm" ? "transparent" : "var(--bg-5)")};

  &:hover {
    background: ${({ $variant }) =>
      $variant === "confirm" ? "var(--accent)" : "var(--bg-4)"};
    opacity: ${({ $variant }) => ($variant === "confirm" ? 0.9 : 1)};
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
