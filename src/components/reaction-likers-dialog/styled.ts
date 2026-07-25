import { css, keyframes, styled } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const dialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

// ─── Dialog shell (desktop) ───────────────────────────────────────────────────

// z-index sits in the same "top tier" as edit-storyboard/profile-edit dialogs
// (100000/100001) rather than the more common 200/201, since this dialog can be
// opened from a heart count nested inside another already-open preview
// dialog/tray (e.g. the story-card preview), and must always render above it.
export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.2s ease both;
`;

export const DialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100001;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  padding: 24px;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
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
  gap: 10px;
  width: 100%;
  padding: 10px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-6);
  }

  .likerAvatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    cursor: pointer;
  }

  @media screen and (max-width: 800px) {
    gap: 8px;
    padding: 8px 10px;

    .likerAvatar {
      width: 30px;
      height: 30px;
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
  gap: 6px;
  flex-shrink: 0;

  .button.messaging {
    background-color: var(--accent);
    cursor: wait;
    pointer-events: none;
  }

  .button.icon-only {
    flex: 0 0 auto;
    width: 32px;
    min-width: 32px;
    padding: 6px 0 !important;
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
      width: 28px;
      min-width: 28px;
      padding: 5px 0 !important;
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

const shimmerMove = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

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
  gap: 10px;
  width: 100%;
  padding: 10px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-6);
  }
`;

export const ShimmerCircle = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  ${shimmer}

  @media screen and (max-width: 800px) {
    width: 30px;
    height: 30px;
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
  width: 84px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
  ${shimmer}
`;
