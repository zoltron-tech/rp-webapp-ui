import { Avatar } from "radix-ui";
import { styled } from "styled-components";

export const AvatarRoot = styled(Avatar.Root)<{ $online?: boolean }>`
  position: relative;
  display: inline-flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
  background-color: var(--bg-2);
  box-shadow: ${({ $online }) => ($online ? "0 0 0 2px #22c55e" : "none")};
  transition: box-shadow 0.2s ease;

  &.selectable {
    cursor: pointer;

    &:hover {
      outline: 1.5px solid var(--accent-a8);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    color: var(--accent-a8);
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-bold);
  }
`;

/** Renders an NWImage with crop/position data using the same fit-by-width
 *  background-position model as AvatarCropDialog and the Muse cardBackground,
 *  so it reproduces the exact adjustment at any avatar size. */
export const NWImageLayer = styled.div<{
  $src: string;
  $x: number;
  $y: number;
  $scale: number;
}>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: url(${(p) => p.$src});
  background-repeat: no-repeat;
  /* Two-value size: width% auto — height scales proportionally (fit by width). */
  background-size: ${(p) => p.$scale * 100}% auto;
  background-position: ${(p) => `${p.$x}% ${p.$y}%`};
  pointer-events: none;
  user-select: none;
`;
