import { styled } from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";
import { UnreadBadgeBase } from "@/components/common/unread-badge";
import { GLASS, Z_INDEX } from "@/theme";

/** Fixed to the viewport (not the page's own scroll container) so it never
 * scrolls with the page content — a true "pinned in place" sidebar rather
 * than a position:sticky element that still travels with a tall page. Its
 * left offset mirrors AppGrid's own centering math through the shared layout
 * variables in globals.css, without the two needing to share any JS state. */
export const LeftNavWrap = styled.nav<{ $visible: boolean }>`
  position: fixed;
  z-index: ${Z_INDEX.CARD};
  left: calc(
    max(0px, (100vw - var(--app-max-width)) / 2) + var(--app-gutter)
  );
  top: calc(var(--topbar-height, 60px) + 16px);
  width: var(--nav-width);
  max-height: calc(100dvh - var(--topbar-height, 60px) - 32px);
  overflow-y: auto;
  /* A sidebar floats over the page, so it is glass — the panel variant, being
     a tall surface full of labels. */
  padding: 8px;
  border-radius: 20px;
  border: 1px solid var(--glass-edge);
  ${GLASS("panel")}
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
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

/* Selection and hover on glass: a neutral wash of the text colour, so it reads
   the same over whatever tint the glass has picked up. */
const NAV_ITEM_FILL = "var(--fill-hover)";
const NAV_ITEM_FOCUS = `
  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: -2px;
  }
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
  background: ${({ $active }) => ($active ? NAV_ITEM_FILL : "transparent")};
  transition: background 0.14s ease, color 0.14s ease;

  &:hover {
    background: ${NAV_ITEM_FILL};
    color: var(--text);
  }

  /* all: unset above wipes the browser focus ring. */
  ${NAV_ITEM_FOCUS}

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
  background: ${({ $active }) => ($active ? NAV_ITEM_FILL : "transparent")};
  transition: background 0.14s ease;

  &:hover {
    background: ${NAV_ITEM_FILL};
  }

  ${NAV_ITEM_FOCUS}
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
