import styled from "styled-components";

/* ── Square design — 1:1 (400×400). Split like the profile page itself:
   the card background image on the left, with just name/nicknames as a
   caption underneath it (kept minimal so the image can be as large as
   possible) — and the quote, penned-by, attribute chips, and brand + QR
   on the right. The fandom tag sits in the top-right corner, stacked
   directly under the TypeLabel pill (both absolute, anchored to Card). ── */

export const CardFrame = styled.div<{ $accent?: string | null }>`
  padding: 1.5px;
  border-radius: 9px;
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
  width: 400px;
  height: 400px;
  border-radius: 7.5px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
`;

/* ── Left column: image (top) + name/fandom/nicknames caption (bottom) ── */

export const LeftColumn = styled.div`
  width: 189px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
`;

/* Same 9:16 aspect ratio as the profile page's card (CardWrapper), so the
   crop the user set there frames identically here. Shorter than the column
   itself — the remaining height below is the caption — which is what makes
   this image a little smaller than a full-bleed column would be. */
export const ImageBox = styled.div<{
  $src: string;
  $bgSize?: string;
  $bgPosition?: string;
}>`
  width: 100%;
  aspect-ratio: 9 / 16;
  flex-shrink: 0;
  position: relative;
  background-image: ${({ $src }) => ($src ? `url(${$src})` : "none")};
  background-color: var(--bg-3);
  background-size: ${({ $bgSize }) => $bgSize ?? "cover"};
  background-position: ${({ $bgPosition }) => $bgPosition ?? "center"};
`;

export const TypeLabel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  font-size: 0.44rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.45);
  padding: 3px 7px;
  border-radius: 4px;
`;

export const CaptionBlock = styled.div<{ $accent?: string | null }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  padding: 4px 8px;
  background:
    linear-gradient(
      to right,
      ${(p) =>
        p.$accent
          ? `color-mix(in srgb, ${p.$accent} 9%, transparent)`
          : "color-mix(in srgb, var(--accent) 9%, transparent)"}
        0%,
      transparent 85%
    ),
    linear-gradient(160deg, var(--bg-1) 0%, #000 100%);
  box-shadow: inset 0 3px 6px -4px rgba(0, 0, 0, 0.6);
`;

/* Sits directly under TypeLabel, in the same top-right absolute stack —
   both anchored to Card's top-right corner. */
export const FandomTag = styled.div<{ $color: string }>`
  position: absolute;
  top: 29px;
  right: 10px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.44rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #fff;
  background: ${({ $color }) => $color};
  padding: 2px 6px 2px 5px;
  border-radius: 20px;
  width: fit-content;
  max-width: calc(100% - 20px);
  overflow: hidden;

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

/* First and last name stacked as two separate lines rather than one
   combined/truncated line — CharacterNameLine truncates each independently. */
export const CharacterName = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.74rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
  letter-spacing: 0.01em;
  max-width: 100%;
`;

export const CharacterNameLine = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* min-height reserves a fixed 2-line slot regardless of actual content —
   whether there are no nicknames, one short nickname, or two full lines of
   them — so CharacterName never shifts position depending on what's here. */
export const NicknamesList = styled.div`
  font-size: 0.56rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.3;
  min-height: 2.6em;
  max-width: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
`;

/* ── Right column: quote, attribute chips, brand + QR ── */

export const InfoColumn = styled.div<{ $accent?: string | null }>`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 14px 12px;
  background:
    radial-gradient(
      circle at 100% 0%,
      ${(p) =>
        p.$accent
          ? `color-mix(in srgb, ${p.$accent} 7%, transparent)`
          : "color-mix(in srgb, var(--accent) 7%, transparent)"}
        0%,
      transparent 75%
    ),
    linear-gradient(160deg, var(--bg-1) 0%, #000 100%);
`;

/* Pulled up so the avatar's top edge lines up with the TypeLabel pill's top
   (InfoColumn's own 16px top padding minus this margin = TypeLabel's 10px).
   The avatar sits first (top-left) but is given a higher z-index than the
   quote container, so it stays on top where the two overlap instead of
   being covered by the container painting later in DOM order. */
export const QuoteBlock = styled.div`
  flex-shrink: 0;
  margin-top: -6px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const QuoteAvatar = styled.img`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
`;

export const QuoteAvatarFallback = styled.div`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
`;

export const QuoteContainer = styled.div`
  position: relative;
  z-index: 1;
  margin-top: -16px;
  margin-left: 28px;
  max-width: calc(100% - 28px);
  padding: 10px 12px 9px 17px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
`;

export const QuoteText = styled.p`
  margin: 0;
  font-size: 0.6rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.4;
  letter-spacing: 0.015em;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
`;

export const AttributesArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

/* Two equal-width "stat chip" columns — each chip is sized to hold a
   two-line value, so the grid stays even regardless of value length. */
export const AttributesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

export const AttributeChip = styled.div<{ $accent?: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 44px;
  padding: 5px 9px 6px;
  border-radius: 9px;
  background: linear-gradient(
    135deg,
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 16%, rgba(255,255,255,0.05))`
        : "color-mix(in srgb, var(--accent) 16%, rgba(255,255,255,0.05))"}
      0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  border: 1px solid
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 30%, transparent)`
        : "color-mix(in srgb, var(--accent) 30%, transparent)"};
  overflow: hidden;
`;

export const AttributeKeyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const AttributeDot = styled.span<{ $accent?: string | null }>`
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== "" ? $accent : "var(--accent)"};
`;

export const AttributeKey = styled.span`
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AttributeValue = styled.span`
  font-size: 0.52rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
`;

export const EmptyAttributes = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0.35;
  padding: 10px 0;
`;

export const EmptyAttributesText = styled.div`
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

export const PennedByRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

export const PennedByLabel = styled.span`
  font-size: 0.54rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const PennedByAvatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
`;

export const PennedByAvatarFallback = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
`;

/* A small pill/chip badge (with the avatar living inside it) rather than
   plain text — matches the accent-tinted chip treatment used elsewhere
   (FandomTag, AttributeChip) for consistency. */
export const PennedByUsername = styled.span<{ $accent?: string | null }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 9px 2px 2px;
  border-radius: 20px;
  font-size: 0.56rem;
  font-weight: 700;
  background: ${({ $accent }) =>
    $accent && $accent.trim() !== ""
      ? `color-mix(in srgb, ${$accent} 18%, transparent)`
      : "color-mix(in srgb, var(--accent) 18%, transparent)"};
  border: 1px solid
    ${({ $accent }) =>
      $accent && $accent.trim() !== ""
        ? `color-mix(in srgb, ${$accent} 35%, transparent)`
        : "color-mix(in srgb, var(--accent) 35%, transparent)"};
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BrandRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  flex-shrink: 0;
`;

export const BrandLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

export const BrandText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0;
  white-space: nowrap;
`;

export const BrandName = styled.span`
  font-size: 0.58rem;
  font-weight: var(--font-weight-regular);
  font-style: italic;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.01em;
`;

export const BrandNameSuffix = styled.span<{ $accent?: string | null }>`
  font-size: 0.58rem;
  font-weight: var(--font-weight-bold);
  font-style: italic;
  margin-left: 3px;
  text-transform: uppercase;
  color: ${({ $accent }) =>
    $accent && $accent.trim() !== "" ? $accent : "var(--accent-8)"};
  letter-spacing: 0.01em;
`;

export const QrWrapper = styled.div`
  flex-shrink: 0;
  padding: 3px;
  background: white;
  border-radius: 5px;
  display: flex;
`;
