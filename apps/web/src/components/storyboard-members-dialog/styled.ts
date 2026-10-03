import { styled } from "styled-components";
import { DIALOG_SCRIM, FOCUS_RING, GLASS_DIALOG } from "@/theme";
import { dialogPopIn, fadeIn } from "@/theme/animations";

// ─── Dialog shell (desktop) ───────────────────────────────────────────────────

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  ${DIALOG_SCRIM}
  animation: ${fadeIn} 0.2s ease both;
`;

export const DialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  ${GLASS_DIALOG}
  border-radius: 22px;
  padding: 24px;
  width: min(440px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
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

export const DialogDescription = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;

  @media screen and (max-width: 800px) {
    font-size: var(--font-size-xsmall);
  }
`;

// ─── Mobile tray header (title + circular done button) ───────────────────────

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
  background: var(--grass-9);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.92);
  }
`;

// ─── Add-member search (admins only) ─────────────────────────────────────────

export const AddMemberSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: 2px solid var(--accent);
    border-color: transparent;
  }

  @media screen and (max-width: 800px) {
    padding: 7px 10px;
  }
`;

export const SuggestionList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid var(--bg-6);
  border-radius: 10px;
  background: var(--bg-3);

  @media screen and (max-width: 800px) {
    max-height: 120px;
  }
`;

export const SuggestionRow = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-6);
  }

  &:hover,
  &:focus-visible {
    background: var(--bg-4);
  }

  .memberAvatar {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
  }

  @media screen and (max-width: 800px) {
    gap: 8px;
    padding: 6px 8px;

    .memberAvatar {
      width: 24px;
      height: 24px;
    }
  }
`;

export const AddIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text);
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
  }

  @media screen and (max-width: 800px) {
    width: 22px;
    height: 22px;

    svg {
      width: 13px;
      height: 13px;
    }
  }
`;

// ─── Members list ─────────────────────────────────────────────────────────────

export const FriendList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 320px;
  overflow-y: auto;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;

  /* Keeps the list (and everything below it) reachable on the smallest
     supported device, iPhone SE (375×667), where the tray has little
     vertical room to spare. */
  @media screen and (max-width: 800px) {
    max-height: 34vh;
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

  .sharedWithAvatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    cursor: pointer;
  }

  @media screen and (max-width: 800px) {
    gap: 8px;
    padding: 8px 10px;

    .sharedWithAvatar {
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

export const RoleBadge = styled.span<{ $variant: "creator" | "admin" }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "creator" ? "var(--amber-9)" : "var(--accent)"};
  color: ${({ $variant }) =>
    $variant === "creator" ? "var(--amber-9)" : "var(--accent)"};
  background: ${({ $variant }) =>
    $variant === "creator"
      ? "color-mix(in srgb, var(--amber-9) 12%, transparent)"
      : "color-mix(in srgb, var(--accent) 12%, transparent)"};
`;

export const FriendActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const RoleActionButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-4);
    color: var(--accent);
  }

  svg {
    width: 15px;
    height: 15px;
  }

  @media screen and (max-width: 800px) {
    width: 24px;
    height: 24px;

    svg {
      width: 13px;
      height: 13px;
    }
  }
`;

export const RemoveActionButton = styled(RoleActionButton)`
  &:hover {
    background: color-mix(in srgb, var(--tomato-9) 15%, transparent);
    color: var(--tomato-9);
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

// ─── Footer ───────────────────────────────────────────────────────────────────

export const DoneButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  text-align: center;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-5);
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
