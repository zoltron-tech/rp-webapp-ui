// Override emoji-picker-react search input font size
import { createGlobalStyle } from "styled-components";

export const EmojiPickerGlobalStyle = createGlobalStyle`
  .EmojiPickerReact .epr-search .epr-search-container,
  .EmojiPickerReact .epr-search input {
    font-size: 16px !important;
  }
`;

import styled from "styled-components";

export const Composer = styled.form`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 4px;
  padding: 10px 25px 35px 25px;
  align-items: center;
  background-color: var(--bg-1);
`;

export const ComposerWrapper = styled.div`
  position: relative;
  /* When the mobile media tray is open we reserve space below the composer
   * equal to the tray height, lifting the composer to rest just above it.
   * 0 on desktop / when closed, so there is no visible effect. */
  margin-bottom: var(--media-tray-height, 0px);
  transition: margin-bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1);
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

export const EditBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 25px;
  background-color: var(--bg-1);
  border-top: 1px solid var(--bg-4);
`;

export const EditBannerIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
`;

export const EditBannerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

export const EditBannerLabel = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--accent);
`;

export const EditBannerClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-3);
    color: var(--text-primary);
  }
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
  border: 1px solid var(--bg-6);
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

  &:hover:not(:disabled) {
    background: var(--bg-3);
    border-color: color-mix(in srgb, var(--accent) 55%, var(--bg-6));
  }

  &:hover:not(:disabled) .avatar {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
  height: 260px;
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
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.5px;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;

  @keyframes media-btn-wiggle {
    0%   { transform: rotate(0deg); }
    25%  { transform: rotate(-5deg); }
    50%  { transform: rotate(5deg); }
    75%  { transform: rotate(-3deg); }
    100% { transform: rotate(0deg); }
  }

  &:hover {
    background: var(--bg-4);
    border-color: var(--bg-6);
    color: var(--text);

    > svg,
    > * > svg {
      animation: media-btn-wiggle 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
  }

  &[data-active="true"] {
    background: color-mix(in srgb, var(--accent) 15%, var(--bg-4));
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
    color: var(--accent);
  }
`;

export const GifButton = MediaPickerButton;
export const StickerButton = MediaPickerButton;
export const ClipButton = MediaPickerButton;
export const ImageButton = MediaPickerButton;
export const EmojiButton = MediaPickerButton;

export const EmojiPickerWrap = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  right: 20px;
  z-index: 100;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
`;

export const MediaToolbarPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg-6);
    border-radius: 2px;
  }
`;

export const MediaToolbarThumb = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-4);
`;

export const MediaToolbarThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const MediaToolbarThumbVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const MediaToolbarRemoveBtn = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }
`;

export const MediaToolbarAddBtn = styled.button`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border: 2px dashed var(--bg-6);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  transition: border-color 0.12s ease, color 0.12s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 50%, var(--bg-6));
    color: var(--text);
  }
`;

export const MediaToolbarSendBtn = styled.button`
  flex-shrink: 0;
  height: 48px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.12s ease;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MediaPickerDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MediaPickerDropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border: 2px dashed var(--bg-6);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  font-size: var(--font-size-input);
  transition: border-color 0.12s ease, background 0.12s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 50%, var(--bg-6));
    background: color-mix(in srgb, var(--accent) 5%, var(--bg-2));
    color: var(--text);
  }
`;

export const MediaPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
`;

export const MediaPickerThumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-4);
`;

export const MediaPickerThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const MediaPickerThumbVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const MediaPickerRemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }
`;

export const MediaUploadOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  border-radius: inherit;
`;

export const MediaUploadSpinner = styled.span`
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: media-upload-spin 0.7s linear infinite;

  @keyframes media-upload-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const MediaUploadErrorBadge = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(229, 62, 62, 0.5);
  border-radius: inherit;
  font-size: 18px;
`;

export const MediaPickerSendBtn = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  transition: opacity 0.12s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export const MediaPickerError = styled.ul`
  margin: 0;
  padding: 10px 12px;
  list-style: none;
  border-radius: 6px;
  background: color-mix(in srgb, #e53e3e 12%, var(--bg-4));
  border: 1px solid color-mix(in srgb, #e53e3e 35%, var(--bg-6));
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    font-size: var(--font-size-small);
    color: #e53e3e;
    word-break: break-all;
  }
`;

export const MediaToggleButton = styled.button`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  transition: color 0.12s ease;
  padding: 0;

  > span {
    display: inline-flex;
    transition: transform 0.2s ease;
  }

  &[data-open="true"] {
    color: var(--accent);

    > span {
      transform: rotate(45deg);
    }
  }

  &:hover {
    color: var(--text);
  }
`;

export const InlineSendButton = styled.button`
  flex-shrink: 0;
  border: none;
  height: 28px;
  width: 28px;
  background-color: var(--accent);
  padding: 12px 12px;
  border-radius: 50%;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  overflow: hidden;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  svg {
    transform: rotate(-30deg);
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

/* ─── Mobile media tray (Discord-style bottom sheet) ─────────────────────── */

export const TrayRoot = styled.div<{ $open: boolean; $expanded: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ $expanded }) =>
    $expanded
      ? "calc(100dvh - var(--tray-top-offset, 56px))"
      : "var(--tray-height, 320px)"};
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: var(--bg-1);
  border-top: 1px solid var(--bg-6);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.32);
  padding-bottom: env(safe-area-inset-bottom);
  transform: ${({ $open }) => ($open ? "translateY(0)" : "translateY(100%)")};
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1),
    height 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform, height;
`;

export const TrayHeader = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--bg-3);
`;

export const TrayTabs = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  flex: 0 1 auto;
  min-width: 0;
  padding: 2px;
  background: var(--bg-3);
  border-radius: 999px;
  isolation: isolate;
`;

/* The single highlight that slides between the segments. Its width is one
 * segment (accounting for the 3px inset padding on each side) and it is
 * translated horizontally by whole multiples of its own width. */
export const TrayTabsIndicator = styled.span<{
  $count: number;
  $index: number;
}>`
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px) / ${({ $count }) => $count});
  transform: translateX(${({ $index }) => `calc(100% * ${$index})`});
  background: color-mix(in srgb, var(--accent) 18%, var(--bg-1));
  border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--bg-6));
  border-radius: 999px;
  z-index: 0;
  pointer-events: none;
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
`;

export const TrayTabPill = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? "var(--accent)" : "var(--text-secondary)")};
  border-radius: 999px;
  padding: 7px 16px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
`;

export const TrayKeyboardButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: var(--bg-3);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: var(--bg-4);
  }

  &:active {
    transform: translateY(-50%) scale(0.94);
  }
`;

export const TrayBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;
