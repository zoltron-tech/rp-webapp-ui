import { Avatar, Form, Select } from "radix-ui";
import styled from "styled-components";
import { AvatarNew } from "../common/avatar-new";

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

export const PromptInputRoot = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;

  transition-property: padding-top;
  transition-duration: 0.25s;
  transition-timing-function: ease-in-out;

  position: relative;

  * {
    font-family: var(--font);
  }

  &.open {
    padding-top: 28px;
    padding-bottom: 45px;
    padding-inline: 16px;
    background-color: var(--bg-2);
    /* border: 0.85px solid var(--bg-6); */
    /* box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.25); */
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
`;

export const TextInputContainer = styled(Form.Field)`
  display: flex;
  flex-direction: column;

  margin-top: 8px;

  textarea {
    background-color: var(--bg-3);
    padding: 8px;
    border-radius: 4px;
    border: none;
    color: var(--text);
    font-size: var(--font-size-input);
    font-family: var(--font);
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
    font-family: var(--font);
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

export const MediaSelect = styled(Form.Field)`
  display: flex;
  flex-direction: column;
  margin-top: 4px;

  .media-input {
    display: none;
  }

  .form-label {
    width: fit-content;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-size);
    padding: 4px 8px;
    border-radius: 2px;
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
