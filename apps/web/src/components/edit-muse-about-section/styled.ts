import styled from "styled-components";
import { DEV_MODE_BORDER, MATERIAL_CARD } from "@/theme";

export const Container = styled.div`
  padding-block: 20px;
  padding-inline: 16px;
  display: flex;
  ${MATERIAL_CARD}
  max-width: 700px;
  margin-inline: auto;
  border-radius: 24px;
  ${DEV_MODE_BORDER("red")}
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 40px;

  @media (max-width: 600px) {
    & {
      margin-top: unset;
    }
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  display: block;
`;

export const OrdinalInput = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--material-edge);
  border-radius: 0.25rem;
  background-color: var(--field-fill);
  accent-color: var(--accent);
  color: var(--text);
  font-size: var(--font-size-input);
  transition: border-color 0.2s;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    background-color: var(--field-fill);
    color: var(--accent);
    cursor: pointer;
    opacity: 1;
  }

  &:hover {
    border-color: var(--bg-5);
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

export const SubmitButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: var(--fill-hover);
  color: var(--text);
  border: 1px solid var(--material-edge);
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--fill-pressed);
    border-color: var(--bg-6);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ─── Full-page layout ──────────────────────────────────────────────────── */

export const FPRoot = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100dvh - var(--topbar-height));
  width: 100%;
  background-color: var(--bg-2);
  overflow: hidden;
  z-index: 1000;
`;

export const FPTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: var(--material-fill);
  border-bottom: 1px solid var(--material-edge);
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
    background-color: var(--fill-pressed);
  }

  svg {
    width: 20px;
    height: 20px;
  }
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

export const FPBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FPMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--material-fill);
  border-bottom: 1px solid var(--material-edge);
  flex-shrink: 0;
  flex-wrap: wrap;
`;

export const FPMetaRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

export const FPEditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
`;

export const FPOrdinalLabel = styled.label`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-family: var(--font);
`;

export const FPOrdinalInput = styled.input`
  width: 56px;
  padding: 4px 6px;
  border: 1px solid var(--material-edge);
  border-radius: 0.25rem;
  background-color: var(--fill-hover);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  text-align: center;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FPGifButton = styled.button`
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
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: var(--accent-hover);
  }

  &:active {
    background-color: var(--accent-active);
  }
`;

export const FPErrorMessage = styled.div`
  flex-shrink: 0;
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background-color: rgba(239, 68, 68, 0.08);
  border-top: 1px solid rgba(239, 68, 68, 0.3);
`;

export const FPAttachButton = styled.label`
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
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: var(--accent-hover);
  }

  &:active {
    background-color: var(--accent-active);
  }
`;

export const FPMediaPreviewArea = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--material-edge);
  background-color: var(--material-fill);
`;

export const FPMediaPreviewImg = styled.img`
  max-height: 120px;
  max-width: 200px;
  border-radius: 4px;
  object-fit: contain;
  display: block;
`;

export const FPMediaRemoveButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  background-color: var(--fill-pressed);
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background-color: var(--fill-pressed);
  }
`;

export const FPMediaUploadingText = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  align-self: center;
`;

/* ── Ordinal stepper ─────────────────────────────────────────────────────── */

export const OrdinalStepper = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--material-edge);
  border-radius: 6px;
  overflow: hidden;
  height: 32px;
`;

export const OrdinalStepBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 32px;
  cursor: pointer;
  color: var(--text-secondary);
  background-color: var(--fill-hover);
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
  transition: background-color 0.12s, color 0.12s;
  user-select: none;

  &:hover:not(:disabled) {
    background-color: var(--fill-pressed);
    color: var(--text);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export const OrdinalValue = styled.span`
  min-width: 36px;
  text-align: center;
  font-size: var(--font-size-small);
  font-family: var(--font);
  color: var(--text);
  background-color: var(--field-fill);
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--material-edge);
  border-right: 1px solid var(--material-edge);
  padding-inline: 6px;
  font-weight: 600;
`;

/* ── Inline / sheet form root ─────────────────────────────────────────────── */

/**
 * Root container for MuseAboutSectionForm.
 * On mobile (inside a bottom sheet): fills the sheet with flex column.
 * On desktop (inline card): has border + rounded corners and a min-height
 * so the editor is comfortable.
 */
export const FormRoot = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-2);

  /* Mobile: fill the sheet */
  @media (max-width: 768px) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* Desktop: card style with comfortable editor height */
  @media (min-width: 769px) {
    border: 1px solid var(--bg-6);
    border-radius: 10px;
    overflow: hidden;
    min-height: 360px;
  }
`;

export const FormTitle = styled.span`
  flex: 1;
  text-align: center;
  font-size: var(--font-size-h6, 1rem);
  font-weight: 700;
  color: var(--text);
  font-family: var(--font);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
