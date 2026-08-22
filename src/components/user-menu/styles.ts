import { Form as RadixForm } from "radix-ui";
import styled, { keyframes } from "styled-components";
import {
  BACKGROUND_BLUR,
  BASE_TRANSITION,
  DEV_MODE_BORDER,
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
  background: var(--bg-2);
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
  gap: 4px;
  padding: 4px;
  width: 100%;
  max-width: 600px;
  margin-inline: auto;
  flex: 1;
`;

export const MobilePanelUserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover,
  &:active {
    background: var(--bg-4, var(--bg-6));
  }

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
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:active {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
  }

  svg { width: 15px; height: 15px; }
`;

export const MobilePanelSection = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  overflow: hidden;
  margin-block: 5px;
`;

export const MobilePanelMenuItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--bg-6);
  color: rgba(209, 216, 226, 1);
  font-size: var(--font-size);
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.2s ease;

  &:last-child { border-bottom: none; }

  svg { width: 22px; height: 22px; flex-shrink: 0; }
`;

export const MobilePanelDestructiveMenuItem = styled(MobilePanelMenuItem)`
  color: #b23636;

  &:active {
    background: #8e2a2a;
    color: #ffffff;
  }
`;

export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  position: absolute;
  right: 1rem;
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

export const Menu = styled.div`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 60px;
  right: 0px;
  padding: 8px 0px 8px;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--bg-3);

  z-index: ${Z_INDEX.MODAL};

  width: 18rem;
  height: max-content;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity, width, height;
  ${BASE_TRANSITION}
  /* ${BACKGROUND_BLUR()} */

  border-radius: 5px;

  &.open {
    opacity: 1;
    pointer-events: all;
  }

  hr {
    height: 1px;
    opacity: 0.6;
  }

  @media (max-width: 700px) {
    & {
      top: 50px;
    }
  }
`;

export const MenuUserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  transition: background-color 0.3s ease-out;

  &:hover {
    background-color: var(--accent);

    span {
      color: #ffffff;
    }
  }

  .avatar {
    width: 34px;
    height: 34px;
    min-width: 34px;
  }
`;

export const MenuUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
`;

export const MenuUserName = styled.span`
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuUserHandle = styled.span`
  font-size: var(--font-size-xsmall);
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
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover,
  &:active {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
  }

  svg {
    width: 13px;
    height: 13px;
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
  border-top: 1px solid #61626bff;
`;

export const List = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0px 4px;
`;

export const Element = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: rgba(209, 216, 226, 1);
  gap: 10px;
  padding: 10px;
  padding-left: 15px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease-out;

  svg {
    width: 22px;
    height: 22px;
    transition: all 0.3s ease-out;
  }

  &:hover {
    background-color: var(--accent);
    color: #ffffff;

    svg {
      stroke: #ffffff;
    }
  }
`;

export const DeleteElement = styled(Element)`
  color: #b23636ff;
  
  &:hover {
    color: #ffffff;
    background-color: #8e2a2a;
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

export const AvatarWrapper = styled.div`
  position: relative;
  margin-top: 4px;
  display: inline-flex;
  flex-shrink: 0;
`;

export const UnreadDot = styled(UnreadBadgeBase)`
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  font-size: 9px;
  border: 2px solid var(--bg-3);
`;

export const UnreadBadge = styled(UnreadBadgeBase)`
  margin-left: auto;
  flex-shrink: 0;
`;

export const DiscordElement = styled(Element)`
  color: #5865f2;

  &:hover {
    background-color: #5865f2;
    color: #ffffff;

    svg {
      stroke: #ffffff;
    }
  }
`;

export const NewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
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
  background-color: #5865f2;
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.2s ease both;
`;

export const DiscordDialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  padding: 28px 24px 24px;
  width: min(440px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
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
