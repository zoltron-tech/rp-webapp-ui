import styled from "styled-components";

export const OnboardingPageRoot = styled.div``;

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
    padding-block: 10px;
    border: none;
  }

  .separator[data-orientation="horizontal"] {
    height: 1px;
    margin-top: var(--font-size-small);
    margin-bottom: var(--font-size-xsmall);
    background-color: var(--bg-6);
  }
`;

export const FormHeading = styled.div`
  display: flex;
  align-items: center;

  .heading-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  h1 {
    all: unset;
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-bold);
    color: var(--text);
    line-height: 1.2;
  }

  svg {
    margin-right: var(--font-size-small);
    width: var(--font-size-h2);
    height: var(--font-size-h2);
    color: var(--accent-8);
    flex-shrink: 0;

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

    svg {
      width: var(--font-size-h3);
      height: var(--font-size-h3);
    }
  }
`;

export const OocBadge = styled.span`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--accent-3);
  border: 1px solid var(--accent-6);
  color: var(--accent-11);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: var(--font);
`;

export const InfoCallout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: var(--font-size-small);
  padding: 12px 14px;
  background-color: var(--accent-2);
  border: 1px solid var(--accent-6);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  color: var(--text);
  font-size: var(--font-size-small);
  line-height: 1.45;

  strong {
    color: var(--text);
    font-weight: var(--font-weight-bold);
  }

  em {
    color: var(--accent-11);
    font-style: italic;
    font-weight: var(--font-weight-medium);
  }

  .callout-icon {
    width: 22px;
    height: 22px;
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

export const FormDescription = styled.div`
  font-size: var(--font-size);
  color: var(--text);

  p {
    margin-bottom: var(--font-size-small);
  }
`;

export const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;

  @media screen and (max-width: 800px) {
    flex-direction: column;
  }
`;

export const OnboardingPanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .tabs-list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 16px;
    counter-reset: tabs;

    .tab {
      all: unset;
      padding: 8px;
      cursor: pointer;
      font-size: var(--font-size);
      font-weight: var(--font-weight-medium);
      color: var(--bg-8);
      min-width: 80px;
      text-align: center;
      border-bottom: 2px solid transparent;
      border-radius: 2px;

      &:hover {
        border-color: var(--accent-3);
        color: var(--bg-11);
      }

      &:focus {
        outline: 1.5px solid var(--accent);
        outline-offset: 2px;
        z-index: 1;
      }

      &[aria-selected="true"] {
        color: var(--text);
        border-bottom: 2px solid var(--accent);
      }

      &::before {
        counter-increment: tabs;
        content: counter(tabs) ".";
        display: inline;
        margin-right: 4px;
        color: inherit;
        font-size: var(--font-size-small);
      }

      @media screen and (max-width: 800px) {
        &::before {
          display: none;
        }
      }

      @media screen and (max-width: 480px) {
        font-size: var(--font-size-small);
        font-weight: var(--font-weight-regular);
        min-width: unset;
      }
    }
  }
`;

const PreviewRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 300px;

  h1 {
    width: 100%;
    text-align: start;
    font-size: var(--font-size);
    font-weight: var(--font-weight-medium);
    color: var(--text);
    margin-top: var(--font-size-xsmall);
    margin-bottom: var(--font-size-small);
  }

  @media screen and (max-width: 800px) {
    margin-inline: auto;
    max-width: 100%;
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    background-color: var(--bg-2);
    border: 1px solid var(--bg-6);

    h1 {
      margin-top: 4px;
    }
  }
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 12px;
  padding-right: 8px;
  border-radius: 4px;
  background-color: var(--bg-1);
  position: relative;
  overflow: hidden;

  .avatar {
    margin-top: 16px;
    width: 100px;
    height: 100px;
    margin-bottom: 12px;
    background-color: var(--bg-2);
    border: 6px solid var(--bg-1);
    z-index: 1;
  }
`;

const PreviewCover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: var(--accent);
  border-bottom: none;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
`;

export const PreviewUsername = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--accent-8);
  margin-bottom: 4px;
  font-style: italic;
  user-select: all;
  text-transform: lowercase;

  &::before {
    content: "@";
  }
`;

export const PreviewAboutMe = styled.div`
  font-size: var(--font-size);
  color: var(--text-secondary);
  text-align: start;
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  padding: 8px;
  background-color: var(--bg-3);
`;

export const Preview = Object.assign(
  {},
  {
    AboutMe: PreviewAboutMe,
    Container: PreviewContainer,
    Cover: PreviewCover,
    Root: PreviewRoot,
    Username: PreviewUsername,
  },
);

export const StepContent = styled.section`
  padding: 8px;
  padding-top: 56px;
  background-color: var(--bg-1);
  border-radius: 4px;
  height: 300px;
  width: 100%;
  position: relative;

  @media screen and (max-width: 800px) {
    width: 100%;
    height: 180px;
    padding: 6px;
    padding-top: 44px;
    background-color: var(--bg-2);
    border: 1px solid var(--bg-6);
  }
`;

export const UsernameStepRoot = styled.div``;

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

  @media screen and (max-width: 800px) {
    form {
      .field {
        font-size: var(--font-size-small);
        margin-bottom: 4px;

        label {
          margin-block: 2px;
        }
      }

      input {
        margin-bottom: 4px;
        padding: 6px 8px;
        font-size: var(--font-size-small);
      }

      .submit-button {
        padding: 6px 10px;
        font-size: var(--font-size-small);
      }
    }
  }
`;

export const BasicInfoFields = styled.div`
  flex-direction: row;
  width: 100%;
  display: flex;
  padding-right: 12px;

  .avatar-field {
    width: 100px;
    height: 100px;
    margin-right: 12px;
    margin-top: 16px;
    flex-shrink: 0;

    label {
      position: relative;
      display: inline-block;
      width: 100px;
      height: 100px;
      cursor: pointer;
      border-radius: 50%;

      &:focus-within {
        outline: 2px solid var(--accent);
        outline-offset: 4px;
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0);
        transition: background-color 0.15s ease;
        pointer-events: none;
      }

      &:hover::after {
        background-color: rgba(0, 0, 0, 0.35);
      }

      .camera-badge {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--accent);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-1);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        z-index: 2;
        transition: background-color 0.15s ease, transform 0.15s ease;
        cursor: pointer;

        svg {
          width: 16px;
          height: 16px;
          pointer-events: none;
        }
      }

      &:hover .camera-badge {
        background-color: var(--accent-hover);
        transform: scale(1.06);
      }
    }

    .avatar {
      width: 100px;
      height: 100px;
      background-color: var(--bg-2);
      border: 6px solid var(--bg-1);
      z-index: 1;
    }
  }

  .name-fields {
    display: flex;
    flex-direction: column;
    gap: 0px;
    width: 100%;  }
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
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  z-index: 2;
`;

export const ResetButton = styled.button`
  all: unset;
  padding: 8px;
  background-color: var(--bg-3);
  color: var(--text-secondary);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;

  @media screen and (max-width: 800px) {
    padding: 6px 10px;
    font-size: var(--font-size-small);
  }

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
    width: 50px;
    height: 25px;
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

export const PaletteGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 8px;
  border-radius: 8px;
  background-color: var(--bg-2);
  width: 100%;
`;

export const PaletteOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;

  &:hover .palette-swatch {
    transform: scale(1.05);
  }

  .palette-swatch {
    all: unset;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--accent);
    cursor: pointer;
    transition: transform 0.15s ease, outline-color 0.15s ease;
    box-sizing: border-box;

    &[aria-checked="true"] {
      outline: 2px solid var(--accent-9);
      outline-offset: 3px;
    }

    &:focus-visible {
      outline: 2px solid var(--accent-9);
      outline-offset: 3px;
    }
  }

  .palette-name {
    font-size: var(--font-size-xsmall);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-family: var(--font);
  }

  &:has(.palette-swatch[aria-checked="true"]) .palette-name {
    color: var(--text);
  }

  @media screen and (max-width: 800px) {
    gap: 6px;
    padding: 2px;

    .palette-swatch {
      width: 36px;
      height: 36px;

      &[aria-checked="true"],
      &:focus-visible {
        outline-width: 2px;
        outline-offset: 2px;
      }
    }

    .palette-name {
      font-size: 10px;
      letter-spacing: 0.06em;
    }
  }
`;
