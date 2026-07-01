import { keyframes, styled } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Dialog shell (desktop) ───────────────────────────────────────────────────

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.83);
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
  border-radius: 12px;
  padding: 28px 24px 24px;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeIn} 0.2s ease both;
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

// ─── Muse identity header ─────────────────────────────────────────────────────

export const MuseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
`;

export const MuseAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--bg-6);
  flex-shrink: 0;
`;

export const MuseAvatarPlaceholder = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--bg-5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
  font-size: 1.3rem;
`;

export const MuseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

export const MuseName = styled.h2<{ $color?: string | null }>`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: ${({ $color }) => $color ?? "var(--text)"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MuseFandom = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--bg-6);
`;

export const SubText = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
  width: 100%;
`;

// ─── Share link row ───────────────────────────────────────────────────────────

export const LinkBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  overflow: hidden;
`;

export const LinkText = styled.a`
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  font-size: var(--font-size-small);
  color: #5865f2;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0 14px;
  height: 100%;
  min-height: 40px;
  border: none;
  border-left: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-5);
    color: var(--text);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

// ─── Action button ────────────────────────────────────────────────────────────

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
  color: #ffffff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #4752c4;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// ─── Mobile tray content wrapper ──────────────────────────────────────────────

export const TrayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px;
  width: 100%;
`;

// ─── Success / error result states ───────────────────────────────────────────

export const ResultState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  width: 100%;
  text-align: center;
`;

export const ResultIconWrap = styled.div<{ $ok: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${({ $ok }) =>
    $ok ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"};
  color: ${({ $ok }) => ($ok ? "#22c55e" : "#ef4444")};

  svg {
    width: 26px;
    height: 26px;
  }
`;

export const ResultTitle = styled.h3`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  margin: 0;
`;

export const ResultSubtitle = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
`;

export const ViewButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 8px;
  background: #5865f2;
  color: #ffffff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #4752c4;
    color: #ffffff;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const RetryButton = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-4);
  }
`;
