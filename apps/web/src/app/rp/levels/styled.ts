import styled, { css, keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-a6); }
  50%       { box-shadow: 0 0 0 10px var(--accent-a2); }
`;

const lineGrow = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;

// ─── Page root ────────────────────────────────────────────────────────────────

export const Root = styled.div`
  max-width: 760px;
  margin-inline: auto;
  margin-block: 60px;
  padding-inline: 20px;
  font-family: var(--font);
  color: var(--text);

  @media screen and (max-width: 800px) {
    margin-block: 20px;
    padding-inline: 14px;
  }
`;

// ─── Header ───────────────────────────────────────────────────────────────────

export const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;

  @media screen and (max-width: 800px) {
    margin-bottom: 28px;
  }
`;

export const HeaderEyebrow = styled.p`
  margin: 0 0 8px 0;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);

  @media screen and (max-width: 800px) {
    margin-bottom: 6px;
  }
`;

export const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.1;
  background: linear-gradient(135deg, var(--text) 30%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media screen and (max-width: 800px) {
    margin-bottom: 6px;
  }
`;

export const HeaderSub = styled.p`
  margin: 0 0 16px 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  max-width: 420px;
  margin-inline: auto;
  line-height: 1.6;

  @media screen and (max-width: 800px) {
    margin-bottom: 12px;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const InfoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--accent) 60%, var(--bg-5));
  background: color-mix(in srgb, var(--accent) 8%, var(--bg-3));
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 800;
  font-style: italic;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  line-height: 1;

  &:hover {
    background: color-mix(in srgb, var(--accent) 18%, var(--bg-3));
    border-color: var(--accent);
  }
`;

export const InviteXPButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 4px;
  margin-bottom: 12px;
  padding: 9px 18px;
  border-radius: 999px;
  border: none;
  background: var(--accent);
  color: var(--accent-fg, var(--text));
  font-size: var(--font-size-small);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 12px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: background 0.15s, box-shadow 0.15s, transform 0.15s;

  &:hover {
    background: var(--accent-hover);
    box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 55%, transparent);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
`;

export const LevelEntry = styled.div`
  display: flex;
  gap: 18px;
  align-items: stretch;
`;

// ─── Connector ────────────────────────────────────────────────────────────────

export const ConnectorArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 42px;
`;

interface BallProps {
  $completed?: boolean;
  $current?: boolean;
  $comingSoon?: boolean;
}

export const LevelBall = styled.div<BallProps>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  z-index: 1;
  transition: background 0.25s ease, border-color 0.25s ease;
  background: var(--bg-3);
  color: var(--text-secondary);
  border: 1.5px solid var(--bg-6);

  ${({ $completed }) =>
    $completed &&
    css`
      background: var(--grass-9);
      color: white;
      border: none;
      font-size: 1.1rem;
    `}

  ${({ $current }) =>
    $current &&
    css`
      background: var(--accent);
      color: var(--bg-1);
      border: none;
      font-size: 1.1rem;
      animation: ${pulse} 2.4s ease-in-out infinite;
    `}

  ${({ $comingSoon, $completed, $current }) =>
    $comingSoon &&
    !$completed &&
    !$current &&
    css`
      background: var(--bg-2);
      color: var(--bg-6);
      border-color: var(--bg-4);
    `}
`;

interface LineProps {
  $filled?: boolean;
}

export const ConnectorLine = styled.div<LineProps>`
  width: 2px;
  flex: 1;
  min-height: 16px;
  border-radius: 1px;
  background: ${({ $filled }) => ($filled ? "var(--grass-9)" : "var(--bg-5)")};
  opacity: ${({ $filled }) => ($filled ? 0.55 : 0.4)};
  margin-block: 4px;
  transform-origin: top center;
  animation: ${lineGrow} 0.4s ease;
`;

// ─── Level card ───────────────────────────────────────────────────────────────

interface CardProps {
  $completed?: boolean;
  $current?: boolean;
  $comingSoon?: boolean;
}

export const LevelCard = styled.div<CardProps>`
  flex: 1;
  min-width: 0;
  border: 1px solid var(--bg-6);
  border-radius: var(--border-radius);
  padding: 16px 20px;
  margin-bottom: 14px;
  position: relative;
  background: var(--bg-2);
  transition: border-color 0.2s ease, background 0.2s ease;

  ${({ $completed }) =>
    $completed &&
    css`
      border-color: var(--grass-6);
      background: color-mix(in srgb, var(--grass-9) 5%, var(--bg-2));
      opacity: 0.6;
    `}

  ${({ $current }) =>
    $current &&
    css`
      border-color: var(--accent-6);
      background: var(--accent-a2);
      box-shadow: 0 0 0 1px var(--accent-a3), 0 6px 24px var(--accent-a2);
    `}

  ${({ $comingSoon }) =>
    $comingSoon &&
    css`
      background: var(--bg-1);
      border-color: var(--bg-4);
      opacity: 0.5;
    `}
`;

// ─── Card header ──────────────────────────────────────────────────────────────

export const LevelCardHead = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
`;

interface LevelNumberProps {
  $completed?: boolean;
}

export const LevelNumber = styled.span<LevelNumberProps>`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ $completed }) => ($completed ? "var(--grass-9)" : "var(--accent)")};
`;

export const LevelTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const XPRange = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  margin-left: auto;

  @media screen and (max-width: 500px) {
    margin-left: 0;
    width: 100%;
  }
`;

// ─── Progress ─────────────────────────────────────────────────────────────────

export const XPToNext = styled.p`
  margin: 6px 0 8px 0;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
`;

export const ProgressBar = styled.div`
  height: 3px;
  background: var(--bg-5);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.6s ease;
  box-shadow: 0 0 6px var(--accent-a7), 0 0 2px var(--accent-a9);
`;

// ─── Perks ────────────────────────────────────────────────────────────────────

export const PerkList = styled.ul`
  list-style: none;
  margin: 10px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface PerkItemProps {
  $locked?: boolean;
}

export const PerkItem = styled.li<PerkItemProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: ${({ $locked }) => ($locked ? 0.45 : 1)};
`;

export const PerkIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
  line-height: 1;
`;

export const PerkLabel = styled.span`
  font-size: var(--font-size-small);
  color: var(--text);
`;

export const PerkLockIcon = styled.span`
  font-size: var(--font-size-xxxsmall);
  color: var(--text-secondary);
  margin-left: auto;
  opacity: 0.5;
`;

// ─── Coming soon (levels 5+) ──────────────────────────────────────────────────

export const ComingSoonBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: var(--font-size-xxxsmall);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bg-4);
  color: var(--bg-8);
`;

export const ComingSoonBody = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--bg-2);
  border-radius: calc(var(--border-radius) - 2px);
`;

export const ComingSoonIcon = styled.span`
  color: var(--bg-6);
  font-size: var(--font-size-small);
  flex-shrink: 0;
`;

export const ComingSoonText = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--bg-7);
  font-style: italic;
`;

// ─── Beyond level 10 ──────────────────────────────────────────────────────────

export const BeyondSection = styled.div`
  position: relative;
`;

interface BeyondEntryProps {
  $depth: number;
}

export const BeyondEntry = styled.div<BeyondEntryProps>`
  display: flex;
  gap: 18px;
  align-items: stretch;
  opacity: ${({ $depth }) => Math.max(0.06, 0.65 - $depth * 0.27)};
  filter: blur(${({ $depth }) => $depth * 1.4}px);
  pointer-events: none;
  user-select: none;
`;

export const BeyondBall = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-2);
  color: var(--bg-6);
  border: 1.5px solid var(--bg-4);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  font-style: italic;
`;

export const BeyondCard = styled.div`
  flex: 1;
  min-width: 0;
  border: 1px solid var(--bg-4);
  border-radius: var(--border-radius);
  padding: 14px 18px;
  margin-bottom: 14px;
  background: var(--bg-1);
`;

export const BeyondLevelNumber = styled.span`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bg-7);
`;

export const BeyondTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--bg-6);
  letter-spacing: 0.1em;
`;

export const BeyondFadeOverlay = styled.div`
  position: absolute;
  bottom: 44px;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(to bottom, transparent, var(--bg-1));
  pointer-events: none;
  z-index: 2;
`;

export const BeyondFooter = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  padding-top: 8px;
  padding-bottom: 40px;
  font-size: var(--font-size-small);
  color: var(--bg-7);
  font-style: italic;
  letter-spacing: 0.06em;
`;
