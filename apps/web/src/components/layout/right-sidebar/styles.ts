import Link from "@/components/link";
import { css, keyframes, styled } from "styled-components";
import { Username } from "@/components/common";
import { UnreadBadgeBase } from "@/components/common/unread-badge";
import { Z_INDEX } from "@/theme";

/** Fixed to the viewport (not the page's own scroll container) so it never
 * scrolls with the page content. Its right offset mirrors AppGrid's own
 * centering math through the shared layout variables in globals.css, without
 * the two needing to share any JS state. Its own content gets an internal
 * scroll + max-height so nothing is unreachable now that the sidebar itself
 * can no longer be scrolled into view by the page. */
export const RightSidebarWrap = styled.aside<{ $visible: boolean }>`
  position: fixed;
  z-index: ${Z_INDEX.CARD};
  right: calc(
    max(0px, (100vw - var(--app-max-width)) / 2) + var(--app-gutter)
  );
  top: calc(var(--topbar-height, 60px) + 16px);
  width: var(--sidebar-width);
  max-height: calc(100dvh - var(--topbar-height, 60px) - 32px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateX(${({ $visible }) => ($visible ? "0" : "24px")});
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.24s ease, transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
`;

/* Content, not chrome: the panels hold suggestions and previews, so they take
   the material tier (translucent, no blur) rather than stacking six glass
   surfaces down the side of the page. */
export const Panel = styled.div`
  background: var(--material-fill-strong);
  border: 1px solid var(--material-edge);
  border-radius: 16px;
  padding: 14px;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const PanelHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const PanelTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
`;

export const PendingCount = styled(UnreadBadgeBase)`
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 11px;
`;

export const ViewAllLink = styled.button`
  all: unset;
  box-sizing: border-box;
  margin-left: auto;
  flex-shrink: 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 4px;
  transition: color 0.14s ease;

  &:hover {
    color: var(--accent-11, var(--accent));
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: 2px;
  }
`;

/** Panel empty state: art stacked over one line, the same shape the full-page
 *  empty states use, just scaled to the sidebar. */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 4px 8px;
  font-family: var(--font);
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  text-align: center;

  /* The shared art sets its own width for a full page. A descendant selector
     outranks that single class, so the panel can size it down without the
     component needing to know where it is being rendered. */
  svg {
    flex-shrink: 0;
    width: 104px;
    height: auto;
  }

  span {
    max-width: 24ch;
  }
`;

/** The shared shape of a sidebar row. Extracted because the two rows need
 *  different host elements: a thread row is itself the button, while a
 *  suggestion row also contains an Add button and so cannot be one — a button
 *  inside a button is invalid HTML, and the parser's auto-close of the outer
 *  one breaks hydration for the whole tree. */
const rowBase = css`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 4px;
  border-radius: 10px;

  &:hover {
    background: var(--fill-hover);
  }

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }
`;

export const ThreadRow = styled.button`
  all: unset;
  ${rowBase}
  cursor: pointer;
`;

/** A plain container, not a button — it holds SuggestionAddButton. */
export const SuggestionRow = styled.div`
  ${rowBase}
  align-items: flex-start;
`;

/** The part of a suggestion row that opens the profile. Carries the row's
 *  click target so the row itself can stay a non-interactive container. */
export const SuggestionMain = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  text-align: left;
`;

/* Overlapping pair — the muse whose thread this is, plus the muse it's with
   tucked into a smaller circle bottom-right (mirrors the outgoing-threads
   card). Sits in place of the single .avatar the row would otherwise show. */
export const AvatarGroup = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;

  && .avatar {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }
`;

export const PrimaryAvatarSlot = styled.div`
  width: 100%;
  height: 100%;
`;

export const TargetAvatarSlot = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--bg-2);
  background-color: var(--bg-2);
`;

export const ThreadInfo = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
`;

export const ThreadTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

export const ThreadTitle = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ThreadMeta = styled.span`
  font-size: 11.5px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Username's own default (var(--font-size-h6), bold, var(--text)) reads too
   loud for a slim secondary meta line. */
export const SuggestionUsername = styled(Username)`
  font-size: 11px !important;
  font-weight: 500 !important;
  color: var(--text-secondary) !important;
`;

export const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

export const Stat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--text-secondary);

  svg {
    flex-shrink: 0;
  }

  b {
    color: var(--text);
    font-weight: 600;
  }
`;

export const ThreadStatusSlot = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const UnreadCount = styled(UnreadBadgeBase)`
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 50%;
`;

export const ConcludedMark = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ok, #4fb477) 20%, transparent);
  color: var(--ok, #4fb477);
`;

const shimmerSweep = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const shimmerPulse = css`
  background: linear-gradient(
    90deg,
    var(--fill-hover) 0%,
    var(--fill-pressed) 50%,
    var(--fill-hover) 100%
  );
  background-size: 400px 100%;
  animation: ${shimmerSweep} 1.5s ease-in-out infinite;
`;

export const ConversationsList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ConversationRowShimmer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;

  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;

export const ShimmerAvatar = styled.div`
  ${shimmerPulse}
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
`;

export const ShimmerLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const ShimmerLine = styled.div<{ $width: string }>`
  ${shimmerPulse}
  height: 10px;
  width: ${({ $width }) => $width};
  border-radius: 4px;
`;

export const SidebarFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 12px;
  text-align: center;
`;

export const SidebarFooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

export const SidebarFooterLink = styled(Link)`
  font-size: 11px;
  color: var(--text-secondary);
  transition: color 0.14s ease;

  &:hover {
    color: var(--accent);
  }
`;

export const SidebarFooterDot = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.5;
`;

export const SidebarFooterCopyright = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
`;

export const SuggestionAddButton = styled.button`
  all: unset;
  box-sizing: border-box;
  flex-shrink: 0;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--bg-12) 18%, transparent);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.14s ease, border-color 0.14s ease, color 0.14s ease;

  &:hover:not(:disabled) {
    background: var(--fill-hover);
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 45%, transparent);
    color: var(--accent-11, var(--accent));
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;
