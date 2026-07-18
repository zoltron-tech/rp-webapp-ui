import styled, { keyframes } from "styled-components";

export const EditStoryboardEventPageRoot = styled.div``;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const EmbeddedLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 40px;
`;

export const EmbeddedSpinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--bg-6);
  border-top-color: var(--accent);
  animation: ${spin} 0.8s linear infinite;
`;

export const Card = styled.div<{ $embedded?: boolean }>`
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

  /* Overlay mode: fill the dialog/tray shell instead of centering as a page. */
  ${({ $embedded }) =>
    $embedded &&
    `
    margin-block: 0;
    margin-inline: 0;
    max-width: none;
    width: 100%;
    border: none;
    background-color: transparent;
    padding: 4px 4px 0;

    @media screen and (max-width: 800px) {
      padding: 0;
    }
  `}
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: var(--bg-2);
  padding-block: 4px;

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

export const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
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
  min-width: 0;

  h1 {
    all: unset;
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-bold);
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  svg {
    flex-shrink: 0;
    margin-right: var(--font-size-xsmall);
    width: var(--font-size-h3);
    height: var(--font-size-h3);
    color: var(--accent-8);
  }

  @media screen and (max-width: 480px) {
    h1 {
      font-size: var(--font-size-h5);
    }
  }
`;

export const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media screen and (max-width: 380px) {
    gap: 6px;
  }
`;

export const ResetButton = styled.button`
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

  @media screen and (max-width: 380px) {
    padding: 6px 10px;
  }
`;

export const SaveButton = styled.button`
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

  @media screen and (max-width: 380px) {
    padding: 6px 12px;
  }
`;

export const ErrorBanner = styled.p`
  margin: 4px 2px 0;
  font-size: var(--font-size-small);
  font-family: var(--font);
  color: var(--tomato-9);
`;

// ── Hero ──────────────────────────────────────────────────────────────────

export const Hero = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 20px 4px 16px;
  border-bottom: 1px solid var(--bg-5);

  @media (max-width: 600px) {
    padding: 16px 4px 14px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 14px 4px 12px;
  }
`;

export const CoverColumn = styled.div`
  flex-shrink: 0;

  @media (max-width: 480px) {
    align-self: center;
  }
`;

export const DetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
  /* Stretch fields to a common width so the Location input lines up with the
     date-picker rows below it (same left and right edges). */
  align-items: stretch;
  gap: 10px;
  flex: 1;
  min-width: 0;
  width: 100%;
  /* Cap the field width so inputs stay a sensible size (matches the scene
     divider pickers) instead of stretching the full column on wide screens. */
  max-width: 300px;
`;

// ── Sections ─────────────────────────────────────────────────────────────

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 14px 4px;
  box-sizing: border-box;

  & + & {
    border-top: 1px solid var(--bg-5);
  }

  @media (max-width: 480px) {
    padding: 10px 2px;
  }
`;

export const SectionLabel = styled.label`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const NameInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  font-family: var(--font);
  padding: 8px 12px;
  background: var(--bg-3);
  border: 1.5px solid var(--bg-6);
  border-radius: 6px;
  transition: border-color 0.18s, background 0.18s;
  cursor: text;
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

  @media (max-width: 480px) {
    font-size: var(--font-size-h6);
  }
`;

// ── Fields ────────────────────────────────────────────────────────────────

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const FieldLabel = styled.label`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
`;

export const OptionalHint = styled.span`
  margin-left: 5px;
  font-size: var(--font-size-xsmall);
  font-style: italic;
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  opacity: 0.65;
`;

export const TextInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1.5px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  transition: border-color 0.18s, background 0.18s;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
  }

  &:hover {
    border-color: var(--bg-8);
  }

  &:focus {
    border-color: var(--accent);
    outline: none;
  }
`;

/* Two shared columns — label then trigger — so the "Opening divider" and
   "Between passages" dropdowns line up and share an equal width. The selects
   use display:contents so their labels/triggers land directly in this grid. */
export const AsterismPickers = styled.div`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: 12px 14px;
  max-width: 420px;
`;

export const DescriptionEditor = styled.div`
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid var(--bg-6);
`;

// ── Chapter song ───────────────────────────────────────────────────────────

export const SongPreview = styled.div`
  width: 100%;
  max-width: 420px;
`;

export const SongButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const SongButton = styled.button`
  all: unset;
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--bg-4);
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

// ── Avatar crop dialog body ──────────────────────────────────────────────

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
