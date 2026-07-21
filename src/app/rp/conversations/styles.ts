import styled, { css, keyframes } from "styled-components";

const shimmerSweep = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOutToRight = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

export const Container = styled.div<{ $slideIn?: boolean }>`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  ${({ $slideIn }) =>
    $slideIn &&
    css`
      animation: ${slideInFromLeft} 0.28s ease both;
    `}
`;
export const BreadcrumbRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  padding-left: 12px;
  padding-right: 20px;
  padding-block: 14px;
  border-bottom: 1px solid var(--bg-6);
  margin-bottom: 6px;

  @media screen and (max-width: 430px) {
    padding-left: 8px;
    padding-right: 12px;
    padding-block: 10px;
  }
`;

export const BreadcrumbActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

// ── Page header (left side of the breadcrumb row) ──────────────────────────────

export const PageHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  @media screen and (max-width: 430px) {
    gap: 10px;
  }
`;

export const PageHeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  color: var(--accent);

  svg {
    width: 20px;
    height: 20px;
  }

  @media screen and (max-width: 430px) {
    width: 34px;
    height: 34px;
    min-width: 34px;

    svg {
      width: 17px;
      height: 17px;
    }
  }
`;

export const PageHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
`;

export const PageHeaderTitle = styled.h1`
  all: unset;
  font-family: var(--font);
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 430px) {
    font-size: var(--font-size-h5);
  }
`;

export const PageHeaderSubtitle = styled.span`
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 430px) {
    font-size: var(--font-size-xsmall);
  }
`;

// ── /Page header ──────────────────────────────────────────────────────────────

export const SupportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-4);
    border-color: var(--primary);
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
// ── Ice breakers rail (Instagram "notes"-style) ─────────────────────────────

export const IceBreakerRail = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 14px;
  width: 100%;
  max-width: 800px;
  padding: 4px 20px 10px 0;
  margin-top: 6px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const IceBreakerAddButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  width: 84px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: var(--font);

  .icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 62px;
    border-radius: 50%;
    border: 3px solid var(--bg-1);
    background: linear-gradient(
      135deg,
      var(--accent) 0%,
      var(--accent-6, var(--accent)) 100%
    );
    color: #fff;
    box-shadow: 0 4px 14px
      color-mix(in srgb, var(--accent) 35%, transparent);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .plus-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--bg-2);
    border: 2px solid var(--bg-1);
    color: var(--accent);
  }

  @media (hover: hover) {
    &:hover .icon {
      transform: scale(1.06);
      box-shadow: 0 6px 20px
        color-mix(in srgb, var(--accent) 45%, transparent);
    }
  }

  &:active .icon {
    transform: scale(0.95);
  }

  span {
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }
`;

export const IceBreakerEmptyState = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  gap: 10px;
  padding: 6px 14px 6px 4px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    color: var(--accent);
    opacity: 0.85;
  }
`;

export const IceBreakerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 84px;
  cursor: pointer;
`;

/** Fixed-size stack that holds the avatar ring, so avatars line up across the
 *  rail no matter how tall the bubble above them grows. The top padding
 *  reserves the room a single-line bubble needs above the avatar; the bubble
 *  itself is anchored to the top of that space, so it never grows upward
 *  (and never gets clipped by the rail's scroll area) — it only grows
 *  downward, over the avatar, as the message needs more room. */
export const IceBreakerAvatarStack = styled.div`
  position: relative;
  display: flex;
  flex-shrink: 0;
  padding-top: 10px;
`;

/** Thought bubble showing the ice breaker message, anchored to the top of the
 *  avatar and overlapping it slightly, with two shrinking trailing circles
 *  drifting down into it — mirrors Instagram's DM "notes" rail, but as a
 *  thought bubble rather than a speech bubble (no pointed tail). Widens up to
 *  `max-width` before wrapping, then grows downward (over the avatar) rather
 *  than upward, so its anchor point never moves. */
export const IceBreakerBubble = styled.p<{ $color?: string | null }>`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 90px;
  background: ${({ $color }) => $color ?? "var(--bg-3)"};
  border-radius: 14px;
  padding: 6px 9px;
  color: ${({ $color }) => ($color ? "#ffffff" : "var(--text)")};
  font-size: var(--font-size-xsmall);
  line-height: 1.3;
  text-align: center;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  /* Trailing circles — sit behind the message text (painted underneath it)
     and drift down toward the avatar, shrinking as they go. */
  &::before,
  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    background: ${({ $color }) => $color ?? "var(--bg-3)"};
  }

  &::before {
    bottom: -8px;
    left: 50%;
    margin-left: -2.5px;
    width: 9px;
    height: 9px;
  }

  &::after {
    bottom: -12px;
    left: 50%;
    margin-left: 3.5px;
    width: 5px;
    height: 5px;
  }
`;

export const IceBreakerAvatarRing = styled.div<{ $ringColor?: string | null }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  padding: 2.5px;
  background: ${({ $ringColor }) =>
    $ringColor ??
    "linear-gradient(135deg, var(--accent) 0%, var(--accent-6, var(--accent)) 100%)"};

  .avatar {
    width: 62px;
    height: 62px;
    border: 2px solid var(--bg-1);
  }
`;

export const IceBreakerSenderName = styled.span`
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 84px;
`;

// ── /Ice breakers rail ─────────────────────────────────────────────────────

// ── Create ice breaker dialog ────────────────────────────────────────────────

export const IceBreakerDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 16px;
`;

/** Extra horizontal breathing room for the desktop dialog body, which
 *  otherwise sits flush against AppAlertDialog's own (small) content padding. */
export const IceBreakerDialogInlinePadding = styled.div`
  padding-inline: 8px;
`;

// ── Mobile tray header (title + circular cancel/confirm actions) ───────────

export const IceBreakerTrayHeaderBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 14px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--bg-5);
`;

export const IceBreakerTrayTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-input);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const IceBreakerTrayActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const IceBreakerTrayActionButton = styled.button<{
  $variant: "cancel" | "confirm";
}>`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
  background: ${({ $variant }) =>
    $variant === "confirm" ? "var(--grass-9)" : "var(--bg-3)"};
  color: ${({ $variant }) =>
    $variant === "confirm" ? "#fff" : "var(--text-secondary)"};
  border: 1px solid
    ${({ $variant }) => ($variant === "confirm" ? "transparent" : "var(--bg-5)")};

  &:hover {
    background: ${({ $variant }) =>
      $variant === "confirm" ? "var(--grass-9)" : "var(--bg-4)"};
    opacity: ${({ $variant }) => ($variant === "confirm" ? 0.9 : 1)};
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const IceBreakerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const IceBreakerSectionLabel = styled.span`
  display: block;
  font-size: 11px;
  font-weight: var(--font-weight-semi-bold, 600);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-align: center;
  color: var(--text-secondary);
`;

// ── Sender picker ────────────────────────────────────────────────────────────

export const IceBreakerSenderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const IceBreakerScrollArrow = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, opacity 0.15s ease;

  &:hover {
    background: var(--bg-4);
    color: var(--accent);
  }

  &:active {
    transform: scale(0.94);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

export const IceBreakerSourceList = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 6px 2px 8px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const IceBreakerAddMuseButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  width: 56px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 10px;
  color: var(--text-secondary);
  transition: color 0.15s ease;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px dashed var(--bg-6);
    color: var(--accent);
    background: var(--bg-2);
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  &:hover .icon {
    border-color: var(--accent);
    background: var(--bg-3);
  }

  span.name {
    font-size: 9px;
    font-weight: var(--font-weight-medium);
    line-height: 1.2;
    text-align: center;
    white-space: normal;
    max-width: 56px;
  }
`;

export const IceBreakerAddMuseFormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

export const IceBreakerQuickAddInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  outline: none;
  font-family: var(--font);
  font-size: var(--font-size-input);
  color: var(--text);

  &:focus {
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const IceBreakerSourceDivider = styled.div`
  flex-shrink: 0;
  align-self: stretch;
  width: 1px;
  margin: 4px 2px;
  background: var(--bg-6);
`;

export const IceBreakerSourceItem = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  width: 56px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 10px;
  color: ${({ $active }) => ($active ? "var(--accent)" : "var(--text-secondary)")};
  transition: color 0.15s ease;

  .avatar-ring {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    padding: 2px;
    border: 2px solid
      ${({ $active }) => ($active ? "var(--accent)" : "transparent")};
    box-shadow: ${({ $active }) =>
      $active
        ? "0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent)"
        : "none"};
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    .avatar {
      width: 40px;
      height: 40px;
    }
  }

  &:hover .avatar-ring {
    border-color: ${({ $active }) => ($active ? "var(--accent)" : "var(--bg-6)")};
  }

  .check-badge {
    position: absolute;
    top: 0px;
    right: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--bg-1);
    border: 1.5px solid var(--bg-2);
  }

  span.name {
    font-size: var(--font-size-input);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 56px;
  }
`;

// ── Message bubble input (styled after the profile note editor) ────────────

export const IceBreakerMessageBubble = styled.div<{
  $focused: boolean;
  $color: string | null;
}>`
  position: relative;
  isolation: isolate;
  width: 100%;
  box-sizing: border-box;
  margin-top: 14px;
  background: ${({ $color }) =>
    $color
      ? $color
      : "linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3) 100%)"};
  color: var(--text);
  border-radius: 16px;
  padding: 12px 14px 40px;
  border: 1.5px dashed
    ${({ $color }) => ($color ? "rgba(255,255,255,0.35)" : "var(--accent-6)")};
  transition: background 0.2s ease, color 0.2s ease, border-color 0.18s ease,
    box-shadow 0.18s ease;

  ${({ $focused, $color }) =>
    $focused &&
    css`
      border-style: solid;
      border-color: ${$color ? "rgba(255,255,255,0.6)" : "var(--accent)"};
      box-shadow: 0 0 0 3px
        ${
          $color
            ? "rgba(255,255,255,0.12)"
            : "color-mix(in srgb, var(--accent) 18%, transparent)"
        };
    `}

  /* Thought-bubble trailing circles — behind all content, drifting up-left
     toward the sender row above, mirroring the rail/view bubble language
     instead of a speech-bubble tail (ice breakers are thought bubbles). */
  &::before,
  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    background: ${({ $color }) => $color ?? "var(--accent-3)"};
  }

  &::before {
    top: -13px;
    left: 28px;
    width: 13px;
    height: 13px;
  }

  &::after {
    top: -22px;
    left: 14px;
    width: 7px;
    height: 7px;
  }
`;

export const IceBreakerCharCount = styled.span`
  display: block;
  text-align: right;
  font-size: var(--font-size-small, 11px);
  color: var(--text-secondary);
  margin-top: 4px;

  &.warn {
    color: var(--tomato-a9);
  }
`;

// ── Bubble color picker ──────────────────────────────────────────────────────

export const IceBreakerColorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  flex-wrap: wrap;
`;

export const IceBreakerColorSwatch = styled.button<{
  $color: string;
  $active: boolean;
}>`
  all: unset;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border-radius: 20%;
  background: ${({ $color }) => $color};
  cursor: pointer;
  border: 3px solid
    ${({ $active }) => ($active ? "var(--text)" : "transparent")};
  box-shadow: 0 0 0 1px var(--bg-6);
  transition: transform 0.1s ease, border-color 0.1s ease;

  &:hover {
    transform: scale(1.12);
  }
`;

export const IceBreakerNoColorSwatch = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border-radius: 20%;
  cursor: pointer;
  border: ${({ $active }) =>
    $active ? "3px solid var(--text)" : "2px solid var(--bg-7)"};
  background: linear-gradient(
      to bottom right,
      transparent calc(50% - 1px),
      #ef4444 calc(50% - 1px),
      #ef4444 calc(50% + 1px),
      transparent calc(50% + 1px)
    ),
    var(--bg-4);
  transition: transform 0.1s ease, border-color 0.1s ease;

  &:hover {
    transform: scale(1.12);
  }
`;

// ── /Create ice breaker dialog ───────────────────────────────────────────────

// ── View ice breaker dialog ──────────────────────────────────────────────────

/** Wraps the hero (avatar + name) and the bubble group so they keep their
 *  shared left edge internally, while the group as a whole is centered
 *  horizontally within the dialog. */
export const ViewIceBreakerHeroWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
  max-width: 100%;
  margin: 14px auto 0;
`;

/** Left-aligned "hero" — bigger avatar with the name beside it, sitting just
 *  above the message bubble it hangs from. Pulled down over the bubble's top
 *  edge with a negative margin (not a transform) so the overlap stays in
 *  normal flow — it can't clip past the dialog/tray edge the way a fixed
 *  pixel translate could on a narrow (375px) viewport. */
export const ViewIceBreakerHero = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  margin-bottom: -14px;
`;

export const ViewIceBreakerHeroAvatarRing = styled.div<{
  $ringColor?: string | null;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  padding: 3px;
  background: ${({ $ringColor }) =>
    $ringColor ??
    "linear-gradient(135deg, var(--accent) 0%, var(--accent-6, var(--accent)) 100%)"};

  .avatar {
    width: 84px;
    height: 84px;
    border: 3px solid var(--bg-1);
  }

  @media (max-width: 480px) {
    .avatar {
      width: 68px;
      height: 68px;
    }
  }
`;

export const ViewIceBreakerName = styled.span`
  min-width: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold, 600);
  color: var(--text);
  text-align: left;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Wraps the bubble and its timestamp so the wrapper shrinks to the bubble's
 *  own (intrinsic, up-to-max-width) width — letting the timestamp's
 *  right-aligned edge line up with the bubble's right edge instead of the
 *  wider dialog body. */
export const ViewIceBreakerBubbleGroup = styled.div`
  display: inline-block;
  max-width: 100%;
`;

/** Timestamp — rendered below the bubble, right-aligned to match the
 *  bubble's own right edge, with a small inset so it doesn't sit perfectly
 *  flush with it. */
export const ViewIceBreakerMeta = styled.span`
  display: block;
  box-sizing: border-box;
  width: 100%;
  margin-top: 6px;
  padding-right: 4px;
  text-align: right;
  font-size: 10px;
  color: var(--text-secondary);
`;

/** Static (read-only) version of the message bubble, hanging from the hero
 *  avatar directly above it — the trailing circles emerge from the bubble's
 *  top-left corner and drift up behind the avatar, mirroring the rail's
 *  thought-bubble language but anchored to a corner instead of the center. */
export const ViewIceBreakerBubble = styled.p<{ $color?: string | null }>`
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  margin: 0;
  min-width: 220px;
  max-width: 285px;
  background: ${({ $color }) =>
    $color ??
    "linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3) 100%)"};
  color: var(--text);
  border-radius: 18px;
  padding: 16px 20px;
  border: 1.5px solid
    ${({ $color }) => ($color ? "rgba(255,255,255,0.35)" : "var(--accent-6)")};
  font-size: var(--font-size);
  line-height: 1.55;
  text-align: center;
  word-break: break-word;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);

  @media (max-width: 480px) {
    min-width: 180px;
    max-width: 240px;
    padding: 13px 16px;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    background: ${({ $color }) => $color ?? "var(--accent-3)"};
    border: 1.5px solid
      ${({ $color }) => ($color ? "rgba(255,255,255,0.35)" : "var(--accent-6)")};
  }

  &::before {
    top: -13px;
    left: 28px;
    width: 13px;
    height: 13px;
  }

  &::after {
    top: -22px;
    left: 14px;
    width: 7px;
    height: 7px;
  }
`;

export const ViewIceBreakerDeleteLink = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 20px auto 0;
  padding: 9px 16px;
  border-radius: 999px;
  font-size: var(--font-size-small, 12px);
  font-weight: var(--font-weight-medium, 500);
  font-family: var(--font);
  color: var(--tomato-9, #db2777);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--tomato-a3, rgba(219, 39, 119, 0.1));
  }
`;

export const ViewIceBreakerConfirmBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 4px 4px;
  text-align: center;
`;

export const ViewIceBreakerConfirmIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--tomato-a3, rgba(219, 39, 119, 0.12));
  color: var(--tomato-9, #db2777);
`;

export const ViewIceBreakerConfirmText = styled.p`
  margin: 0;
  max-width: 280px;
  font-size: var(--font-size-input);
  color: var(--text);
  line-height: 1.5;
`;

// ── Reply composer (mirrors send-message-composer's inline-send pattern) ───

export const ViewIceBreakerReplyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

export const ViewIceBreakerReplyAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .avatar {
    width: 26px;
    height: 26px;
  }
`;

/** ChatRichInput renders its own pill-shaped input box, so this wrapper only
 *  needs to claim the remaining row width. */
export const ViewIceBreakerReplyInputWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

/** Circular send button that fades/expands in once there's text — used by
 *  both the reply composer and the create-ice-breaker message input. */
export const IceBreakerInlineSendButton = styled.button<{
  $visible: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  width: ${({ $visible }) => ($visible ? "30px" : "0px")};
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: var(--bg-1);
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: width 0.15s ease, opacity 0.15s ease;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &:active {
    transform: scale(0.94);
  }
`;

// ── /View ice breaker dialog ─────────────────────────────────────────────────

export const ConversationListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 10px;
  width: 100%;
  max-width: 800px;
`;

export const ConversationListRoot = styled.div`
  background: var(--bg-2);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;

  @media (max-width: 600px) {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

export const ConversationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  display: grid;
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
`;

export const EmptyStateRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 44px;
  gap: 14px;
`;

export const IllustrationWrap = styled.div`
  animation: ${float} 3.6s ease-in-out infinite;
`;

export const EmptyStateHeading = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg, 17px);
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
`;

export const EmptyStateBody = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 270px;
  line-height: 1.55;
`;

export const EmptyStateActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
`;

export const EmptyStateButton = styled.button<{ $primary?: boolean }>`
  padding: 9px 22px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid
    ${({ $primary }) => ($primary ? "var(--accent)" : "var(--bg-6)")};
  background: ${({ $primary }) => ($primary ? "var(--accent)" : "transparent")};
  color: ${({ $primary }) => ($primary ? "var(--bg-1)" : "var(--text)")};
  transition: opacity 0.15s ease, transform 0.15s ease;

  &:hover {
    opacity: 0.82;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    opacity: 1;
  }
`;

// ── Shimmer skeletons ─────────────────────────────────────────────────────────

const shimmerPulse = css`
  background: linear-gradient(
    90deg,
    var(--bg-4) 0%,
    var(--bg-5) 50%,
    var(--bg-4) 100%
  );
  background-size: 800px 100%;
  animation: ${shimmerSweep} 1.5s ease-in-out infinite;
`;

export const ShimmerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--bg-4);

  &:last-child {
    border-bottom: none;
  }
`;

export const ShimmerAvatar = styled.div`
  ${shimmerPulse}
  width: 46px;
  height: 46px;
  min-width: 46px;
  flex-shrink: 0;
  border-radius: 50%;
  margin-top: 1px;
`;

export const ShimmerContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const ShimmerContentMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding-top: 3px;
`;

export const ShimmerLine = styled.div<{ $width: string; $height?: number }>`
  ${shimmerPulse}
  height: ${({ $height }) => $height ?? 13}px;
  width: ${({ $width }) => $width};
  border-radius: 4px;
`;

export const ShimmerExtras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-top: 3px;
  flex-shrink: 0;
`;

/** Ice breaker rail card skeleton — mirrors IceBreakerCard's layout (a small
 *  bubble hovering above a circular avatar, with a name label below) so the
 *  shimmer doesn't cause the rail to jump in height once real cards load. */
export const IceBreakerCardShimmerBubble = styled.div`
  ${shimmerPulse}
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 46px;
  height: 22px;
  border-radius: 14px;
`;

export const IceBreakerCardShimmerAvatar = styled.div`
  ${shimmerPulse}
  width: 62px;
  height: 62px;
  border-radius: 50%;
`;

export const IceBreakerCardShimmerName = styled.div`
  ${shimmerPulse}
  margin-top: 6px;
  width: 40px;
  height: 10px;
  border-radius: 4px;
`;

// ── /Shimmer skeletons ────────────────────────────────────────────────────────

/** Full-viewport panel that slides in from the right on mobile. */
export const ConversationSheet = styled.div<{
  $open: boolean;
  $closing: boolean;
}>`
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: var(--bg-1);
  overflow: hidden;
  /* Default: off-screen */
  transform: translateX(100%);

  ${({ $open, $closing }) =>
    $open &&
    !$closing &&
    css`
      animation: ${slideInFromRight} 0.28s ease both;
    `}

  ${({ $closing }) =>
    $closing &&
    css`
      animation: ${slideOutToRight} 0.26s ease both;
    `}

  @media (min-width: 681px) {
    display: none;
  }
`;
