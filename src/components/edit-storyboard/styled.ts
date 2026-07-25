import { Dialog } from "radix-ui";
import styled, { keyframes } from "styled-components";

/* display:contents so this wrapper doesn't sit between the dialog/tray
   shell and Card — Card's flex:1/min-height:0 needs to reach the shell's
   flex container directly, or the sticky footer and internal body scroll
   break and content overflows the shell instead. */
export const EditStoryboardPageRoot = styled.div`
  display: contents;
`;

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

  .separator[data-orientation="horizontal"] {
    height: 1px;
    margin-top: var(--font-size-small);
    margin-bottom: var(--font-size-xsmall);
    background-color: var(--bg-6);
  }

  /* Overlay mode: fill the dialog/tray shell instead of centering as a page.
     Header/footer stay put; Body (below) owns the internal scrolling. */
  ${({ $embedded }) =>
    $embedded &&
    `
    margin-block: 0;
    margin-inline: 0;
    max-width: none;
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border: none;
    background-color: transparent;
    padding: 0;
  `}
`;

export const TopBar = styled.div<{ $embedded?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: sticky;
  top: 0;
  z-index: 5;
  flex-shrink: 0;
  background-color: var(--bg-2);
  padding-block: 4px;

  ${({ $embedded }) =>
    $embedded &&
    `
    padding: 14px 16px;
    border-bottom: 1px solid var(--bg-5);

    @media (min-width: 801px) {
      padding: 16px 20px;
    }
  `}

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
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover,
  &:active {
    color: var(--accent);
    border-color: var(--accent-7);
    background: var(--bg-4);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

/* Compact destructive action surfaced in the header when editing inside the
   dialog/tray, so deleting doesn't require scrolling to the danger zone. */
export const HeaderDangerButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--tomato-9);
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s;

  &:hover {
    background: color-mix(in srgb, var(--tomato-9) 14%, transparent);
    border-color: var(--tomato-9);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const FormHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  .titles {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  h1 {
    all: unset;
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-bold);
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtitle {
    font-size: var(--font-size-xsmall);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  svg {
    flex-shrink: 0;
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

// ── Scrollable body (embedded mode) / footer ────────────────────────────────

/* Everything between the header and footer. In embedded (dialog/tray) mode
   this is the only part that scrolls, so the header and footer stay put. */
export const Body = styled.div<{ $embedded?: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ $embedded }) =>
    $embedded &&
    `
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 16px;

    @media (min-width: 801px) {
      padding: 0 20px;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--bg-5);
      border-radius: 3px;
    }
  `}
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--bg-5);
  background: var(--bg-2);

  @media (min-width: 801px) {
    padding: 14px 20px;
  }
`;

export const FooterCancelBtn = styled.button`
  all: unset;
  padding: 11px 14px;
  border-radius: 9px;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: var(--text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FooterPrimaryBtn = styled.button`
  all: unset;
  flex: 1;
  text-align: center;
  padding: 12px 18px;
  border-radius: 9px;
  background: var(--accent);
  color: #fff;
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  &:disabled {
    background: var(--bg-6);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

// ── Cover ────────────────────────────────────────────────────────────────

export const CoverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--bg-5);

  @media (max-width: 480px) {
    gap: 12px;
    padding: 12px 2px;
  }
`;

export const CoverThumb = styled.div`
  flex-shrink: 0;
`;

export const CoverMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  .t {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }

  .s {
    font-size: var(--font-size-xsmall);
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

export const CoverMetaButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  width: fit-content;
  transition: border-color 0.18s, background 0.18s, color 0.18s;

  &:hover {
    border-color: var(--accent-7);
    background: var(--bg-4);
    color: var(--text);
  }

  svg {
    width: 13px;
    height: 13px;
  }
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
  font-size: var(--font-size-input);
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
`;

export const EditorArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 1;
  }
`;

export const CreatorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  span.label {
    opacity: 0.75;
  }
`;

// ── Visibility segmented control ────────────────────────────────────────

export const VisibilitySeg = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
`;

export const VisibilitySegOption = styled.button<{ $active: boolean }>`
  all: unset;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 10px;
  border-radius: 7px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  color: ${({ $active }) =>
    $active ? "var(--text)" : "var(--text-secondary)"};
  background: ${({ $active }) => ($active ? "var(--bg-5)" : "transparent")};

  &:hover {
    color: var(--text);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const VisibilityHint = styled.p`
  margin: 8px 2px 0;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  line-height: 1.4;
`;

// ── Members row ──────────────────────────────────────────────────────────

export const MembersRow = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    border-color: var(--accent-7);
    background: var(--bg-4);
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
    gap: 10px;
  }
`;

export const MemberStack = styled.div`
  display: flex;
  align-items: center;

  .avatar {
    width: 30px;
    height: 30px;
    border: 2px solid var(--bg-3);
    margin-left: -10px;

    &:first-child {
      margin-left: 0;
    }
  }

  @media (max-width: 480px) {
    .avatar {
      width: 26px;
      height: 26px;
      margin-left: -8px;
    }
  }
`;

export const MembersRowText = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  flex: 1;

  .title {
    font-size: var(--font-size);
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }

  .subtitle {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
  }
`;

// ── Delete section ───────────────────────────────────────────────────────

export const DangerZone = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--tomato-9) 35%, var(--bg-6));
  background: color-mix(in srgb, var(--tomato-9) 6%, transparent);

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const DangerZoneText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .title {
    font-size: var(--font-size);
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }

  .subtitle {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
  }
`;

export const DeleteButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--tomato-9) 12%, transparent);
  color: var(--tomato-9);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--tomato-9);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: var(--tomato-9);
    color: #fff;
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

// ── Fandom picker (trigger + search dialog) ─────────────────────────────────

export const PickerTrigger = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
  width: 100%;
  box-sizing: border-box;
  color: var(--text);

  &:hover {
    border-color: var(--accent-7);
    background: var(--bg-4);
  }

  .picker-value {
    font-size: var(--font-size);
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &[data-empty="true"] .picker-value {
    color: var(--text-secondary);
  }

  .picker-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: var(--text-secondary);
  }

  .picker-lead {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: var(--text-muted, var(--text-secondary));
  }
`;

export const PickerClear = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--tomato-9);
  }
`;

const overlayShow = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const FandomDialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  /* Above the mobile slide-up tray (z-index 99999) so the picker is visible
     when opened from within the story-creation tray. */
  z-index: 100000;
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
  z-index: 100001;
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
  border: 1px solid
    ${({ $selected }) => ($selected ? "var(--accent)" : "transparent")};

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

// ── Genre multi-select (curated, up to 5) ───────────────────────────────────

export const SectionLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

export const GenreCount = styled.span<{ $full?: boolean }>`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  color: ${({ $full }) => ($full ? "var(--accent)" : "var(--text-secondary)")};
`;

export const GenrePills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`;

export const GenrePill = styled.button<{ $selected: boolean; $color: string }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
  color: ${({ $selected }) => ($selected ? "#fff" : "var(--text)")};
  background: ${({ $selected, $color }) =>
    $selected ? $color : "var(--bg-3)"};
  border: 1.5px solid
    ${({ $selected, $color }) => ($selected ? $color : "var(--bg-6)")};

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    display: ${({ $selected }) => ($selected ? "none" : "inline-block")};
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    border-color: ${({ $color }) => $color};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const PickerHint = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
`;

export const GenreToggle = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 2px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  color: var(--accent);
  border: 1px solid var(--bg-6);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-4);
    border-color: var(--accent-7);
    color: var(--accent-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// ── Avatar crop dialog body (shared visual shell) ───────────────────────────

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
