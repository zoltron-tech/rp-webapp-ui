import styled from "styled-components";
import { Z_INDEX } from "@/theme";

export const CardFrame = styled.div<{ $accent?: string | null }>`
  position: relative;
  padding: 2px;
  border-radius: calc(var(--border-radius) + 2px);
  background: linear-gradient(
    135deg,
    ${(p) => p.$accent ?? "var(--accent)"},
    ${(p) =>
      p.$accent
        ? `color-mix(in srgb, ${p.$accent} 50%, white)`
        : "color-mix(in srgb, var(--accent) 50%, white)"}
  );
  width: 240px;
  min-width: 240px;
  height: 420px;
  flex-shrink: 0;
  cursor: pointer;
  z-index: ${Z_INDEX.CARD};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  container-name: muse-preview-card;
  container-type: size;

  @media (hover: hover) {
    &:hover {
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
    }
  }

  &:active {
    /* Optionally keep a slight scale for tap/click */
    /* transform: scale(0.97); */
  }

  &.hero {
    width: 160px;
    min-width: 160px;
    height: 300px;
  }

  /* Real viewport check, not a container query: the layout's content column
     is squeezed under 1000px by the fixed sidebar reserves on effectively
     every desktop width once the sidebars are showing (>= 1300px), so a
     container query here would keep this card on the "narrow" branch on
     desktop too — matches the breakpoint MuseCardShimmer/NextPageCard use. */
  @media (max-width: 600px) {
    & {
      width: 160px;
      min-width: 160px;
      /* Match the 240×420 desktop aspect ratio (1.75) so the fit-by-width
         card crop frames identically on mobile. 160 × 420/240 = 280. */
      height: 280px;
    }

    &.home {
      width: 120px;
      min-width: 120px;
      height: 220px;
    }

    &.hero {
      width: 100px;
      min-width: 100px;
      height: 180px;
    }
  }
`;

export const Card = styled.div`
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
`;

export const CoverImage = styled.div<{
  $src: string;
  $bgSize?: string;
  $bgPosition?: string;
}>`
  width: 100%;
  height: 100%;
  background-image: ${({ $src }) => ($src ? `url(${$src})` : "none")};
  background-color: var(--bg-3);
  background-size: ${({ $bgSize }) => $bgSize ?? "cover"};
  background-position: ${({ $bgPosition }) => $bgPosition ?? "center top"};
  background-repeat: no-repeat;
  position: relative;
  transition: transform 0.22s cubic-bezier(.4,1.4,.6,1);

  ${CardFrame}:hover & {
    transform: scale(1.04);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0.0) 30%,
      rgba(0, 0, 0, 0.72) 100%
    );
  }
`;

export const CoverNameBlock = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 3px;

  @container muse-preview-card (max-width: 120px) {
    bottom: 7px;
    left: 7px;
    right: 7px;
    gap: 2px;
  }
`;

export const FandomTag = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.48rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #fff;
  background: ${({ $color }) => $color};
  padding: 2px 6px;
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: fit-content;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
  }

  @container muse-preview-card (max-width: 120px) {
    font-size: var(--font-size-xxxsmall);
    padding: 1px 5px;
    gap: 1px;
  }
`;

export const CharacterName = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @container muse-preview-card (max-width: 120px) {
    font-size: 0.66rem;
  }
`;

export const VerseBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

export const VerseBadge = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 0.5rem;
  font-weight: 700;
  cursor: ${(p) => (p.$active ? "default" : "pointer")};
  background: ${(p) =>
    p.$active ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.18)"};
  color: ${(p) => (p.$active ? "#111" : "#fff")};
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: background 0.15s ease, transform 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background: ${(p) =>
        p.$active ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.35)"};
      transform: ${(p) => (p.$active ? "none" : "scale(1.1)")};
    }
  }

  @container muse-preview-card (max-width: 120px) {
    width: 13px;
    height: 13px;
    font-size: 0.42rem;
  }
`;

export const PennedByRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  max-width: 100%;
  overflow: hidden;
`;

export const PennedByLabel = styled.span`
  font-size: 0.56rem;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;

  @container muse-preview-card (max-width: 120px) {
    font-size: 0.44rem;
  }
`;

export const PennedByUsername = styled.span<{ $accent?: string | null }>`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: ${(p) =>
    p.$accent
      ? `color-mix(in srgb, ${p.$accent} 90%, white)`
      : "color-mix(in srgb, var(--accent) 90%, white)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @container muse-preview-card (max-width: 120px) {
    font-size: 0.44rem;
  }
`;

export const ControlsOverlay = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 6;
`;

export const IconButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0,0,0,0.45);
  color: #fff;
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: rgba(0,0,0,0.6); }
`;

export const EditButton = styled(IconButton)`
  background: var(--bg-3);
  color: #fff;
  opacity: 0.9;
  &:hover { filter: brightness(0.9); }
`;

export const DeleteButton = styled(IconButton)`
  background: rgba(138, 49, 34, 0.85); /* tomato with transparency */
  color: #fff;
  &:hover { background: rgba(225, 92, 69, 0.95); }
`;
