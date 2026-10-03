import { Avatar, Form, Select } from "radix-ui";
import styled, { css } from "styled-components";
import { FOCUS_RING, GLASS, MATERIAL_CARD, Z_INDEX } from "@/theme";
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
  /* A sheet over the page: the panel glass, with its bars drawn as hairlines
     on it rather than as stacked grey strips. */
  ${GLASS("panel")}
  overflow: hidden;
  z-index: ${Z_INDEX.PROMPT_OVERLAY};
`;

export const FPTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border-bottom: 1px solid var(--glass-edge);
  flex-shrink: 0;
`;

export const FPBackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--fill-hover);
  }

  ${FOCUS_RING}

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
  background-color: transparent;
  border-bottom: 1px solid var(--glass-edge);
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
  min-height: 36px;
  padding: 0 20px;
  border-radius: 999px;
  background-color: var(--accent);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  min-width: 60px;
  box-sizing: border-box;
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

  ${FOCUS_RING}

  &:disabled {
    background-color: var(--fill-hover);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

/* ─── End full-page ─────────────────────────────────────────────────────── */

/* Closed: a content-width pill button ("Start a new thread") — the composer
   stays collapsed until asked for. It was a full-width field, which read as a
   text box and stretched across the whole card. Open: a small collapse chip
   centred on the composer's top edge (it was a solid black disc). */
export const PromptTrigger = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: auto;
  max-width: 100%;
  min-height: 40px;
  padding: 5px 18px 5px 5px;
  border-radius: 999px;
  color: var(--text-secondary);
  background-color: var(--field-fill, var(--bg-3));
  border: 1px solid var(--field-edge, var(--bg-6));
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;

  .plus-icon {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: var(--text);
    background-color: var(--accent);
  }

  &:not(.open) {
    &:hover {
      color: var(--text);
      border-color: color-mix(in srgb, var(--bg-12) 18%, transparent);

      .plus-icon {
        background-color: var(--accent-hover);
      }
    }

    &:active .plus-icon {
      background-color: var(--accent-active);
    }
  }

  ${FOCUS_RING}

  &.open {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    min-height: 0;
    margin-top: 8px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--fill-hover);
    border-color: var(--material-edge);
    color: var(--text-secondary);

    svg {
      transform: rotate(180deg);
      width: 18px;
      height: 18px;
    }

    &:hover {
      background-color: var(--fill-pressed);
      color: var(--text);
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
  background-color: var(--fill-hover);
  border-radius: 50%;
  border: 1px solid var(--material-edge);
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

  /* With a shell (the composer at the top of a feed): a material card, the
     same pane as the prompts below it — it was a square-cornered opaque slab.
     Without one ($noShell: the comment composer inside a prompt card): no
     surface of its own, since it already sits on the card. */
  /* Closed, the pill gets room of its own: it sat flush between the card's
     action row above and the threads header below. */
  &:not(.open) {
    padding-block: 14px 12px;
  }

  &.open {
    padding: ${({ $noShell }) => ($noShell ? "44px 0 6px" : "48px 18px 18px")};

    ${({ $noShell }) =>
      !$noShell &&
      css`
        ${MATERIAL_CARD}
        border-radius: 20px;

        @media screen and (max-width: 800px) {
          width: calc(100% - 16px);
          padding-inline: 12px;
          border-radius: 16px;
        }
      `}
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* "Post as" / "Comment as": a quiet label over the sender control. */
  .form-label {
    font-size: var(--font-size-small);
    font-family: var(--font);
    font-weight: var(--font-weight-semi-bold);
    color: var(--text-secondary);
  }

  /* Level with the collapse chip on the composer's top edge. */
  .prompt-input-privacy-select {
    position: absolute;
    top: 8px;
    right: 12px;
  }
`;

export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  pointer-events: none;
  color: var(--text-secondary);

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--material-edge);
  }
`;

export const SelectGroupLabel = styled.div`
  padding: 6px;
  font-size: 11px;
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
    background-color: var(--fill-hover);
    border: 1px solid var(--material-edge);
    padding: 6px 8px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--text);
    font-size: var(--font-size);
    font-family: var(--font);
    user-select: none;

    &:focus-visible {
      outline: 2px solid var(--accent-11, var(--accent));
      outline-offset: 2px;
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
  /* Opaque rather than glass: Radix mounts this list where a blurred ancestor
     may already exist (see GLASS_REDESIGN_PLAN rule 9). The glass edge and
     shadow keep it the same material as the other menus. */
  background-color: var(--bg-2);
  border: 1px solid var(--glass-edge, var(--bg-6));
  border-radius: 14px;
  padding: 6px;
  box-shadow: var(--glass-shadow, 0 12px 32px rgb(0 0 0 / 0.5));

  .select-viewport {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .separator[data-orientation="horizontal"] {
      height: 1px;
      width: 100%;
      margin-block: 5px;
      background-color: var(--material-edge);
    }
  }

  .select-item {
    scroll-snap-align: start;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    min-height: 36px;
    box-sizing: border-box;
    padding: 8px 12px 8px 10px;
    border-radius: 10px;
    user-select: none;
    cursor: pointer;
    position: relative;
    color: var(--text);
    font-size: var(--font-size);
    font-family: var(--font);

    /* Rounded rows with a neutral wash replace the hairline between items. */
    &:hover,
    &:focus {
      outline: none;
      background-color: var(--fill-hover);
    }

    &[data-state="unchecked"] {
      padding-left: 30px;
    }

    .select-item-indicator {
      width: 12px;
      display: flex;
      align-items: center;
      justify-content: start;

      svg {
        width: 10px;
        height: 10px;
        color: var(--accent-11, var(--accent));
      }
    }
  }
`;

export const PrivacySelect = styled(SelectBase)`

  .select-trigger {
    min-width: 34px;
    min-height: 32px;
    padding: 4px 8px;
    background-color: transparent;
    border: 1px solid transparent;
    border-radius: 999px;

    &:hover,
    &[data-state="open"] {
      background-color: var(--fill-hover);
      border-color: var(--material-edge);
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
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  /* Neutral chips: three accent-filled squares beside the one accent send
     button spent the colour on the least important controls. */
  color: var(--text-secondary);
  background-color: var(--fill-hover);
  border: 1px solid var(--material-edge);
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: var(--text);
    background-color: var(--fill-pressed);
  }

  &:active {
    transform: scale(0.95);
  }

  ${FOCUS_RING}

  /* At the 375 baseline the sender chip and the three tool chips share one
     row only at 32px; at 36 the tools wrapped onto a second line. */
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

export const UploadErrorBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.875rem;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--error, #e53e3e) 14%, transparent);
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

  /* The attach button (a label for the hidden file input): same neutral chip
     as ToolButton. */
  .form-label {
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: var(--text-secondary);
    background-color: var(--fill-hover);
    border: 1px solid var(--material-edge);
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      color: var(--text);
      background-color: var(--fill-pressed);
    }

    &:focus-visible {
      outline: 2px solid var(--accent-11, var(--accent));
      outline-offset: 2px;
    }

    svg {
      width: 17px;
      height: 17px;
    }
  }

  @media (max-width: 480px) {
    .form-label {
      width: 32px;
      height: 32px;
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
    border-radius: 12px;
    border: 1px solid var(--material-edge);

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
    background-color: var(--bg-2);
    border: 1px solid var(--glass-edge, var(--bg-6));
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
  padding: 8px 20px;
  border-radius: 999px;
  background-color: var(--accent);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
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

  ${FOCUS_RING}

  &:disabled {
    background-color: var(--fill-hover);
    color: var(--text-secondary);
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
    border: 1px solid var(--material-edge);
    border-radius: 14px;
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
  background: var(--fill-hover);
  border: 1px solid var(--material-edge);
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--tomato-a4);
    color: var(--tomato-11);
  }

  ${FOCUS_RING}

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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  /* The composer's one accent control. */
  background: var(--accent);
  color: var(--text);
  box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--accent) 70%, transparent);
  transition: background 0.15s ease;

  &:not(:disabled):hover {
    background: var(--accent-hover);
  }

  &:not(:disabled):active {
    background: var(--accent-active);
  }

  &:disabled {
    background: var(--fill-hover);
    color: var(--text-secondary);
    box-shadow: none;
    cursor: not-allowed;
  }

  ${FOCUS_RING}
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
    /* In character takes the accent's text step: --accent itself (step 6) is
       2.4:1 on the composer, and the mode label below is set in it. */
    --mode: ${({ $novelist }) =>
      $novelist ? "#b1a9ff" : "var(--accent-11, var(--accent))"};
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 4px 6px 4px 4px;
    border: 1px solid
      ${({ $locked }) =>
        $locked
          ? "var(--material-edge)"
          : "color-mix(in srgb, var(--mode) 28%, transparent)"};
    border-radius: 999px;
    background: ${({ $locked }) =>
      $locked
        ? "var(--fill-hover)"
        : "color-mix(in srgb, var(--mode) 9%, transparent)"};
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
      box-shadow: 0 0 0 2px var(--bg-2), 0 0 0 3.5px var(--mode);
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
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.05em;
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
      background: var(--fill-hover);
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: var(--font-weight-semi-bold);
      flex-shrink: 0;
    }

    .mode-switch svg {
      width: 13px;
      height: 13px;
    }

    &:not(:disabled):hover {
      background: color-mix(in srgb, var(--mode) 16%, transparent);
      border-color: color-mix(in srgb, var(--mode) 50%, transparent);
    }

    &:not(:disabled):hover .mode-switch {
      background: var(--fill-pressed);
      color: var(--text);
    }

    &:not(:disabled):focus-visible {
      outline: 2px solid var(--mode);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: default;
    }

    @media screen and (max-width: 600px) {
      gap: 8px;

      .mode-eyebrow {
        letter-spacing: 0.02em;
      }

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
      ? "color-mix(in srgb, var(--accent) 14%, transparent)"
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
    background: var(--fill-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: -2px;
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
  font-size: 11px;
  font-family: var(--font);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ $novelist }) =>
    $novelist
      ? "color-mix(in srgb, #b1a9ff 16%, transparent)"
      : "color-mix(in srgb, var(--accent) 16%, transparent)"};
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
  font-size: 11px;
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
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--fill-hover);
  border: 1px solid var(--material-edge);
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--fill-pressed);
    color: var(--text);
  }

  &:active {
    transform: scale(0.92);
  }

  ${FOCUS_RING}
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
  background: var(--material-fill);
  border: 1px solid var(--material-edge);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--fill-hover);
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 35%, transparent);
  }

  &:active {
    transform: scale(0.99);
  }

  ${FOCUS_RING}

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
  background: color-mix(in srgb, var(--accent) 16%, transparent);
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
  font-size: 12px;
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
  border: 1px solid var(--field-edge, var(--bg-6));
  background: var(--field-fill, var(--bg-2));
  outline: none;
  font-family: var(--font);
  font-size: var(--font-size-input);
  color: var(--text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 60%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
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
    $variant === "confirm" ? "var(--accent)" : "var(--fill-hover)"};
  color: ${({ $variant }) =>
    $variant === "confirm"
      ? "var(--text-on-accent, #fff)"
      : "var(--text-secondary)"};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "confirm" ? "transparent" : "var(--material-edge)"};

  &:hover {
    background: ${({ $variant }) =>
      $variant === "confirm" ? "var(--accent)" : "var(--fill-pressed)"};
    opacity: ${({ $variant }) => ($variant === "confirm" ? 0.9 : 1)};
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  ${FOCUS_RING}
`;

/* ─── Embedded "create a character" form (forced in-character, no muses) ─── */

export const IcRequiredWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: var(--material-fill);
  border: 1px solid var(--material-edge);
`;

export const IcRequiredHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;

  > svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-top: 2px;
    color: var(--accent-11, var(--accent));
  }
`;

export const IcRequiredHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const IcRequiredTitle = styled.span`
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const IcRequiredDesc = styled.span`
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-secondary);
`;

export const IcRequiredBody = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const IcRequiredAvatarLabel = styled.label`
  position: relative;
  flex-shrink: 0;
  display: flex;
  cursor: pointer;

  .avatar {
    width: 52px;
    height: 52px;
  }

  .camera-badge {
    position: absolute;
    right: -2px;
    bottom: -2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--text-on-accent, #fff);
    font-size: 11px;
    border: 2px solid var(--bg-2);
  }
`;

export const IcRequiredFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const IcRequiredSubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 999px;
  border: none;
  background: var(--accent);
  color: var(--text-on-accent, #fff);
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  ${FOCUS_RING}
`;

export const IcRequiredError = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--tomato-11, #ff977d);
`;
