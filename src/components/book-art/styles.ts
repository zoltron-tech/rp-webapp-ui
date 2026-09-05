import styled, { css, keyframes } from "styled-components";
import {
  artDotTwinkle,
  artGlowPulse,
  artStarTwinkle,
  bookFloat,
  bookShadowBreathe,
  bookTilt,
  ribbonSway,
} from "@/theme/animations";

/* Motion specific to one scene lives here; anything shared across them is in
 * @/theme/animations, since every scene is the same paper object caught at a
 * different moment. */

/** Quill hovers over the page as if searching for the first word. */
const quillWrite = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  30%      { transform: translate(-4px, 2px) rotate(-5deg); }
  65%      { transform: translate(3px, -1px) rotate(4deg); }
`;

/** Ink gathers at the nib, falls, fades before it ever lands. */
const inkDrip = keyframes`
  0%       { opacity: 0; transform: translateY(-5px) scale(0.4); }
  20%      { opacity: 0.45; transform: translateY(0) scale(1); }
  70%      { opacity: 0.2; transform: translateY(7px) scale(0.85); }
  100%     { opacity: 0; transform: translateY(12px) scale(0.4); }
`;

/** Ruled lines write themselves in once, on mount. Paired with pathLength="1"
 *  on every line so one dashoffset works whatever the line's real length. */
const inkLine = keyframes`
  from { stroke-dashoffset: 1; opacity: 0; }
  to   { stroke-dashoffset: 0; opacity: 1; }
`;

/** The waiting "?" pulses gently. */
const questionPulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.95; }
`;

/** Occasional blink — squash the eyes then hold open most of the cycle. */
const blink = keyframes`
  0%, 92%, 100% { transform: scaleY(1); }
  96%           { transform: scaleY(0.2); }
`;

/** Zzz drift up + fade, staggered per letter. */
const drift = keyframes`
  0%   { opacity: 0; transform: translate(0, 2px) scale(0.7); }
  25%  { opacity: 1; }
  100% { opacity: 0; transform: translate(4px, -8px) scale(1.1); }
`;

/** Ellipsis in an empty starter bubble — a message nobody has typed yet. */
const typingPulse = keyframes`
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30%           { opacity: 1; transform: translateY(-2px); }
`;

/** Magnifier swings over the cards, as if being moved across them. */
const lensSweep = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  35%      { transform: translate(-6px, 3px) rotate(-4deg); }
  70%      { transform: translate(3px, -2px) rotate(3deg); }
`;

/** A crack travels across the ice, holds, then the ice reforms. */
const crackSpread = keyframes`
  0%       { stroke-dashoffset: 1; opacity: 0; }
  10%      { stroke-dashoffset: 1; opacity: 1; }
  45%      { stroke-dashoffset: 0; opacity: 1; }
  80%      { stroke-dashoffset: 0; opacity: 1; }
  100%     { stroke-dashoffset: 0; opacity: 0; }
`;

/** The torn-off half sags away from the tear and drifts back, never leaving. */
const scrapSlip = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(-1.5deg); opacity: 0.85; }
  50%      { transform: translate(4px, 6px) rotate(-4deg); opacity: 0.55; }
`;

/** Paper flakes lift off the tear and fade, staggered along it. */
const flakeLift = keyframes`
  0%   { opacity: 0; transform: translate(0, 2px) rotate(0deg) scale(0.6); }
  25%  { opacity: 0.9; }
  100% { opacity: 0; transform: translate(6px, -12px) rotate(35deg) scale(1); }
`;

/** Smaller, colder bob than bookFloat — this scene renders at rail size. */
const iceDrift = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-1.5px) rotate(-2deg); }
`;

/**
 * Every rule the scenes draw with. Variants below only set a size — the
 * markup opts into motion by class name, so a scene that has no ribbon simply
 * never renders one.
 */
export const Art = styled.svg<{ $accent?: string | null }>`
  overflow: visible;

  /* A muse can carry its own accent, stored as a single colour rather than a
   * full scale. Redefining the scale here means every fill in the markup keeps
   * reading var(--accent-*) and simply resolves against the muse instead of
   * the logged-in user's theme. Unset, the art inherits the app accent. */
  ${({ $accent }) =>
    $accent?.trim()
      ? css`
          --accent: color-mix(in srgb, ${$accent} 82%, black);
          --accent-8: color-mix(in srgb, ${$accent} 72%, black);
          --accent-9: ${$accent};
          --accent-10: color-mix(in srgb, ${$accent} 88%, white);
          --accent-11: color-mix(in srgb, ${$accent} 62%, white);
        `
      : null}

  .tilt {
    transform-box: fill-box;
    transform-origin: 50% 60%;
    transform-style: preserve-3d;
    animation: ${bookTilt} 7.4s ease-in-out infinite;
  }

  .scene {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${bookFloat} 5.2s ease-in-out infinite;
  }

  .shadow {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${bookShadowBreathe} 5.2s ease-in-out infinite;
  }

  .glow {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${artGlowPulse} 6.5s ease-in-out infinite;
  }

  .ribbon {
    transform-box: fill-box;
    transform-origin: top center;
    animation: ${ribbonSway} 5.2s ease-in-out infinite;
  }

  .lines line,
  .lines path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ${inkLine} 0.7s ease-out both;
  }
  .lines :nth-child(1) { animation-delay: 0.15s; }
  .lines :nth-child(2) { animation-delay: 0.25s; }
  .lines :nth-child(3) { animation-delay: 0.35s; }
  .lines :nth-child(4) { animation-delay: 0.45s; }
  .lines :nth-child(5) { animation-delay: 0.55s; }
  .lines :nth-child(6) { animation-delay: 0.65s; }
  .lines :nth-child(7) { animation-delay: 0.75s; }
  .lines :nth-child(8) { animation-delay: 0.85s; }

  .quill {
    transform-box: fill-box;
    /* Pivot where a hand would grip the shaft, so the nib does the swinging. */
    transform-origin: 50% 45%;
    animation: ${quillWrite} 4.8s ease-in-out infinite;
  }

  .barbs path {
    stroke-width: 0.9;
    opacity: 0.45;
  }

  .ink {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${inkDrip} 4.8s ease-in-out infinite;
  }

  .question {
    animation: ${questionPulse} 3.4s ease-in-out infinite;
  }

  .face {
    stroke-width: 2.2;
  }

  .eye {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${blink} 4.2s ease-in-out infinite;
  }

  .mouth {
    stroke-width: 2;
  }

  .cheek {
    fill: var(--accent-9);
    opacity: 0.35;
  }

  .z {
    fill: var(--accent-11);
    font-family: var(--font);
    font-weight: var(--font-weight-bold, 700);
    font-size: 15px;
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }
  .z1 { animation: ${drift} 3s ease-in-out infinite; }
  .z2 { font-size: 13px; animation: ${drift} 3s ease-in-out 0.6s infinite; }
  .z3 { font-size: 11px; animation: ${drift} 3s ease-in-out 1.2s infinite; }

  .bond {
    animation: ${questionPulse} 3.4s ease-in-out infinite;
  }

  .ice {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${iceDrift} 4.4s ease-in-out infinite;
  }


  .scrap {
    transform-box: fill-box;
    /* Pivot at the tear, so the half hangs off it rather than sliding flat. */
    transform-origin: 20% 0%;
    animation: ${scrapSlip} 6.2s ease-in-out infinite;
  }

  .flake {
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
  }
  .flake1 { animation: ${flakeLift} 3.6s ease-in-out infinite; }
  .flake2 { animation: ${flakeLift} 3.6s ease-in-out 1.2s infinite; }
  .flake3 { animation: ${flakeLift} 3.6s ease-in-out 2.4s infinite; }

  .crack path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ${crackSpread} 4.6s ease-in-out infinite;
  }
  .crack path:nth-child(2) { animation-delay: 0.35s; }

  /* Notes drifting off an empty staff — the same idea as the Zzz. */
  .note {
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
  }
  .note1 { animation: ${drift} 3.4s ease-in-out infinite; }
  .note2 { animation: ${drift} 3.4s ease-in-out 0.8s infinite; }
  .note3 { animation: ${drift} 3.4s ease-in-out 1.6s infinite; }

  /* The bookmark that hasn't been placed yet. */
  .ghost {
    animation: ${questionPulse} 3.4s ease-in-out infinite;
  }

  .lens {
    transform-box: fill-box;
    /* Pivot at the handle's end, the way a hand would hold it. */
    transform-origin: 90% 90%;
    animation: ${lensSweep} 5.6s ease-in-out infinite;
  }

  .typing circle {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${typingPulse} 1.8s ease-in-out infinite;
  }
  .typing circle:nth-child(2) { animation-delay: 0.2s; }
  .typing circle:nth-child(3) { animation-delay: 0.4s; }

  .star {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${artStarTwinkle} 3.8s ease-in-out infinite;
  }

  .sparkle {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${artDotTwinkle} 3.4s ease-in-out infinite;
  }

  .s1 { animation-delay: 0s; }
  .s2 { animation-delay: 0.35s; }
  .s3 { animation-delay: 0.7s; }
  .s4 { animation-delay: 1.05s; }
  .s5 { animation-delay: 1.4s; }
  .s6 { animation-delay: 1.75s; }
  .s7 { animation-delay: 2.1s; }
  .s8 { animation-delay: 2.45s; }
  .s9 { animation-delay: 2.8s; }
  .s10 { animation-delay: 3.15s; }
  .s11 { animation-delay: 0.55s; }
  .s12 { animation-delay: 1.95s; }

  @media (prefers-reduced-motion: reduce) {
    .tilt,
    .scene,
    .shadow,
    .glow,
    .ribbon,
    .quill,
    .ink,
    .question,
    .bond,
    .ice,
    .scrap,
    .flake,
    .crack path,
    .ghost,
    .note,
    .lens,
    .eye,
    .z,
    .star,
    .sparkle,
    .typing circle,
    .lines line,
    .lines path {
      animation: none;
    }
    .typing circle { opacity: 0.55; }
    .tilt {
      transform: perspective(420px) rotateX(6deg) rotateY(-12deg) rotate(-1deg);
    }
    .lines line,
    .lines path { stroke-dashoffset: 0; opacity: 1; }
    .ink { opacity: 0.35; }
    .question { opacity: 0.7; }
    .bond { opacity: 0.7; }
    .ghost { opacity: 0.7; }
    .crack path { stroke-dashoffset: 0; opacity: 0.8; }
    .scrap { opacity: 0.7; transform: translate(3px, 4px) rotate(-3deg); }
    .flake { opacity: 0.6; }
    .note { opacity: 0.6; }
    .z { opacity: 0.6; }
    .star { opacity: 0.45; }
    .sparkle { opacity: 0.3; }
    .glow { opacity: 0.5; }
  }
`;

/** Open book with a quill — the empty-feed illustration. */
export const OpenBookSvg = styled(Art)`
  height: 128px;
  width: 160px;
`;

/** Closed, dozing book — the compact end-of-list marker. */
export const DozingBookSvg = styled(Art)`
  width: 96px;
  height: 77px;
`;

/** Blank scroll — the muse story placeholder. */
export const ScrollSvg = styled(Art)`
  width: 104px;
  height: 104px;
`;

/** Blank character card — the muse info placeholder. */
export const BlankCardSvg = styled(Art)`
  width: 112px;
  height: 96px;
`;

/** Empty speech bubble — the muse open-starters placeholder. */
export const StarterSvg = styled(Art)`
  width: 112px;
  height: 96px;
`;

/** Two unlinked character cards — the muse connections placeholder. */
export const BondSvg = styled(Art)`
  width: 124px;
  height: 96px;
`;

/** A stack of blank photo frames — the muse gallery placeholder. */
export const GallerySvg = styled(Art)`
  width: 120px;
  height: 96px;
`;

/** Cards under a magnifier — the filtered-to-nothing characters placeholder. */
export const NoMatchSvg = styled(Art)`
  width: 124px;
  height: 96px;
`;

/** A storyboard sheet of empty panels — the no-stories placeholder. */
export const StoryboardSvg = styled(Art)`
  width: 148px;
  height: 113px;
`;

/** Chapter pages with an unfilled bookmark slot — the no-bookmarks placeholder. */
export const BookmarkSvg = styled(Art)`
  width: 132px;
  height: 100px;
`;

/** An empty staff with the notes drifting off — the no-music placeholder. */
export const MusicSvg = styled(Art)`
  width: 140px;
  height: 106px;
`;

/** A sent message and an unanswered reply — the no-interactions placeholder. */
export const ThreadsSvg = styled(Art)`
  width: 136px;
  height: 104px;
`;

/** An avatar row with an open place — the no-friends placeholder. */
export const FriendsSvg = styled(Art)`
  width: 124px;
  height: 94px;
`;

/** Two bubbles mid-exchange — the no-conversations placeholder. */
export const ConversationsSvg = styled(Art)`
  width: 128px;
  height: 98px;
`;

/** A silent bell — the no-notifications placeholder. */
export const NotificationsSvg = styled(Art)`
  width: 120px;
  height: 92px;
`;

/** An avatar pair with room for one more. Sized for the home friends strip,
 *  which is a compact horizontal rail rather than a centred empty state. */
export const FriendsRailSvg = styled(Art)`
  width: 62px;
  height: 40px;
`;

/** A frozen bubble cracking open. Sized for the ice breaker rail, which is a
 *  compact horizontal strip rather than a centred empty state. */
export const FrozenBubbleSvg = styled(Art)`
  width: 50px;
  height: 44px;
`;

/** A thread page torn in two — the deleted-thread placeholder. */
export const TornThreadSvg = styled(Art)`
  width: 152px;
  height: 116px;
`;
