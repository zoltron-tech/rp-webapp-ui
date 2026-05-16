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
  padding: 16px;
`;

/* ── The card that gets exported as an image — fixed 9:16 (360×640) ── */
export const CardFrame = styled.div<{ $accent?: string | null }>`
  padding: 3px;
  border-radius: 23px;
  background: linear-gradient(
    135deg,
    ${(p) => p.$accent ?? "var(--accent)"},
    ${(p) =>
      p.$accent
        ? `color-mix(in srgb, ${p.$accent} 50%, white)`
        : "color-mix(in srgb, var(--accent) 50%, white)"}
  );
  flex-shrink: 0;
  align-self: center;
`;

export const Card = styled.div`
  position: relative;
  width: 360px;
  height: 640px;
  background: linear-gradient(160deg, var(--bg-1) 0%, #000 100%);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
`;

export const CoverImage = styled.div<{
  $src: string;
  $position?: number;
  $isPortrait?: boolean;
}>`
  width: 100%;
  height: 360px;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: ${({ $position, $isPortrait }) =>
    $isPortrait
      ? `center ${$position ?? 50}%`
      : `${100 - ($position ?? 50)}% center`};
  flex-shrink: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.85));
  }
`;

export const CoverNameBlock = styled.div`
  position: absolute;
  bottom: 12px;
  left: 16px;
  z-index: 1;
`;

export const CharacterName = styled.div`
  font-size: 1.7rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  letter-spacing: 0.01em;
`;

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px 0;
  gap: 8px;
  width: 100%;
  overflow: hidden;
`;

export const CardTypeLabel = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  font-size: 0.52rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(0, 0, 0, 0.45);
  padding: 3px 8px;
  border-radius: 4px;
`;

export const FandomTag = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  background: ${({ $color }) => $color};
  padding: 2px 8px 2px 6px;
  border-radius: 4px;
  margin-bottom: 2px;

  &::before {
    content: "";
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }
`;

export const NicknamesList = styled.div`
  font-size: 0.7rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
  margin-top: 4px;
`;

export const NicknamesDivider = styled.div`
  width: 32px;
  height: 1.5px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin-top: 8px;
`;

export const EmptyAttributes = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0.35;
`;

export const EmptyAttributesIcon = styled.div`
  font-size: 22px;
`;

export const EmptyAttributesText = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
`;

export const AttributesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  align-content: start;
`;

export const AttributeCard = styled.div<{ $accent?: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 10px;
  border-radius: 8px;
  background-color: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 12%, rgba(0,0,0,0.4))`
      : "rgba(255,255,255,0.07)"};
  border: 1px solid ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 28%, transparent)`
      : "rgba(255,255,255,0.11)"};
  overflow: hidden;
`;

export const AttributeKey = styled.span`
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AttributeValue = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

export const Divider = styled.div`
  width: calc(100% - 40px);
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

export const PennedByRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  padding: 6px 20px;
  flex-shrink: 0;
`;

export const PennedByLabel = styled.span`
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  white-space: nowrap;
`;

export const PennedByAvatar = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
`;

export const PennedByUsername = styled.span<{ $accent?: string | null }>`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${({ $accent }) =>
    $accent && $accent.trim() !== "" ? $accent : "var(--accent)"};
`;

export const BrandBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;

export const BrandLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const BrandText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0;
`;

export const BrandName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
  font-style: italic;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.01em;
`;

export const BrandNameSuffix = styled.span<{ $accent?: string | null }>`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  font-style: italic;
  margin-left: 4px;
  text-transform: uppercase;
  color: ${({ $accent }) =>
    $accent && $accent.trim() !== "" ? $accent : "var(--accent-8)"};
  letter-spacing: 0.01em;
`;

export const QrWrapper = styled.div`
  flex-shrink: 0;
  padding: 5px;
  background: white;
  border-radius: 6px;
  display: flex;
`;

/* ── Controls rendered outside the exported card ── */
export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 360px;
`;

export const PositionSliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 360px;
`;

export const PositionSliderLabel = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.7;
`;

export const PositionSlider = styled.input`
  flex: 1;
  height: 3px;
  accent-color: var(--accent);
  cursor: ew-resize;
  border-radius: 2px;
`;

export const DownloadButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 28px;
  flex: 1;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CloseButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  opacity: 0.6;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
  }
`;
