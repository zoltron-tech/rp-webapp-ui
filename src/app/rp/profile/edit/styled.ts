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
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--accent);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s ease, outline-color 0.15s ease;

    &:hover {
      transform: scale(1.05);
    }

    &[aria-checked="true"] {
      outline: 2px solid var(--accent-9);
      outline-offset: 3px;
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
  font-size: var(--font-size-input);
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

// ── Username row ──────────────────────────────────────────────────────────────

export const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;

  .username-label {
    font-size: var(--font-size);
    color: var(--accent);
    font-weight: var(--font-weight-bold);
  }
`;

export const EditUsernameButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.15s ease, background 0.15s ease;

  svg {
    width: 13px;
    height: 13px;
  }

  &:hover {
    color: var(--accent);
    background: var(--bg-4);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

// ── Change-username dialog ────────────────────────────────────────────────────

export {
  Content,
  Overlay,
  Title,
} from "@/components/dialog/styled";

export const DialogDescription = styled.p`
  font-size: var(--font-size-input);
  color: var(--text-secondary);
  margin: 8px 12px 16px;
  line-height: 1.5;
`;

export const DialogForm = styled.form`
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  input:not([type="hidden"]) {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--bg-6);
    background: var(--bg-3);
    color: var(--text);
    font-size: var(--font-size-input);
    font-family: var(--font);
    box-sizing: border-box;

    &:focus {
      outline: 2px solid var(--accent);
    }

    &:disabled {
      background: var(--bg-2);
      color: var(--text-secondary);
      cursor: not-allowed;
    }
  }
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
`;

export const DialogCancelButton = styled.button`
  all: unset;
  width: 90px;
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

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const DialogSubmitButton = styled.button`
  min-width: 90px;
  padding: 8px;
  background-color: var(--accent);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-medium);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;

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

  &[disabled] {
    background-color: var(--bg-6);
    cursor: not-allowed;
    color: var(--text-secondary);
  }
`;

export const UsernameFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AvailabilityIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-small);
  margin-top: 4px;
  font-weight: var(--font-weight-medium);

  svg {
    flex-shrink: 0;
    width: 13px;
    height: 13px;
  }

  &.available {
    color: var(--grass-9);
  }

  &.taken {
    color: var(--tomato-9);
  }

  &.checking {
    color: var(--text-secondary);
  }

  &.invalid {
    color: var(--amber-9);
  }
`;

export const DialogErrorText = styled.p`
  font-size: var(--font-size-small);
  color: var(--tomato-9);
  margin: 0;
  font-weight: var(--font-weight-medium);
`;

// ── Top bar / wizard shared ──────────────────────────────────────────────────

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

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

// ── Landing hero ─────────────────────────────────────────────────────────────

export const LandingHero = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 4px 12px;
`;

export const LandingHeroAvatarWrap = styled.div`
  flex-shrink: 0;

  label {
    cursor: pointer;
    display: block;
  }

  label > div {
    width: 100px;
    height: 100px;
  }

  .avatar {
    height: 150px;
    width: 150px;
    border: 3px solid var(--accent-7);
  }
`;

export const LandingHeroEditRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
`;

export const LandingHeroNameRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

export const LandingHeroInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  font-family: var(--font);
  padding: 6px 10px;
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
  }
`;

export const LandingHeroMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
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

export const LandingHeroResetButton = styled.button`
  all: unset;
  padding: 6px 14px;
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
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

export const LandingSubtitle = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-block: 12px 14px;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;

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
`;

export const LandingCardIconArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px 22px;

  &.appearance {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.04) 100%);
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    .section-icon { color: rgb(139, 92, 246); }
  }

  &.about {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.04) 100%);
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    .section-icon { color: rgb(59, 130, 246); }
  }

  &.account {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.04) 100%);
    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
    .section-icon { color: rgb(16, 185, 129); }
  }

  .section-icon {
    width: 38px;
    height: 38px;
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
  border: 1px solid ${({ $active }) => ($active ? "var(--grass-9)" : "var(--bg-6)")};
  color: ${({ $active }) => ($active ? "var(--grass-9)" : "var(--text-secondary)")};
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--grass-9) 10%, transparent)"
      : "var(--bg-4)"};
`;

// ── Account section ─────────────────────────────────────────────────────────

export const AccountSectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 4px;
`;

export const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;

  @media screen and (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

export const AccountRowMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

export const AccountRowLabel = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const AccountRowValue = styled.span`
  font-size: var(--font-size);
  color: var(--text);
  font-weight: var(--font-weight-medium);
  word-break: break-all;
`;

export const AccountRowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const AccountActionButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  background: var(--bg-4);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--bg-6);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: var(--bg-5);
    border-color: var(--accent);
    color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const AccountActionButtonPrimary = styled(AccountActionButton)`
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text);

  &:hover:not(:disabled) {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
    color: var(--text);
  }
`;

export const VerifiedBadge = styled.span<{ $verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid
    ${({ $verified }) => ($verified ? "var(--grass-9)" : "var(--amber-9)")};
  color: ${({ $verified }) => ($verified ? "var(--grass-9)" : "var(--amber-9)")};
  background: ${({ $verified }) =>
    $verified
      ? "color-mix(in srgb, var(--grass-9) 10%, transparent)"
      : "color-mix(in srgb, var(--amber-9) 10%, transparent)"};

  svg {
    width: 12px;
    height: 12px;
  }
`;

// ── Blocked novelists list ───────────────────────────────────────────────────

export const BlockedSectionHeading = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 8px 0 4px;
`;

export const BlockedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BlockedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;

  .avatar {
    width: 38px;
    height: 38px;
  }
`;

export const BlockedItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const BlockedItemName = styled.span`
  font-size: var(--font-size);
  color: var(--text);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BlockedItemUsername = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const UnblockButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--tomato-9) 10%, transparent);
  color: var(--tomato-9);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--tomato-9);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: var(--tomato-9);
    color: var(--text-contrast, #fff);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// ── About section ───────────────────────────────────────────────────────────

export const AboutSectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
`;

// ── Appearance section ──────────────────────────────────────────────────────

export const AppearanceSectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 12px 0;
`;

/**
 * Wraps the parts of the Appearance section that should preview the
 * currently-selected accent (palette swatches + Save button). Adding the
 * radix accent class ("jade", "cyan", "iris", "crimson") on this wrapper
 * scopes the new --accent-* variables to its subtree without changing the
 * global app accent until the user actually saves.
 */
export const AppearancePreviewScope = styled.div`
  display: contents;
`;

export const AppearanceFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AppearanceFieldLabel = styled.label`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
