import { RichText as NWRichText } from "@novelist-world/ui";
import { Form, Select } from "radix-ui";
import styled from "styled-components";
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
    background-color: var(--bg-1);
    padding-inline: 10px;
    padding-block: 30px;
    border: none;
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
  margin-bottom: var(--font-size-h4);

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

  @media screen and (max-width: 480px) {
    h1 {
      font-size: var(--font-size-h5);
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

  .avatar-field {
    .avatar {
      margin-top: 40px;
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
    width: 400px;
  }

  .note {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 600px;
  }
`;

export const FandomSelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-inline: 5px;
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

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: var(--font-size-small);
  width: 100%;
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
    gap: 20px;

    @media screen and (max-width: 720px) {
      padding-top: 40px;
    }

    .media-label {
      height: 240px;
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
