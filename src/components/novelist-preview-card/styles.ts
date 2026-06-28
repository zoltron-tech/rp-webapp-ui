import { css, styled } from "styled-components";
import * as Common from "@/components/common";
import { CARD_BORDER, Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

// ─── Rank tier colours ────────────────────────────────────────────────────────

// Multi-stop gradients that simulate a metallic sheen: dark → bright → mid → bright → dark
const RANK_METALLIC_GRADIENT: Record<1 | 2 | 3, string> = {
  1: "linear-gradient(135deg, #6B4506 0%, #F2CC50 22%, #C89010 42%, #FAE070 58%, #C89010 75%, #7A5008 100%)",
  2: "linear-gradient(135deg, #323E4A 0%, #C4D4E4 22%, #6A8AA0 42%, #D0E0EE 58%, #6A8AA0 75%, #38485A 100%)",
  3: "linear-gradient(135deg, #461E0A 0%, #CB7840 22%, #8C3E1A 42%, #D88E50 58%, #8C3E1A 75%, #4E2410 100%)",
};

const RANK_GLOW: Record<1 | 2 | 3, string> = {
  1: "rgba(200, 144, 16, 0.55)",
  2: "rgba(106, 138, 160, 0.55)",
  3: "rgba(140, 62, 26, 0.55)",
};

const RANK_STRIP_BG: Record<1 | 2 | 3, string> = {
  1: "linear-gradient(150deg, rgba(220,168,28,0.52) 0%, rgba(180,118,8,0.24) 60%, rgba(140,80,4,0.10) 100%)",
  2: "linear-gradient(150deg, rgba(144,172,200,0.50) 0%, rgba(96,128,160,0.22) 60%, rgba(64,96,128,0.08) 100%)",
  3: "linear-gradient(150deg, rgba(200,108,44,0.52) 0%, rgba(152,72,18,0.24) 60%, rgba(112,50,8,0.10) 100%)",
};

const RANK_TAG_BG: Record<1 | 2 | 3, string> = {
  1: "rgba(12, 7, 0, 0.84)",
  2: "rgba(6, 11, 18, 0.84)",
  3: "rgba(12, 6, 0, 0.84)",
};

const RANK_TAG_BORDER: Record<1 | 2 | 3, string> = {
  1: "rgba(210, 155, 22, 0.72)",
  2: "rgba(122, 154, 184, 0.72)",
  3: "rgba(172, 96, 38, 0.72)",
};

const RANK_TAG_COLOR: Record<1 | 2 | 3, string> = {
  1: "#DDB024",
  2: "#90B0CC",
  3: "#C27434",
};

const RANK_EMOJI: Record<1 | 2 | 3, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const RANK_ORDINAL: Record<1 | 2 | 3, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

// ─── Rank frame (gradient-border wrapper) ────────────────────────────────────

export const RankFrame = styled.div<{ $rank: 1 | 2 | 3 }>`
  width: 220px;
  min-width: 220px;
  box-sizing: border-box;
  padding: 2px;
  border-radius: 14px;
  background: ${({ $rank }) => RANK_METALLIC_GRADIENT[$rank]};
  box-shadow: 0 4px 24px ${({ $rank }) => RANK_GLOW[$rank]};
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 38px ${({ $rank }) => RANK_GLOW[$rank]};
  }

  @media (max-width: 600px) {
    width: 155px;
    min-width: 155px;

    &:hover {
      transform: none;
      box-shadow: 0 4px 24px ${({ $rank }) => RANK_GLOW[$rank]};
    }
  }
`;

// ─── Card shell ──────────────────────────────────────────────────────────────

export const CardWrapper = styled.div<{ $rank?: 1 | 2 | 3 }>`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-2);
  z-index: ${Z_INDEX.CARD};

  ${({ $rank }) =>
    $rank
      ? css`
          width: 100%;
          min-width: 0;
        `
      : css`
          width: 220px;
          min-width: 220px;
          ${CARD_BORDER}
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          }
          @media (max-width: 600px) {
            width: 155px;
            min-width: 155px;
            &:hover {
              transform: none;
              box-shadow: none;
            }
          }
        `}
`;

// ─── Rank pill tag ────────────────────────────────────────────────────────────

export const RankTag = styled.div<{ $rank: 1 | 2 | 3 }>`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px 4px 6px;
  border-radius: 24px;
  background: ${({ $rank }) => RANK_TAG_BG[$rank]};
  border: 1px solid ${({ $rank }) => RANK_TAG_BORDER[$rank]};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export const RankTagEmoji = styled.span`
  font-size: 14px;
  line-height: 1;
  display: block;
`;

export const RankTagText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

export const RankTagOrdinal = styled.span<{ $rank: 1 | 2 | 3 }>`
  font-size: 11px;
  font-weight: 800;
  color: ${({ $rank }) => RANK_TAG_COLOR[$rank]};
  line-height: 1.2;
  letter-spacing: 0.3px;
  font-family: var(--font);
`;

export const RankTagSub = styled.span`
  font-size: 8px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  line-height: 1;
  font-family: var(--font);
`;

// ─── Decorative accent strip at the top ──────────────────────────────────────

export const AccentStrip = styled.div<{ $rank?: 1 | 2 | 3 }>`
  width: 100%;
  height: ${({ $rank }) => ($rank ? "64px" : "56px")};
  background: ${({ $rank }) =>
    $rank
      ? RANK_STRIP_BG[$rank]
      : "linear-gradient(135deg, var(--accent-a4) 0%, var(--accent-a2) 100%)"};
  flex-shrink: 0;

  @media (max-width: 600px) {
    height: ${({ $rank }) => ($rank ? "48px" : "40px")};
  }
`;

// ─── Exported rank helpers (used in index.tsx) ────────────────────────────────

export { RANK_EMOJI, RANK_ORDINAL };

// ─── Body (everything below the strip) ───────────────────────────────────────

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 14px 14px;
  gap: 8px;
  /* fixed height so the button is always at the bottom */
  min-height: 190px;
  justify-content: space-between;

  @media (max-width: 600px) {
    padding: 0 10px 10px;
    gap: 6px;
    min-height: 148px;
  }
`;

// ─── Avatar wrapper (pulled up over the strip) ───────────────────────────────

export const AvatarWrapper = styled.div`
  position: relative;
  margin-top: -30px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    margin-top: -22px;
  }
`;

export const StyledAvatar = styled(AvatarNew)`
  width: 64px !important;
  height: 64px !important;
  box-shadow: 0 0 0 2px var(--bg-2), 0 2px 12px rgba(0, 0, 0, 0.4);

  .avatar-image,
  .avatar-fallback {
    width: 64px;
    height: 64px;
  }

  @media (max-width: 600px) {
    width: 48px !important;
    height: 48px !important;

    .avatar-image,
    .avatar-fallback {
      width: 48px;
      height: 48px;
    }
  }
`;

export const VerifiedBadgeWrapper = styled.span`
  position: absolute;
  bottom: -2px;
  right: -4px;
  display: flex;
  background-color: var(--bg-2);
  border-radius: 50%;
  padding: 1px;
`;

// ─── Name / username ─────────────────────────────────────────────────────────

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  text-align: center;
`;

export const Title = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 600px) {
    font-size: var(--font-size-small);
  }
`;

export const UsernameStyled = styled(Common.Username)`
  font-size: var(--font-size-small) !important;
  opacity: 0.7;

  @media (max-width: 600px) {
    font-size: var(--font-size-xsmall) !important;
  }
`;

export const MutualCount = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  opacity: 0.8;

  @media (max-width: 600px) {
    font-size: 10px;
  }
`;

// ─── Muses strip ─────────────────────────────────────────────────────────────

export const MusesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  /* overlapping avatars */
  & > * + * {
    margin-left: -8px;
  }

  @media (max-width: 600px) {
    min-height: 20px;
  }
`;

export const MuseAvatar = styled(AvatarNew)`
  width: 26px !important;
  height: 26px !important;
  border: 1.5px solid var(--bg-2);
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;

  .avatar-image,
  .avatar-fallback {
    width: 26px;
    height: 26px;
    font-size: 10px;
  }

  &:hover {
    z-index: 1;
    transform: scale(1.15);
    transition: transform 0.15s ease;
  }

  @media (max-width: 600px) {
    width: 20px !important;
    height: 20px !important;

    .avatar-image,
    .avatar-fallback {
      width: 20px;
      height: 20px;
    }
  }
`;

export const MuseOverflow = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: var(--bg-4);
  border: 1.5px solid var(--bg-2);
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 20px;
    height: 20px;
    font-size: 8px;
  }
`;

// ─── Button container ─────────────────────────────────────────────────────────

export const ButtonContainer = styled.div`
  display: flex;
  gap: 6px;
  width: 100%;
  justify-content: center;
  margin-top: 2px;

  .button.messaging {
    background-color: var(--accent-hover);
    cursor: wait;
    pointer-events: none;
  }

  /* shrink font on very small cards */
  @media (max-width: 600px) {
    .button {
      font-size: var(--font-size-xsmall) !important;
      padding: 7px 8px !important;
    }
  }
`;
