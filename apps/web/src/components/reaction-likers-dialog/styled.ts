import { css, styled } from "styled-components";
import { DIALOG_SCRIM, FOCUS_RING, GLASS_DIALOG } from "@/theme";
import { dialogPopIn, fadeIn, shimmerMove } from "@/theme/animations";

// ─── Dialog shell (desktop) ───────────────────────────────────────────────────

// z-index sits in the same "top tier" as edit-storyboard/profile-edit dialogs
// (100000/100001) rather than the more common 200/201, since this dialog can be
// opened from a heart count nested inside another already-open preview
// dialog/tray (e.g. the story-card preview), and must always render above it.
export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100000;
  ${DIALOG_SCRIM}
  animation: ${fadeIn} 0.2s ease both;
`;

export const DialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100001;
  ${GLASS_DIALOG}
  border-radius: 22px;
  padding: 24px;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
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

export const DialogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 32px;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DialogTitle = styled.h2`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  margin: 0;
`;

export const CountBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 11px;
  background: var(--bg-4);
  color: var(--text-secondary);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
`;

// ─── Mobile tray header (title + circular close button) ──────────────────────

export const MobileHeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 4px 12px;
  border-bottom: 1px solid var(--bg-5);
`;

export const MobileConfirmButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-5);
    color: var(--text);
  }

  &:active {
    transform: scale(0.92);
  }
`;

// ─── Likers list ───────────────────────────────────────────────────────────────

export const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 340px;
  overflow-y: auto;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;

  /* Keeps the list (and everything below it) reachable on the smallest
     supported device, iPhone SE (375×667), where the tray has little
     vertical room to spare. */
  @media screen and (max-width: 800px) {
    max-height: 40vh;
  }
`;

export const FriendRow = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 10px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-6);
  }

  .likerAvatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    cursor: pointer;
  }

  @media screen and (max-width: 800px) {
    gap: 7px;
    padding: 6px 8px;

    .likerAvatar {
      width: 28px;
      height: 28px;
    }
  }
`;

export const FriendInfo = styled.button`
  all: unset;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  cursor: pointer;
`;

export const FriendNameRow = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

export const FriendName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FriendUsername = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;

  .button {
    width: auto;
    min-width: max-content;
    border-radius: 7px;
  }

  .button span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .button svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  .button.primary,
  .button.secondary,
  .button.negative,
  .button.positive {
    padding: 5px 10px !important;
    font-size: var(--font-size-xsmall);
  }

  .button.messaging {
    background-color: var(--accent);
    cursor: wait;
    pointer-events: none;
  }

  .button.icon-only {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    min-width: 26px;
    padding: 0 !important;
  }

  .button.icon-only span {
    min-width: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button.secondary.icon-only {
    border: 1px solid var(--bg-6);
  }

  .button.negative.pending {
    background-color: var(--bg-4);
    color: var(--text-secondary);

    span {
      color: var(--text-secondary);
    }

    &:not(.loading):hover {
      background-color: var(--tomato-9);
      color: #fff;

      span {
        color: #fff;
      }
    }
  }

  @media screen and (max-width: 800px) {
    .button.icon-only {
      width: 24px;
      height: 24px;
      min-width: 24px;
    }
  }
`;

export const EmptyText = styled.p`
  margin: 0;
  padding: 20px 12px;
  width: 100%;
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;

  @media screen and (max-width: 800px) {
    padding: 14px 10px;
  }
`;

// ─── Mobile tray content wrapper ──────────────────────────────────────────────

export const TrayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 4px;
  width: 100%;
`;

// ─── Shimmer skeleton rows ──────────────────────────────────────────────────────

const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--bg-3) 25%,
    var(--bg-4) 50%,
    var(--bg-3) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

export const ShimmerRow = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 10px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-6);
  }
`;

export const ShimmerCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  ${shimmer}

  @media screen and (max-width: 800px) {
    width: 28px;
    height: 28px;
  }
`;

export const ShimmerInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ShimmerLine = styled.div<{ $width?: string; $height?: string }>`
  height: ${({ $height }) => $height ?? "11px"};
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: 6px;
  ${shimmer}
`;

export const ShimmerButton = styled.div`
  width: 68px;
  height: 26px;
  border-radius: 7px;
  flex-shrink: 0;
  ${shimmer}
`;
