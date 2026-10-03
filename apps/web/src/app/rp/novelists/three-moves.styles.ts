import styled, { css, keyframes } from "styled-components";
import { spin } from "@/theme/animations";

/* ─────────────────────────────────────────────────────────────────────────────
   "A story in three moves" — an animated reel.

   The three beats live on a rail at the top; the active beat plays that move
   in the stage below as its own object — a character card, an opening book, a
   thread of turns — so the three read as different things rather than as three
   screenshots of the same window. Everything here is CSS-driven
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

/* The card's border inking itself in. Normalised by `pathLength="1"` on the
   rect, so the dash maths does not depend on the card's rendered size. */
const inkEdge = keyframes`
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
`;

/* The portrait coming up out of the dark, like a print developing. */
const develop = keyframes`
  from { opacity: 0; filter: brightness(0.2) contrast(1.6) blur(6px); transform: scale(1.08); }
  60%  { opacity: 1; }
  to   { opacity: 1; filter: none; transform: scale(1); }
`;

/* Wax seal pressed onto the card: it comes down big and settles crooked. */
const stamp = keyframes`
  0%   { opacity: 0; transform: scale(2.4) rotate(-26deg); }
  55%  { opacity: 1; transform: scale(0.9) rotate(-4deg); }
  100% { opacity: 1; transform: scale(1) rotate(-8deg); }
`;

/* The right-hand leaf of the storyboard swinging open on the spine. */
const turnPage = keyframes`
  from { opacity: 0; transform: rotateY(-82deg); }
  60%  { opacity: 1; }
  to   { opacity: 1; transform: rotateY(0deg); }
`;

/* Ink arriving across a block of text. Unlike the typewriter this survives
   wrapping, so it can be used on a cover title inside a narrow page. */
const inkIn = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
`;

/* The story thread spun out downward as the turns land on it. */
const spool = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
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

// ─── Scene frame ──────────────────────────────────────────────────────────────

/**
 * Every move gets its own object rather than a shared window mock: a character
 * card, a storyboard opening like a book, a thread of turns. Only the outer box
 * is shared, and only so the three of them are exactly the same size — the
 * stage must not resize as the reel walks between beats.
 *
 * The height is set above the tallest composition at the narrowest width the
 * scene is ever given (~300px, inside the stage on a 375px viewport), so no
 * scene clips and none of them jump.
 */
export const Scene = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 420px;
  height: 352px;
  margin-inline: auto;

  @media (max-width: 420px) {
    height: 344px;
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

/** A left-to-right ink wipe that works on wrapped, multi-line text. */
export const Inked = styled.span<{ $delay: number; $ms: number }>`
  display: inline-block;
  animation: ${inkIn} ${({ $ms }) => $ms}ms cubic-bezier(0.4, 0, 0.25, 1)
    ${({ $delay }) => $delay}ms both;

  ${reduced(css`
    animation: none;
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

/** Shared lift for the three scene objects. */
const paper = css`
  box-shadow:
    0 18px 44px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

// ─── Scene 1 · a character card being struck ──────────────────────────────────

/* The card's outline inks itself in, the portrait develops out of the dark,
   traits are cut as tags, and the sheet is signed with a wax seal. */

export const Card = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 20px 16px;
  border-radius: 18px;
  transform: rotate(-1.1deg);
  background:
    radial-gradient(
      120% 78% at 50% 0%,
      color-mix(in srgb, var(--accent) 13%, transparent),
      transparent 68%
    ),
    linear-gradient(180deg, #111318, #0b0d11);
  ${paper}
  overflow: hidden;

  /* Faint laid-paper grain, so the card does not read as one more panel. */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      114deg,
      rgba(255, 255, 255, 0.022) 0 1px,
      transparent 1px 7px
    );
    pointer-events: none;
  }

  @media (max-width: 420px) {
    padding: 18px 13px;
  }
`;

/** The card's border, drawn on rather than simply present. `pathLength="1"`
 *  keeps the dash maths identical at every width the card is given. */
export const CardEdge = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  rect {
    fill: none;
    stroke: color-mix(in srgb, var(--accent) 46%, transparent);
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
    stroke-dasharray: 1;
    animation: ${inkEdge} 1.5s cubic-bezier(0.5, 0, 0.2, 1) 120ms both;
  }

  ${reduced(css`
    rect {
      animation: none;
      stroke-dashoffset: 0;
    }
  `)}
`;

/** Registration ticks at the corners — the sheet is being cut to size. */
export const CardTick = styled.span<{ $at: "bl" | "br" | "tl" | "tr" }>`
  position: absolute;
  width: 13px;
  height: 13px;
  border: 1.5px solid color-mix(in srgb, var(--accent) 55%, transparent);
  ${({ $at }) => css`
    ${$at[0] === "t" ? "top: 11px;" : "bottom: 11px;"}
    ${$at[1] === "l" ? "left: 11px;" : "right: 11px;"}
    border-${$at[0] === "t" ? "bottom" : "top"}-width: 0;
    border-${$at[1] === "l" ? "right" : "left"}-width: 0;
  `}
  ${enters(1000)}
`;

export const CardKind = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-inline: 8px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
  ${enters(760)}

  b {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 1.2px;
    color: var(--accent);
  }

  svg {
    font-size: 0.8rem;
  }
`;

/** A framed portrait, not one more round avatar: it develops out of the dark. */
export const Portrait = styled.span<{ $img: string }>`
  position: relative;
  display: block;
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  border-radius: 16px;
  background:
    url(${({ $img }) => $img}) center / cover no-repeat,
    linear-gradient(135deg, #6fa0c1, #2a4a6b);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
  animation: ${develop} 1.2s ease-out 200ms both;

  ${reduced(css`
    animation: none;
  `)}

  /* A slow conic sweep running around the frame — the character catching the
     light. Masked down to the border itself, so it is a travelling edge rather
     than a wedge of colour spilling over the portrait. */
  &::before {
    content: "";
    position: absolute;
    inset: -5px;
    padding: 1.5px;
    border-radius: 20px;
    background: conic-gradient(
      from 0deg,
      transparent 0deg 250deg,
      color-mix(in srgb, var(--accent) 90%, transparent) 330deg,
      transparent 360deg
    );
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    animation: ${spin} 4.4s linear 400ms infinite;

    ${reduced(css`
      animation: none;
      opacity: 0.55;
    `)}
  }

  @media (max-width: 420px) {
    width: 84px;
    height: 84px;
  }
`;

export const CardName = styled.div`
  max-width: 100%;
  font-size: 1.02rem;
  font-weight: 700;
  text-align: center;
  color: #ffffff;
`;

export const CardHandle = styled.div<{ $delay: number }>`
  margin-top: -5px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  ${({ $delay }) => enters($delay)}
`;

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
`;

/** Notched tags — cut from the sheet, rather than pill-shaped chips. */
export const Tag = styled.span<{ $accent?: boolean; $delay: number }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px 5px 9px;
  font-size: 0.71rem;
  font-weight: 600;
  clip-path: polygon(7px 0, 100% 0, 100% 100%, 0 100%, 0 7px);
  color: ${({ $accent }) =>
    $accent ? "var(--accent)" : "rgba(255, 255, 255, 0.66)"};
  background: ${({ $accent }) =>
    $accent
      ? "color-mix(in srgb, var(--accent) 16%, transparent)"
      : "rgba(255, 255, 255, 0.06)"};
  ${({ $delay }) => pops($delay)}

  svg {
    font-size: 0.78rem;
  }
`;

/** The character's voice, pulled out as a line of their own. */
export const Voice = styled.p<{ $delay: number }>`
  position: relative;
  margin: 2px 0 0;
  padding-left: 11px;
  font-size: 0.79rem;
  font-style: italic;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.62);
  ${({ $delay }) => enters($delay)}

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 3px;
    bottom: 3px;
    width: 2px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--accent) 65%, transparent);
  }
`;

export const SealRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  margin-top: auto;
`;

export const SealNote = styled.span<{ $delay: number }>`
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--accent) 70%, #ffffff);
  ${({ $delay }) => enters($delay)}
`;

/** Wax seal — the sheet is signed, so the character exists. */
export const Seal = styled.span<{ $delay: number }>`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  font-size: 1.05rem;
  color: #08090c;
  background:
    radial-gradient(
      70% 70% at 32% 28%,
      rgba(255, 255, 255, 0.45),
      transparent 60%
    ),
    var(--accent);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 30%, transparent);
  animation: ${stamp} 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)
    ${({ $delay }) => $delay}ms both;

  ${reduced(css`
    animation: none;
    transform: rotate(-8deg);
  `)}

  /* Scalloped rim, the way wax spreads out from under a stamp. */
  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px dashed color-mix(in srgb, var(--accent) 45%, transparent);
  }

  @media (max-width: 420px) {
    width: 42px;
    height: 42px;
  }
`;

// ─── Scene 2 · a storyboard opening like a book ───────────────────────────────

/* The left leaf is the cover being written; the right leaf turns open on the
   spine to reveal the opening scene and the writers invited into it. */

export const Book = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: 0.84fr 1.16fr;
  border-radius: 5px 14px 14px 5px;
  background: linear-gradient(180deg, #12141a, #0b0d11);
  perspective: 1100px;
  ${paper}
  overflow: hidden;

  /* Light passing over the spread, once, as the page settles open. */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 38%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.06),
      transparent
    );
    pointer-events: none;
    animation: ${sheen} 1.7s ease-out 900ms both;

    ${reduced(css`
      animation: none;
      opacity: 0;
    `)}
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    border-radius: 14px 14px 5px 5px;
  }
`;

/** The gutter: a hard centre line with the page shadow falling either side. */
export const Spine = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 42%;
  width: 22px;
  transform: translateX(-50%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.5) 45%,
    rgba(255, 255, 255, 0.07) 50%,
    rgba(0, 0, 0, 0.5) 55%,
    transparent
  );
  pointer-events: none;

  /* Stacked leaves put the gutter between two rows whose height depends on how
     the cover wraps, so it is drawn on the leaf edge itself down here instead
     of guessed at from the outside. */
  @media (max-width: 420px) {
    display: none;
  }
`;

/** Bookmark ribbon hanging out of the top of the board. */
export const Ribbon = styled.span<{ $delay: number }>`
  position: absolute;
  top: 0;
  right: 20px;
  width: 15px;
  height: 42px;
  background: linear-gradient(
    180deg,
    var(--accent),
    color-mix(in srgb, var(--accent) 45%, transparent)
  );
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 74%, 0 100%);
  ${({ $delay }) => enters($delay)}
`;

export const Leaf = styled.div<{ $side: "left" | "right" }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: ${({ $side }) =>
    $side === "left" ? "20px 14px 16px 16px" : "20px 15px 16px 20px"};

  ${({ $side }) =>
    $side === "right" &&
    css`
      transform-origin: left center;
      backface-visibility: hidden;
      animation: ${turnPage} 1.05s cubic-bezier(0.3, 0.85, 0.35, 1) 240ms both;

      ${reduced(css`
        animation: none;
      `)}

      @media (max-width: 420px) {
        transform-origin: center top;
        padding: 18px 14px 14px;
      }
    `}

  @media (max-width: 420px) {
    padding: 16px 14px 12px;

    ${({ $side }) =>
      $side === "left" &&
      css`
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        box-shadow: 0 8px 14px -8px rgba(0, 0, 0, 0.75);
      `}
  }
`;

export const LeafLabel = styled.div<{ $delay: number }>`
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  ${({ $delay }) => enters($delay)}
`;

export const BoardTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  color: #ffffff;
`;

export const BoardMeta = styled.ul<{ $delay: number }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.71rem;
  color: rgba(255, 255, 255, 0.46);
  ${({ $delay }) => enters($delay)}

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  svg {
    flex-shrink: 0;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--accent) 85%, #ffffff);
  }

  @media (max-width: 420px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px 12px;
  }
`;

/** Foot of the cover leaf: a rule and a chapter mark, so the page has a
 *  bottom edge instead of trailing off into empty paper. */
export const LeafFoot = styled.div<{ $delay: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.34);
  ${({ $delay }) => enters($delay)}

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent) 40%, transparent),
      transparent
    );
  }

  @media (max-width: 420px) {
    display: none;
  }
`;

/** Ruled manuscript lines, with the opening scene written onto them. */
export const RuledText = styled.p<{ $delay: number }>`
  margin: 0;
  font-size: 0.78rem;
  line-height: 22px;
  color: rgba(255, 255, 255, 0.7);
  background-image: linear-gradient(
    rgba(255, 255, 255, 0.07) 1px,
    transparent 1px
  );
  background-size: 100% 22px;
  background-position: 0 21px;
  ${({ $delay }) => enters($delay)}
`;

export const InviteRow = styled.div<{ $delay: number }>`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  ${({ $delay }) => enters($delay)}
`;

export const AvatarStack = styled.div`
  display: flex;
`;

export const StackAvatar = styled.span<{ $delay: number; $img: string }>`
  width: 28px;
  height: 28px;
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
  font-size: 0.74rem;
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
  max-width: 100%;
  padding: 7px 11px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  ${({ $delay }) => pops($delay)}

  svg {
    flex-shrink: 0;
  }

  span {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

// ─── Scene 3 · turns knotted onto one thread ──────────────────────────────────

/* Not a chat window: the story is a thread running down the scene, and every
   turn is knotted onto it in the order it was written. */

export const Thread = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 12px 2px;
`;

/** The turns hug their own height and sit centred in the scene, and the thread
 *  is measured against them — otherwise it runs on past the last turn into the
 *  empty half of a box sized by the two taller scenes. */
export const ThreadInner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
`;

/** The thread itself, spun downward as the turns land on it. */
export const Ply = styled.span`
  position: absolute;
  top: 15px;
  bottom: 14px;
  left: 15px;
  width: 2px;
  border-radius: 2px;
  transform-origin: top center;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 75%, transparent),
    color-mix(in srgb, var(--accent) 20%, transparent)
  );
  animation: ${spool} 2.9s cubic-bezier(0.4, 0, 0.3, 1) 150ms both;

  ${reduced(css`
    animation: none;
  `)}
`;

export const Knot = styled.div<{ $delay: number; $mine?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr;
  align-items: start;
  gap: 8px;
  padding-left: ${({ $mine }) => ($mine ? "24px" : "0")};
  ${({ $delay }) => enters($delay)}

  > div {
    min-width: 0;
  }

  /* Elbow reaching from the thread across to the turn — longer for your own
     turn, which is set in from the thread. */
  &::before {
    content: "";
    position: absolute;
    top: 15px;
    left: 15px;
    width: ${({ $mine }) => ($mine ? "10px" : "8px")};
    height: 1px;
    background: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  @media (max-width: 420px) {
    padding-left: ${({ $mine }) => ($mine ? "15px" : "0")};
  }
`;

export const KnotAvatar = styled.span<{ $img: string; $mine?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background:
    url(${({ $img }) => $img}) center / cover no-repeat,
    linear-gradient(135deg, #c8a87c, #8e5b3a);
  box-shadow:
    0 0 0 2px #0b0d11,
    0 0 0 ${({ $mine }) => ($mine ? "3.5px" : "3px")}
      ${({ $mine }) => ($mine ? "var(--accent)" : "rgba(255, 255, 255, 0.16)")};
`;

export const TurnWho = styled.div`
  margin-bottom: 4px;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.5);
`;

export const Line = styled.div<{ $mine?: boolean }>`
  padding: 9px 12px;
  border-radius: 12px;
  border-top-left-radius: 4px;
  font-size: 0.79rem;
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

/* The waiting beat is a knot still being tied: it appears, runs, then folds
   away as the reply it was announcing lands. `$until` is when the fold starts. */
export const Tying = styled.div<{ $delay: number; $until: number }>`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 4px;
  margin-left: 40px;
  padding: 9px 12px;
  border-radius: 12px;
  border-top-left-radius: 4px;
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

/** Foot of the thread — where it is still running. */
export const Tail = styled.div<{ $delay: number }>`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  padding-left: 40px;
  ${({ $delay }) => enters($delay)}

  @media (max-width: 420px) {
    padding-left: 32px;
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
  left: 52px;
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
