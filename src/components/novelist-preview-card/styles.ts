import { css, styled } from "styled-components";
import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

// ─── Card shell ──────────────────────────────────────────────────────────────

export const CardWrapper = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
  border: 1px solid var(--bg-4);
  z-index: ${Z_INDEX.CARD};
  width: 240px;
  min-width: 240px;
  min-height: 344px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  }
  @media (max-width: 600px) {
    width: 160px;
    min-width: 160px;
    min-height: 248px;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

// ─── Banner (uploaded image when set, gradient fallback otherwise) ──────────
// aspect-ratio (not a fixed height) keeps the 5:2 crop correct at every card
// width (240px desktop / 160px mobile) instead of only at one breakpoint.

interface BannerProps {
  $src?: string | null;
  $x?: number;
  $y?: number;
  $scale?: number;
}

export const Banner = styled.div<BannerProps>`
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 2;
  flex-shrink: 0;
  /* No banner image: flat palette accent, no gradient/shadow overlays. */
  background: ${({ $src }) => ($src ? "var(--bg-4)" : "var(--accent-6)")};
  background-image: ${({ $src }) => ($src ? `url(${$src})` : "none")};
  background-repeat: no-repeat;
  background-size: ${({ $scale }) =>
    $scale != null ? `${$scale * 100}% auto` : "cover"};
  background-position: ${({ $x, $y, $scale }) =>
    $scale != null ? `${$x ?? 50}% ${$y ?? 50}%` : "center"};
`;

// ─── Badges (stacked in the banner's top-right corner) ───────────────────────

/**
 * The badge column sits over the banner rather than under the username: the
 * card's centre column is already name, handle and stats, and the banner's
 * right side is the only space on a 160px card that is reliably empty.
 *
 * A banner is an arbitrary uploaded photo, so the crests get their own scrim —
 * without it a pale banner swallows the blurple.
 */
export const BadgeCorner = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  padding: 5px 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(3px);
  /* The strip lays itself out; this only positions and shades it. */
  display: flex;

  /* The mobile banner is 64px tall (a 160px card at 5:2), and a full column is
     two crests plus a "+N". These numbers are picked so that stack lands on
     the banner's bottom edge rather than hanging over the body:
     4 top + 3 pad + 3×16 + 2×3 gap + 3 pad = 64. Change one, redo the sum.

     The crests are sized from a numeric prop, so this is an override rather
     than a second prop — this is the only place their size has to follow the
     viewport. The child selector below catches every item the strip lays out,
     crest frames and the "+N" pill alike, so the column keeps one width. */
  @media (max-width: 600px) {
    top: 4px;
    right: 5px;
    padding: 3px;

    > span {
      gap: 3px;
    }

    > span > span {
      width: 16px;
      min-width: 16px;
      height: 16px;
    }
  }
`;

// ─── Body (everything below the banner) ──────────────────────────────────────

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px 16px;
  gap: 9px;
  flex: 1;

  @media (max-width: 600px) {
    padding: 0 10px 10px;
    gap: 6px;
  }
`;

// ─── Avatar wrapper (pulled up over the banner) ──────────────────────────────

export const AvatarWrapper = styled.div`
  position: relative;
  margin-top: -38px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    margin-top: -26px;
  }
`;

export const StyledAvatar = styled(AvatarNew)`
  width: 74px !important;
  height: 74px !important;
  box-shadow:
    0 0 0 3px var(--bg-2),
    0 0 0 5px var(--accent-a6),
    0 6px 16px rgba(0, 0, 0, 0.5);

  .avatar-image,
  .avatar-fallback {
    width: 74px;
    height: 74px;
  }

  @media (max-width: 600px) {
    width: 52px !important;
    height: 52px !important;

    .avatar-image,
    .avatar-fallback {
      width: 52px;
      height: 52px;
    }
  }
`;

export const VerifiedBadgeWrapper = styled.span`
  position: absolute;
  bottom: 0;
  right: -4px;
  display: flex;
  background-color: var(--bg-2);
  border-radius: 50%;
  padding: 2px;
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
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  color: var(--text);
  line-height: 1.25;
  /* Keeps the row's height even when firstName/lastName are missing —
     otherwise a blank name collapses the line and shifts everything below. */
  min-height: 1.25em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 600px) {
    font-size: var(--font-size);
  }
`;

export const UsernameStyled = styled(Common.Username)`
  font-size: var(--font-size-small) !important;
  color: var(--accent-11) !important;
  opacity: 0.85;

  @media (max-width: 600px) {
    font-size: var(--font-size-xsmall) !important;
  }
`;

// ─── Stats row (muses count + mutual friends, spelled out) ──────────────────

export const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 16px;
  margin-top: 3px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  @media (max-width: 600px) {
    gap: 7px;
    min-height: 13px;
    font-size: 10px;
  }
`;

export const Stat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;

  b {
    color: var(--text);
    font-weight: var(--font-weight-bold);
  }

  svg {
    width: 13px;
    height: 13px;
    color: var(--text-secondary);
    opacity: 0.8;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    svg {
      width: 11px;
      height: 11px;
    }
  }
`;

export const StatSep = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--bg-7);
  flex-shrink: 0;
`;

// ─── Muses block (bordered section, bigger overlapping avatars) ─────────────

export const MuseBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  margin-top: 3px;
  padding: 11px 0 12px;
  border-top: 1px solid var(--bg-4);
  border-bottom: 1px solid var(--bg-4);

  @media (max-width: 600px) {
    padding: 7px 0 8px;
    gap: 5px;
  }
`;

export const MuseLabel = styled.span`
  font-size: 9.5px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-secondary);
  opacity: 0.7;
`;

export const MuseContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;

  @media (max-width: 600px) {
    min-height: 24px;
  }
`;

export const MusesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  /* overlapping avatars */
  & > * + * {
    margin-left: -9px;
  }
`;

export const MuseAvatar = styled(AvatarNew)`
  width: 32px !important;
  height: 32px !important;
  border: 2px solid var(--bg-2);
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.15s ease;

  .avatar-image,
  .avatar-fallback {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  &:hover {
    z-index: 1;
    transform: translateY(-3px) scale(1.08);
  }

  @media (max-width: 600px) {
    width: 24px !important;
    height: 24px !important;

    .avatar-image,
    .avatar-fallback {
      width: 24px;
      height: 24px;
    }
  }
`;

export const MuseOverflow = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accent-a4);
  border: 2px solid var(--bg-2);
  margin-left: -9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xsmall);
  color: var(--accent-11);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 24px;
    height: 24px;
    font-size: 8px;
  }
`;

export const MusesEmpty = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  opacity: 0.7;
  font-style: italic;
  padding: 2px 0;

  @media (max-width: 600px) {
    font-size: var(--font-size-xsmall);
  }
`;

// ─── Button container ─────────────────────────────────────────────────────────

export const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  margin-top: auto;
  padding-top: 3px;

  .button.messaging {
    background-color: var(--accent);
    cursor: wait;
    pointer-events: none;
  }

  .button.icon-only {
    flex: 0 0 auto;
    width: 40px;
    min-width: 40px;
    padding: 10px 0 !important;
  }

  /* thin, subtle border instead of Button's default 2px solid var(--text) */
  .button.secondary.icon-only {
    border: 1px solid var(--bg-6);
  }

  /* pending "request sent" pill: muted by default, reddens on hover to invite cancelling */
  .button.negative.pending {
    background-color: var(--bg-4);
    color: var(--text-secondary);

    span {
      color: var(--text-secondary);
    }

    &:not(.loading):hover {
      background-color: ${({ theme }: any) => theme.error};

      span {
        color: var(--text);
      }
    }
  }

  /* shrink font on very small cards */
  @media (max-width: 600px) {
    gap: 5px;

    .button {
      font-size: var(--font-size-xsmall) !important;
      padding: 7px 8px !important;
    }

    .button.icon-only {
      width: 32px;
      min-width: 32px;
      padding: 7px 0 !important;
    }
  }
`;

export const BtnContent = styled.span`
  /* !important: Button's own "& span" rule (a descendant selector) also
     matches this span and forces display: inline-block, which drops the
     row layout and the icon/text gap entirely. */
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 6px;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    gap: 4px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;
