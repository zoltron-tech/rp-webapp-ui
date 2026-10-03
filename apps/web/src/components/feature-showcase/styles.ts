import styled, { css, keyframes } from "styled-components";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared chrome for the three landing-page feature scenes.

   Each scene is a mock of a real in-app surface, framed like a small app
   window. The frame is shared so the three read as the same product; only the
   body of each differs.
   ──────────────────────────────────────────────────────────────────────────── */

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.9); }
  60%  { opacity: 1; transform: scale(1.03); }
  100% { opacity: 1; transform: scale(1); }
`;

const blink = keyframes`
  0%, 45% { opacity: 1; }
  50%, 95% { opacity: 0; }
`;

const dotBounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
  30%           { transform: translateY(-3px); opacity: 1; }
`;

const glowDrift = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(0.96); }
  50%      { opacity: 0.85; transform: scale(1.05); }
`;

/* ── Window frame ───────────────────────────────────────────────────────── */

export const Frame = styled.div`
  position: relative;
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: color-mix(in srgb, var(--bg-2) 88%, transparent);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  /* Contain the accent glow each scene paints behind its content. */
  isolation: isolate;
`;

/** Soft accent pool behind the mock, so the panel doesn't read as a grey box. */
export const FrameGlow = styled.span`
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--accent) 22%, transparent) 0%,
    transparent 70%
  );
  filter: blur(24px);
  pointer-events: none;
  z-index: -1;
  animation: ${glowDrift} 7s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
`;

export const Dots = styled.span`
  display: inline-flex;
  gap: 5px;

  i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.16);
  }
`;

export const TitleText = styled.span`
  font-family: var(--font);
  font-size: 11px;
  letter-spacing: 0.3px;
  color: var(--text-secondary);
`;

/**
 * A fixed stage, not a box that grows.
 *
 * Every scene animates content in, so `min-height` meant the frame resized
 * mid-loop and the three frames settled at three different heights. A fixed
 * height keeps each panel still while its script plays and keeps the three
 * matching each other; the column layout lets a scene pin its chrome (a
 * composer, a typing line) to the bottom instead of letting content shove it
 * around. Sized to the tallest scene, which is the Codex.
 */
export const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 344px;
  overflow: hidden;

  @media (max-width: 560px) {
    padding: 12px;
    height: 312px;
  }
`;

/* ── Bits shared by more than one scene ─────────────────────────────────── */

export const Caret = styled.i`
  display: inline-block;
  width: 1px;
  height: 1em;
  margin-left: 1px;
  translate: 0 2px;
  background: var(--accent-11);
  animation: ${blink} 1s steps(1) infinite;
`;

export const TypingDots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent-10);
    animation: ${dotBounce} 1.3s ease-in-out infinite;
  }
  i:nth-child(2) { animation-delay: 0.16s; }
  i:nth-child(3) { animation-delay: 0.32s; }
`;

const enters = css`
  animation: ${fadeSlideUp} 0.34s ease both;
`;

/* ── 1. Codex ───────────────────────────────────────────────────────────── */

export const CodexHead = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const CodexTitle = styled.span`
  font-family: var(--font);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const CodexBadge = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: 10px;
  font-weight: var(--font-weight-semi-bold);
  color: var(--accent-11);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  ${enters}
`;

export const TabRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
`;

export const Tab = styled.span<{ $active?: boolean }>`
  padding: 5px 11px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: 11px;
  white-space: nowrap;
  transition:
    background 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease;
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, var(--accent) 55%, transparent)"
        : "rgba(255,255,255,0.09)"};
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 18%, transparent)"
      : "transparent"};
  color: ${({ $active }) => ($active ? "var(--accent-11)" : "var(--text-secondary)")};
`;

export const CodexGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: min-content;
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);

    /* Two columns would run the six entries to three rows and overflow the
       fixed stage. Drop two of the settled ones so it stays 2x2 — the entry
       being added is last in the DOM, so it always survives. */
    > *:nth-child(4),
    > *:nth-child(5) {
      display: none;
    }
  }
`;

export const CodexCard = styled.div<{ $new?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid
    ${({ $new }) =>
      $new
        ? "color-mix(in srgb, var(--accent) 50%, transparent)"
        : "rgba(255,255,255,0.08)"};
  background: rgba(255, 255, 255, 0.03);
  ${({ $new }) => $new && css`animation: ${popIn} 0.4s ease both;`}
`;

export const CardSwatch = styled.span<{ $tone?: string }>`
  width: 100%;
  height: 34px;
  border-radius: 6px;
  background: ${({ $tone }) =>
    $tone ?? "color-mix(in srgb, var(--accent) 22%, transparent)"};
`;

export const CardLabel = styled.span`
  font-family: var(--font);
  font-size: 10.5px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardMeta = styled.span`
  font-family: var(--font);
  font-size: 9px;
  color: var(--text-secondary);
`;

/* Sidebar rail: the storyboard's own nav, so the Codex reads as one panel of
   a larger editor rather than a floating grid. */
export const CodexLayout = styled.div`
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

/** Right-hand column of the Codex: search, tabs, then the entry grid. */
export const CodexMain = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

export const CodexNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.07);

  @media (max-width: 560px) {
    display: none;
  }
`;

export const NavItem = styled.span<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 7px;
  border-radius: 6px;
  font-family: var(--font);
  font-size: 10px;
  color: ${({ $active }) => ($active ? "var(--text)" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "rgba(255,255,255,0.06)" : "transparent")};

  b {
    margin-left: auto;
    font-weight: var(--font-weight-semi-bold);
    font-size: 9px;
    color: var(--text-secondary);
  }
`;

export const CodexSearch = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding: 5px 9px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(0, 0, 0, 0.2);
  font-family: var(--font);
  font-size: 10px;
  color: var(--text-secondary);
`;

/** Colour bar down the side of a card, the way the real Codex tags entries. */
export const CardTag = styled.span<{ $tone?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font);
  font-size: 8.5px;
  color: var(--text-secondary);

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: ${({ $tone }) => $tone ?? "var(--accent-10)"};
  }
`;

export const CardRow = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

export const LinkCount = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font);
  font-size: 8.5px;
  color: var(--text-secondary);
`;

/* Relationship mesh. Colours and stroke patterns mirror the real Codex's
   three tones (see story-codex/relationships/tones.ts): a bond is solid green,
   strain is dashed orange, neutral is dotted blue. Colour is never the only
   signal there, so it isn't here either. */

export const MeshWrap = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(0, 0, 0, 0.18);
  overflow: hidden;
`;

export const Mesh = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
`;

export const MeshLabel = styled.text`
  font-family: var(--font);
  font-size: 7px;
  fill: var(--text-secondary);
  text-anchor: middle;
`;

export const NodeName = styled.text`
  font-family: var(--font);
  font-size: 7.5px;
  font-weight: var(--font-weight-semi-bold);
  fill: var(--text);
  text-anchor: middle;
`;

export const NodeInitial = styled.text`
  font-family: var(--font);
  font-size: 8.5px;
  font-weight: var(--font-weight-bold);
  fill: #0d1512;
  text-anchor: middle;
  dominant-baseline: central;
`;

export const Legend = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

export const LegendChip = styled.span<{ $tone: string; $dash: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font);
  font-size: 8.5px;
  color: var(--text-secondary);

  &::before {
    content: "";
    width: 16px;
    height: 0;
    border-top: 2px ${({ $dash }) => $dash} ${({ $tone }) => $tone};
  }
`;

export const MeshHint = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font);
  font-size: 8.5px;
  color: var(--accent-11);
`;

/* ── 2. Banter ──────────────────────────────────────────────────────────── */

export const Thread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  /* Turns stack up from the composer the way a real thread does, so arriving
     messages push the history upward instead of shoving the composer down. */
  justify-content: flex-end;
  overflow: hidden;
`;

export const Turn = styled.div<{ $mine?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-direction: ${({ $mine }) => ($mine ? "row-reverse" : "row")};
  ${enters}
`;

export const TurnAvatar = styled.span<{ $tone: string }>`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: #0d1512;
  background: ${({ $tone }) => $tone};
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
`;

export const Bubble = styled.div<{ $mine?: boolean }>`
  position: relative;
  max-width: 78%;
  padding: 8px 11px;
  border-radius: 12px;
  border: 1px solid
    ${({ $mine }) =>
      $mine
        ? "color-mix(in srgb, var(--accent) 45%, transparent)"
        : "rgba(255,255,255,0.1)"};
  background: ${({ $mine }) =>
    $mine
      ? "color-mix(in srgb, var(--accent) 14%, transparent)"
      : "rgba(255,255,255,0.045)"};
  font-family: var(--font);
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--text);
`;

export const TurnName = styled.span`
  display: block;
  margin-bottom: 2px;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-11);
`;

export const PennedBy = styled.span`
  display: block;
  margin-top: 3px;
  font-size: 9px;
  color: var(--text-secondary);
`;

export const Reaction = styled.span`
  position: absolute;
  right: 8px;
  bottom: -9px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: 9px;
  color: var(--text);
  background: var(--bg-3);
  border: 1px solid rgba(255, 255, 255, 0.12);
  animation: ${popIn} 0.32s ease both;
`;

/** Who is in the scene, above the thread. */
export const SceneHead = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  font-family: var(--font);
  font-size: 10px;
  color: var(--text-secondary);
`;

export const CastStack = styled.span`
  display: inline-flex;

  span {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 8px;
    font-weight: var(--font-weight-bold);
    color: #0d1512;
    border: 1.5px solid var(--bg-2);
  }
  span + span {
    margin-left: -6px;
  }
`;

export const ScenePill = styled.span`
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 9px;
  color: var(--accent-11);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
`;

export const TurnTime = styled.span`
  margin-left: 6px;
  font-size: 8.5px;
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
`;

/** The composer, with the muse-picker button that makes a turn in-character. */
export const Composer = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  /* Pinned: Thread takes the slack above it, so this never moves. */
  flex-shrink: 0;
  margin-top: 12px;
  padding: 6px 7px 6px 6px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.22);
`;

export const ComposerMuse = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  font-family: var(--font);
  font-size: 9.5px;
  color: var(--text);
  white-space: nowrap;

  i {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 8px;
    font-style: normal;
    font-weight: var(--font-weight-bold);
    color: #0d1512;
    background: ${({ $tone }) => $tone};
  }
`;

export const ComposerField = styled.span`
  flex: 1;
  min-width: 0;
  font-family: var(--font);
  font-size: 10.5px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
`;

export const ComposerHint = styled.span`
  color: var(--text-secondary);
`;

export const SendButton = styled.span<{ $active?: boolean }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  transition: background 0.2s ease, color 0.2s ease;
  color: ${({ $active }) => ($active ? "#0d1512" : "var(--text-secondary)")};
  background: ${({ $active }) =>
    $active ? "var(--accent-10)" : "rgba(255,255,255,0.07)"};
`;

/* ── 3. Community ───────────────────────────────────────────────────────── */

export const Discord = styled.div`
  display: grid;
  grid-template-columns: 44px 116px 1fr 92px;
  gap: 0;
  flex: 1;
  min-height: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);

  /* Drop the member list first, then the channel list, as room runs out. */
  @media (max-width: 1100px) {
    grid-template-columns: 44px 116px 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 38px 1fr;
  }
`;

export const ServerRail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  background: rgba(0, 0, 0, 0.28);
`;

export const ServerPip = styled.span<{ $active?: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: ${({ $active }) => ($active ? "10px" : "50%")};
  display: grid;
  place-items: center;
  font-family: var(--font);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  transition: border-radius 0.25s ease;
  color: ${({ $active }) => ($active ? "#0d1512" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "var(--accent-10)" : "rgba(255,255,255,0.07)")};
`;

export const ChannelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 8px;
  background: rgba(0, 0, 0, 0.16);

  @media (max-width: 560px) {
    display: none;
  }
`;

export const ServerName = styled.span`
  font-family: var(--font);
  font-size: 10.5px;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  padding: 0 4px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 6px;
`;

export const Channel = styled.span<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 5px;
  font-family: var(--font);
  font-size: 10.5px;
  transition: background 0.25s ease, color 0.25s ease;
  color: ${({ $active }) => ($active ? "var(--text)" : "var(--text-secondary)")};
  background: ${({ $active }) => ($active ? "rgba(255,255,255,0.07)" : "transparent")};
`;

export const ChatPane = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  gap: 9px;
  min-height: 0;
  overflow: hidden;
`;

export const ChatHead = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  font-family: var(--font);
  font-size: 10.5px;
  color: var(--text-secondary);
`;

export const OnlinePill = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  color: var(--text-secondary);

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #43b581;
  }
`;

export const ChatLine = styled.div`
  display: flex;
  gap: 7px;
  align-items: flex-start;
  ${enters}
`;

export const ChatAvatar = styled.span<{ $tone: string }>`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font);
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  color: #0d1512;
  background: ${({ $tone }) => $tone};
`;

export const ChatBody = styled.div`
  min-width: 0;
`;

export const ChatAuthor = styled.span`
  font-family: var(--font);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-11);
`;

export const ChatText = styled.p`
  margin: 1px 0 0;
  font-family: var(--font);
  font-size: 10.5px;
  line-height: 1.5;
  color: var(--text);
`;

/** Right-hand member list, the part that makes a server feel populated. */
export const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px 8px;
  background: rgba(0, 0, 0, 0.16);

  @media (max-width: 1100px) {
    display: none;
  }
`;

export const MemberGroup = styled.span`
  font-family: var(--font);
  font-size: 8.5px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const Member = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font);
  font-size: 9.5px;
  color: var(--text);
`;

export const MemberDot = styled.span<{ $tone: string; $away?: boolean }>`
  position: relative;
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 8px;
  font-weight: var(--font-weight-bold);
  color: #0d1512;
  background: ${({ $tone }) => $tone};
  opacity: ${({ $away }) => ($away ? 0.45 : 1)};

  &::after {
    content: "";
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1.5px solid var(--bg-2);
    background: ${({ $away }) => ($away ? "#b9863f" : "#43b581")};
  }
`;

/** Reactions under a message. */
export const ChatReacts = styled.span`
  display: inline-flex;
  gap: 4px;
  margin-top: 4px;
`;

export const ChatReact = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: 9px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

/** "someone is typing" line at the foot of the channel. */
export const ChatTyping = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 6px;
  font-family: var(--font);
  font-size: 9.5px;
  color: var(--text-secondary);
`;
