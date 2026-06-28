import { RadioGroup } from "radix-ui";
import styled, { css, keyframes } from "styled-components";
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
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--bg-2);
`;

export const PaletteRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
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


export const NoteDialogBodyWrapper = styled.div`
  padding: 4px 12px 0;
  max-height: 62vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

// ── Note editable bubble (preview + input combined) ──────────────────────────

export const NoteEditableBubble = styled.div<{ $color: string | null }>`
  position: relative;
  isolation: isolate;
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 22px;
  background: ${({ $color }) =>
    $color
      ? $color
      : "linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3) 100%)"};
  color: ${({ $color }) => ($color ? "#ffffff" : "inherit")};
  border-radius: 16px;
  padding: 10px 14px 10px 38px;
  cursor: text;
  /* always-visible dashed border signals "editable" */
  border: 1.5px dashed ${({ $color }) =>
    $color ? "rgba(255,255,255,0.35)" : "var(--accent-6)"};
  transition: background 0.25s ease, color 0.25s ease,
    border-color 0.18s ease, box-shadow 0.18s ease;

  /* solid border + glow when the inner contenteditable is focused */
  &:focus-within {
    border-style: solid;
    border-color: ${({ $color }) => ($color ? "rgba(255,255,255,0.6)" : "var(--accent)")};
    box-shadow: 0 0 0 3px
      ${({ $color }) =>
        $color
          ? "rgba(255,255,255,0.12)"
          : "color-mix(in srgb, var(--accent) 18%, transparent)"};
  }

  /* Thought bubble tail — behind all content */
  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: -18px;
    left: 16px;
    width: 0;
    height: 0;
    border-radius: 50%;
    border-left: 18px solid ${({ $color }) => $color ?? "var(--accent-4)"};
    border-bottom: 18px solid ${({ $color }) => $color ?? "var(--accent-4)"};
  }

  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    top: -11px;
    left: 4px;
    width: 0;
    height: 0;
    border-radius: 50%;
    border-left: 10px solid ${({ $color }) => $color ?? "var(--accent-3)"};
    border-bottom: 10px solid ${({ $color }) => $color ?? "var(--accent-3)"};
  }
`;

export const NoteEditableContent = styled.div`
  outline: none;
  min-height: 3.6em;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: inherit;
  background: transparent;
  caret-color: currentColor;

  &[data-empty]::before {
    content: attr(data-placeholder);
    opacity: 0.5;
    font-style: italic;
    pointer-events: none;
    display: block;
  }
`;

const noteEmojiWiggle = keyframes`
  0%   { transform: rotate(45deg) scale(1); }
  20%  { transform: rotate(10deg) scale(1.45); }
  45%  { transform: rotate(75deg) scale(1.2); }
  70%  { transform: rotate(20deg) scale(1.35); }
  100% { transform: rotate(45deg) scale(1); }
`;

const notePickerWiggle = keyframes`
  0%   { transform: scale(1.18); }
  20%  { transform: scale(1.5) rotate(-12deg); }
  45%  { transform: scale(1.25) rotate(10deg); }
  70%  { transform: scale(1.4) rotate(-6deg); }
  100% { transform: scale(1.18); }
`;

export const NotePreviewEmoji = styled.span<{ $wiggling?: boolean }>`
  position: absolute;
  top: -18px;
  right: -12px;
  font-size: 1.75rem;
  display: inline-block;
  transform: rotate(45deg);
  line-height: 1;
  pointer-events: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
  ${({ $wiggling }) =>
    $wiggling &&
    css`
      animation: ${noteEmojiWiggle} 0.5s ease;
    `}
`;

// ── Note no-color swatch ──────────────────────────────────────────────────────

export const NoteNoColorSwatch = styled.button<{ $active: boolean }>`
  all: unset;
  width: 18px;
  height: 18px;
  border-radius: 20%;
  cursor: pointer;
  border: ${({ $active }) =>
    $active ? "3px solid var(--text)" : "2px solid var(--bg-7)"};
  background: linear-gradient(
      to bottom right,
      transparent calc(50% - 1px),
      #ef4444 calc(50% - 1px),
      #ef4444 calc(50% + 1px),
      transparent calc(50% + 1px)
    ),
    var(--bg-4);
  transition: transform 0.1s ease, border-color 0.1s ease;

  &:hover {
    transform: scale(1.15);
  }
`;

// ── Note emoji picker ─────────────────────────────────────────────────────────

export const NoteEmojiPickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const NoteEmojiPickerArrow = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1px solid var(--bg-6);
  border-radius: 50%;
  background: var(--bg-2);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--accent) 14%, var(--bg-2));
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
  }
`;

export const NoteEmojiPickerRow = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  touch-action: pan-x;
  scrollbar-width: none;
  /* padding gives selected/scaled buttons room to render their
     box-shadow and scale without being clipped by the scroll container */
  padding-block: 8px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const NoteEmojiButton = styled.button<{ $selected: boolean; $wiggling?: boolean }>`
  all: unset;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: ${({ $selected }) => ($selected ? "1.25rem" : "1.1rem")};
  cursor: pointer;
  transition: background 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease, outline-color 0.12s ease;

  /* Selected state is always red — signals "click to remove" */
  background: ${({ $selected }) =>
    $selected ? "color-mix(in srgb, #ef4444 22%, var(--bg-3))" : "transparent"};
  outline: ${({ $selected }) => ($selected ? "2px solid #ef4444" : "1.5px solid transparent")};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 4px color-mix(in srgb, #ef4444 18%, transparent)" : "none"};
  transform: ${({ $selected }) => ($selected ? "scale(1.18)" : "scale(1)")};

  /* "×" badge always visible when selected */
  &[data-selected="true"]::after {
    content: "✕";
    position: absolute;
    top: -5px;
    right: -5px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    font-size: 7px;
    text-align: center;
    line-height: 13px;
    pointer-events: none;
  }

  &:not([data-selected="true"]):hover {
    background: var(--bg-4);
    transform: scale(1.2);
  }

  &:active {
    transform: scale(0.92);
  }

  ${({ $wiggling }) =>
    $wiggling &&
    css`
      animation: ${notePickerWiggle} 0.5s ease;
    `}
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

export const NoteColorSection = styled.div`
  margin-top: 14px;
`;

export const NoteEmojiSection = styled.div`
  margin-top: 12px;
`;

export const NoteColorLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

export const NoteLevelGate = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--accent);
  opacity: 0.8;
`;

export const NoteColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
`;

const colorRowSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const colorRowSwapIn = keyframes`
  0%   { opacity: 0.5; transform: translateX(-5px) scale(0.97); }
  60%  { transform: translateX(2px) scale(1.01); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
`;

export const NoteColorGridExpandWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const NoteColorGridRow = styled.div<{
  $slideIn?: boolean;
  $delay?: number;
  $swap?: boolean;
}>`
  ${({ $slideIn, $delay }) =>
    $slideIn &&
    css`
      animation: ${colorRowSlideIn} 0.18s ease ${($delay ?? 0) * 45}ms both;
    `}
  ${({ $swap }) =>
    $swap &&
    css`
      animation: ${colorRowSwapIn} 0.26s cubic-bezier(0.34, 1.2, 0.64, 1) both;
    `}
`;

export const NoteColorToggle = styled.button`
  all: unset;
  display: block;
  margin-top: 6px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font);
  user-select: none;
  opacity: 0.7;
  transition: color 0.15s ease, opacity 0.15s ease;
  letter-spacing: 0.01em;

  &:hover {
    color: var(--accent);
    opacity: 1;
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export const NoteColorSwatch = styled.button<{
  $color: string;
  $active: boolean;
}>`
  all: unset;
  width: 18px;
  height: 18px;
  border-radius: 20%;
  background: ${({ $color }) => $color};
  cursor: pointer;
  border: 3px solid
    ${({ $active }) => ($active ? "var(--text)" : "transparent")};
  transition: transform 0.1s ease, border-color 0.1s ease;

  &:hover {
    transform: scale(1.15);
  }
`;


// ── Note level-3 perk box ─────────────────────────────────────────────────────

const noteLockPulse = keyframes`
  0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(251,191,36,0); }
  30%  { transform: scale(1.02); box-shadow: 0 0 0 4px rgba(251,191,36,0.25); }
  60%  { transform: scale(0.99); box-shadow: 0 0 0 2px rgba(251,191,36,0.1); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(251,191,36,0); }
`;

export const NotePerksBox = styled.div<{ $unlocked?: boolean }>`
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${({ $unlocked }) =>
    $unlocked
      ? "linear-gradient(135deg, color-mix(in srgb, var(--grass-9) 9%, transparent) 0%, color-mix(in srgb, var(--grass-9) 5%, transparent) 100%)"
      : "linear-gradient(135deg, rgba(251, 191, 36, 0.09) 0%, rgba(245, 158, 11, 0.05) 100%)"};
  border: 1px solid ${({ $unlocked }) =>
    $unlocked
      ? "color-mix(in srgb, var(--grass-9) 32%, transparent)"
      : "rgba(251, 191, 36, 0.32)"};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const NotePerksHeader = styled.div<{ $unlocked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ $unlocked }) => ($unlocked ? "var(--grass-9)" : "rgba(251, 191, 36, 0.85)")};
`;

export const NoteLockBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.14) 0%,
    rgba(245, 158, 11, 0.08) 100%
  );
  border: 1px solid rgba(251, 191, 36, 0.42);
  animation: ${noteLockPulse} 0.45s ease;
`;

export const NoteLockBannerIcon = styled.span`
  font-size: 0.95rem;
  line-height: 1.4;
  flex-shrink: 0;
`;

export const NoteLockBannerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NoteLockBannerTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: rgba(251, 191, 36, 0.95);
  letter-spacing: 0.02em;
`;

export const NoteLockBannerDesc = styled.span`
  font-size: 0.68rem;
  color: var(--text-secondary);
  line-height: 1.45;
`;

export const NoteEditHint = styled.p`
  font-size: 0.65rem;
  color: var(--text-secondary);
  margin: 0;
  margin-left: 222px;
  margin-top: 4px;
  text-align: left;
  opacity: 0.7;

  @media (max-width: 480px) {
    margin-left: 122px;
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

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 4px 8px;
  }
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

  @media (max-width: 600px) {
    label > div {
      width: 80px;
      height: 80px;
    }

    > div {
      width: 110px;
      height: 110px;
    }

    .avatar {
      width: 110px;
      height: 110px;
    }
  }
`;

export const LandingHeroEditRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;

  @media (max-width: 600px) {
    align-items: center;
  }
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

export const BannerAvatarContainer = styled.div`
  position: relative;
  overflow: visible;
`;

export const AvatarHangRow = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  padding-left: 64px;
  overflow: visible;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  @media (max-width: 480px) {
    padding-left: 24px;
  }
`;

export const HangingAvatarWrap = styled.div`
  transform: translateY(50%);
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 5px var(--bg-2);

  @media (max-width: 480px) {
    transform: translateY(70%);
    > div:first-child {
      width: 90px;
      height: 90px;
    }
  }
`;

export const AvatarHangSpacer = styled.div`
  padding-top: 72px;
  padding-left: 64px;

  @media (max-width: 480px) {
    padding-top: 54px;
    padding-left: 24px;
  }
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

export const PaletteLockBadge = styled.span`
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg-2);
  border: 1.5px solid var(--amber-9);
  color: var(--amber-9);
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  font-family: var(--font);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  line-height: 1;
`;

export const PaletteLockNote = styled.p`
  font-size: var(--font-size-small);
  color: var(--amber-9);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  margin: 2px 2px 0;
`;

// ── Banner edit field ────────────────────────────────────────────────────────

export const BannerEditWrap = styled.div<{
  $src: string | null;
  $x: number;
  $y: number;
  $scale: number;
  $locked?: boolean;
}>`
  position: relative;
  width: 100%;
  aspect-ratio: 10 / 3;
  border-radius: 8px;
  overflow: hidden;
  cursor: ${({ $locked }) => ($locked ? "default" : "pointer")};
  border: 1.5px dashed var(--bg-7);
  background-color: var(--bg-3);
  transition: border-color 0.15s ease;

  ${({ $src, $x, $y, $scale }) =>
    $src
      ? `
        background-image: url(${$src});
        background-repeat: no-repeat;
        background-size: ${$scale * 100}% auto;
        background-position: ${$x}% ${$y}%;
        border-style: solid;
        border-color: var(--bg-6);
      `
      : ""}

  &:hover {
    ${({ $locked }) => !$locked && "border-color: var(--accent);"}
  }
`;

export const BannerDeleteButton = styled.button`
  all: unset;
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(220, 38, 38, 0.85);
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

export const BannerEditHint = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: #fff;
  background: rgba(0, 0, 0, 0.42);
  opacity: 0;
  transition: opacity 0.15s ease;

  ${BannerEditWrap}:hover & {
    opacity: 1;
  }
`;

export const BannerEmptyContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  pointer-events: none;
  color: var(--text-secondary);
  transition: color 0.18s ease;

  ${BannerEditWrap}:hover & {
    color: var(--accent);
  }

  @media (max-width: 480px) {
    justify-content: center;
    padding-left: 120px;
  }
`;

export const BannerLockNote = styled.p`
  font-size: var(--font-size-small);
  color: var(--amber-9);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  margin: 2px 2px 0;
`;

export const BannerLockBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(35, 35, 35, 0.82);
  border: 1px solid rgba(180, 180, 180, 0.2);
  border-radius: 4px;
  padding: 2px 6px;
  color: rgba(251, 191, 36, 1);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  pointer-events: none;
  z-index: 1;
`;

export const BannerLockedStrip = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: linear-gradient(
    to top,
    rgba(20, 20, 20, 0.88) 0%,
    rgba(60, 60, 60, 0.45) 100%
  );
  border-top: 1px solid rgba(180, 180, 180, 0.2);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: rgba(251, 191, 36, 1);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  text-align: right;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 480px) {
    font-size: var(--font-size-xxsmall);
    padding: 6px 10px;
  }
`;

export const BannerEmptyIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.45;
  margin-bottom: 4px;
  transition: opacity 0.18s ease;

  ${BannerEditWrap}:hover & {
    opacity: 0.85;
  }
`;

export const BannerEmptyLabel = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: inherit;
`;

export const BannerFormatLine = styled.span`
  font-size: 0.65rem;
  color: inherit;
  opacity: 0.65;
  letter-spacing: 0.02em;
`;

// ── Avatar crop dialog ───────────────────────────────────────────────────────

export const AvatarCropBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
`;

/** Circular viewport that clips the image preview */
export const AvatarCropViewport = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  background-color: var(--bg-1);
  cursor: grab;
  touch-action: none;
  user-select: none;
  align-self: center;

  &:active {
    cursor: grabbing;
  }

  @media (max-width: 460px) {
    width: clamp(140px, 44vw, 180px);
    height: clamp(140px, 44vw, 180px);
  }
`;

/** Background-image layer that moves around inside the viewport */
export const AvatarCropImage = styled.div<{
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
  background-size: ${({ $scale }) => $scale * 100}% auto;
  background-position: ${({ $x, $y }) => `${$x}% ${$y}%`};
  pointer-events: none;
`;

export const AvatarCropScaleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;

  label {
    font-family: var(--font);
    font-size: 11px;
    color: var(--text-secondary);
    min-width: 62px;
    flex-shrink: 0;
    display: flex;
    gap: 4px;
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
  }
`;

// ── Note edit tray (mobile bottom sheet) ─────────────────────────────────────

const noteTraySlideIn = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

const noteTraySlideOut = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
`;

const noteTrayOverlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const noteTrayOverlayOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

export const NoteTrayOverlay = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  animation: ${({ $closing }) => ($closing ? noteTrayOverlayOut : noteTrayOverlayIn)} 0.28s ease both;
`;

export const NoteTraySheet = styled.div<{ $closing: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;
  background: var(--bg-2);
  border-radius: 16px 16px 0 0;
  border-top: 1px solid var(--bg-5);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.3);
  max-height: 88svh;
  display: flex;
  flex-direction: column;
  animation: ${({ $closing }) => ($closing ? noteTraySlideOut : noteTraySlideIn)} 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
  color: var(--text);
  font-family: var(--font);
  padding-bottom: 60px; /* space for safe-area-inset-bottom on iOS 15+ */
`;

export const NoteTrayHandle = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 4px;
  background: var(--bg-6);
  border-radius: 2px;
  margin: 10px auto 2px;
`;

export const NoteTrayHeaderBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 6px 12px 8px;
  border-bottom: 1px solid var(--bg-4);
`;

export const NoteTrayTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  flex: 1;
`;

export const NoteTrayActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const NoteTrayActionButton = styled.button<{ $variant: "cancel" | "confirm" }>`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  background: ${({ $variant }) =>
    $variant === "confirm" ? "var(--accent)" : "var(--bg-3)"};
  color: ${({ $variant }) =>
    $variant === "confirm" ? "var(--text-primary)" : "var(--text-secondary)"};
  border: 1px solid
    ${({ $variant }) => ($variant === "confirm" ? "transparent" : "var(--bg-5)")};

  &:hover {
    background: ${({ $variant }) =>
      $variant === "confirm" ? "var(--accent)" : "var(--bg-4)"};
    color: var(--text);
  }

  &:active {
    transform: scale(0.92);
  }
`;

export const NoteTrayBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
`;
