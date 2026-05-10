import styled from "styled-components";

/* --- Page shell ---------------------------------------------------------- */

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100dvh - var(--topbar-height, 56px));
  width: 100%;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 100;

  @media (min-width: 600px) {
    max-height: 600px;
  }
`;

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: var(--bg-2);
  max-width: 800px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);

  @media (max-width: 900px) {
    margin-top: 0px;
    border-radius: 0px;
    box-shadow: unset;
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0.625rem 1rem;
  background-color: var(--bg-3);
  border-bottom: 1px solid var(--bg-6);
  flex-shrink: 0;
  min-height: 52px;

  .icon {
    color: var(--accent);
    }
`;

export const BackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  min-width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s;

  &:hover,
  &:active {
    background-color: var(--bg-5);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const PageTitle = styled.h1`
  flex: 1;
  font-size: var(--font-size-h6, 1.1rem);
  font-weight: 700;
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AttributeCount = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  background: var(--bg-5);
  border-radius: 999px;
  padding: 2px 10px;
  font-weight: 600;
`;

/* â”€â”€â”€ Scrollable body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  /* Comfortable bottom padding so last card isn't hidden by the action bar */
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));

  scrollbar-width: thin;
  scrollbar-color: var(--bg-6) transparent;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6);
    border-radius: 2px;
  }
`;

/* â”€â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  text-align: center;

  svg {
    opacity: 0.3;
    width: 48px;
    height: 48px;
  }

  p {
    margin: 0;
    font-size: var(--font-size-small);
    line-height: 1.5;
  }
`;

/* â”€â”€â”€ Attribute card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const AttributeCard = styled.div`
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;
  padding: 0.875rem 0.875rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  position: relative;
`;

export const CardFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
`;

export const InputLabel = styled.label`
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

const inputBase = (hasError?: boolean) => `
  width: 100%;
  padding: 0.55rem 0.625rem;
  border: 1.5px solid ${hasError ? "#ef4444" : "var(--bg-6)"};
  border-radius: 6px;
  background-color: var(--bg-4);
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${hasError ? "#ef4444" : "var(--accent)"};
    box-shadow: 0 0 0 3px ${
      hasError
        ? "rgba(239,68,68,0.18)"
        : "color-mix(in srgb, var(--accent) 25%, transparent)"
    };
  }
`;

export const KeyInput = styled.input<{ $hasError?: boolean }>`
  ${({ $hasError }) => inputBase($hasError)}
`;

export const ValueInput = styled.input<{ $hasError?: boolean }>`
  ${({ $hasError }) => inputBase($hasError)}
`;

export const FieldError = styled.span`
  display: block;
  font-size: 0.68rem;
  color: #ef4444;
  margin-top: 1px;
  line-height: 1.3;
`;

/* â”€â”€â”€ Suggestions dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const KeyInputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 400;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  max-height: 200px;
  min-width: 160px;
  width: 100%;
  max-width: min(260px, calc(100vw - 2rem));
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-6) var(--bg-3);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6);
    border-radius: 2px;
  }
`;

export const SuggestionItem = styled.button<{ $focused: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border: none;
  background: ${({ $focused }) =>
    $focused
      ? "color-mix(in srgb, var(--accent) 18%, var(--bg-4))"
      : "transparent"};
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 500;
  transition: background 0.1s ease;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: color-mix(in srgb, var(--accent) 25%, var(--bg-4));
  }
`;

/* â”€â”€â”€ Remove button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const RemoveButton = styled.button`
  all: unset;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-family: var(--font);
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: color 0.15s, background-color 0.15s;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 13px;
    height: 13px;
  }

  &:hover,
  &:active {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

/* â”€â”€â”€ Add button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const AddButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 0.75rem;
  border: 1.5px dashed color-mix(in srgb, var(--accent) 50%, var(--bg-6));
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  font-size: var(--font-size-input);
  font-family: var(--font);
  font-weight: 700;
  color: var(--accent);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &:active {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

/* â”€â”€â”€ Bottom action bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  padding: 0.625rem 1rem;
  padding-bottom: calc(0.625rem + env(safe-area-inset-bottom, 0px));
  background-color: var(--bg-3);
  border-top: 1px solid var(--bg-6);
  flex-shrink: 0;
`;

export const CancelButton = styled.button`
  all: unset;
  cursor: pointer;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-3);
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  transition: background 0.15s;

  &:hover,
  &:active {
    background: var(--bg-4);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const SubmitButton = styled.button`
  all: unset;
  cursor: pointer;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  background: var(--accent);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: 600;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

/* â”€â”€â”€ Error banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  color: #ef4444;
  font-size: var(--font-size-small);
  font-family: var(--font);
`;

/* â”€â”€â”€ Legacy aliases (unused new names kept for compat) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export const AttributeList = styled.div``;
export const AttributeRow = styled.div``;
export const ButtonGroup = styled.div``;
export const ErrorMessage = styled.div``;
