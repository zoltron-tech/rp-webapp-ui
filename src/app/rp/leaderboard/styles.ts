import styled, { keyframes } from "styled-components";
import { spin } from "@/theme/animations";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Page shell ───────────────────────────────────────────────────────────────

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
  padding: 24px 16px 100px;
  box-sizing: border-box;
  animation: ${fadeUp} 0.3s ease both;

  @media (max-width: 800px) {
    padding: 14px 12px 100px;
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 640px;

  @media (max-width: 800px) {
    margin-bottom: 12px;
    gap: 2px;
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 10px;
  transition: color 0.15s;

  &:hover {
    color: var(--text);
  }

  @media (max-width: 800px) {
    margin-bottom: 6px;
  }
`;

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 0.62rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.85;

  @media (max-width: 800px) {
    display: none;
  }
`;

export const Title = styled.h1`
  margin: 4px 0 0;
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;

  @media (max-width: 800px) {
    font-size: 1.05rem;
    margin-top: 0;
  }
`;

export const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.6;

  @media (max-width: 800px) {
    display: none;
  }
`;

export const InviteXPButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
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

// ─── List ─────────────────────────────────────────────────────────────────────

export const TopThreeGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  /* gradient inner bg + gradient outer border via background-clip */
  border: 1.5px solid transparent;
  background:
    linear-gradient(
        160deg,
        color-mix(in srgb, #f5c842 13%, var(--bg-2)) 0%,
        color-mix(in srgb, #b8ccd4 9%, var(--bg-2)) 50%,
        color-mix(in srgb, #c4855a 11%, var(--bg-2)) 100%
      )
      padding-box,
    linear-gradient(180deg, #e8b800 0%, #9ab0bc 48%, #b5734a 100%) border-box;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  border-radius: 8px;
  border: 1px solid var(--bg-4);
  overflow: hidden;
  background: var(--bg-2);
`;

// medal accent colors shared between Row and RankBadge
const MEDAL = {
  1: { bg: "#f5c842", border: "#e8b800", divider: "rgba(232,184,0,0.22)" },
  2: { bg: "#b8ccd4", border: "#9ab0bc", divider: "rgba(154,176,188,0.22)" },
  3: { bg: "#c4855a", border: "#b5734a", divider: "rgba(181,115,74,0.22)" },
} as const;

function medalBorderColor(rank: number): string {
  if (rank === 1) return MEDAL[1].border;
  if (rank === 2) return MEDAL[2].border;
  if (rank === 3) return MEDAL[3].border;
  return "transparent";
}
function medalBg(rank: number): string {
  if (rank === 1) return `color-mix(in srgb, ${MEDAL[1].bg} 11%, var(--bg-2))`;
  if (rank === 2) return `color-mix(in srgb, ${MEDAL[2].bg} 9%, var(--bg-2))`;
  if (rank === 3) return `color-mix(in srgb, ${MEDAL[3].bg} 10%, var(--bg-2))`;
  return "var(--bg-2)";
}
function medalHoverBg(rank: number): string {
  if (rank === 1) return `color-mix(in srgb, ${MEDAL[1].bg} 17%, var(--bg-3))`;
  if (rank === 2) return `color-mix(in srgb, ${MEDAL[2].bg} 14%, var(--bg-3))`;
  if (rank === 3) return `color-mix(in srgb, ${MEDAL[3].bg} 15%, var(--bg-3))`;
  return "var(--bg-3)";
}
function medalDivider(rank: number): string {
  if (rank === 1) return MEDAL[1].divider;
  if (rank === 2) return MEDAL[2].divider;
  if (rank === 3) return MEDAL[3].divider;
  return "var(--bg-4)";
}

export const Row = styled.div<{
  $rank?: number;
  $isSelf?: boolean;
  $accent?: string | null;
  $inGroup?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;

  border-left: 3px solid
    ${({ $inGroup, $isSelf, $accent, $rank }) => {
      if ($inGroup) return "transparent";
      if ($isSelf) return "var(--accent)";
      if ($accent) return $accent;
      if ($rank && $rank <= 3) return medalBorderColor($rank);
      return "transparent";
    }};

  background: ${({ $inGroup, $isSelf, $accent, $rank }) => {
    if ($inGroup) return "transparent";
    if ($isSelf) return "color-mix(in srgb, var(--accent) 10%, var(--bg-2))";
    if ($accent) return `color-mix(in srgb, ${$accent} 10%, var(--bg-2))`;
    if ($rank && $rank <= 3) return medalBg($rank);
    return "var(--bg-2)";
  }};

  border-bottom: 1px solid
    ${({ $inGroup, $isSelf, $accent, $rank }) => {
      if ($inGroup && $rank && $rank <= 3) return medalDivider($rank);
      if ($inGroup) return "color-mix(in srgb, var(--bg-5) 30%, transparent)";
      if ($isSelf) return "color-mix(in srgb, var(--accent) 28%, var(--bg-4))";
      if ($accent) return `color-mix(in srgb, ${$accent} 22%, var(--bg-4))`;
      if ($rank && $rank <= 3) return medalDivider($rank);
      return "var(--bg-4)";
    }};

  cursor: pointer;
  transition: background 0.12s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ $inGroup, $isSelf, $accent, $rank }) => {
      if ($inGroup) return "color-mix(in srgb, var(--bg-5) 20%, transparent)";
      if ($isSelf) return "color-mix(in srgb, var(--accent) 16%, var(--bg-3))";
      if ($accent) return `color-mix(in srgb, ${$accent} 16%, var(--bg-3))`;
      if ($rank && $rank <= 3) return medalHoverBg($rank);
      return "var(--bg-3)";
    }};
  }

  .avatar {
    width: 64px;
    height: 64px;
  }

  @media (max-width: 800px) {
    .avatar {
      width: 42px;
      height: 42px;
    }
  }
`;

export const RankBadge = styled.span<{ $rank: number }>`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: ${({ $rank }) =>
    $rank === 1
      ? "linear-gradient(135deg, #f5c842 0%, #e09a00 100%)"
      : $rank === 2
        ? "linear-gradient(135deg, #c8d4dc 0%, #8fa3b1 100%)"
        : $rank === 3
          ? "linear-gradient(135deg, #d4956a 0%, #a0572a 100%)"
          : "var(--bg-4)"};
  color: ${({ $rank }) => ($rank <= 3 ? "#1a1a1a" : "var(--text-secondary)")};
  box-shadow: ${({ $rank }) =>
    $rank === 1
      ? "0 0 12px rgba(240,184,0,0.55)"
      : $rank === 2
        ? "0 0 10px rgba(180,200,212,0.45)"
        : $rank === 3
          ? "0 0 10px rgba(196,133,90,0.45)"
          : "none"};
`;

// Podium slot that holds the detailed trophy graphic for the top three ranks.
export const RankTrophyBadge = styled.span<{ $big?: boolean }>`
  flex-shrink: 0;
  width: ${({ $big }) => ($big ? 42 : 30)}px;
  height: ${({ $big }) => ($big ? 42 : 30)}px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
`;

export const AvatarWrapper = styled.div<{ $size?: number }>`
  flex-shrink: 0;
  width: ${({ $size }) => $size ?? 40}px;
  height: ${({ $size }) => $size ?? 40}px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round(($size ?? 40) * 0.42)}px;
  color: var(--text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const RowBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const RowName = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RowSub = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`;

export const LevelChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--accent) 38%, var(--bg-5));
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const ScoreChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 6px;
  border-radius: 999px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
`;

export const FandomChip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  background: ${({ $color }) => $color};
  padding: 2px 7px 2px 5px;
  border-radius: 3px;
  white-space: nowrap;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }
`;

export const YouBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--accent);
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--bg-1);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
`;

// ─── Own rank sticky footer ────────────────────────────────────────────────────

export const StickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 10px 16px 16px;
  background: linear-gradient(to top, var(--bg-1) 60%, transparent 100%);
  pointer-events: none;
`;

export const OwnRankCard = styled.div`
  width: 100%;
  max-width: 640px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 10%, var(--bg-2));
  border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--bg-5));
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent);
  pointer-events: auto;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--accent) 16%, var(--bg-3));
  }

  .avatar {
    width: 36px;
    height: 36px;
  }
`;

export const OwnRankLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.8;
  margin-bottom: 1px;
`;

// ─── States ───────────────────────────────────────────────────────────────────

export const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-5);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  margin: 40px auto;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 24px;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  text-align: center;
`;

export const ErrorText = styled.p`
  color: var(--tomato-a9);
  font-size: var(--font-size-small);
  text-align: center;
  margin: 0;
`;

export const LoadMoreWrap = styled.div`
  width: 100%;
  max-width: 640px;
  margin-top: 8px;
`;
