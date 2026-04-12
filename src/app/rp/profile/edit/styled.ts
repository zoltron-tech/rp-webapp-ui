import { RadioGroup } from "radix-ui";
import styled from "styled-components";
export const EditProfilePageRoot = styled.div``;

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

export const BasicInfoFields = styled.div`

    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    display: flex;



  .avatar-field {
    width: 150px;
    height: 150px;
    margin-block: 24px;

  .avatar {
    width: 150px;
    height: 150px;
    background-color: var(--bg-2);
    border: 6px solid var(--bg-1);
    z-index: 1;
  }
  }



  .name-fields {
    display: flex;
    flex-direction: column;
    width: 400px;
  }

  @media (max-width: 500px) {
    .name-fields {
      width: 300px;
    }
  }
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

export const PaletteGroup = styled(RadioGroup.Root)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  padding: 8px; /* container padding */
  border-radius: 8px;
  background-color: var(--bg-2);
`;

export const RadioItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  pointer-events: passthrough;

  &:hover {
    background-color: var(--bg-4);
  }

  .radio-item {
    all: unset;
    width: 60px;
    height: 30px;
    border-radius: 4px;
    background-color: var(--accent);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &[aria-checked="true"] {
      outline: 1.5px solid var(--accent-8);
      outline-offset: 2px;
    }
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: var(--font-size-small);
  width: 100%;
`;

export const VerficationEmailButton = styled.button`
      width: 120px;
      padding: 8px;
      background-color: var(--amber-a7);
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
        background-color: var(--amber-8);
      }

      &:not([disabled]):active {
        background-color: var(--amber-8);
      }

      &:focus {
        outline: 1.5px solid var(--amber-a7);
        outline-offset: 2px;
      }
`;

export const InfoBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border: 1px solid var(--blue-a6);
  padding: 12px;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--blue-12);
  background-color: var(--blue-a2);

  margin-bottom: 22px;

  div {
    display: flex;
    align-items: center;
    color: var(--blue-12);
    font-size: var(--font-size);
    font-weight: var(--font-weight-bold);
    margin-bottom: 8px;
  }

  svg {
    width: 22px;
    height: 22px;
    margin-right: 4px;
    fill: var(--blue-9);
  }

  p {
    margin: 0;
    margin-block: 8px;
    line-height: 1.4;
  }

  a {
    color: var(--accent-7);
    text-decoration: none;
    font-weight: var(--font-weight-bold);
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent-8);
      text-decoration: underline;
    }

    &:focus {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
  }

  strong {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size);
  }

  &.error {
    border-color: var(--tomato-a9);
    background-color: var(--tomato-a2);
    color: var(--tomato-12);

    svg {
      fill: var(--tomato-9);
    }
  }

  &.not_found {
    border-color: var(--amber-a9);
    background-color: var(--amber-a2);
    color: var(--amber-12);

    svg {
      fill: var(--amber-9);
    }
  }
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

export const MediaErrorWrapper = styled.div`
display: flex;
align-items: center;
justify-content: center;
padding-inline: 20px;
padding-top: 20px;
width: 100%;
`;

export const NoteDialogTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  resize: vertical;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  padding: 8px;
  font-family: var(--font);
  font-size: var(--font-size);
  box-sizing: border-box;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
`;

export const NoteDialogBodyWrapper = styled.div`
  padding: 4px 12px 0;
`;

export const NoteCharCount = styled.span`
  display: block;
  text-align: right;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-top: 4px;

  &.warn {
    color: var(--tomato-a9);
  }
`;
