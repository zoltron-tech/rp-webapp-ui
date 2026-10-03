import styled, { keyframes } from "styled-components";
import { DIALOG_SCRIM, GLASS_DIALOG } from "@/theme";
import { fadeIn as overlayFadeIn, slideInUp } from "@/theme/animations";

/**
 * Chrome for [UserGuideDialog] — a centred dialog on desktop, a slide-up tray
 * on mobile, following the same shape as [ResponsiveSheet] so a guide reads as
 * part of the app rather than a bolted-on tour.
 *
 * Sized against the 375 × 667 baseline: the header and footer are fixed, and
 * everything else scrolls between them, so Next is always on screen.
 */

const popIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

/** The ring around whatever the step is currently talking about. */
const emphasisPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 0 2px var(--accent),
      0 0 0 4px color-mix(in srgb, var(--accent) 26%, transparent);
  }
  50% {
    box-shadow:
      0 0 0 2px var(--accent),
      0 0 0 11px color-mix(in srgb, var(--accent) 0%, transparent);
  }
`;

/** The tap the pointer lands with. */
const tapRipple = keyframes`
  from { opacity: 0.9; transform: scale(0.4); }
  to   { opacity: 0;   transform: scale(2.6); }
`;

/** Above the workspace's own sheets (301), below confirmation dialogs. */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  ${DIALOG_SCRIM}
  z-index: 400;
  animation: ${overlayFadeIn} 0.2s ease both;
`;

export const Dialog = styled.div`
  position: fixed;
  z-index: 401;
  display: flex;
  flex-direction: column;
  ${GLASS_DIALOG}
  font-family: var(--font);
  border-radius: 22px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Fixed, not fitted: the dialog is the same box on every step. A box that
     grew and shrank with each step's copy would move the buttons under the
     reader's thumb between one Next and the next. Long copy scrolls; short
     copy simply leaves room at the bottom. */
  width: min(94vw, 760px);
  height: min(88vh, 700px);
  animation: ${popIn} 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;

  /* Mobile: a bottom sheet. It has to fit and scroll inside 375 × 667. */
  @media (max-width: 700px) {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: auto;
    transform: none;
    height: 88svh;
    border-radius: 22px 22px 0 0;
    border-bottom: none;
    animation: ${slideInUp} 0.28s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/** The grab affordance for the tray. Decorative — the header carries close. */
export const Grabber = styled.span`
  display: none;

  @media (max-width: 700px) {
    display: block;
    width: 38px;
    height: 4px;
    margin: 8px auto 0;
    border-radius: 2px;
    background: var(--bg-6);
  }
`;

export const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--bg-4);
`;

export const Title = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** "3 / 10" — the same count the dots carry, for when they are too small. */
export const Counter = styled.span`
  flex-shrink: 0;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
`;

/**
 * The stage: a scale model of the real screen.
 *
 * Fixed height, and it never shrinks — a long step's copy must not squeeze the
 * picture out of the dialog, which is exactly what happens on a phone when the
 * two share one scroller. So the stage holds its size and the copy below it
 * scrolls on its own.
 *
 * Painted in the page's own background rather than the dialog's, because what
 * it holds are real components styled to sit on a page — cards in `--bg-2` on
 * a `--bg-2` dialog would dissolve into it.
 */
export const Stage = styled.div`
  flex-shrink: 0;
  /* The model is pinned to the top-left corner and scaled from it, so every
     step's mock starts at the same place — a picture that re-centres itself as
     its content changes height reads as drift, not as layout. */
  display: block;
  height: 340px;
  margin: 0.9rem 0.9rem 0;
  border-radius: 12px;
  border: 1px solid var(--bg-6);
  background: var(--bg-1);
  /* The model is scaled to fit, so there is never anything to scroll to —
     clipping only guards the frame while the first measurement lands. */
  overflow: hidden;

  /* A phone's mock is a phone's shape — tall and narrow — so the frame is
     given as much height as the 375 × 667 budget can spare it: the copy under
     it scrolls, the picture cannot. */
  @media (max-width: 700px) {
    height: 280px;
    margin: 0.7rem 0.7rem 0;
  }

  /* A short desktop window (a laptop with the browser at half height) has the
     same problem a phone does — take it out of the picture, not the copy. */
  @media (min-width: 701px) and (max-height: 720px) {
    height: 240px;
  }

  /* Landscape on a phone, or a very short window: the picture gives way — at
     this height the copy and the buttons are all there is room for. Last, so
     it wins over the two above. */
  @media (max-height: 560px) {
    height: 150px;
  }
`;

/**
 * The scale model itself: laid out at a screen's width, drawn at a fraction of
 * it. See [GuideStage] for how the fraction is arrived at.
 *
 * The width is what makes this a model of a *screen* rather than of the frame:
 * a desktop's mock is laid out in a desktop's worth of room, so its cards form
 * the rows they really form, and only then is the whole thing shrunk.
 */
export const StageModel = styled.div<{ $scale: number }>`
  /* A desktop's worth of room — wide enough that the codex grid forms the rows
     it really forms, and wide enough that the fit alone shrinks it well down. */
  width: 1080px;
  padding: 0.9rem;
  box-sizing: border-box;
  /* The pointer is placed against this box. */
  position: relative;
  /* A picture, not a working copy: nothing in here takes a click or a tap. The
     model also carries the inert attribute, which covers the keyboard and
     assistive tech; this covers the pointer. */
  pointer-events: none;
  user-select: none;
  transform: scale(${(p) => p.$scale});
  /* Shrinks toward the corner it sits in, so the model's top-left stays the
     frame's top-left whatever the scale works out to. */
  transform-origin: top left;
  /* Nothing is shown until the first measurement, or the model would flash at
     full size for a frame. */
  opacity: ${(p) => (p.$scale > 0 ? 1 : 0)};
  transition: opacity 0.12s ease;

  /* A phone is modelled at a phone's width — the same 375px baseline the app
     is built to, so its mock wraps and truncates exactly as the real screen. */
  @media (max-width: 700px) {
    width: 375px;
    padding: 0.6rem;
  }

  /* ── The flow's own marks ───────────────────────────────────────────────
     Applied by the stages as classes rather than as wrappers, so nothing an
     emphasis touches has its layout changed by being emphasised. */

  /* Whatever the copy beside the stage is talking about, right now. */
  .guide-emphasis {
    position: relative;
    z-index: 2;
    /* Follows the element's own corners, whatever shape it is. */
    animation: ${emphasisPulse} 1.9s ease-in-out infinite;
  }

  /* A row mid-drag, for the flows that demonstrate reordering. */
  .guide-lift {
    position: relative;
    z-index: 3;
    transform: translateY(-7px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    .guide-emphasis {
      animation: none;
      box-shadow:
        0 0 0 2px var(--accent),
        0 0 0 6px color-mix(in srgb, var(--accent) 16%, transparent);
    }

    .guide-lift {
      transform: none;
    }
  }
`;

/**
 * The pointer: a hand moving through the mock, so a step reads as somebody
 * using the screen rather than as a screenshot with a ring drawn on it.
 *
 * Placed in the model's own coordinates and scaled down with it, so it stays
 * the right size against the UI it is pointing at.
 */
export const Pointer = styled.span`
  position: absolute;
  z-index: 6;
  width: 26px;
  height: 26px;
  margin: -2px 0 0 -3px;
  pointer-events: none;
  /* Kept in step with POINTER_TRAVEL_MS: the stage acts when the hand lands,
     so if these two drift apart the action fires early or late. */
  transition:
    left 0.42s cubic-bezier(0.33, 0, 0.15, 1),
    top 0.42s cubic-bezier(0.33, 0, 0.15, 1);

  svg {
    width: 100%;
    height: 100%;
    /* Outlined in the stage's own background so it reads over any surface. */
    fill: var(--text);
    stroke: var(--bg-1);
    stroke-width: 1.5;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/** The tap that lands when the pointer arrives. Restarted on every move. */
export const PointerTap = styled.span`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  animation: ${tapRipple} 0.7s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0;
  }
`;

export const StageNote = styled.p`
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.5;
  color: var(--text-secondary);
`;

/** The copy under the stage — the only part of the body that scrolls. */
export const Copy = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.75rem 0.9rem;

  &:focus {
    outline: none;
  }

  @media (max-width: 700px) {
    gap: 0.55rem;
    padding: 0.6rem 0.7rem;
  }
`;

export const StepTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.3;

  &:focus {
    outline: none;
  }

  @media (max-width: 700px) {
    font-size: var(--font-size);
  }
`;

export const StepBody = styled.div`
  margin: 0;
  font-size: var(--font-size-input);
  line-height: 1.6;
  color: var(--text-secondary);

  b {
    color: var(--text);
    font-weight: var(--font-weight-semi-bold);
  }

  @media (max-width: 700px) {
    font-size: var(--font-size-small);
  }
`;

export const Points = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 1rem;
    font-size: var(--font-size-small);
    line-height: 1.55;
    color: var(--text-secondary);
  }

  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }

  b {
    color: var(--text);
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const Footer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  padding-bottom: calc(0.7rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--bg-4);

  /* On a phone the dots take their own line above the buttons — three buttons
     and ten dots do not share 375px without shrinking the tap targets. */
  @media (max-width: 700px) {
    flex-wrap: wrap;
    padding: 0.6rem 0.75rem;
    padding-bottom: calc(0.6rem + env(safe-area-inset-bottom, 0px));
  }
`;

export const Dots = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin: 0 auto;

  @media (max-width: 700px) {
    order: -1;
    width: 100%;
    margin: 0 0 0.15rem;
  }
`;

export const Dot = styled.button<{ $active?: boolean; $done?: boolean }>`
  width: ${(p) => (p.$active ? "18px" : "8px")};
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: ${(p) =>
    p.$active
      ? "var(--accent)"
      : p.$done
        ? "color-mix(in srgb, var(--accent) 45%, var(--bg-6))"
        : "var(--bg-6)"};
  transition: width 0.18s ease, background 0.18s ease;

  &:hover {
    background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-9, #777)")};
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* Shares the second line with Skip rather than taking one of its own — at
     375px a third footer row costs more than the whole dots line. */
  @media (max-width: 700px) {
    flex: 1;
    gap: 0.4rem;
  }
`;

const buttonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-height: 40px;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (max-width: 700px) {
    min-height: 38px;
    padding: 0.4rem 0.7rem;
    font-size: var(--font-size-xsmall);
  }
`;

/** Skip — quiet, and always the smallest thing in the row. */
export const SkipButton = styled.button`
  ${buttonBase}
  background: transparent;
  border: none;
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding-inline: 0.4rem;

  &:hover {
    color: var(--text);
  }
`;

export const BackButton = styled.button`
  ${buttonBase}
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--text);
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }

  @media (max-width: 700px) {
    flex: 1;
  }
`;

export const NextButton = styled.button`
  ${buttonBase}
  background: var(--accent);
  border: 1px solid var(--accent);
  color: #fff;

  &:hover {
    background: var(--accent-hover, var(--accent));
  }

  @media (max-width: 700px) {
    flex: 1.4;
  }
`;
