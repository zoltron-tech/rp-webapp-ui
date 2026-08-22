import { styled } from "styled-components";
import { dialogPopIn, fadeIn, spin } from "@/theme/animations";

// ─── Dialog shell (desktop) ───────────────────────────────────────────────────

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.2s ease both;
`;

export const DialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  padding: 24px;
  width: min(440px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  animation: ${dialogPopIn} 0.2s ease both;
  outline: none;
`;

export const DialogClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-5);
    color: var(--text);
  }
`;

export const DialogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 32px;
`;

export const DialogTitle = styled.h2`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  margin: 0;
`;

export const DialogDescription = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

// ─── Story preview card ────────────────────────────────────────────────────────

export const PreviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;
`;

export const StoryCover = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 66px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-4);
  border: 1px solid var(--bg-6);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const StoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

export const StoryName = styled.h3`
  margin: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StoryFandom = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ─── Share link row ───────────────────────────────────────────────────────────

export const LinkRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
`;

export const LinkBox = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  min-height: 38px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  color: var(--text-secondary);

  > svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export const LinkUrl = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CopyButton = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 0 14px;
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid ${({ $copied }) => ($copied ? "rgba(34, 197, 94, 0.5)" : "var(--bg-6)")};
  background: ${({ $copied }) => ($copied ? "rgba(34, 197, 94, 0.12)" : "var(--bg-3)")};
  color: ${({ $copied }) => ($copied ? "#22c55e" : "var(--text)")};
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: ${({ $copied }) => ($copied ? "rgba(34, 197, 94, 0.12)" : "var(--bg-5)")};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// ─── Action buttons ───────────────────────────────────────────────────────────

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const NativeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.92;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const DiscordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: #5865f2;
  color: #fff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: ${spin} 0.7s linear infinite;
`;

export const ErrorText = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--red-9, #e5484d);

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

// ─── Success state ──────────────────────────────────────────────────────────

export const ResultState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 8px 4px 4px;
`;

export const ResultIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  font-size: 22px;
  margin-bottom: 4px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const ResultTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const ResultSubtitle = styled.p`
  margin: 0 0 8px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const ViewButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-5);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const DoneButton = styled.button`
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;

  &:hover {
    color: var(--text);
  }
`;

export const SrAnnounce = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// ─── Mobile tray content wrapper ──────────────────────────────────────────────

export const TrayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px;
  width: 100%;
`;
