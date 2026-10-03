import styled from "styled-components";
import { FOCUS_RING, MEDIA_CHIP, Z_INDEX } from "@/theme";

export const CardFrame = styled.div<{ $accent?: string | null }>`
  position: relative;
  padding: 2px;
  border-radius: 16px;
  box-shadow: 0 18px 36px -26px rgb(0 0 0 / 0.8);
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
  /* inline-size, not size: all muse-preview-card container queries are
     width-only, and size containment on every card in a long grid is an iOS
     paint hazard (see muse-card/novelist-card, same change). */
  container-type: inline-size;

  @media (hover: hover) {
    &:hover {
      box-shadow: 0 24px 44px -24px rgb(0 0 0 / 0.85);
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

    /* 140 × 245 (was 120 × 220): the smallest size at which the name,
       fandom and author fit at an 11px floor. */
    &.home {
      width: 140px;
      min-width: 140px;
      height: 245px;
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
  border-radius: 14px;
  overflow: hidden;
  position: relative;

  /* A lit top edge on the art, so the card reads as a pane of glass with the
     character behind it rather than a flat print. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 3;
    border-radius: inherit;
    pointer-events: none;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.22),
      inset 0 0 0 1px rgb(255 255 255 / 0.06);
  }
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

  @container muse-preview-card (max-width: 140px) {
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
  /* 11px (was 0.48rem, 7.7px — and 6px on the phone card). */
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fff;
  background: ${({ $color }) => $color};
  padding: 2px 7px;
  border-radius: 5px;
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

  @container muse-preview-card (max-width: 140px) {
    padding: 1px 5px;
    gap: 3px;
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

  @container muse-preview-card (max-width: 140px) {
    font-size: 0.8125rem;
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  cursor: ${(p) => (p.$active ? "default" : "pointer")};
  background: ${(p) =>
    p.$active ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.18)"};
  color: ${(p) => (p.$active ? "#111" : "#fff")};
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: background 0.15s ease, transform 0.15s ease;
  ${FOCUS_RING}

  @media (hover: hover) {
    &:hover {
      background: ${(p) =>
        p.$active ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.35)"};
      transform: ${(p) => (p.$active ? "none" : "scale(1.1)")};
    }
  }

  @container muse-preview-card (max-width: 140px) {
    width: 18px;
    height: 18px;
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
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
  flex-shrink: 0;
`;

export const PennedByUsername = styled.span<{ $accent?: string | null }>`
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: ${(p) =>
    p.$accent
      ? `color-mix(in srgb, ${p.$accent} 90%, white)`
      : "color-mix(in srgb, var(--accent) 90%, white)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
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
  border-radius: 10px;
  ${MEDIA_CHIP}
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background-color: rgb(0 0 0 / 0.75); }
  ${FOCUS_RING}
`;

export const EditButton = styled(IconButton)`
  opacity: 0.95;
  &:hover { filter: brightness(0.9); }
`;

export const DeleteButton = styled(IconButton)`
  background: rgba(138, 49, 34, 0.85); /* tomato with transparency */
  color: #fff;
  &:hover { background: rgba(225, 92, 69, 0.95); }
`;
