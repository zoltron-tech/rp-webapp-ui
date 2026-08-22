import styled, { keyframes } from "styled-components";
import { fadeIn as overlayFadeIn, slideInUp } from "@/theme/animations";

export const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 8px 4px 4px;
`;

export const ChoiceCard = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 14px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition:
    background 0.15s,
    border-color 0.15s;
  width: 100%;

  &:hover {
    background: var(--bg-4);
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-4));
  }
`;

export const ChoiceIconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-4));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
`;

export const ChoiceTitle = styled.span`
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const ChoiceDesc = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const ChoiceGifHint = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(251, 191, 36, 0.8);
  margin-top: 2px;
`;

export const BackRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const BackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  transition: background 0.15s;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

// ── Mobile picker tray ────────────────────────────────────────────────────────

export const PickerTrayOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 300;
  animation: ${overlayFadeIn} 0.22s ease both;
`;

export const PickerTraySheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 301;
  display: flex;
  flex-direction: column;
  background: var(--bg-2);
  border-radius: 16px 16px 0 0;
  border-top: 1px solid var(--bg-5);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.3);
  max-height: 88svh;
  animation: ${slideInUp} 0.32s cubic-bezier(0.4, 0, 0.2, 1) both;
`;

export const PickerTrayHandle = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 4px;
  background: var(--bg-6);
  border-radius: 2px;
  margin: 10px auto 2px;
`;

export const PickerTrayHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 10px;
  border-bottom: 1px solid var(--bg-4);
`;

export const PickerTrayTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const PickerTrayBackButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  transition: background 0.15s;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

export const PickerTrayCloseButton = styled.button`
  all: unset;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.15s;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

export const PickerTrayBannerWrap = styled.div`
  flex-shrink: 0;
  padding: 10px 14px 0;
`;

export const PickerTrayBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

// ── Level-gate lock UI ─────────────────────────────────────────────────────────

const lockPulse = keyframes`
  0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(251,191,36,0); }
  30%  { transform: scale(1.02); box-shadow: 0 0 0 4px rgba(251,191,36,0.25); }
  60%  { transform: scale(0.99); box-shadow: 0 0 0 2px rgba(251,191,36,0.1); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(251,191,36,0); }
`;

export const LockedBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.11) 0%,
    rgba(245, 158, 11, 0.07) 100%
  );
  border: 1px solid rgba(251, 191, 36, 0.38);
  animation: ${lockPulse} 0.45s ease;
`;

export const LockedBannerIcon = styled.span`
  font-size: 1.05rem;
  line-height: 1.3;
  flex-shrink: 0;
`;

export const LockedBannerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const LockedBannerTitle = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  color: rgba(251, 191, 36, 0.95);
  letter-spacing: 0.02em;
`;

export const LockedBannerDesc = styled.span`
  font-size: 0.69rem;
  color: var(--text-secondary);
  line-height: 1.45;
`;

export const ChoiceLockCorner = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(35, 35, 35, 0.82);
  border: 1px solid rgba(180, 180, 180, 0.2);
  border-radius: 4px;
  padding: 2px 6px;
  color: rgba(251, 191, 36, 1);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  pointer-events: none;
`;
