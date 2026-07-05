import { Container } from "@novelist-world/ui";
import styled, { css, keyframes } from "styled-components";
import { setOpacity } from "@/utils/helpers";

/* ────────────────────────────────────────────────────────────────────────────
   Novelist World — landing / hero page
   Immersive, cinematic dark layout. Text content is constrained to a readable
   column while the carousels stay full-bleed. Accent pops use the theme-aware
   `--accent` variable so the page adapts to the user's chosen palette.
   Baseline responsive target: iPhone SE (375 × 667).
   ──────────────────────────────────────────────────────────────────────────── */

const WALLPAPER =
  "https://rp-webapp-ui.s3.eu-central-1.amazonaws.com/deployments/NW-Wallpaper.png";

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

  /* Wallpaper layer + cinematic overlay that fades into the page background */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -2;
    background-image:
      linear-gradient(
        180deg,
        rgba(8, 9, 12, 0.45) 0%,
        rgba(8, 9, 12, 0.55) 45%,
        rgba(8, 9, 12, 0.92) 88%,
        #08090c 100%
      ),
      url(${WALLPAPER});
    background-size: cover;
    background-position: center 30%;
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

export const HeroInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(18px, 3vw, 28px);
  max-width: 860px;
  width: 100%;

  > * {
    animation: ${floatUp} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  > *:nth-child(2) { animation-delay: 0.06s; }
  > *:nth-child(3) { animation-delay: 0.12s; }
  > *:nth-child(4) { animation-delay: 0.18s; }
  > *:nth-child(5) { animation-delay: 0.24s; }
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

  @media (max-width: 420px) {
    font-size: 0.62rem;
    letter-spacing: 1.8px;
    padding: 6px 13px;
  }
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.35rem, 7.5vw, 4.6rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -1.5px;
  color: #ffffff;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.55);
`;

export const HeroTitleAccent = styled.span`
  display: inline-block;
  background-image: linear-gradient(
    100deg,
    var(--accent) 0%,
    #ffffff 92%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

export const HeroText = styled.p`
  margin: 0;
  max-width: 600px;
  font-size: clamp(1rem, 1.6vw, 1.18rem);
  line-height: 1.7;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.74);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
`;

export const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 6px;

  @media (max-width: 420px) {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
`;

// ─── Buttons ────────────────────────────────────────────────────────────────

const ButtonBase = styled.button`
  appearance: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 15px 28px;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  border-radius: 4px;
  /* Clipped top-right / bottom-left corners for the angular brand feel */
  clip-path: polygon(
    10px 0,
    100% 0,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    0 100%,
    0 10px
  );
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    color 0.18s ease, border-color 0.18s ease;

  svg {
    font-size: 1.05em;
    transition: transform 0.2s ease;
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  @media (max-width: 420px) {
    width: 100%;
    padding: 15px 24px;
  }
`;

export const PrimaryButton = styled(ButtonBase)`
  border: none;
  color: #08090c;
  background: var(--accent);
  box-shadow: 0 10px 28px -10px var(--accent), 0 0 0 1px rgba(255, 255, 255, 0.06) inset;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 38px -12px var(--accent);
    filter: brightness(1.08);
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

export const GhostButton = styled(ButtonBase)`
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.4);
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
`;

export const SectionSubtitle = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 1.5vw, 1.08rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.62);
  max-width: 560px;
`;

// ─── Muse carousels ───────────────────────────────────────────────────────────

export const MuseCarouselContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  overflow: hidden;

  /* Fade the marquee edges so cards enter/exit gracefully */
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    #000 6%,
    #000 94%,
    transparent
  );
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 6%,
    #000 94%,
    transparent
  );

  @media (max-width: 640px) {
    -webkit-mask-image: none;
    mask-image: none;
  }
`;

// ─── Feature cards ────────────────────────────────────────────────────────────

export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding-inline: clamp(20px, 5vw, 48px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 460px;
    gap: 18px;
  }
`;

export const InfoCard = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
  border-radius: 18px !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }: any) =>
    setOpacity(theme.navbar, 0.28)} !important;
  padding: 34px 26px !important;
  cursor: default !important;
  text-align: center;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${setOpacity("#ffffff", 0.22)};
  }

  @-moz-document url-prefix() {
    backdrop-filter: none !important;
  }
`;

export const CardIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 18px;
  border-radius: 14px;
  color: var(--accent);
  background: ${setOpacity("#ffffff", 0.06)};
  border: 1px solid ${setOpacity("#ffffff", 0.1)};

  svg {
    font-size: 1.55rem;
  }
`;

export const Cardheading = styled.h3`
  margin: 0 0 8px;
  font-size: 1.22rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.2px;
`;

export const CardText = styled.p`
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.66);
`;

// ─── Download-as-app band ─────────────────────────────────────────────────────

export const AppSection = styled.section`
  position: relative;
  width: 100%;
  padding: clamp(48px, 8vw, 88px) clamp(20px, 5vw, 48px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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
  }
`;

export const AppIconTile = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(256px, 18vw, 172px);
  height: clamp(256px, 18vw, 172px);
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
`;

export const AppText = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: clamp(0.94rem, 1.5vw, 1.05rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.66);
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

// ─── Loading shimmers ─────────────────────────────────────────────────────────
// Placeholder cards shown in the novelist / muse rows until their data arrives,
// so the page renders instantly instead of blocking on the fetches. Dimensions
// mirror the real cards (novelist ~220px tall coverflow slides; muse "hero"
// cards 160×300, shrinking to 100×180 in the content container).

const shimmerMove = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const shimmerSurface = css`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.5s ease-in-out infinite;
`;

export const NovelistShimmerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(14px, 3vw, 34px);
  padding-block: 30px;
  overflow: hidden;
`;

export const NovelistShimmerCard = styled.div`
  flex-shrink: 0;
  width: min(360px, 80vw);
  height: 220px;
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.06);
  ${shimmerSurface}

  /* Side cards echo the coverflow scale + fade of the real carousel */
  &.side {
    opacity: 0.4;
    transform: scale(0.78);
  }

  @media (max-width: 900px) {
    height: 190px;
  }

  @media (max-width: 640px) {
    height: 150px;

    &.side {
      display: none;
    }
  }
`;

export const MuseShimmerRow = styled.div`
  display: flex;
  gap: clamp(10px, 2vw, 18px);
`;

export const MuseShimmerCard = styled.div`
  flex-shrink: 0;
  width: 160px;
  height: 300px;
  border-radius: calc(var(--border-radius) + 2px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  ${shimmerSurface}

  @container content-container (max-width: 1000px) {
    width: 100px;
    height: 180px;
  }
`;
