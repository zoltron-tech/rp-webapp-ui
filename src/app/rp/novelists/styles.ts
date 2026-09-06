import styled, { keyframes } from "styled-components";

/* ────────────────────────────────────────────────────────────────────────────
   Novelist World — landing / hero page
   Immersive, cinematic dark layout. Text content is constrained to a readable
   column while the carousels stay full-bleed. Accent pops use the theme-aware
   `--accent` variable so the page adapts to the user's chosen palette.
   Baseline responsive target: iPhone SE (375 × 667).
   ──────────────────────────────────────────────────────────────────────────── */

/** Pen stroke drawing itself in. Paired with pathLength="1" on the path. */
const inkStroke = keyframes`
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
`;

const floatUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const bob = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50%      { transform: translateY(6px); opacity: 1; }
`;

// ─── Page shell ───────────────────────────────────────────────────────────────

export const PageShell = styled.div`
  position: relative;
  width: 100%;
  background-color: #08090c;
  color: #fff;
  /* Do NOT add overflow-x hidden / clip / contain here. The novelist carousel
     uses Swiper 3D coverflow, and its autoplay waits for the wrapper
     transitionend to resume each cycle; a clipping ancestor over the 3D
     transform context breaks that event and stalls autoplay after one slide.
     Horizontal overflow is already handled by each child (the carousel paint
     containment, the muse marquee overflow-hidden, and the app card). */
`;

// ─── Hero ───────────────────────────────────────────────────────────────────

export const Hero = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: clamp(540px, 92dvh, 940px);
  padding: clamp(96px, 14vh, 168px) clamp(20px, 5vw, 48px) clamp(72px, 10vh, 120px);
  isolation: isolate;
  overflow: hidden;

  @media (max-width: 640px) {
    min-height: auto;
    padding: 88px 20px 52px;
  }

  @media (max-width: 420px) {
    padding: 64px 16px 32px;
  }

  /* The wallpaper is drawn, not fetched: see hero-backdrop.tsx. This layer is
     just the readability scrim over it, so the copy holds contrast wherever
     the aurora happens to drift. */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -2;
    background: linear-gradient(
      180deg,
      rgba(8, 9, 12, 0.3) 0%,
      rgba(8, 9, 12, 0.42) 45%,
      rgba(8, 9, 12, 0.86) 88%,
      #08090c 100%
    );
  }

  /* Accent aura + vignette */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      120% 90% at 50% 0%,
      transparent 55%,
      rgba(0, 0, 0, 0.55) 100%
    );
    pointer-events: none;
  }
`;

/* Two columns on desktop (copy + live manuscript), stacking to a single
   centered column on tablet/mobile so it still fits an iPhone SE. */
export const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: clamp(32px, 5vw, 64px);
  width: 100%;
  max-width: 1180px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: clamp(28px, 6vw, 44px);
  }
`;

export const HeroInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: clamp(16px, 2.4vw, 24px);
  max-width: 620px;
  width: 100%;

  > * {
    animation: ${floatUp} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  > *:nth-child(2) { animation-delay: 0.06s; }
  > *:nth-child(3) { animation-delay: 0.12s; }
  > *:nth-child(4) { animation-delay: 0.18s; }
  > *:nth-child(5) { animation-delay: 0.24s; }
  > *:nth-child(6) { animation-delay: 0.30s; }

  @media (max-width: 980px) {
    align-items: center;
    text-align: center;
    max-width: 640px;
  }

  @media (max-width: 420px) {
    gap: 10px;
  }
`;

/* Manuscript column — floats in slightly after the copy. */
export const HeroPanel = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  animation: ${floatUp} 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
`;

export const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 10px 1px var(--accent);
  }

  @media (max-width: 480px) {
    font-size: 0.56rem;
    letter-spacing: 1.5px;
    padding: 5px 11px;
  }
`;

/* The headline sets its own line breaks rather than taking a hard `<br>`.
   The copy column is ~586px at 1440 and the old 4.6rem fit barely 13 characters
   into it, so the two intended lines broke into four with "is" stranded on its
   own. Sized to the measure instead: at the cap the line runs ~538px of the 586
   available, and `balance` keeps the two lines even at every width in between
   rather than leaving a word alone on the second one. */
export const HeroTitle = styled.h1`
  margin: 0;
  max-width: 19ch;
  font-size: clamp(2.05rem, 4.6vw, 3.05rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.1px;
  text-wrap: balance;
  color: #ffffff;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.55);

  @media (max-width: 420px) {
    font-size: 1.7rem;
    line-height: 1.16;
    letter-spacing: -0.4px;
  }
`;

/** Carries the underline, so the swash is measured against the accented phrase
 *  itself instead of the headline block it sits in. */
export const HeroTitleAccent = styled.span`
  position: relative;
  display: inline-block;
  padding-bottom: 0.17em;
  background-image: linear-gradient(
    100deg,
    var(--accent) 0%,
    #ffffff 92%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

/* ── Hero copy ──────────────────────────────────────────────────────────── */

/** Underline swash under the accented half of the headline. Drawn rather than
 *  a border, so it can keep the hand-inked wobble of a pen stroke. */
export const TitleUnderline = styled.svg`
  position: absolute;
  left: 0;
  bottom: 0;
  display: block;
  width: 100%;
  height: 0.13em;
  overflow: visible;

  path {
    fill: none;
    stroke: var(--accent);
    stroke-width: 4;
    /* The viewBox is stretched to whatever width the phrase happens to be
       (preserveAspectRatio="none"), which would squash the stroke with it. */
    vector-effect: non-scaling-stroke;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ${inkStroke} 1.1s cubic-bezier(0.6, 0, 0.3, 1) 0.5s both;
  }

  @media (prefers-reduced-motion: reduce) {
    path {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

/** What the reader actually gets, said in four words rather than a paragraph. */
export const HeroChips = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 2px 0 0;
  padding: 0;

  @media (max-width: 980px) {
    justify-content: center;
  }
`;

export const HeroChip = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(6px);
  font-family: var(--font);
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.78);

  svg {
    flex-shrink: 0;
    color: var(--accent);
    font-size: 0.92rem;
  }

  @media (max-width: 420px) {
    font-size: 0.7rem;
    padding: 5px 10px;
  }
`;

export const HeroText = styled.p`
  margin: 0;
  max-width: 600px;
  text-wrap: pretty;
  font-size: clamp(1rem, 1.6vw, 1.18rem);
  line-height: 1.7;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.74);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);

  @media (max-width: 420px) {
    font-size: 0.85rem;
    line-height: 1.48;
  }
`;

export const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 6px;

  @media (max-width: 980px) {
    justify-content: center;
  }

  @media (max-width: 420px) {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
`;

/* Small reassurance line under the CTAs. */
export const HeroNote = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.55);

  svg {
    color: var(--accent);
    flex-shrink: 0;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.68rem;
    line-height: 1.4;
    gap: 6px;
    text-align: center;
  }
`;

// ─── Buttons ────────────────────────────────────────────────────────────────

// A light bar that sweeps across a button on hover.
const buttonSheen = keyframes`
  from { transform: translateX(-160%) skewX(-18deg); }
  to   { transform: translateX(260%) skewX(-18deg); }
`;

const ButtonBase = styled.button`
  appearance: none;
  cursor: pointer;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 22px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border-radius: 999px;
  transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.2s ease,
    background 0.2s ease, color 0.2s ease, border-color 0.2s ease, filter 0.2s ease;

  svg {
    font-size: 1em;
    transition: transform 0.2s ease;
  }

  /* Diagonal light sweep — parked off-screen, runs on hover/focus. */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 44%;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.35),
      transparent
    );
    transform: translateX(-160%) skewX(-18deg);
  }

  &:hover::after,
  &:focus-visible::after {
    animation: ${buttonSheen} 0.8s cubic-bezier(0.3, 0.7, 0.3, 1);
  }

  &:active {
    transform: translateY(1px) scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  @media (max-width: 420px) {
    width: 100%;
    padding: 10px 16px;
    font-size: 0.7rem;
    letter-spacing: 0.4px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      display: none;
    }
  }
`;

export const PrimaryButton = styled(ButtonBase)`
  border: none;
  color: var(--text);
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--accent) 82%, #ffffff) 0%,
    var(--accent) 45%,
    color-mix(in srgb, var(--accent) 78%, #000000) 100%
  );
  box-shadow: 0 12px 30px -10px var(--accent),
    0 1px 0 0 rgba(255, 255, 255, 0.35) inset,
    0 0 0 1px color-mix(in srgb, var(--accent) 60%, transparent);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 44px -12px var(--accent),
      0 1px 0 0 rgba(255, 255, 255, 0.45) inset,
      0 0 0 1px color-mix(in srgb, var(--accent) 75%, transparent);
    filter: saturate(1.08) brightness(1.05);
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

export const GhostButton = styled(ButtonBase)`
  color: var(--text);
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  /* Two-layer background: soft glass fill (padding-box) + a bright gradient
     hairline (border-box) for a lit, beveled edge. */
  background:
    linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))
      padding-box,
    linear-gradient(
        140deg,
        rgba(255, 255, 255, 0.45),
        rgba(255, 255, 255, 0.08) 55%,
        color-mix(in srgb, var(--accent) 55%, transparent)
      )
      border-box;
  box-shadow: 0 10px 26px -16px rgba(0, 0, 0, 0.9);

  svg {
    color: var(--text);
  }

  &:hover {
    transform: translateY(-3px);
    background:
      linear-gradient(
          rgba(255, 255, 255, 0.14),
          color-mix(in srgb, var(--accent) 12%, transparent)
        )
        padding-box,
      linear-gradient(
          140deg,
          color-mix(in srgb, var(--accent) 85%, #ffffff),
          color-mix(in srgb, var(--accent) 40%, transparent)
        )
        border-box;
    box-shadow: 0 16px 34px -18px color-mix(in srgb, var(--accent) 70%, #000);
  }

  &:hover svg {
    transform: translateY(-2px);
  }
`;

// ─── Scroll cue ───────────────────────────────────────────────────────────────

export const ScrollCue = styled.div`
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.62rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);

  svg {
    font-size: 1.15rem;
    animation: ${bob} 1.8s ease-in-out infinite;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

// ─── Generic section ──────────────────────────────────────────────────────────

export const Section = styled.section`
  position: relative;
  width: 100%;
  padding: clamp(56px, 9vw, 104px) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 640px) {
    padding: 46px 0;
  }

  @media (max-width: 420px) {
    padding: 38px 0;
  }
`;

export const SectionHead = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  max-width: 720px;
  margin: 0 auto clamp(36px, 6vw, 60px);
  padding-inline: clamp(20px, 5vw, 48px);

  @media (max-width: 420px) {
    gap: 8px;
    margin-bottom: 26px;
  }
`;

/* Centers the LiveStorybook book-view preview. */
export const StorybookShowcase = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px clamp(20px, 5vw, 48px) 0;
`;

export const SectionEyebrow = styled.span`
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);

  @media (max-width: 420px) {
    font-size: 0.66rem;
    letter-spacing: 2px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.7rem, 4.2vw, 2.6rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.6px;
  color: #ffffff;

  @media (max-width: 420px) {
    font-size: 1.5rem;
    line-height: 1.2;
    letter-spacing: -0.3px;
  }
`;

export const SectionSubtitle = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 1.5vw, 1.08rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.62);
  max-width: 560px;

  @media (max-width: 420px) {
    font-size: 0.9rem;
    line-height: 1.55;
  }
`;

// ─── How it works ─────────────────────────────────────────────────────────────
// Replaced the novelist coverflow + muse marquees that used to sit here — both
// were live-data rows of image-heavy layers. The reel that took their place
// lives in ./three-moves.tsx: one scene animating at a time, gated on
// visibility, no fetch.

export const StepsCta = styled.div`
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 4vw, 44px);
  padding-inline: clamp(20px, 5vw, 48px);

  @media (max-width: 420px) {
    margin-top: 22px;
  }
`;

// ─── Feature cards ────────────────────────────────────────────────────────────

/* ── Feature rows ─────────────────────────────────────────────────────────
   Three full-width rows rather than three cards abreast: each pairs a block of
   copy with an animated mock of the flow it describes, and the mock needs the
   room to be legible. The rows alternate sides so the eye zig-zags down the
   page instead of scanning one column. */

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 72px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding-inline: clamp(20px, 5vw, 48px);

  @media (max-width: 900px) {
    gap: 44px;
  }
`;

export const FeatureRow = styled.div<{ $flip?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: clamp(28px, 5vw, 64px);

  /* The mock is second in the DOM so the copy is always read first — by a
     screen reader, and on mobile where the row collapses to one column. On
     flipped rows it is only *placed* first. */
  > *:last-child {
    grid-column: ${({ $flip }) => ($flip ? 1 : 2)};
    grid-row: 1;
  }
  > *:first-child {
    grid-column: ${({ $flip }) => ($flip ? 2 : 1)};
    grid-row: 1;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 22px;

    > *:first-child,
    > *:last-child {
      grid-column: 1;
      grid-row: auto;
    }
  }
`;

export const FeatureCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;

  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
  }
`;

export const FeatureStep = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-family: var(--font);
  font-size: 0.72rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--accent-11);

  &::before {
    content: "";
    width: 22px;
    height: 1px;
    background: color-mix(in srgb, var(--accent) 60%, transparent);
  }

  @media (max-width: 900px) {
    &::before {
      display: none;
    }
  }
`;

/** The concrete capabilities under each feature's paragraph. The headline
 *  says what the feature is for; these say what you actually get. */
export const FeaturePoints = styled.ul`
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
  width: 100%;

  @media (max-width: 900px) {
    max-width: 460px;
    margin-inline: auto;
  }
`;

export const FeaturePoint = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  /* Always left-aligned, even where the surrounding copy centres on mobile —
     a centred ragged list is much harder to scan. */
  text-align: left;
  font-family: var(--font);
  font-size: 0.88rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);

  b {
    color: #ffffff;
    font-weight: var(--font-weight-semi-bold);
  }

  @media (max-width: 420px) {
    font-size: 0.8rem;
  }
`;

export const PointTick = styled.span`
  flex-shrink: 0;
  margin-top: 1px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--accent-11);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
`;

export const Cardheading = styled.h3`
  margin: 0 0 12px;
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.2px;

  @media (max-width: 420px) {
    font-size: 1rem;
    margin-bottom: 3px;
  }
`;

export const CardText = styled.p`
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.66);

  @media (max-width: 420px) {
    font-size: 0.82rem;
    line-height: 1.5;
  }
`;

// ─── Download-as-app band ─────────────────────────────────────────────────────

export const AppSection = styled.section`
  position: relative;
  width: 100%;
  padding: clamp(48px, 8vw, 88px) clamp(20px, 5vw, 48px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 420px) {
    padding: 40px 18px;
  }
`;

export const AppCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(24px, 4vw, 48px);
  max-width: 1000px;
  margin: 0 auto;
  padding: clamp(28px, 4vw, 48px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  background:
    radial-gradient(
      120% 140% at 0% 0%,
      color-mix(in srgb, var(--accent) 20%, transparent) 0%,
      transparent 55%
    ),
    rgba(255, 255, 255, 0.03);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);

  @media (max-width: 720px) {
    flex-direction: column;
    text-align: center;
    gap: 22px;
  }

  @media (max-width: 420px) {
    padding: 24px 20px;
    border-radius: 20px;
  }
`;

export const AppIconTile = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 172px;
  height: 172px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);

  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    border-radius: 18px;
  }

  @media (max-width: 720px) {
    width: 148px;
    height: 148px;
  }

  @media (max-width: 420px) {
    width: 120px;
    height: 120px;
    border-radius: 16px;
  }
`;

export const AppBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;

  @media (max-width: 720px) {
    align-items: center;
  }
`;

export const AppHeading = styled.h2`
  margin: 0;
  font-size: clamp(1.5rem, 3.4vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #ffffff;

  @media (max-width: 420px) {
    font-size: 1.35rem;
  }
`;

export const AppText = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: clamp(0.94rem, 1.5vw, 1.05rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.66);

  @media (max-width: 420px) {
    font-size: 0.9rem;
    line-height: 1.58;
  }
`;

export const AppBenefits = styled.ul`
  list-style: none;
  margin: 4px 0 6px;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;

  @media (max-width: 720px) {
    justify-content: center;
  }
`;

export const AppBenefit = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);

  svg {
    font-size: 1.05rem;
    color: var(--accent);
    flex-shrink: 0;
  }
`;
