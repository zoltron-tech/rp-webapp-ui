import styled from "styled-components";

export const Composer = styled.form`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 4px;
  padding: 10px;
  align-items: center;
  background-color: var(--bg-1);
`;

export const ComposerWrapper = styled.div`
  position: relative;
`;

export const MediaToolbar = styled.div<{ $open: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background-color: var(--bg-1);
  transform: ${({ $open }) => ($open ? "translateY(0)" : "translateY(100%)")};
  opacity: ${({ $open }) => ($open ? "1" : "0")};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: transform 0.2s ease, opacity 0.15s ease;
`;

export const SendButton = styled.button`
  height: 44px;
  min-width: 120px;
  border: none;
  border-radius: 4px;
  background: var(--accent);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    cursor: pointer;
    background: var(--accent);
  }

  &:disabled {
    background: var(--bg-4);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  @media (max-width: 680px) {
    min-width: 44px;
    width: 44px;
    padding: 0;
  }
`;

export const SendButtonText = styled.span`
  @media (max-width: 680px) {
    display: none;
  }
`;

export const SenderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 44px;
  padding: 0 8px 0 4px;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--bg-6));
  border-radius: 999px;
  background: var(--bg-2);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;

  .avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
    transition: opacity 0.15s ease;
  }

  &:hover {
    background: var(--bg-3);
    border-color: color-mix(in srgb, var(--accent) 55%, var(--bg-6));
  }

  &:hover .avatar {
    opacity: 0.85;
  }
`;

export const SenderCaret = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 9px;
  line-height: 1;
  pointer-events: none;
`;

export const SenderDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SenderSearch = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--bg-6);
  background: var(--bg-4);
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);

  &:focus {
    outline: none;
    border-color: color-mix(in srgb, var(--accent) 60%, var(--bg-6));
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const SenderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 260px;
  overflow-y: auto;
`;

export const SenderListItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 14%, var(--bg-4))"
      : "transparent"};
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.12s ease;

  .avatar {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  &:hover {
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-4));
  }
`;

export const SenderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
`;

export const SenderName = styled.span`
  font-size: var(--font-size-input);
  color: var(--text);
  font-weight: var(--font-weight-semi-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SenderType = styled.span`
  font-size: var(--font-size-input);
  color: var(--text-secondary);
`;

export const SenderSelectedMark = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
`;

const MediaPickerButton = styled.button`
  height: 32px;
  padding-inline: 4px;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-3);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.5px;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }

  &[data-active="true"] {
    background: color-mix(in srgb, var(--accent) 15%, var(--bg-4));
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
  }
`;

export const GifButton = MediaPickerButton;
export const StickerButton = MediaPickerButton;

export const MediaToggleButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-3);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  transition: background 0.12s ease, color 0.12s ease;

  > span {
    display: inline-flex;
    transition: transform 0.2s ease;
  }

  &[data-open="true"] {
    background: color-mix(in srgb, var(--accent) 12%, var(--bg-4));
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));

    > span {
      transform: rotate(45deg);
    }
  }

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }

  @media (max-width: 680px) {
    width: 38px;
    height: 38px;
  }
`;

export const SenderEmptyText = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  padding: 16px 0;
`;

export const SenderDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 2px;
  text-transform: uppercase;
  font-size: var(--font-size-xxsmall);
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  pointer-events: none;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
  }
`;

export const SenderSectionLabel = styled.div`
  padding: 4px 2px 2px;
  font-size: var(--font-size-xsmall);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  pointer-events: none;
  opacity: 0.7;
`;
