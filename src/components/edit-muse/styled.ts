import { RichText as NWRichText } from "@novelist-world/ui";
import { Dialog, Form, Select } from "radix-ui";
import styled, { keyframes } from "styled-components";
import { AvatarNew } from "../common/avatar-new";

export const RichText = styled(NWRichText)`
  & > .pm-container {
    & > .ProseMirror {
      background-color: ${({ theme }: any) => theme.colors.inputBackground};
      font-size: var(--font-size-input);
    }
  }
`;

export const AddEditMusePageRoot = styled.div``;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border: none;
  background: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:active {
    color: var(--accent);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  margin-block: 60px;
  margin-inline: auto;
  max-width: 800px;
  border: 0.85px solid var(--bg-6);
  background-color: var(--bg-2);
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);
  padding: 20px;

  @media screen and (max-width: 800px) {
    margin-block: 0px;
    padding-inline: 10px;
    /* padding-block: 30px; */
    border: none;
    overflow-x: hidden;
  }

  .separator[data-orientation="horizontal"] {
    height: 1px;
    margin-top: var(--font-size-small);
    margin-bottom: var(--font-size-xsmall);
    background-color: var(--bg-6);
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between
`;

export const FormHeading = styled.div`
  display: flex;
  align-items: center;

  h1 {
    all: unset;
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-bold);
    color: var(--text);
  }

  svg {
    margin-right: var(--font-size-xsmall);
    width: var(--font-size-h3);
    height: var(--font-size-h3);
    color: var(--accent-8);

    &.success {
      color: var(--grass-9);
    }

    &.error {
      color: var(--tomato-9);
    }

    &.warning {
      color: var(--amber-9);
    }
  }

  @media screen and (max-width: 600px) {
    h1 {
      font-size: var(--font-size-h6);
    }

    svg {
      width: var(--font-size-h4);
      height: var(--font-size-h4);
    }
  }
`;

export const FormContainer = styled.div`

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

  form {
    flex-direction: column;
    width: 100%;
    display: flex;
    height: 100%;

    .field {
      display: flex;
      flex-direction: column;
      width: 100%;
      color: var(--text);
      font-size: var(--font-size);
      font-family: var(--font);
      margin-bottom: 8px;

      label {
        padding: 2px;
        font-weight: var(--font-weight-regular);
        margin-block: 4px;
      }

      .label-message {
        color: var(--tomato-a9);
        font-size: var(--font-size-small);
        font-weight: var(--font-weight-medium);
        font-family: var(--font);
        text-align: end;

        &::before {
          content: "*";
          color: var(--tomato-a9);
          font-weight: var(--font-weight-bold);
          margin-right: 2px;
        }
      }

          &.checkbox {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          margin-bottom: 8px;
          font-size: var(--font-size-small);
          font-weight: var(--font-weight-medium);
          font-family: var(--font);
          color: var(--text-secondary);

          input[type="checkbox"] {
            all: unset;
            width: 20px;
            height: 20px;
            aspect-ratio: 1;
            border-radius: 4px;

            margin: 0;
            cursor: pointer;
            overflow: hidden;
            accent-color: var(--accent);
            outline-offset: 2px;
            background-color: var(--bg-3);
            border: 1px solid var(--bg-6);

            &:checked {
              background-color: var(--accent);
              border: 1px solid var(--accent-hover);

              &::before {
                content: "✓";
                display: block;
                color: var(--text);
                text-align: center;
                line-height: 20px;
                font-weight: var(--font-weight-bold);
              }
            }

            &:not(:checked) {
              background-color: var(--bg-5);
              border: 1px solid var(--bg-6);
            }

            &:hover {
              outline: 1px solid var(--accent);
            }

            &[data-invalid="true"] {
              outline: 1.5px solid var(--tomato-a9);
            }

            &:focus {
              outline: 2px solid var(--accent);
            }

            &[disabled] {
              background-color: var(--bg-6);
              cursor: not-allowed;
              color: var(--text-secondary);
            }
          }

          label {
            font-weight: var(--font-weight-regular);
            color: var(--text);

            a {
              color: var(--accent-9);
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }

              &:focus {
                outline: 1.5px solid var(--accent);
                outline-offset: 2px;
              }
            }
          }
        }
    }

    input {
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
      color: var(--text);
      font-size: var(--font-size-input);
      font-weight: var(--font-weight-regular);
      background-color: var(--bg-3);
      border: none;
      font-family: var(--font);

      &:not([readonly]) {
        outline-offset: 2px;
        border: 1px solid var(--bg-6);

        &::placeholder {
          color: var(--text-secondary);
          opacity: 0.4;
        }

        &:hover {
          outline: 1px solid var(--accent);
        }

        &:focus {
          outline: 2px solid var(--accent);
        }

        &[data-invalid="true"] {
          outline: 1.5px solid var(--tomato-a9);
        }

        &:-internal-autofill-selected {
          background: var(--bg-3) !important;
          background-color: var(--bg-3) !important;
          color: var(--text) !important;
          appearance: none !important;
        }

        &[disabled] {
          background-color: var(--bg-2);
          cursor: not-allowed;
          color: var(--text-secondary);
          font-weight: var(--font-weight-regular);
          border: 1px solid var(--bg-6);
        }
      }
    }

    input[required] ~ label::before {
      content: "*";
      color: var(--tomato-a9);
      font-weight: var(--font-weight-bold);
      margin-right: 2px;
    }

    .submit-button {
      width: 100px;
      padding: 8px;
      background-color: var(--accent);
      color: var(--text);
      font-size: var(--font-size);
      font-weight: var(--font-weight-medium);
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &[disabled] {
        background-color: var(--bg-6);
        cursor: not-allowed;
        width: 150px;
        color: var(--text-secondary);
      }

      &:not([disabled]):hover {
        background-color: var(--accent-hover);
      }

      &:not([disabled]):active {
        background-color: var(--accent-active);
      }

      &:focus {
        outline: 1.5px solid var(--accent);
        outline-offset: 2px;
      }
    }
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
    width: 240px;
    max-width: 100%;
    min-width: 0;
    background-color: var(--bg-3);
    border: 0.85px solid var(--bg-6);
    padding: 6px 8px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
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

export const FandomSelect = styled(SelectBase)`
  gap: 0.5rem;
`;

export const FandomSelectTrigger = styled(Select.Trigger)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.5rem;
  border: 0.85px solid var(--bg-6);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: var(--bg-3);
  &:hover {
    background-color: var(--bg-5);
  }
`;

const SelectPortalBase = styled(Select.Portal)`
  max-height: 200px;
  width: 255px;
  scroll-behavior: smooth;
  overflow: hidden;
  background-color: var(--bg-3);
  border: 0.85px solid var(--bg-6);
  border-radius: 2px;
  padding: 4px 8px;

  .select-viewport {
    display: flex;
    flex-direction: column;
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

export const FandomSelectPortal = styled(SelectPortalBase)``;

export const FandomSelectContent = styled(Select.Content)`
  border-radius: 0.5rem;
  border: 1px solid var(--colors-border);
  background-color: var(--colors-background);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 999;
  width: 400px;
`;

export const FandomDropdownSearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--bg-4);
  font-size: 0.9rem;
  background-color: var(--bg-2);
  color: var(--text);
  margin-block: 4px;

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const DropdownMessage = styled.div`
  padding: 0.75rem;
  font-size: 0.85rem;
  color: var(--text);
  text-align: center;
`;

export const FandomSelectItem = styled(Select.Item)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: var(--colors-backgroundHover);
  }

  &[data-state="checked"] {
    background-color: var(--accent);
  }
`;

export const BasicInfoFields = styled.div`
  position: relative;
  justify-content: center;
  align-items: center;
  width: 100%;
  display: flex;
  gap: 2em;
  margin-block: 5px;

  .avatar-field {
    .avatar {
      width: 150px;
      height: 150px;
      background-color: var(--bg-2);
      border: 6px solid var(--bg-1);
      z-index: 1;
    }
  }

  .muse-privacy-select {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .name-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    min-width: 0;
    max-width: 400px;
  }

  .note {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    min-width: 0;
    max-width: 600px;
  }
`;

export const FandomSelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  gap: 2em;
`;

export const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  .secondary-text {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
    font-weight: var(--font-weight-regular);
  }
`;

export const AboutSectionsLink = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-block: 8px;
  max-width: 700px;
  margin-inline: auto;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
    opacity: 0.8;
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 6px 16px;
    border: 1px solid var(--accent);
    border-radius: 50px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: var(--font-size-h6);
    font-weight: 700;
    font-style: italic;
    color: var(--accent);
    white-space: nowrap;
    transition: all 0.2s ease;

    svg {
      display: block;
    }
  }

  span:hover {
    cursor: pointer;
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: var(--font-size-small);
  width: 100%;
  padding-right: 20px;
  margin-bottom: 20px;
`;

export const ResetButton = styled.button`
  all: unset;
  width: 100px;
  padding: 8px;
  text-align: center;
  background-color: var(--bg-3);
  color: var(--text-secondary);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: var(--bg-2);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

export const MediaUploadSectionContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    width: 100%;
    margin-top: 20px;
    gap: 20px;

    .media-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
  

      span {
        font-family: var(--font);
        font-size: var(--font-size);
        font-weight: var(--font-weight-regular);
        color: var(--text-secondary);
      }
    }
`;

export const infoButton = styled.button`
  all: unset;
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1.5px solid var(--bg-10);

  svg {
    fill: var(--bg-10);
    stroke: var(--bg-10);
    height: 16px;
    width: 16px;
  }

  &:active {
    scale: 0.98;
  }

  &:hover, &:focus {
      border-color: var(--accent-7);
      background-color: var(--bg-1);
   svg {
    fill: var(--accent-7);
  
   }
  }
`;

export const CardBackgroundSelect = styled(AvatarNew)`
margin-block: 10px;
border-radius: unset;
height: 200px;
width: 113px;
      background-color: var(--bg-2);
      border: 6px solid var(--bg-1);
`;

export const WallpaperSelect = styled(AvatarNew)`
margin-block: 10px;
border-radius: unset;
height: 200px;
width: 300px;
      background-color: var(--bg-2);
      border: 6px solid var(--bg-1);
`;

export const ColorPickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;

  .colorpicker-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    span {
      font-family: var(--font);
      font-size: var(--font-size);
      font-weight: var(--font-weight-regular);
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    input {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--border);
      width: 80px;
      text-align: center;
      font-family: var(--font);
      font-size: var(--font-size);
      color: var(--text-primary);

      &:focus {
        outline: none;
        border-color: var(--accent);
      }
    }
  }
`;

export const MediaErrorWrapper = styled.div`
display: flex;
align-items: center;
justify-content: center;
padding-inline: 20px;
padding-top: 20px;
width: 100%;
`;

/* ── Nicknames ───────────────────────────────────────────────────────────── */

export const NicknamesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 12px 5px;
`;

export const NicknamesInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  input {
    flex: 1;
    margin-bottom: 0;
  }
`;

export const AddNicknameButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 4px;
  background-color: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: var(--bg-6);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

export const NicknameTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 28px;
`;

export const NicknameTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 12px;
  background-color: color-mix(in srgb, var(--accent) 15%, var(--bg-4));
  border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--bg-6));
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-family: var(--font);
  color: var(--text);
  font-weight: 500;
`;

export const NicknameRemove = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: color 0.12s, background-color 0.12s;

  &:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.15);
  }

  svg {
    width: 10px;
    height: 10px;
  }
`;

export const NicknamesHint = styled.p`
  margin: 0;
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-family: var(--font);
`;

/* ── Accent color inline row ─────────────────────────────────────────────── */

export const AccentColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

export const AccentColorSwatch = styled.button`
  all: unset;
  cursor: pointer;
  display: inline-block;
  width: 56px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid var(--bg-6);
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const AccentEditButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: color 0.15s, background-color 0.15s;

  &:hover,
  &:focus-visible {
    color: var(--text);
    background-color: var(--bg-4);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
`;

export const AccentPickerDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-top: 4px;

  .react-colorful {
    width: 100%;
    max-width: 260px;
  }

  .hex-input-row {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      font-family: var(--font);
      font-size: var(--font-size-small);
      color: var(--text-secondary);
    }

    input {
      width: 90px;
      padding: 5px 8px;
      border-radius: 4px;
      border: 1px solid var(--bg-6);
      background: var(--bg-3);
      color: var(--text);
      font-family: var(--font);
      font-size: var(--font-size-small);
      text-align: center;

      &:focus {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
      }
    }
  }
`;

// ── Wallpaper filter dialog ──────────────────────────────────────────────────

export const PaletteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  svg {
    flex-shrink: 0;
    color: var(--accent);
  }

  &:hover {
    background: var(--bg-4);
    color: var(--text);
    border-color: var(--accent);
  }
`;

export const FilterDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
  width: 100%;
  min-width: min(280px, 100%);

  @media (max-width: 460px) {
    overflow: hidden;
    max-height: calc(100dvh - 180px);
  }
`;

export const FilterPreviewWrap = styled.div`
  position: relative;
  width: 100%;
  height: 230px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface FilterPreviewBannerProps {
  $src: string;
  $greyscale: number;
  $brightness: number;
  $blur: number;
}

export const FilterPreviewBanner = styled.div<FilterPreviewBannerProps>`
  position: absolute;
  inset: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  filter: grayscale(${({ $greyscale }) => $greyscale}%)
    brightness(${({ $brightness }) => $brightness}%)
    blur(${({ $blur }) => $blur}px);
  contain: paint;
`;

export const FilterPreviewCard = styled.div<{ $src: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 105px;
  border-radius: 8px;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
`;

/* Card + info-panel expanded preview */
export const FilterPreviewLayout = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.06);
`;

export const FilterPreviewCardFace = styled.div<{
  $src: string;
  $bgSize?: string;
  $bgPosition?: string;
}>`
  width: 95px;
  aspect-ratio: 9 / 16; /* must match the displayed card ratio exactly */
  flex-shrink: 0;
  background-image: url(${({ $src }) => $src});
  background-repeat: no-repeat;
  background-color: var(--bg-1);
  background-size: ${({ $bgSize }) => $bgSize ?? "cover"};
  background-position: ${({ $bgPosition }) => $bgPosition ?? "center"};
`;

/** Like FilterPreviewCardFace but interactive — drag to reposition card bg */
/* Dynamic background props (image/size/position) are applied via the `style`
   prop (inline) rather than styled-component props so rapid drag/zoom updates
   don't regenerate CSS classes. */
export const InteractiveCardFace = styled.div`
  width: 95px;
  aspect-ratio: 9 / 16; /* must match the displayed card ratio exactly */
  flex-shrink: 0;
  position: relative;
  background-repeat: no-repeat;
  background-color: var(--bg-1);
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &::after {
    content: "drag · scroll to zoom";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 18px 4px 5px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.72), transparent);
    color: rgba(255, 255, 255, 0.82);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    text-transform: uppercase;
    pointer-events: none;
  }
`;

export const FilterPreviewPanel = styled.div`
  width: 120px;
  height: 170px;
  background: rgba(10, 10, 10, 0.82);
  backdrop-filter: blur(10px);
  padding: 14px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  flex-shrink: 0;
`;

export const FilterPreviewMuseName = styled.div`
  font-family: var(--font);
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
  text-align: center;
  width: 100%;
`;

export const FilterPreviewFandom = styled.div`
  font-family: var(--font);
  font-size: 9px;
  color: rgba(255, 255, 255, 0.42);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  width: 100%;
`;

export const FilterPreviewAvatar = styled.div<{ $src: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  border: 2px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  background-color: rgba(255, 255, 255, 0.08);
`;

export const FilterPreviewAttrGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  width: 100%;
`;

export const FilterPreviewAttr = styled.div`
  height: 16px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 12%, rgba(0, 0, 0, 0.35));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  backdrop-filter: blur(4px);
`;

export const FilterSliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FilterSliderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  label {
    font-family: var(--font);
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 62px;
    flex-shrink: 0;
  }

  .value {
    font-family: var(--font);
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    color: var(--text);
    min-width: 32px;
    text-align: right;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  input[type="range"] {
    flex: 1;
    height: 16px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;

    &::-webkit-slider-runnable-track {
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(
        to right,
        var(--accent) var(--fill, 0%),
        var(--bg-5) var(--fill, 0%)
      );
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: var(--accent);
      margin-top: -5px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    &::-moz-range-track {
      height: 3px;
      border-radius: 2px;
      background: var(--bg-5);
    }
    &::-moz-range-progress {
      height: 3px;
      border-radius: 2px;
      background: var(--accent);
    }
    &::-moz-range-thumb {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
  }
`;

export const PreviewChangeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

/* ── Visual settings slider sections ─────────────────────────────────────── */

export const SliderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
`;

export const SliderSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > span {
    font-family: var(--font);
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
`;

export const MediaPickerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 4px;

  span {
    font-family: var(--font);
    font-size: var(--font-size-small);
    color: var(--text-secondary);
  }
`;

export const MediaPickerBackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 5px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: var(--font-size-small);
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

export const MediaPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
`;

export const MediaPickerThumb = styled.button<{ $selected: boolean }>`
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid
    ${({ $selected }) => ($selected ? "var(--accent)" : "var(--bg-5)")};
  background: var(--bg-3);
  cursor: pointer;
  padding: 0;
  aspect-ratio: 1;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--accent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const MediaPickerUploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 5px;
  border: 1.5px dashed var(--bg-6);
  background: var(--bg-2);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font);
  font-size: 11px;
  aspect-ratio: 1;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: var(--accent);
    color: var(--text);
  }
`;

export const MediaPickerEmpty = styled.p`
  text-align: center;
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: var(--font-size-small);
  padding: 20px 0;
`;

// ── Card crop editor ─────────────────────────────────────────────────────────

export const CropEditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CropEditorLabel = styled.div`
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const CropEditorHint = styled.p`
  font-family: var(--font);
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
`;

/* The viewport that clips to the 9:16 card preview */
export const CropViewport = styled.div`
  position: relative;
  width: 100%;
  max-width: 180px;
  aspect-ratio: 9 / 16;

  @media (max-width: 460px) {
    max-width: clamp(120px, 40vw, 160px);
  }
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  background-color: var(--bg-1); /* fills empty space when image doesn't cover full area */
  cursor: grab;
  touch-action: none;
  user-select: none;
  align-self: center;

  &:active {
    cursor: grabbing;
  }
`;

/* The actual image layer that moves around inside the viewport */
export const CropImage = styled.div<{
  $src: string;
  $x: number;
  $y: number;
  $scale: number;
}>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: url(${({ $src }) => $src});
  background-repeat: no-repeat;
  /* Two-value size: width% auto — height scales proportionally, never tiles */
  background-size: ${({ $scale }) => $scale * 100}% auto;
  background-position: ${({ $x, $y }) => `${$x}% ${$y}%`};
  pointer-events: none;
`;

export const CropScaleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  label {
    font-family: var(--font);
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 62px;
    flex-shrink: 0;
  }

  .value {
    font-family: var(--font);
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    color: var(--text);
    min-width: 32px;
    text-align: right;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  input[type="range"] {
    flex: 1;
    height: 16px;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;

    &::-webkit-slider-runnable-track {
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(
        to right,
        var(--accent) var(--fill, 0%),
        var(--bg-5) var(--fill, 0%)
      );
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: var(--accent);
      margin-top: -5px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    &::-moz-range-track {
      height: 3px;
      border-radius: 2px;
      background: var(--bg-5);
    }
    &::-moz-range-progress {
      height: 3px;
      border-radius: 2px;
      background: var(--accent);
    }
    &::-moz-range-thumb {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
  }
`;

// ── Visual settings two-column layout ──────────────────────────────────────

/** Desktop: card on the left, wallpaper+sliders on the right.
 *  Mobile: stacked vertically. */
export const VisualSettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

export const VisualPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PanelHeading = styled.p`
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

export const PanelHint = styled.p`
  font-family: var(--font);
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
`;

/** Container for the wallpaper banner preview (same structure as FilterPreviewWrap) */
export const WallpaperPreviewBox = styled.div`
  position: relative;
  width: 100%;
  height: clamp(160px, 30vh, 230px);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ── Fandom picker dialog ─────────────────────────────────────────────────────

const overlayShow = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const FandomDialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  z-index: 1000;
  animation: ${overlayShow} 150ms ease-out;
`;

export const FandomDialogContent = styled(Dialog.Content)`
  background-color: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: 95vw;
  max-width: 480px;
  height: 400px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: ${contentShow} 150ms ease-out;
  color: var(--text);
  font-family: var(--font);
`;

export const FandomDialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--bg-5);
  flex-shrink: 0;
`;

export const FandomDialogTitle = styled(Dialog.Title)`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-semi-bold);
  margin: 0;
`;

export const FandomDialogCloseBtn = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background-color: var(--bg-5);
    color: var(--text);
  }
`;

export const FandomDialogSearch = styled.input`
  flex-shrink: 0;
  margin: 10px 16px 6px;
  padding: 8px 12px;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background-color: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
  }
`;

export const FandomDialogList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const FandomDialogMessage = styled.div`
  padding: 16px;
  text-align: center;
  font-size: var(--font-size-input);
  color: var(--text-secondary);
`;

export const FandomDialogItem = styled.button<{ $selected?: boolean }>`
  all: unset;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: var(--font-size-input);
  font-family: var(--font);
  cursor: pointer;
  color: var(--text);
  background-color: ${({ $selected }) =>
    $selected
      ? "color-mix(in srgb, var(--accent) 18%, transparent)"
      : "transparent"};
  border: 1px solid ${({ $selected }) =>
    $selected ? "var(--accent)" : "transparent"};

  &:hover {
    background-color: var(--bg-5);
  }

  .selected-icon {
    flex-shrink: 0;
    color: var(--accent);
    width: 14px;
    height: 14px;
  }
`;

export const FandomDialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px 12px;
  border-top: 1px solid var(--bg-5);
  flex-shrink: 0;
`;

export const FandomDialogCancelBtn = styled.button`
  all: unset;
  padding: 6px 20px;
  border-radius: 4px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);
  font-size: var(--font-size-input);
  font-family: var(--font);
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
  }
`;

// ── Landing / Wizard shared components ──────────────────────────────────────

export const LandingHero = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 4px 12px;
`;

export const LandingHeroAvatarWrap = styled.div`
  flex-shrink: 0;

  /* Resize the AvatarUploadField wrapper to fit the hero */
  label {
    cursor: pointer;
    display: block;
  }

  label > div {
    width: 100px;
    height: 100px;
  }

  .avatar {
    height: 95px;
    width: 95px;
    border: 3px solid var(--accent-7);
  }
`;

export const LandingHeroInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
  flex: 1;
`;

export const LandingHeroName = styled.h2`
  all: unset;
  display: block;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 480px) {
    font-size: var(--font-size-h5);
  }
`;

export const LandingHeroEditRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
`;

export const LandingHeroInput = styled.input`
  flex: 1;
  width: 80%;
  min-width: 0;
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  font-family: var(--font);
  padding: 4px 8px;
  background: var(--bg-3);
  border: 1.5px solid var(--bg-6);
  border-radius: 6px;
  transition: border-color 0.18s, background 0.18s;
  cursor: text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
    font-weight: var(--font-weight-regular);
  }

  &:hover {
    border-color: var(--bg-8);
    background: var(--bg-4);
  }

  &:focus {
    border-color: var(--accent);
    background: var(--bg-3);
    outline: none;
    text-overflow: clip;
    white-space: nowrap;
  }

  @media screen and (max-width: 480px) {
    font-size: var(--font-size-input);
  }
`;

export const LandingVisitButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid var(--accent-a6);
  background-color: transparent;
  color: var(--accent-10);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s, border-color 0.15s;

  &:hover {
    background-color: var(--accent-a3);
    border-color: var(--accent-a8);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const LandingHeroResetButton = styled.button`
  all: unset;
  padding: 6px 14px;
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--bg-6);
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--bg-4);
    color: var(--text);
    border-color: var(--bg-8);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const LandingHeroSaveButton = styled.button`
  all: unset;
  padding: 6px 16px;
  border-radius: 4px;
  background-color: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  &:disabled {
    background-color: var(--bg-6);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const LandingErrorBanner = styled.p`
  margin: 4px 2px 0;
  font-size: var(--font-size-small);
  font-family: var(--font);
  color: var(--tomato-9);
`;

export const LandingHeroMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const LandingFandomBadge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: var(--font-size-xxsmall);
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: center;
  vertical-align: middle;
  background-color: ${({ $color }) => $color ?? "var(--bg-6)"};
  color: #fff;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  transition: all 0.2s ease-in-out;

  &:hover {
    filter: brightness(1.2);
    transform: translateY(-1px);
  }
`;

export const LandingMetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
  background: var(--bg-4);
  color: var(--text-secondary);
  border: 1px solid var(--bg-5);
  white-space: nowrap;
`;

export const LandingSubtitle = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-block: 0 16px;
  margin-inline: 2px;
`;

export const LandingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  align-items: stretch;

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const LandingCard = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--accent-7);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    border-style: dashed;
    border-color: var(--bg-6);
    background: var(--bg-2);

    &:hover {
      border-style: dashed;
      border-color: var(--bg-6);
      box-shadow: none;
      transform: none;
    }

    /* Strip the coloured gradient from the icon area */
    > *:first-child {
      background: var(--bg-4) !important;
      border-bottom-color: var(--bg-5) !important;

      .section-icon {
        color: var(--text-secondary) !important;
        opacity: 0.5;
      }
    }

    /* Mute all card text */
    span,
    p {
      color: var(--text-secondary);
    }
  }
`;

export const LandingCardIconArea = styled.div<{
  $hue:
    | "appearance"
    | "information"
    | "story"
    | "gallery"
    | "connections"
    | "headcanons";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px 22px;
  background: ${({ $hue }) => {
    if ($hue === "appearance")
      return "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.04) 100%)";
    if ($hue === "information")
      return "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 100%)";
    if ($hue === "gallery")
      return "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.04) 100%)";
    if ($hue === "connections")
      return "linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0.04) 100%)";
    if ($hue === "headcanons")
      return "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 100%)";
    return "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.04) 100%)";
  }};
  border-bottom: 1px solid
    ${({ $hue }) => {
      if ($hue === "appearance") return "rgba(139,92,246,0.2)";
      if ($hue === "information") return "rgba(59,130,246,0.2)";
      if ($hue === "gallery") return "rgba(16,185,129,0.2)";
      if ($hue === "connections") return "rgba(236,72,153,0.2)";
      if ($hue === "headcanons") return "rgba(99,102,241,0.2)";
      return "rgba(245,158,11,0.2)";
    }};

  .section-icon {
    width: 38px;
    height: 38px;
    color: ${({ $hue }) => {
      if ($hue === "appearance") return "rgb(139,92,246)";
      if ($hue === "information") return "rgb(59,130,246)";
      if ($hue === "gallery") return "rgb(16,185,129)";
      if ($hue === "connections") return "rgb(236,72,153)";
      if ($hue === "headcanons") return "rgb(99,102,241)";
      return "rgb(245,158,11)";
    }};
  }

  @media screen and (max-width: 600px) {
    padding: 14px 16px 12px;

    .section-icon {
      width: 26px;
      height: 26px;
    }
  }
`;

export const LandingCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 10px;
  flex: 1;

  @media screen and (max-width: 600px) {
    padding: 9px 14px 7px;
  }
`;

export const LandingCardTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const LandingCardDesc = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
`;

export const LandingCardChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 10px 12px 14px;
  border-top: 1px solid var(--bg-5);

  @media screen and (max-width: 600px) {
    padding: 6px 10px 10px;
    gap: 4px;
  }
`;

export const LandingCardChip = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-family: var(--font);
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid
    ${({ $active }) => ($active ? "var(--grass-9)" : "var(--bg-6)")};
  color: ${({ $active }) => ($active ? "var(--grass-9)" : "var(--text-secondary)")};
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--grass-9) 10%, transparent)"
      : "var(--bg-4)"};
`;

export const LandingCardComingSoon = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-family: var(--font);
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid var(--amber-9);
  color: var(--amber-11);
  background: color-mix(in srgb, var(--amber-9) 10%, transparent);

  /* Restore amber even when the parent button is disabled */
  button:disabled & {
    color: var(--amber-11);
    border-color: var(--amber-9);
    background: color-mix(in srgb, var(--amber-9) 10%, transparent);
  }
`;

export const LandingCardAccentChip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-family: var(--font);
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);
  background: var(--bg-4);

  &::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ $color }) => $color};
    flex-shrink: 0;
  }
`;

export const StepBadge = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-regular);
  white-space: nowrap;
`;

export const StepDots = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  margin-bottom: 4px;
`;

export const StepDot = styled.span<{ $active: boolean; $done: boolean }>`
  width: ${({ $active }) => ($active ? "24px" : "8px")};
  height: 8px;
  border-radius: 4px;
  background: ${({ $active, $done }) =>
    $active ? "var(--accent)" : $done ? "var(--accent-6)" : "var(--bg-5)"};
  transition: all 0.25s ease;
`;

export const WizardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: var(--font-size-small);
  margin-bottom: 20px;
  padding-right: 20px;
`;

export const SkipButton = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 8px 16px;
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid var(--bg-5);
  font-family: var(--font);
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const StorySectionBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  p {
    font-size: var(--font-size);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
`;

export const QuoteBlock = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  z-index: 100000;
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
  font-size: var(--font-size-input);
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

export const QuoteCharCount = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-family: var(--font);
  align-self: flex-end;

  &.warn {
    color: var(--amber-9);
  }
`;

/* ── Information section scroll body ──────────────────────────────────── */
export const InformationScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;

  scrollbar-width: thin;
  scrollbar-color: var(--bg-6) transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--bg-6); border-radius: 2px; }
`;

/* ── Extra attributes sub-section within Information ─────────────────── */
export const ExtraAttributesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
`;

export const ExtraAttributesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ExtraAttributesTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--font-size-h6, 1rem);
  font-weight: 700;
  color: var(--text);

  svg {
    color: var(--accent);
    flex-shrink: 0;
  }
`;

export const ExtraAttributesDesc = styled.p`
  margin: 0 0 0.25rem;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.5;
`;

export const AvatarCropBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;

  @media (max-width: 480px) {
    padding: 4px 2px;
  }
`;
