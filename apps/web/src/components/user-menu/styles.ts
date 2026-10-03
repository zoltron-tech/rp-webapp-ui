import { Form as RadixForm } from "radix-ui";
import styled, { keyframes } from "styled-components";
import {
  DEV_MODE_BORDER,
  DIALOG_SCRIM,
  FOCUS_RING,
  GLASS,
  GLASS_DIALOG,
  NO_SCROLLBAR,
  Z_INDEX,
} from "@/theme";
import { fadeIn } from "@/theme/animations";
import { UnreadBadgeBase } from "../common/unread-badge";

const slideInRight = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOutRight = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

/** Semi-transparent backdrop behind the mobile panel. */
export const MobileOverlay = styled.div<{ $closing?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba(0, 0, 0, 0.45);
  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)} 0.3s ease both;
`;

/** Full-height slide-in panel on mobile — enters from the right. */
export const MobilePanel = styled.div<{ $closing?: boolean }>`
  position: fixed;
  top: var(--topbar-height, 0px);
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  ${GLASS("panel")}
  border-top: 1px solid var(--glass-edge);
  overflow-y: auto;
  animation: ${({ $closing }) => ($closing ? slideOutRight : slideInRight)}
    0.32s cubic-bezier(0.4, 0, 0.2, 1) both;
`;

export const MobilePanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--bg-6);
  background: var(--bg-2);
  flex-shrink: 0;
`;

export const MobilePanelBackBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background 0.15s;
  &:hover { background: var(--bg-4); }
  svg { width: 20px; height: 20px; }
`;

export const MobilePanelTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const MobilePanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px calc(20px + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 600px;
  margin-inline: auto;
  flex: 1;
`;

/* The account card at the top of the panel. The profile link and the edit
   button are siblings: the edit button used to sit inside the clickable
   header, one control nested in another. */
export const MobilePanelUserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 18px;
  background: var(--material-fill);
  border: 1px solid var(--glass-edge);
`;

export const MobilePanelUserHeader = styled.button`
  all: unset;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: var(--fill-pressed);
  }

  ${FOCUS_RING}

  .avatar {
    width: 48px;
    height: 48px;
    min-width: 48px;
  }
`;

export const MobilePanelUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const MobilePanelUserName = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const MobilePanelUserHandle = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const MobilePanelEditButton = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  border: 1px solid var(--glass-edge);
  background: var(--fill-hover);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:active {
    background: var(--fill-pressed);
  }

  ${FOCUS_RING}

  svg { width: 16px; height: 16px; }
`;

/* Inset grouped list on the glass panel: each group a rounded tile. */
export const MobilePanelSection = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--material-fill);
  border: 1px solid var(--glass-edge);
  border-radius: 18px;
  overflow: hidden;
`;

export const MobilePanelMenuItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 50px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--glass-edge);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-input);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.2s ease;

  &:last-child { border-bottom: none; }

  &:active { background: var(--fill-pressed); }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: -2px;
  }

  svg { width: 22px; height: 22px; flex-shrink: 0; }

  /* The trailing chevron is a hint, not an icon to read. */
  > svg:last-child { width: 16px; height: 16px; opacity: 0.6; }
`;

export const MobilePanelDestructiveMenuItem = styled(MobilePanelMenuItem)`
  color: var(--tomato-11);

  &:active {
    background: var(--tomato-a4);
  }
`;

/** Laid out by the top bar, not pinned to it — see the notifications menu. */
export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  display: inline-flex;
  align-items: center;
`;

export const FormRoot = styled(RadixForm.Root)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

export const FormField = styled(RadixForm.Field)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FormLabel = styled(RadixForm.Label)`
  margin-bottom: 10px;
  font-size: var(--font-size);
  color: var(--text-secondary);

  span {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semi-bold);
    font-style: italic;
    color: var(--accent);
  }
`;

export const FormControl = styled(RadixForm.Control)`
  width: 100%;
  min-height: 120px;
  padding: 10px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  resize: vertical;
  font-size: var(--font-size);
  font-family: var(--font);
`;

export const FormMessage = styled(RadixForm.Message)`
  margin-top: 10px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--accent);
`;

export const FormTextArea = styled.textarea`
    font-size: var(--font-size-input);
`;

/* The desktop account menu: a glass panel dropping from the avatar.
 *
 * Closed, it was only opacity 0 — still in the tab order, so keyboard focus
 * walked through a dozen invisible items. `visibility` takes it out; the
 * delayed visibility transition lets the fade-out finish first. */
export const Menu = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: ${Z_INDEX.MODAL};

  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 288px;
  max-height: calc(100dvh - var(--topbar-height, 60px) - 24px);
  overflow-y: auto;
  padding: 6px;
  ${NO_SCROLLBAR}

  /* Not GLASS(): this menu is a descendant of the top bar, which already has
     a backdrop-filter. A nested backdrop-filter can only sample its blurred
     ancestor, not the page, so the "glass" showed the sidebar text behind it
     sharp through the fill (still faintly at 96%). An opaque panel fill with
     the glass edge and highlight instead — reads as the same material, stays
     legible over anything. */
  background-color: var(--bg-2);
  box-shadow: inset 0 1px 0 var(--glass-highlight), var(--glass-shadow);
  border: 1px solid var(--glass-edge);
  border-radius: 18px;

  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-6px) scale(0.98);
  transform-origin: top right;
  transition:
    opacity 0.16s ease,
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s linear 0.18s;

  &.open {
    opacity: 1;
    visibility: visible;
    pointer-events: all;
    transform: none;
    transition:
      opacity 0.16s ease,
      transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      visibility 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }
`;

export const MenuUserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px 2px 0;
`;

export const MenuUserHeader = styled.button`
  all: unset;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--fill-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: -2px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }
`;

export const MenuUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
`;

export const MenuUserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuUserHandle = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuEditButton = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  border: 1px solid var(--glass-edge);
  background: var(--fill-hover);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:active {
    background: var(--fill-pressed);
  }

  ${FOCUS_RING}

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const ContentContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}

  position: relative;
  width: max-content;
  height: max-content;

  .avatar {
    width: var(--font-size-h2);
    height: var(--font-size-h2);
  }

  @media screen and (max-width: 480px) {
  .avatar {
    width: var(--font-size-h3);
    height: var(--font-size-h3);
  }
  }
`;

export const Separator = styled.div`
  height: 1px;
  margin: 4px 10px;
  background: var(--glass-edge);
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

/* Menu rows are buttons now (were clickable <li>s: no focus, no keyboard).
   Hover is a neutral wash — a full accent fill on every row was the loudest
   thing in the menu, and it hid the unread badges it passed over. */
export const Element = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 8px 10px 8px 12px;
  border-radius: 10px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  > svg:last-child {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }

  &:hover {
    background-color: var(--fill-hover);
  }

  &:active {
    background-color: var(--fill-pressed);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: -2px;
  }
`;

/* tomato-11, not #b23636: that was about 3:1 on the panel. */
export const DeleteElement = styled(Element)`
  color: var(--tomato-11);
  
  &:hover {
    color: var(--tomato-11);
    background-color: var(--tomato-a3);
  }
`;

export const LastSectionElement = styled(Element)`
  color: ${({ theme }: any) => theme.primaryLoading};

  svg {
    stroke: #bd89ff;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.primaryAlpha};

    svg {
      stroke: #bd89ff;
    }
  }
`;

/* The menu trigger. A real button (it was a div), so it can be focused and
   announces itself — see the aria attributes on it in index. */
export const AvatarWrapper = styled.button`
  appearance: none;
  position: relative;
  margin-top: 4px;
  padding: 0;
  display: inline-flex;
  flex-shrink: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: 3px;
  }
`;

export const UnreadDot = styled(UnreadBadgeBase)`
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  font-size: 11px;
  border: 2px solid var(--bg-2);
`;

export const UnreadBadge = styled(UnreadBadgeBase)`
  margin-left: auto;
  flex-shrink: 0;
`;

/* Brand colour on the glyph only. #5865f2 as text was under 4.5:1 on the
   panel, and a blurple hover fill was a second call to action in the menu. */
export const DiscordElement = styled(Element)`
  > div > svg {
    color: #8f97ff;
  }
`;

export const NewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  flex-shrink: 0;
`;

export const LeaderboardElement = styled(Element)`
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);

  &:hover {
    background-color: #d97706;
    color: #ffffff;

    svg {
      stroke: #ffffff;
    }
  }
`;

export const MobilePanelDiscordMenuItem = styled(MobilePanelMenuItem)`
  > div > svg {
    color: #8f97ff;
  }
`;

export const MobilePanelLeaderboardMenuItem = styled(MobilePanelMenuItem)`
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);

  &:active {
    background: #d97706;
    color: #ffffff;
  }
`;

const discordDialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const DiscordDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  ${DIALOG_SCRIM}
  animation: ${fadeIn} 0.2s ease both;
`;

export const DiscordDialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  ${GLASS_DIALOG}
  border-radius: 22px;
  padding: 28px 24px 24px;
  width: min(440px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${discordDialogPopIn} 0.2s ease both;
  outline: none;
`;

export const DiscordDialogClose = styled.button`
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
  line-height: 1;
  ${FOCUS_RING}
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-5);
    color: var(--text);
  }
`;

export const DiscordDialogImage = styled.img`
  width: 100%;
  max-width: 160px;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  margin-top: 20px;
`;

export const DiscordDialogTitle = styled.h2`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-align: center;
  margin: 0;
`;

export const DiscordDialogDescription = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

export const DiscordInviteLinkRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
`;

export const DiscordInviteLinkBox = styled.div`
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

export const DiscordInviteLinkUrl = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DiscordInviteCopyButton = styled.button<{ $copied: boolean }>`
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

export const DiscordSrAnnounce = styled.span`
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

export const DiscordTrayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 4px;
  width: 100%;
`;

export const DiscordJoinButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  background: #5865f2;
  color: #ffffff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &:hover {
    background: #4752c4;
  }

  &:active {
    background: #3c45a5;
  }
`;
