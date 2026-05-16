import { styled } from "styled-components";
import * as Common from "@/components/common";
import { CARD_BORDER, Z_INDEX } from "@/theme";
import { AvatarNew } from "../common/avatar-new";

// ─── Card shell ──────────────────────────────────────────────────────────────

export const CardWrapper = styled.div`
  position: relative;
  width: 220px;
  min-width: 220px;
  border-radius: 12px;
  overflow: hidden;
  ${CARD_BORDER}
  background-color: var(--bg-2);
  z-index: ${Z_INDEX.CARD};
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
`;

// ─── Decorative accent strip at the top ──────────────────────────────────────

export const AccentStrip = styled.div`
  width: 100%;
  height: 56px;
  background: linear-gradient(
    135deg,
    var(--accent-a4) 0%,
    var(--accent-a2) 100%
  );
  flex-shrink: 0;

  @media (max-width: 600px) {
    height: 40px;
  }
`;

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
  border: 2px solid var(--bg-2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);

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
  /* overlapping avatars */
  & > * + * {
    margin-left: -8px;
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
