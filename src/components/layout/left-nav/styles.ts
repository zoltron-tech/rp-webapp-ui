import { styled } from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";
import { UnreadBadgeBase } from "@/components/common/unread-badge";
import { Z_INDEX } from "@/theme";

export const NAV_WIDTH = 210;

/** Fixed to the viewport (not the page's own scroll container) so it never
 * scrolls with the page content — a true "pinned in place" sidebar rather
 * than a position:sticky element that still travels with a tall page. Its
 * left offset mirrors AppGrid's own centering math (max-width 1400px,
 * margin-inline:auto, 16px edge padding) without the two needing to share
 * any layout state. */
export const LeftNavWrap = styled.nav<{ $visible: boolean }>`
  position: fixed;
  z-index: ${Z_INDEX.CARD};
  left: calc(max(0px, (100vw - 1400px) / 2) + 16px);
  top: calc(var(--topbar-height, 60px) + 16px);
  width: ${NAV_WIDTH}px;
  max-height: calc(100dvh - var(--topbar-height, 60px) - 32px);
  overflow-y: auto;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateX(${({ $visible }) => ($visible ? "0" : "-24px")});
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.24s ease, transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NavSectionLabel = styled.div`
  padding: 6px 12px 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  opacity: 0.7;
`;

export const NavSeparator = styled.hr`
  all: unset;
  display: block;
  height: 1px;
  margin: 8px 4px;
  background: var(--bg-6);
`;

export const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14.5px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? "var(--text)" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "var(--bg-3)" : "transparent")};
  transition: background 0.14s ease, color 0.14s ease;

  &:hover {
    background: var(--bg-3);
    color: var(--text);
  }

  svg {
    flex-shrink: 0;
  }
`;

export const NavLabel = styled.span`
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const NavBadge = styled(UnreadBadgeBase)`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
`;

/** Profile row — a richer, taller variant of NavItem showing the bigger
 * avatar plus the novelist's name, handle and level so the sidebar's most
 * personal destination reads as a proper account card, not just another link. */
export const ProfileItem = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "var(--bg-3)" : "transparent")};
  transition: background 0.14s ease;

  &:hover {
    background: var(--bg-3);
  }
`;

export const ProfileAvatar = styled(AvatarNew)`
  &.avatar {
    width: 44px;
    height: 44px;
  }
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

export const ProfileName = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }
`;

export const ProfileHandle = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProfileLevel = styled.span`
  flex-shrink: 0;
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--accent-a11, var(--accent));
  background: var(--accent-a3, var(--bg-3));
`;
