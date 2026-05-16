import styled, { keyframes } from "styled-components";

// ─── Keyframes ────────────────────────────────────────────────────────────────

/** Spins the conic-gradient pseudo so the border looks like confetti ribbon */
const spinBorder = keyframes`
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

/** Entrance pop for festive emoji row */
const popIn = keyframes`
  0%   { transform: scale(0.3) rotate(-15deg); opacity: 0; }
  65%  { transform: scale(1.18) rotate(5deg);  opacity: 1; }
  100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
`;

/** Gentle idle bob for emoji items */
const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
`;

/** Fade + slide-up entrance for the card content */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/** Logo badge scale-in on mount */
const logoPop = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
`;

/** Twinkle for the sparkle dots near the card corners */
const twinkle = keyframes`
  0%, 100% { opacity: 0.15; transform: scale(0.7) rotate(0deg); }
  50%       { opacity: 0.85; transform: scale(1.2) rotate(30deg); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

export const Root = styled.div`
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px 64px;
  box-sizing: border-box;

  @media (max-width: 800px) {
    padding: 24px 12px 48px;
  }
`;

/**
 * Spinning rainbow-confetti border wrapper.
 * overflow:hidden clips the oversized rotating pseudo.
 */
export const CardBorderWrap = styled.div`
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  width: 100%;
  max-width: 560px;
  padding: 2px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.18);

  /* The spinning conic confetti gradient */
  &::before {
    content: "";
    position: absolute;
    width: 700px;
    height: 700px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    background: conic-gradient(
      var(--accent) 0deg,
      #f6c90e 70deg,
      #ff6eb4 140deg,
      #3ecfcf 210deg,
      #a78bfa 280deg,
      var(--accent) 360deg
    );
    animation: ${spinBorder} 8s linear infinite;
    pointer-events: none;
  }

  @media (max-width: 800px) {
    border-radius: 18px;
  }
`;

export const Card = styled.section`
  position: relative;
  z-index: 1;
  background: var(--bg-2);
  border-radius: 20px;
  padding: 36px 32px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  animation: ${fadeUp} 0.45s ease both 0.05s;

  @media (max-width: 800px) {
    padding: 26px 18px 22px;
    gap: 14px;
    border-radius: 16px;
  }
`;

// ─── Branding ─────────────────────────────────────────────────────────────────

export const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 4px;
`;

export const LogoImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: contain;
  flex-shrink: 0;
  animation: ${logoPop} 0.55s cubic-bezier(0.2, 1.2, 0.4, 1) both 0.1s;

  @media (max-width: 800px) {
    width: 38px;
    height: 38px;
    border-radius: 8px;
  }
`;

export const BrandName = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1;
  user-select: none;
`;

export const BrandNamePrimary = styled.span`
  font-size: 20px;
  font-weight: 400;
  color: var(--text);

  @media (max-width: 800px) {
    font-size: 17px;
  }
`;

export const BrandNameAccent = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-8, var(--accent));

  @media (max-width: 800px) {
    font-size: 19px;
  }
`;

// ─── Festive decorations ──────────────────────────────────────────────────────

export const FestiveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 36px;
  line-height: 1;

  /* Staggered bounce per child */
  > span {
    display: inline-block;
    animation: ${popIn} 0.55s cubic-bezier(0.2, 1.2, 0.4, 1) both,
      ${floatY} 3.4s ease-in-out infinite;
  }

  > span:nth-child(1) { animation-delay: 0.05s, 0.6s; }
  > span:nth-child(2) { animation-delay: 0.15s, 0.9s; font-size: 28px; }
  > span:nth-child(3) { animation-delay: 0.10s, 0.75s; }
  > span:nth-child(4) { animation-delay: 0.20s, 1.05s; font-size: 28px; }
  > span:nth-child(5) { animation-delay: 0.06s, 0.65s; }

  @media (max-width: 800px) {
    font-size: 30px;
    gap: 4px;

    > span:nth-child(2),
    > span:nth-child(4) { font-size: 22px; }
  }
`;

// ─── Content ──────────────────────────────────────────────────────────────────

export const Title = styled.h1`
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;

  @media (max-width: 800px) {
    font-size: var(--font-size-h3);
  }
`;

export const Highlight = styled.span`
  color: var(--accent);
  font-weight: var(--font-weight-bold);
`;

export const Divider = styled.hr`
  width: 48px;
  height: 2px;
  border: none;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  margin: 2px auto;
  border-radius: 9999px;
  opacity: 0.6;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Paragraph = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size);
  line-height: 1.55;

  strong {
    color: var(--text);
    font-weight: var(--font-weight-bold);
  }

  @media (max-width: 800px) {
    font-size: var(--font-size-small);
  }
`;

export const Accented = styled.strong`
  color: var(--accent) !important;
  font-weight: var(--font-weight-bold);
`;

// ─── Actions ──────────────────────────────────────────────────────────────────

export const Actions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28), 0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent); }
  50%       { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.32), 0 0 0 6px color-mix(in srgb, var(--accent) 0%, transparent); }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  padding: 15px 20px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 80%, #fff 20%) 0%,
    var(--accent) 50%,
    color-mix(in srgb, var(--accent) 85%, #000 15%) 100%
  );
  color: #fff;
  font-size: calc(var(--font-size) * 1.05);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28),
    0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent);
  transition: filter 0.18s, transform 0.08s, box-shadow 0.22s;
  animation: ${pulseGlow} 3s ease-in-out infinite 1.5s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35),
      0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent);
    animation: none;
  }

  &:active {
    transform: translateY(1px);
    filter: brightness(0.97);
  }

  &:disabled {
    cursor: progress;
    opacity: 0.65;
    filter: none;
    transform: none;
    animation: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  }
`;

export const SkipButton = styled.button`
  background: none;
  border: none;
  padding: 6px 4px;
  color: var(--accent-hover, var(--accent));
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    cursor: progress;
    opacity: 0.4;
  }
`;

export const SkipHint = styled.p`
  margin: 4px 0 0;
  text-align: center;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
`;
