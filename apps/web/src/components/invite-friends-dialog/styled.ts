import { styled } from "styled-components";
import { DIALOG_SCRIM, FOCUS_RING, GLASS_DIALOG } from "@/theme";
import { fadeIn } from "@/theme/animations";

// ─── Desktop dialog ─────────────────────────────────────────────────────────────

export const InviteDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  ${DIALOG_SCRIM}
  animation: ${fadeIn} 0.2s ease both;
`;

export const InviteDialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  ${GLASS_DIALOG}
  border-radius: 22px;
  padding: 28px 24px 24px;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeIn} 0.2s ease both;
`;

export const InviteDialogClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--glass-edge, rgb(255 255 255 / 0.11));
  background: var(--fill-hover, rgb(255 255 255 / 0.08));
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--fill-pressed, rgb(255 255 255 / 0.12));
    color: var(--text);
  }

  ${FOCUS_RING}
`;

// ─── Shared content (desktop + tray) ────────────────────────────────────────────

export const InviteIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 18%, var(--bg-3));
  color: var(--accent);
  font-size: 24px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const InviteTitle = styled.h2`
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-align: center;
  margin: 0;
`;

export const InviteDescription = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

export const InviteLinkBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  overflow: hidden;
`;

export const InviteLinkText = styled.a`
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  font-size: var(--font-size-small);
  color: var(--accent);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const InviteCopyButton = styled.button`
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

export const InviteReferralsLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  color: var(--accent);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

// ─── Mobile tray ─────────────────────────────────────────────────────────────────

export const InviteTrayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 4px 8px;
  width: 100%;
`;
