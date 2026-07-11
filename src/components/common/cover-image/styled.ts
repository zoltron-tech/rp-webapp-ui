import styled from "styled-components";

/** Frame — sizing/aspect-ratio is controlled entirely by the consumer via
 *  className (e.g. story cards, hero previews). This just clips the layer. */
export const Frame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-2);
`;

/** Plain <img>-style cover fit, used when there's no crop/position data yet. */
export const PlainCover = styled.div<{ $src: string }>`
  position: absolute;
  inset: 0;
  background-image: url(${(p) => p.$src});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
`;

/** Renders an NWImage with crop/position data using the same fit-by-width
 *  background-position model as AvatarCropDialog and AvatarNew's NWImageLayer,
 *  so the cover reproduces the exact adjustment at any frame size. */
export const CroppedCover = styled.div<{
  $src: string;
  $x: number;
  $y: number;
  $scale: number;
}>`
  position: absolute;
  inset: 0;
  background-image: url(${(p) => p.$src});
  background-repeat: no-repeat;
  background-size: ${(p) => p.$scale * 100}% auto;
  background-position: ${(p) => `${p.$x}% ${p.$y}%`};
`;

export const EmptyState = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: linear-gradient(135deg, var(--bg-3) 0%, var(--bg-2) 100%);

  svg {
    width: 28%;
    height: 28%;
    opacity: 0.35;
  }
`;
