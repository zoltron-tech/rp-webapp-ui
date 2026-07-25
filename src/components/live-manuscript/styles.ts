import styled, { css, keyframes } from "styled-components";

/* ────────────────────────────────────────────────────────────────────────────
   Live manuscript — a faux "story in progress" panel for the landing hero.
   Two novelists trade turns on a shared thread: the first turn is settled and
   reacted to, the second is being typed live with a blinking caret. Around the
   panel, floating status chips hint at real-time activity (desktop only, so the
   iPhone-SE layout stays clean). Styling follows the landing theme: dark glass
   panels, white-opacity hairlines, and the theme-aware `--accent`.
   Baseline responsive target: iPhone SE (375 × 667).
   ──────────────────────────────────────────────────────────────────────────── */

const turnIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

const blink = keyframes`
  50% { opacity: 0; }
`;

const ping = keyframes`
  0%   { transform: scale(0.6); opacity: 0.7; }
  100% { transform: scale(1.9); opacity: 0; }
`;

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
`;

const dotPulse = keyframes`
  0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
  30%           { opacity: 1; transform: translateY(-2px); }
`;

const sheen = keyframes`
  0%   { transform: translateX(-120%); }
  60%, 100% { transform: translateX(240%); }
`;

/* A freshly-sent turn rising from the composer into the thread. */
const slideUpIn = keyframes`
  from { opacity: 0; transform: translateY(26px) scale(0.97); }
  60%  { opacity: 1; }
  to   { opacity: 1; transform: none; }
`;

/* Tap ripple where the demo cursor clicks. */
const ripple = keyframes`
  from { transform: scale(0.3); opacity: 0.55; }
  to   { transform: scale(2.6); opacity: 0; }
`;

// ─── Wrapper (holds panel + floating chips) ────────────────────────────────────

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;

  /* 3D tilt — the manuscript reads as an object turned toward the copy,
     catching light on its right edge. */
  transform: perspective(1500px) rotateY(-17deg) rotateX(7deg);
  transform-style: preserve-3d;

  /* No tilt on tablet/mobile — keep it flat, readable, and inside the frame. */
  @media (max-width: 980px) {
    max-width: 420px;
    transform: none;
  }

  /* Compact footprint so the whole panel fits an iPhone SE with breathing room. */
  @media (max-width: 480px) {
    max-width: 335px;
  }

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    &:hover {
      transform: none;
    }
  }
`;

export const Panel = styled.div`
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    180deg,
    rgba(26, 25, 34, 0.92),
    rgba(14, 13, 18, 0.97)
  );
  box-shadow: 0 40px 90px -50px #000, 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  text-align: left;

  /* Faint accent glow bleeding in from the top-right corner. */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      80% 60% at 85% 0%,
      color-mix(in srgb, var(--accent) 16%, transparent) 0%,
      transparent 55%
    );
  }

  @media (max-width: 420px) {
    border-radius: 16px;
  }
`;

// ─── Title bar ────────────────────────────────────────────────────────────────

export const Bar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);
  background: rgba(8, 9, 12, 0.5);
`;

export const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  flex-shrink: 0;
`;

export const BarTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  min-width: 0;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);

  svg {
    color: var(--accent);
    flex-shrink: 0;
    font-size: 0.85rem;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    color: rgba(255, 255, 255, 0.72);
    font-weight: 600;
  }
`;

export const BarVis = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.68rem;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.42);

  svg {
    font-size: 0.85rem;
  }
`;

// ─── Meta row (tags + progress) ────────────────────────────────────────────────

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 14px 0;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 6px;
    padding: 10px 13px 0;
  }
`;

export const Tag = styled.span<{ $accent?: boolean }>`
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ $accent }) =>
      $accent
        ? "color-mix(in srgb, var(--accent) 40%, transparent)"
        : "rgba(255, 255, 255, 0.12)"};
  color: ${({ $accent }) =>
    $accent ? "var(--accent)" : "rgba(255, 255, 255, 0.6)"};
  background: ${({ $accent }) =>
    $accent
      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
      : "rgba(255, 255, 255, 0.03)"};
`;

export const WordCount = styled.span`
  margin-left: auto;
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.42);
`;

// ─── Turns ────────────────────────────────────────────────────────────────────

export const Body = styled.div`
  padding: 14px 16px 4px;

  @media (max-width: 480px) {
    padding: 11px 13px 2px;
  }
`;

export const Turn = styled.div<{ $delay: number; $slide?: boolean }>`
  display: flex;
  gap: 11px;
  margin-bottom: 14px;
  opacity: 0;
  animation: ${({ $slide }) => ($slide ? slideUpIn : turnIn)}
    ${({ $slide }) => ($slide ? "0.55s" : "0.6s")}
    cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
  animation-delay: ${({ $delay }) => $delay}s;

  @media (max-width: 480px) {
    gap: 9px;
    margin-bottom: 11px;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
  }
`;

export const Avatar = styled.span<{ $from: string; $to: string; $img?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $img }) => ($img ? "transparent" : "#0b0a0d")};
  background: ${({ $from, $to, $img }) =>
    $img
      ? `center / cover no-repeat url(${$img})`
      : `linear-gradient(150deg, ${$from}, ${$to})`};
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.04);

  @media (max-width: 480px) {
    width: 26px;
    height: 26px;
    font-size: 0.72rem;
  }
`;

export const TurnBody = styled.div`
  min-width: 0;
  flex: 1;
`;

export const TurnHead = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
  flex-wrap: wrap;
`;

export const TurnName = styled.span`
  font-weight: 600;
  font-size: 0.82rem;
  color: #fff;
`;

export const RoleTag = styled.span`
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: 5px;
  padding: 1px 5px;
`;

export const TurnTime = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.4);
`;

export const TurnText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.86);

  em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.66);
  }

  @media (max-width: 480px) {
    font-size: 0.82rem;
    line-height: 1.5;
  }
`;

// ─── Reactions on a settled turn ───────────────────────────────────────────────

export const ReactionRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
`;

/* A heart that drifts up and fades when a new like lands during the demo. */
const heartFloat = keyframes`
  0%   { opacity: 0; transform: translateY(2px) scale(0.6); }
  25%  { opacity: 1; transform: translateY(-6px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-30px) scale(0.9); }
`;

export const FloatingHeart = styled.span`
  position: absolute;
  left: 12px;
  bottom: 100%;
  pointer-events: none;
  color: var(--accent);
  animation: ${heartFloat} 1.3s ease-out forwards;

  svg {
    font-size: 0.95rem;
    filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--accent) 50%, transparent));
  }
`;

/* Quick pop when the like count ticks up. */
const likeBump = keyframes`
  0%, 100% { transform: scale(1); }
  40%      { transform: scale(1.18); }
`;

/* Share control pinned to the right end of the reaction line. */
export const ShareButton = styled.button`
  appearance: none;
  cursor: pointer;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;

  svg {
    font-size: 0.8rem;
  }

  &:hover {
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
`;

/* Byline at the bottom of a message: which user penned this muse's turn. */
export const PennedBy = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.42);

  b {
    color: var(--accent);
    font-weight: 600;
  }
`;

export const PennedByAvatar = styled.span<{ $from: string; $to: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $from, $to }) => `linear-gradient(150deg, ${$from}, ${$to})`};
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
`;

export const Reaction = styled.span<{ $accent?: boolean; $bump?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  ${({ $bump }) =>
    $bump &&
    css`
      animation: ${likeBump} 0.45s ease;
    `}
  font-size: 0.64rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ $accent }) =>
      $accent
        ? "color-mix(in srgb, var(--accent) 40%, transparent)"
        : "rgba(255, 255, 255, 0.1)"};
  color: ${({ $accent }) =>
    $accent ? "var(--accent)" : "rgba(255, 255, 255, 0.55)"};
  background: ${({ $accent }) =>
    $accent
      ? "color-mix(in srgb, var(--accent) 10%, transparent)"
      : "rgba(255, 255, 255, 0.03)"};

  svg {
    font-size: 0.75rem;
  }
`;

// ─── Typing indicator ──────────────────────────────────────────────────────────

export const TypingDots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;

  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--accent);
    animation: ${dotPulse} 1.2s ease-in-out infinite;
  }
  span:nth-child(2) {
    animation-delay: 0.18s;
  }
  span:nth-child(3) {
    animation-delay: 0.36s;
  }

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
      opacity: 0.6;
    }
  }
`;

export const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -2px;
  background: var(--accent);
  animation: ${blink} 1s step-end infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// ─── Composer (scripted "send as your muse" demo) ──────────────────────────────

/* Holds the composer plus the pop-over character picker (absolute, above the
   input) and the demo cursor / tap ripple, all anchored to the composer. */
export const ComposerArea = styled.div`
  position: relative;
  margin: 2px 12px 12px;

  @media (max-width: 480px) {
    margin: 2px 10px 10px;
  }
`;

/* Static attachment affordances above the input — image, GIF, music. Purely
   decorative for the demo; not interactive. */
export const ComposerTools = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px 6px;
`;

export const ToolButton = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border-radius: 8px;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s ease, background 0.2s ease;

  svg {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.62rem;
    padding: 3px 6px;
  }
`;

export const Composer = styled.div`
  position: relative;
  display: flex;
  /* Buttons hug the bottom so the field can grow upward into a second line,
     like a real chat composer. */
  align-items: flex-end;
  gap: 9px;
  padding: 6px;
  min-height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.25s ease, box-shadow 0.25s ease,
    min-height 0.2s ease;

  &[data-active="true"] {
    border-color: color-mix(in srgb, var(--accent) 45%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
  }

  @media (max-width: 480px) {
    min-height: 42px;
  }
`;

/* The avatar button at the left end of the input — click opens the picker. */
export const MuseButton = styled.button<{
  $from?: string;
  $to?: string;
  $img?: string;
}>`
  appearance: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 0.82rem;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;

  ${({ $from, $to, $img }) =>
    $img
      ? css`
          color: transparent;
          border: none;
          background: center / cover no-repeat url(${$img});
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
        `
      : $from && $to
      ? css`
          color: #0b0a0d;
          border: none;
          background: linear-gradient(150deg, ${$from}, ${$to});
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
        `
      : css`
          color: rgba(255, 255, 255, 0.5);
          border: 1px dashed rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.02);
        `}

  &[data-pressed="true"] {
    transform: scale(0.9);
  }

  svg {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
  }
`;

export const ComposerText = styled.span<{ $placeholder?: boolean }>`
  flex: 1;
  min-width: 0;
  /* Sit the text on the button row, then let it wrap up to two lines as it
     overflows — the composer's min-height grows to hold the second line. */
  align-self: center;
  padding: 4px 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: ${({ $placeholder }) =>
    $placeholder ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 255, 255, 0.82)"};
  /* Wrap to at most two lines (2 × line-height); the caret stays inline at the
     end of the text, and the composer's min-height grows to fit the extra row. */
  max-height: 2.8em;
  overflow: hidden;
  white-space: normal;
  overflow-wrap: anywhere;

  @media (max-width: 480px) {
    font-size: 0.78rem;
  }
`;

export const SendButton = styled.span<{ $active?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 36px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  transition: transform 0.15s ease, background 0.25s ease, color 0.25s ease,
    box-shadow 0.25s ease;

  color: ${({ $active }) => ($active ? "#08090c" : "rgba(255, 255, 255, 0.35)")};
  background: ${({ $active }) =>
    $active ? "var(--accent)" : "rgba(255, 255, 255, 0.06)"};
  box-shadow: ${({ $active }) =>
    $active ? "0 6px 16px -8px var(--accent)" : "none"};

  &[data-pressed="true"] {
    transform: scale(0.88);
  }

  svg {
    font-size: 0.92rem;
  }
`;

/* Pop-over that lists the writer's muses, sliding up over the input. */
export const Picker = styled.div<{ $open: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 6;
  padding: 8px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    180deg,
    rgba(30, 29, 38, 0.98),
    rgba(16, 15, 21, 0.98)
  );
  box-shadow: 0 24px 50px -24px #000, 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  transform-origin: bottom left;
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.7, 0.3, 1);

  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? "translateY(0) scale(1)" : "translateY(10px) scale(0.96)"};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
`;

export const PickerHead = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 8px;
  font-size: 0.62rem;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);

  svg {
    color: var(--accent);
    font-size: 0.8rem;
  }
`;

export const PickerItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border-radius: 10px;
  transition: background 0.18s ease, box-shadow 0.18s ease;
  background: ${({ $selected }) =>
    $selected
      ? "color-mix(in srgb, var(--accent) 14%, transparent)"
      : "transparent"};
  box-shadow: ${({ $selected }) =>
    $selected
      ? "inset 0 0 0 1px color-mix(in srgb, var(--accent) 45%, transparent)"
      : "none"};

  & + & {
    margin-top: 2px;
  }
`;

export const PickerName = styled.span`
  min-width: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PickerMeta = styled.span`
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.58rem;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
`;

export const PickerCheck = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 16px;
  color: var(--accent);

  svg {
    font-size: 0.85rem;
  }
`;

/* Decorative cursor that travels between the muse button and send. */
export const Cursor = styled.span<{ $pos: "hide" | "avatar" | "send" }>`
  position: absolute;
  z-index: 7;
  bottom: 9px;
  width: 17px;
  height: 17px;
  pointer-events: none;
  color: #fff;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.7));
  transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s ease,
    opacity 0.25s ease;

  opacity: ${({ $pos }) => ($pos === "hide" ? 0 : 1)};
  left: ${({ $pos }) => ($pos === "send" ? "calc(100% - 42px)" : "22px")};

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const Ripple = styled.span<{ $target: "avatar" | "send" }>`
  position: absolute;
  z-index: 5;
  bottom: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  pointer-events: none;
  background: color-mix(in srgb, var(--accent) 55%, transparent);
  left: ${({ $target }) => ($target === "send" ? "calc(100% - 42px)" : "14px")};
  animation: ${ripple} 0.5s ease-out forwards;
`;

// ─── Footer ───────────────────────────────────────────────────────────────────

export const Foot = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  margin: 0 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.055);
  border-radius: 11px;
  background: rgba(8, 9, 12, 0.4);

  @media (max-width: 480px) {
    padding: 10px 12px;
    margin: 0 10px 10px;
  }
`;

export const Writers = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
`;

export const AvatarStack = styled.span`
  display: flex;

  ${Avatar} {
    width: 24px;
    height: 24px;
    font-size: 0.62rem;
    margin-left: -8px;
    border: 2px solid #0e0d12;
    box-shadow: none;
  }
  ${Avatar}:first-child {
    margin-left: 0;
  }
`;

export const Viewers = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.42);

  &::before {
    content: "";
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.28);
  }

  svg {
    font-size: 0.78rem;
  }

  @media (max-width: 340px) {
    display: none;
  }
`;

export const LivePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.62rem;
  letter-spacing: 0.5px;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 999px;
  padding: 3px 9px;
`;

const pulseDot = css`
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
`;

export const LiveDot = styled.span`
  ${pulseDot}

  &::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1px solid var(--accent);
    opacity: 0.6;
    animation: ${ping} 2.4s ease-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

// ─── Floating status chips (decorative, desktop only) ──────────────────────────

export const Floaty = styled.span<{ $pos: "tl" | "br" }>`
  position: absolute;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.72rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(19, 18, 24, 0.94);
  backdrop-filter: blur(8px);
  box-shadow: 0 16px 40px -20px #000;
  white-space: nowrap;
  animation: ${bob} 5s ease-in-out infinite;

  b {
    color: #fff;
    font-weight: 600;
  }

  svg {
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  ${({ $pos }) =>
    $pos === "tl"
      ? css`
          top: -16px;
          left: -26px;
        `
      : css`
          bottom: 40px;
          right: -28px;
          animation-delay: 1.5s;
        `}

  /* Hidden on anything that isn't a roomy desktop, so the chips never spill
     past the viewport edge in the hero's right column or on mobile. */
  @media (max-width: 1180px) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// A thin sheen that sweeps across the "loved this scene" chip's heart.
export const Sheen = styled.span`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.12),
      transparent
    );
    animation: ${sheen} 4.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;
