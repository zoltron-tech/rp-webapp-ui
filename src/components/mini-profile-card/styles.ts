import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.79);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const CloseButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  color: var(--text);
  opacity: 0.6;
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }
`;

/* ── Card shell ─────────────────────────────────────────────────────────── */

export const CardFrame = styled.div`
  padding: 3px;
  border-radius: 27px;
  background: linear-gradient(
    135deg,
    var(--accent),
    color-mix(in srgb, var(--accent) 50%, white)
  );
  flex-shrink: 0;
  align-self: center;
  overflow: hidden;
  /* Force a GPU compositing layer so iOS Safari honours the
     overflow:hidden + border-radius clip on nested children */
  transform: translateZ(0);
`;

export const Card = styled.div`
  position: relative;
  width: 380px;
  height: 676px;
  background: var(--bg-2);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  /* Same GPU-layer trick for the inner clip */
  transform: translateZ(0);
`;

/* ── Hero banner ─────────────────────────────────────────────────────────── */

export const HeroBanner = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 14px;
  border-top-right-radius: 24px;
  border-top-left-radius: 24px;
  /* GPU layer so the inset:-20px HeroBg is clipped correctly on iOS Safari */
  transform: translateZ(0);
`;

export const HeroBg = styled.div<{ $src: string }>`
  position: absolute;
  inset: -20px;
  background-image: url(${(p) => p.$src});
  background-size: cover;
  background-position: center top;
  filter: blur(22px) brightness(0.3);
  border-radius: 24px;
  z-index: 0;
`;

export const HeroAccentOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 30%, transparent) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  z-index: 1;
  border-top-right-radius: 24px;
  border-top-left-radius: 24px;
`;

export const HeroInner = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top-right-radius: 24px;
  border-top-left-radius: 24px;
  gap: 8px;
`;

export const AvatarRing = styled.div`
  padding: 3px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--accent),
    color-mix(in srgb, var(--accent) 50%, white)
  );

  .avatar {
    width: 148px;
    height: 148px;
    display: block;
  }
`;

export const HeroName = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
  line-height: 1.2;
  letter-spacing: -0.01em;
`;

export const HeroUsername = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: color-mix(in srgb, var(--accent) 70%, white);
  letter-spacing: 0.03em;
`;

/* ── Content area ────────────────────────────────────────────────────────── */

export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 28px 2px;
  gap: 18px;
  min-height: 0;
  width: 100%;
  justify-content: flex-start;
`;

export const NoteQuote = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
`;

export const NoteBar = styled.div`
  width: 3px;
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
`;

export const NoteText = styled.div`
  font-size: 13px;
  color: var(--text);
  line-height: 1.65;
  font-style: italic;
  opacity: 0.85;
  word-break: break-word;
`;

export const StatsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: var(--bg-3);
  border-radius: 16px;
  border: 1px solid var(--bg-6);
  padding: 11px 0;
`;

export const StatItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

export const StatValue = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.02em;
`;

export const StatLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-weight: 600;
`;

export const StatSep = styled.div`
  width: 1px;
  height: 26px;
  background: var(--bg-6);
  flex-shrink: 0;
`;

export const CharSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

export const CharLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-secondary);
  font-weight: 700;
`;

export const CharRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
`;

export const CharItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

export const CharCard = styled.div`
  width: 96px;
  height: 168px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(160deg, var(--bg-3) 0%, var(--bg-4) 100%);
  border: 2px solid var(--accent-3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const CharCardFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 800;
  color: var(--accent);
  opacity: 0.5;
`;

export const CharName = styled.div`
  font-size: var(--font-size-xxsmall);
  color: var(--text);
  text-align: center;
  font-weight: 600;
  max-width: 92px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EmptyNote = styled.div`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px dashed var(--bg-6);
  font-size: 12px;
  font-style: italic;
  color: var(--text-secondary);
  opacity: 0.7;
  text-align: center;
`;

export const EmptyChars = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const EmptyCharsIcon = styled.div`
  font-size: 28px;
  opacity: 0.3;
`;

export const EmptyCharsText = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.6;
  text-align: center;
`;

/* ── Bottom bar ──────────────────────────────────────────────────────────── */

export const BottomBar = styled.div`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 7px 20px 10px;
  border-top: 1px solid var(--bg-6);
`;

export const QrWrapper = styled.div`
  padding: 4px;
  background: white;
  border-radius: 6px;
  display: flex;
  flex-shrink: 0;
`;

export const UrlBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ProfileUrlLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-weight: 600;
`;

export const ProfileUrl = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  word-break: break-all;
  line-height: 1.4;
  width: 100%;
`;

export const BrandBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
`;

export const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const BrandText = styled.div`
  display: flex;
  align-items: baseline;
`;

export const BrandName = styled.span`
  font-size: 11px;
  font-weight: 400;
  font-style: italic;
  text-transform: uppercase;
  color: var(--text);
  letter-spacing: 0.02em;
`;

export const BrandNameSuffix = styled.span`
  font-size: 11px;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  color: var(--accent-8);
  letter-spacing: 0.02em;
  margin-left: 3px;
`;

export const DownloadButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 28px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--accent-hover);
  }
`;
