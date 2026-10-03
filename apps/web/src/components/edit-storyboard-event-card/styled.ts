import styled, { keyframes } from "styled-components";
import {
  FIELD,
  ICON_BUTTON,
  MATERIAL_CARD,
  PILL_PRIMARY,
  PILL_SECONDARY,
} from "@/theme";
import { spin } from "@/theme/animations";

/* display:contents so this wrapper doesn't sit between the dialog/tray
   shell and Card — Card's flex:1/min-height:0 needs to reach the shell's
   flex container directly, or the sticky footer and internal body scroll
   break and content overflows the shell instead. */
export const EditStoryboardEventPageRoot = styled.div`
  display: contents;
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
  margin-block: 24px 48px;
  margin-inline: auto;
  max-width: 800px;
  /* Content layer: an editor sheet is material, never glass. */
  ${MATERIAL_CARD}
  border-radius: 24px;
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);
  padding: 20px 24px 24px;

  /* Below 800px the editor is the page: no sheet chrome, content to the edges. */
  @media screen and (max-width: 800px) {
    margin-block: 0px;
    padding-inline: 12px;
    padding-block: 10px;
    border: none;
    border-radius: 0;
    background-color: transparent;
    box-shadow: none;
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
    border-radius: 0;
    background-color: transparent;
    box-shadow: none;
    padding: 0;
  `}
`;

export const TopBar = styled.div<{ $embedded?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
  padding-block: 4px 8px;

  /* No fill of its own: in a dialog or tray it sits on the shell's glass, which
     an opaque bar would cover. */
  ${({ $embedded }) =>
    $embedded &&
    `
    padding: 14px 16px;
    border-bottom: 1px solid var(--glass-edge, rgb(255 255 255 / 0.11));

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
  ${ICON_BUTTON}
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
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 16px;
  ${PILL_SECONDARY}
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: var(--text);
  }

  @media screen and (max-width: 380px) {
    padding: 0 12px;
  }
`;

export const SaveButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 18px;
  ${PILL_PRIMARY}
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;

  @media screen and (max-width: 380px) {
    padding: 0 14px;
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
      background-color: var(--fill-pressed);
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
  border-top: 1px solid var(--glass-edge, rgb(255 255 255 / 0.11));

  @media (min-width: 801px) {
    padding: 14px 20px;
  }
`;

export const FooterCancelBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  ${PILL_SECONDARY}
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: var(--text);
  }
`;

export const FooterPrimaryBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  ${PILL_PRIMARY}
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-bold);
`;

// ── Cover ────────────────────────────────────────────────────────────────

export const CoverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--material-edge);

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
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  min-height: 32px;
  padding: 0 14px;
  ${PILL_SECONDARY}
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  width: fit-content;

  svg {
    width: 14px;
    height: 14px;
  }
`;

// ── Location / date-time row ────────────────────────────────────────────

export const DetailsRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;

  @media (max-width: 560px) {
    flex-direction: column;
    gap: 14px;
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
    border-top: 1px solid var(--material-edge);
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

export const SectionLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

export const CharCount = styled.span<{ $full?: boolean }>`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  color: ${({ $full }) =>
    $full ? "var(--tomato-9)" : "var(--text-secondary)"};
`;

export const NameInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 14px;
  ${FIELD}
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-bold);
  font-family: var(--font);
  cursor: text;

  &::placeholder {
    font-weight: var(--font-weight-regular);
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
  padding: 10px 12px;
  ${FIELD}
  font-size: var(--font-size-input);
  font-family: var(--font);
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
  border-radius: 14px;
  overflow: hidden;
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
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 16px;
  ${PILL_SECONDARY}
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: var(--text);
  }

  @media screen and (max-width: 380px) {
    padding: 0 12px;
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
