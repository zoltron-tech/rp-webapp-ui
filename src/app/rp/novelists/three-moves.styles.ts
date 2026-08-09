import styled, { css, keyframes } from "styled-components";

/* ─────────────────────────────────────────────────────────────────────────────
   "A story in three moves" — an animated reel.

   The three beats live on a rail at the top; the active beat plays a small,
   scripted mock of that move in the stage below. Everything here is CSS-driven
   (transform/opacity only) and unmounts when its beat is not active, so only
   one scene is ever animating. The whole block is gated on visibility by the
   component, and every animation collapses to its finished frame under
   `prefers-reduced-motion` — the base styles ARE the end state, so switching
   `animation: none` leaves the scene fully composed.
   Baseline responsive target: iPhone SE (375 × 667).
   ──────────────────────────────────────────────────────────────────────────── */

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
`;

const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.7); }
  60%  { opacity: 1; transform: scale(1.06); }
  100% { opacity: 1; transform: scale(1); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(26px); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-26px); }
`;

const typeOut = keyframes`
  from { width: 0; }
  to   { width: 100%; }
`;

const caretBlink = keyframes`
  0%, 45%   { border-color: var(--accent); }
  46%, 100% { border-color: transparent; }
`;

const sweepRing = keyframes`
  from { stroke-dashoffset: 163.4; }
  to   { stroke-dashoffset: 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const sheen = keyframes`
  from { transform: translateX(-120%); }
  to   { transform: translateX(220%); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
  40%           { transform: translateY(-4px); opacity: 1; }
`;

const floatHeart = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.6); }
  35%  { opacity: 1; }
  to   { opacity: 0; transform: translateY(-34px) scale(1.15); }
`;

/* Folds the typing bubble away *and* the flex gaps either side of it, so the
   two turns close up on it instead of leaving a hole. */
const fold = keyframes`
  from { opacity: 1; max-height: 44px; padding-block: 11px; margin-block: 0; }
  to   { opacity: 0; max-height: 0; padding-block: 0; margin-block: -6px; border-width: 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.35); }
`;

/** Every scene animation is an entrance from a hidden start frame, so killing
 *  the animation is enough to leave the finished layout in place. */
const reduced = (rules: ReturnType<typeof css>) => css`
  @media (prefers-reduced-motion: reduce) {
    ${rules}
  }
`;

// ─── Shell ────────────────────────────────────────────────────────────────────

export const Reel = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(22px, 3.6vw, 38px);
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding-inline: clamp(20px, 5vw, 48px);
`;

// ─── Rail (the navigator) ─────────────────────────────────────────────────────

export const Rail = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

export const Beat = styled.button<{ $active: boolean; $done: boolean }>`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: clamp(92px, 21vw, 150px);
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: none;
  }

  &:focus-visible > span:first-child {
    box-shadow:
      0 0 0 3px #08090c,
      0 0 0 5px var(--accent);
  }

  @media (max-width: 420px) {
    gap: 7px;
  }
`;

export const BeatDisc = styled.span<{ $active: boolean; $done: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: #0d0f13;
  transition:
    transform 0.35s ease,
    color 0.35s ease,
    border-color 0.35s ease,
    background 0.35s ease;

  ${({ $active, $done }) =>
    $active
      ? css`
          color: #08090c;
          background: var(--accent);
          border: 1px solid var(--accent);
          transform: scale(1.06);
        `
      : $done
        ? css`
            color: var(--accent);
            border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
            background: color-mix(in srgb, var(--accent) 16%, #0d0f13);
          `
        : css`
            color: rgba(255, 255, 255, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.16);
          `}

  ${Beat}:hover & {
    transform: scale(1.06);
  }

  @media (max-width: 420px) {
    width: 44px;
    height: 44px;
    font-size: 0.85rem;
  }
`;

/** Countdown ring around the active beat — doubles as the auto-advance clock,
 *  and freezes with the timer while the reel is paused. */
export const Ring = styled.svg<{ $ms: number; $paused: boolean }>`
  position: absolute;
  inset: -7px;
  width: calc(100% + 14px);
  height: calc(100% + 14px);
  transform: rotate(-90deg);
  pointer-events: none;

  circle {
    fill: none;
    stroke: color-mix(in srgb, var(--accent) 80%, transparent);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 163.4;
    animation: ${sweepRing} ${({ $ms }) => $ms}ms linear forwards;
    animation-play-state: ${({ $paused }) => ($paused ? "paused" : "running")};
  }

  ${reduced(css`
    display: none;
  `)}
`;

export const BeatLabel = styled.span<{ $active: boolean }>`
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-align: center;
  transition: color 0.3s ease;
  color: ${({ $active }) =>
    $active ? "#ffffff" : "rgba(255, 255, 255, 0.42)"};

  @media (max-width: 420px) {
    font-size: 0.72rem;
  }
`;

/** Connector between two beats; fills left-to-right as the reel advances. */
export const Rung = styled.span<{ $filled: boolean }>`
  position: relative;
  flex: 1 1 auto;
  max-width: 130px;
  height: 2px;
  margin-top: 27px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent) 40%, transparent),
      var(--accent)
    );
    transform-origin: left center;
    transform: scaleX(${({ $filled }) => ($filled ? 1 : 0)});
    transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 420px) {
    margin-top: 22px;
  }
`;

// ─── Stage ────────────────────────────────────────────────────────────────────

export const Stage = styled.div`
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.015)
  );
  padding: clamp(18px, 3vw, 34px);
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;

  @media (max-width: 420px) {
    padding: 16px 14px;
    border-radius: 16px;
  }
`;

export const StageDrag = styled.div<{ $dir: number; $drag: number }>`
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  align-items: center;
  gap: clamp(20px, 3.5vw, 44px);
  transform: translateX(${({ $drag }) => $drag}px);
  transition: ${({ $drag }) => ($drag === 0 ? "transform 0.3s ease" : "none")};

  /* min-width: 0 — grid items default to their min-content width, and the
     mock's nowrap chrome would otherwise push the whole page wider than an
     iPhone SE. */
  > * {
    min-width: 0;
    animation: ${({ $dir }) => ($dir >= 0 ? slideInRight : slideInLeft)} 0.45s
      cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  ${reduced(css`
    > * {
      animation: none;
    }
  `)}

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 420px) {
    gap: 8px;
  }
`;

export const CopyKicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  color: var(--accent);

  svg {
    font-size: 0.95rem;
  }
`;

export const CopyTitle = styled.h3`
  margin: 0;
  font-size: clamp(1.25rem, 2.6vw, 1.7rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.3px;
  color: #ffffff;
`;

export const CopyText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.64);

  @media (max-width: 420px) {
    font-size: 0.85rem;
    line-height: 1.55;
  }
`;

export const CopyHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.74rem;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.34);

  svg {
    font-size: 0.9rem;
  }
`;

// ─── Shared mock chrome ───────────────────────────────────────────────────────

export const Mock = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  max-width: 420px;
  margin-inline: auto;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: #0d0f13;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.42);
  overflow: hidden;
`;

export const MockBar = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);

  span {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  b {
    color: rgba(255, 255, 255, 0.75);
    font-weight: 600;
  }
`;

export const MockDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
`;

export const MockBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  min-height: 232px;

  @media (max-width: 420px) {
    min-height: 208px;
    padding: 12px;
  }
`;

/** One-line typewriter. `$ms` is the run, `$delay` when it starts. */
export const Typed = styled.span<{ $delay: number; $ms: number }>`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
  border-right: 1.5px solid transparent;
  animation:
    ${typeOut} ${({ $ms }) => $ms}ms steps(28, end)
      ${({ $delay }) => $delay}ms both,
    ${caretBlink} 760ms steps(1, end) ${({ $delay }) => $delay}ms 6;

  ${reduced(css`
    animation: none;
    border-right-color: transparent;
  `)}
`;

const enters = ($delay: number) => css`
  animation: ${rise} 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) ${$delay}ms both;

  ${reduced(css`
    animation: none;
  `)}
`;

const pops = ($delay: number) => css`
  animation: ${popIn} 0.45s cubic-bezier(0.2, 0.7, 0.3, 1) ${$delay}ms both;

  ${reduced(css`
    animation: none;
  `)}
`;

// ─── Scene 1 · create a character ─────────────────────────────────────────────

export const CharTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const CharAvatar = styled.span<{ $img: string }>`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background:
    url(${({ $img }) => $img}) center / cover no-repeat,
    linear-gradient(135deg, #6fa0c1, #2a4a6b);
  ${pops(120)}

  /* Ring being "drawn" around the new character. */
  &::after {
    content: "";
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 1.5px solid transparent;
    border-top-color: var(--accent);
    border-right-color: color-mix(in srgb, var(--accent) 45%, transparent);
    animation: ${spin} 2.6s linear 300ms infinite;

    ${reduced(css`
      animation: none;
      border-color: color-mix(in srgb, var(--accent) 45%, transparent);
    `)}
  }
`;

export const CharLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`;

export const CharName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
`;

export const CharHandle = styled.div`
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.42);
  ${enters(900)}
`;

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

export const Chip = styled.span<{ $delay: number; $accent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  border: 1px solid
    ${({ $accent }) =>
      $accent
        ? "color-mix(in srgb, var(--accent) 45%, transparent)"
        : "rgba(255, 255, 255, 0.1)"};
  color: ${({ $accent }) => ($accent ? "var(--accent)" : "rgba(255,255,255,0.6)")};
  background: ${({ $accent }) =>
    $accent
      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
      : "rgba(255, 255, 255, 0.04)"};
  ${({ $delay }) => pops($delay)}
`;

export const FieldLabel = styled.div<{ $delay: number }>`
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  ${({ $delay }) => enters($delay)}
`;

export const FieldBox = styled.div<{ $delay: number }>`
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.8rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.66);
  ${({ $delay }) => enters($delay)}
`;

export const SavePill = styled.span<{ $delay: number }>`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #08090c;
  background: var(--accent);
  ${({ $delay }) => pops($delay)}
`;

// ─── Scene 2 · open a storyboard ──────────────────────────────────────────────

export const Cover = styled.div<{ $delay: number }>`
  position: relative;
  padding: 16px 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 14%, transparent),
    rgba(255, 255, 255, 0.02)
  );
  overflow: hidden;
  ${({ $delay }) => enters($delay)}

  /* Light sweeping across the freshly opened board. */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 45%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.09),
      transparent
    );
    animation: ${sheen} 2.4s ease-in-out 900ms infinite;

    ${reduced(css`
      animation: none;
      opacity: 0;
    `)}
  }
`;

export const CoverTitle = styled.div`
  font-size: 0.98rem;
  font-weight: 700;
  color: #ffffff;
`;

export const CoverMeta = styled.div<{ $delay: number }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
  ${({ $delay }) => enters($delay)}
`;

export const InviteRow = styled.div<{ $delay: number }>`
  display: flex;
  align-items: center;
  gap: 10px;
  ${({ $delay }) => enters($delay)}
`;

export const AvatarStack = styled.div`
  display: flex;
`;

export const StackAvatar = styled.span<{ $img: string; $delay: number }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #0d0f13;
  background:
    url(${({ $img }) => $img}) center / cover no-repeat,
    linear-gradient(135deg, #9a8ac8, #3e3564);

  & + & {
    margin-left: -9px;
  }

  ${({ $delay }) => pops($delay)}
`;

export const InviteText = styled.span`
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);

  b {
    color: rgba(255, 255, 255, 0.82);
  }
`;

export const Toast = styled.div<{ $delay: number }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: flex-start;
  padding: 7px 11px;
  border-radius: 10px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  ${({ $delay }) => pops($delay)}
`;

// ─── Scene 3 · take your turn ─────────────────────────────────────────────────

export const Turn = styled.div<{ $delay: number; $mine?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 9px;
  flex-direction: ${({ $mine }) => ($mine ? "row-reverse" : "row")};
  ${({ $delay }) => enters($delay)}

  > div {
    min-width: 0;
  }
`;

export const TurnAvatar = styled.span<{ $img: string }>`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background:
    url(${({ $img }) => $img}) center / cover no-repeat,
    linear-gradient(135deg, #c8a87c, #8e5b3a);
`;

export const Bubble = styled.div<{ $mine?: boolean }>`
  position: relative;
  max-width: 78%;
  padding: 9px 12px;
  border-radius: 14px;
  border-bottom-left-radius: ${({ $mine }) => ($mine ? "14px" : "4px")};
  border-bottom-right-radius: ${({ $mine }) => ($mine ? "4px" : "14px")};
  font-size: 0.8rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.82);
  border: 1px solid
    ${({ $mine }) =>
      $mine
        ? "color-mix(in srgb, var(--accent) 35%, transparent)"
        : "rgba(255, 255, 255, 0.09)"};
  background: ${({ $mine }) =>
    $mine
      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
      : "rgba(255, 255, 255, 0.04)"};

  em {
    color: #ffffff;
    font-style: italic;
  }
`;

export const TurnWho = styled.div`
  margin-bottom: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.5);
`;

/* The typing bubble is a beat of its own: it appears, runs, then folds away as
   the reply it was announcing lands. `$until` is when the fold starts. */
export const Typing = styled.div<{ $delay: number; $until: number }>`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 4px;
  padding: 11px 13px;
  margin-left: 37px;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
  animation:
    ${rise} 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) ${({ $delay }) => $delay}ms both,
    ${fold} 0.35s ease-in ${({ $until }) => $until}ms forwards;

  ${reduced(css`
    animation: none;
    display: none;
  `)}
`;

export const TypingDot = styled.span<{ $i: number }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  animation: ${dotBounce} 1.1s ease-in-out ${({ $i }) => $i * 140}ms infinite;

  ${reduced(css`
    animation: none;
    opacity: 0.6;
  `)}
`;

export const ReactionRow = styled.div<{ $delay: number }>`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-left: 37px;
  ${({ $delay }) => enters($delay)}

  @media (max-width: 420px) {
    padding-left: 0;
  }
`;

export const Reaction = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
`;

export const FloatingHeart = styled.span<{ $delay: number }>`
  position: absolute;
  left: 48px;
  bottom: 4px;
  font-size: 0.85rem;
  color: #e0245e;
  pointer-events: none;
  animation: ${floatHeart} 1.5s ease-out ${({ $delay }) => $delay}ms both;

  ${reduced(css`
    animation: none;
    opacity: 0;
  `)}
`;

export const LivePill = styled.span<{ $delay: number }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  ${({ $delay }) => enters($delay)}
`;

export const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: ${pulse} 1.9s ease-in-out infinite;

  ${reduced(css`
    animation: none;
  `)}
`;
