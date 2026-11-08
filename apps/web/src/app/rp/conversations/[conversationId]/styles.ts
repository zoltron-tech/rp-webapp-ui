import styled, { css, keyframes } from "styled-components";
import { UnreadBadgeBase } from "@/components/common/unread-badge";
import { FOCUS_RING, GLASS } from "@/theme";

const slideInFromRight = keyframes`
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`;

export const Container = styled.div<{
  $playerHeight: number;
  $slideFrom?: "left" | "right";
  $animate?: boolean;
}>`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: calc(100dvh - 60px - ${({ $playerHeight }) => $playerHeight}px);
  overflow: hidden;
  ${({ $slideFrom, $animate = true }) =>
    $animate &&
    (
      $slideFrom === "left"
        ? css`animation: ${slideInFromLeft} 0.28s ease both;`
        : css`animation: ${slideInFromRight} 0.28s ease both;`
    )}

  @media (max-width: 680px) {
    padding-top: 0px;
    height: calc(100dvh - 45px - ${({ $playerHeight }) => $playerHeight}px);
  }
`;

export const ChatWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 12px;

  @media (max-width: 680px) {
    gap: 2px;
  }
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 4px;
  ${GLASS("bar")}
  border: 1px solid var(--glass-edge);

  @media (max-width: 680px) {
    border-radius: unset;
    border-top: none;
    border-right: none;
    border-left: none;
  }
`;

export const ChatPerson = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar {
    width: 42px;
    height: 42px;
    min-width: 42px;
  }
`;

export const BackButtonWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: var(--fill-hover);
    }
  }

  &:active {
    background-color: var(--fill-pressed);
  }
`;

export const BackBadge = styled(UnreadBadgeBase)`
  position: absolute;
  bottom: -5px;
  right: -7px;
  border: 2px solid var(--bg-2);
`;

export const ChatTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const ChatTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ChatTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-h6);
  color: var(--text);
`;

export const ChatMeta = styled.span`
  display: flex;
  align-items: flex-start;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
`;

export const GroupBadge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  font-size: var(--font-size-small, 11px);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 9999px;
  padding: 1px 7px;
  line-height: 1.5;
  white-space: nowrap;
`;

export const MessagesWrapper = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`;

// ─── Chat background patterns ────────────────────────────────────────────────
// Change ACTIVE_CHAT_PATTERN to switch:  "dots" | "diamonds" | "grid" | "crosshatch"

const _glows = [
  `radial-gradient(ellipse 65% 55% at 100% 100%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 100%)`,
  `radial-gradient(ellipse 65% 55% at 0% 0%,    color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 100%)`,
].join(", ");

const PATTERN_CSS = {
  /** Woven cross-hatch of diagonal lines */
  crosshatch: `
    background-image: ${_glows},
      repeating-linear-gradient( 45deg, transparent 0px, transparent 14px, rgba(128,128,128,0.09) 14px, rgba(128,128,128,0.09) 15px),
      repeating-linear-gradient(-45deg, transparent 0px, transparent 14px, rgba(128,128,128,0.09) 14px, rgba(128,128,128,0.09) 15px);
    background-size: 100% 100%, 100% 100%, auto, auto;
    background-position: 0 0, 0 0, 0 0, 0 0;
  `,
  /** Rotated diamond outlines with a centre dot at each vertex */
  diamonds: `
    background-image: ${_glows},
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='rgba(128%2C128%2C128%2C0.10)' stroke-width='0.75'/%3E%3Ccircle cx='20' cy='20' r='1.2' fill='rgba(128%2C128%2C128%2C0.12)'/%3E%3C/svg%3E");
    background-size: 100% 100%, 100% 100%, 40px 40px;
    background-position: 0 0, 0 0, 0 0;
  `,
  /** Staggered polka dots — hex-like arrangement */
  dots: `
    background-image: ${_glows},
      radial-gradient(circle, rgba(128,128,128,0.18) 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(128,128,128,0.18) 1.5px, transparent 1.5px);
    background-size: 100% 100%, 100% 100%, 26px 26px, 26px 26px;
    background-position: 0 0, 0 0, 0 0, 13px 13px;
  `,
  /** Graph-paper square grid */
  grid: `
    background-image: ${_glows},
      linear-gradient(rgba(128,128,128,0.10) 1px, transparent 1px),
      linear-gradient(90deg, rgba(128,128,128,0.10) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 28px 28px, 28px 28px;
    background-position: 0 0, 0 0, 0 0, 0 0;
  `,
} as const;

/** ✏️  Change this one value to switch the chat background pattern */
export const ACTIVE_CHAT_PATTERN: keyof typeof PATTERN_CSS = "diamonds";

// ─────────────────────────────────────────────────────────────────────────────

export const MessagesContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  border: 1px solid var(--material-edge);
  border-radius: 4px;
  padding: 10px;
  background-color: var(--bg-1);
  ${PATTERN_CSS[ACTIVE_CHAT_PATTERN]}

  @media (max-width: 680px) {
    border-radius: unset;
  }
`;

export const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--material-edge);
  }
`;

export const EmptyText = styled.p`
  font-size: var(--font-size-small);
  color: var(--text);
  font-weight: var(--font-weight-semibold);
  text-align: center;
`;

export const EmptyTextSub = styled.p`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  text-align: center;
`;

export const HelloState = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 80px;

  ${EmptyText} {
    padding: 0;
  }
`;

export const HelloBox = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 18px 50px;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  text-align: center;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--accent) 22%, var(--bg-3)) 0%,
    color-mix(in srgb, var(--accent) 14%, var(--bg-2)) 50%,
    color-mix(in srgb, var(--accent) 20%, var(--bg-3)) 100%
  );
  border: 1px solid transparent;
  background-clip: padding-box;
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent),
    0 2px 20px color-mix(in srgb, var(--accent) 10%, transparent);
  transition: box-shadow 0.2s ease, background 0.2s ease, transform 0.15s ease;

  &::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 21px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 50%, transparent),
      transparent 40%,
      color-mix(in srgb, var(--accent) 30%, transparent) 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    padding: 1px;
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--accent) 30%, var(--bg-3)) 0%,
      color-mix(in srgb, var(--accent) 20%, var(--bg-2)) 50%,
      color-mix(in srgb, var(--accent) 28%, var(--bg-3)) 100%
    );
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent),
      0 4px 28px color-mix(in srgb, var(--accent) 22%, transparent);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const HelloStickerImg = styled.img`
  width: 110px;
  height: 110px;
  object-fit: contain;
  margin-block: 20px;
  border-radius: 12px;
  pointer-events: none;
`;

export const HelloLabel = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const RetentionNotice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 20px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 8%, var(--material-fill-strong));
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  color: var(--text-secondary);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-medium);
  text-align: center;
  margin: 4px auto 10px;
  width: fit-content;
  max-width: 90%;
  letter-spacing: 0.01em;
  line-height: 1.5;
`;

export const RetentionNoticeHighlight = styled.span`
  color: var(--text-secondary);
  opacity: 0.8;
  font-size: var(--font-size-xsmall);

  strong {
    color: var(--accent-hover);
    font-weight: var(--font-weight-bold);
  }
`;

/* One quiet line above the composer: why an archived DM is archived. Text,
   not a banner — the conversation still works. */
export const ArchivedNotice = styled.p`
  margin: 0;
  padding: 6px 16px 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
  text-align: center;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ScrollToBottomButton = styled.button<{ $visible: boolean }>`
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 50%;
  z-index: 10;
  ${GLASS("bar")}
  border: 1px solid var(--glass-edge);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
  }

  ${FOCUS_RING}
`;

export const ReplyPreviewBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 4px 4px 0 0;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--material-edge));
  border-bottom: none;
  background: color-mix(in srgb, var(--accent) 8%, var(--material-fill-strong));
  border-left: 3px solid var(--accent);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent) 8%, transparent) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

export const ReplyPreviewAvatar = styled.div`
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 1px;

  .avatar {
    width: 22px;
    height: 22px;
    min-width: 22px;
  }
`;

export const ReplyPreviewBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const ReplyPreviewSender = styled.span`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ReplyPreviewText = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ReplyPreviewLabel = styled.span`
  color: var(--text-secondary);
  flex-shrink: 0;
`;

export const ReplyPreviewThumb = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid var(--material-edge);
`;

export const ReplyPreviewThumbLabel = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  font-style: italic;
`;

export const ReplyPreviewDismiss = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 20%, var(--fill-pressed));
  }
`;

const shimmer = `
  background: linear-gradient(
    90deg,
    var(--material-fill) 25%,
    var(--fill-hover) 50%,
    var(--material-fill) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const MessagesLoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
`;

export const SkeletonBubble = styled.div<{
  $align?: "left" | "right";
  $width?: string;
}>`
  height: 44px;
  border-radius: 16px;
  width: ${({ $width }) => $width ?? "55%"};
  align-self: ${({ $align }) => ($align === "right" ? "flex-end" : "flex-start")};
  ${shimmer}
`;

export const SkeletonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
