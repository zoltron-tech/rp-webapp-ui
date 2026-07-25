import styled, { keyframes } from "styled-components";
import { CARD_BORDER, Z_INDEX } from "@/theme";

export const CardBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const Title = styled.div`
  position: relative;
  bottom: -40px;
  font-size: 18px;
  font-weight: 600;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: var(--text);
  text-align: end;
  transform: translateY(160px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &.profile {
    bottom: -160px;
    right: -10;
  }

  @container content-container (max-width: 750px) {
    bottom: 10px;
    font-size: 12px;
  }
`;

export const Description = styled.div`
  position: relative;
  bottom: -50px;
  right: 10px;
  font-size: 16px;
  font-weight: 300;
  word-wrap: break-word;
  white-space: wrap;
  max-width: 80%;
  color: var(--text);
  text-align: end;
  opacity: 0;
  transform: translateY(250px);
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;

  &.profile {
    bottom: -160px;
    right: -10;
  }

  @container content-container (max-width: 750px) {
    bottom: -180px;
    font-size: 12px;
    opacity: 1;
    transform: none;
  }
`;

/* 6:9 (2:3) portrait ratio, matching Storyboard Event cover avatars. */
export const CardWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 300px;
  min-width: 200px;
  min-height: 300px;
  border-radius: var(--border-radius);
  ${CARD_BORDER};

  &.own {
    border: 3px solid var(--accent);
  }

  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: story-card;
  container-type: size;

  &.profile {
    width: 160px;
    height: 240px;
    min-width: 160px;
    min-height: 240px;
  }

  @container content-container (max-width: 750px) {
    & {
      width: 170px;
      height: 255px;
      min-width: 170px;
      min-height: 255px;
    }
  }

  @media (max-width: 520px) {
    & {
      width: 145px;
      height: 217px;
      min-width: 145px;
      min-height: 217px;
    }
  }

  @container content-container (min-width: 750px) {
    &:hover {
      z-index: ${Z_INDEX.MODAL};
      transform: scale(1.2);
    }
  }
`;

export const CardFooter = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: end;
  font-size: 14px;
  font-weight: 600;
  padding: 20px;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease, scale 0.5s ease;
  background: linear-gradient(
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
  );

  @container content-container (max-width: 750px) {
    & {
      height: 30px;
      font-size: 8px;
      padding: 10px;
      opacity: 1;
    }
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px 10px 0px;
  position: relative;
  height: 100%;
  contain: paint;
  background: linear-gradient(
    ${({ theme }: any): string => theme.cardBackgroundGradient.join(", ")}
  );
  cursor: pointer;

  @container content-container (min-width: 750px) {
    &:hover {
      background: linear-gradient(
        ${({ theme }: any): string =>
          theme.cardDarkerBackgroundGradient.join(", ")}
      );
      & ${Title} {
        transform: translateY(0);
      }

      & ${Description} {
        transform: translateY(0);
      }

      & ${Description}, ${CardFooter} {
        opacity: 1;
      }
    }
  }
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;

export const MuseInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: end;
  font-size: 14px;
`;

// ─── Mobile preview tray (Netflix-style) ───────────────────────────────────

/* Outer frame — same technique as the desktop portal: a blurred, over-scaled
 * copy of the cover image bleeds through the top/side padding gap to form a
 * glossy, image-tinted border along the top edge of the tray. Negative inline
 * margin cancels the shared sheet's 18px padding to reach the sheet edges. */
export const TrayFrame = styled.div`
  position: relative;
  margin: 0 -18px;
  padding: 2.5px 2.5px 0;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.5),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.18);

  /* Fade the image-tinted side borders to gray toward the bottom, so the
   * colored border reads only across the top half of the tray. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(
      to bottom,
      transparent 42%,
      var(--bg-4) 82%
    );
  }
`;

export const TrayFrameGlow = styled.div`
  position: absolute;
  inset: -14%;
  z-index: 0;
  pointer-events: none;
  filter: blur(18px) saturate(2) brightness(1.15);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

/* Full-bleed hero banner, inset by the frame's border thickness. */
export const TrayHero = styled.div`
  position: relative;
  z-index: 1;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 14px 14px 0 0;

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const TrayHeroScrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 42%,
    color-mix(in srgb, var(--bg-2) 55%, transparent) 78%,
    var(--bg-2) 100%
  );
`;

/* Glassy drag pill floating over the hero. */
export const TrayDragHandle = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
`;

/* Header actions pinned top-right over the hero: edit, delete, then close. */
export const TrayHeaderActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TrayHeaderButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.12s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:active {
    background: rgba(0, 0, 0, 0.72);
    transform: scale(0.92);
  }
`;

export const TrayDeleteHeaderButton = styled(TrayHeaderButton)`
  &:active {
    background: color-mix(in srgb, var(--tomato-9) 70%, rgba(0, 0, 0, 0.5));
  }
`;

export const TrayCloseButton = styled(TrayHeaderButton)``;

/* Eyebrow + title overlaid on the bottom-left of the hero. */
export const TrayHeroText = styled.div`
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 10px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TrayEyebrow = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.55);
`;

export const TrayTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

export const TrayBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 2px 0;
`;

export const TrayDescription = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const TrayReadMoreButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 18px;
  padding: 13px 20px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;

// ─── Desktop preview dialog (Netflix-style) ────────────────────────────────

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const dialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  animation: ${overlayFadeIn} 0.2s ease both;
`;

/* Outer frame — slightly larger than the card. Holds a blurred copy of the
 * cover image; the padding gap becomes a border tinted by the image itself. */
export const DialogFrame = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 501;
  padding: 2.5px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.6),
    /* glossy top sheen along the border rim */
    inset 0 1.5px 0 rgba(255, 255, 255, 0.5),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.18);
  animation: ${dialogPopIn} 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;

  /* Fade the image-tinted border to gray below the hero so the colored
   * border reads only across the top half of the portal. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(
      to bottom,
      transparent 42%,
      var(--bg-4) 78%
    );
  }
`;

/* Blurred, over-scaled cover image that bleeds its colors into the border gap. */
export const DialogFrameGlow = styled.div`
  position: absolute;
  inset: -14%;
  z-index: 0;
  pointer-events: none;
  filter: blur(18px) saturate(2) brightness(1.15);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const DialogContent = styled.div`
  position: relative;
  z-index: 1;
  width: min(660px, calc(100vw - 50px));
  max-height: 86vh;
  display: flex;
  gap: 22px;
  padding: 22px;
  overflow: hidden;
  background: var(--bg-2);
  /* Glassy border: translucent light stroke + soft inner highlight/edge. */
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  outline: none;
`;

/* Left column: portrait cover at its original 2:3 ratio (reproduces the avatar
 * crop exactly, like the story card). With the heading moved to the right
 * column, the cover now owns the full left column and can be larger. */
export const DialogCover = styled.div`
  position: relative;
  width: 240px;
  aspect-ratio: 2 / 3;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 10px;
  ${CARD_BORDER};
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

/* Eyebrow + title sit at the top of the right column, above the description. */
export const DialogHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* Keep clear of the close button in the top-right corner. */
  padding-right: 46px;
  margin-top: 60px;
`;

export const DialogEyebrow = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
`;

/* Header actions pinned top-right over the dialog: edit, delete, then close. */
export const DialogHeaderActions = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DialogHeaderButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.75);
    transform: scale(1.06);
  }
`;

export const DialogDeleteHeaderButton = styled(DialogHeaderButton)`
  &:hover {
    background: color-mix(in srgb, var(--tomato-9) 70%, rgba(0, 0, 0, 0.55));
  }
`;

export const DialogClose = styled(DialogHeaderButton)``;

export const DialogInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  padding: 2px 0;
  overflow: hidden;
`;

export const DialogTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;
`;

export const DialogDescription = styled.p`
  margin: 14px 0 0;
  flex: 1 1 0;
  min-height: 0;
  font-size: var(--font-size);
  color: var(--text-secondary);
  line-height: 1.6;
  /* Fill the space above the pinned actions and trim to fit — never scroll. */
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 8;
`;

/* Buttons pinned to the bottom-right of the portal. */
export const DialogActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 10px;
  padding-top: 16px;
`;

export const DialogReadMoreButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;

  &:hover {
    opacity: 0.94;
    box-shadow: 0 8px 22px color-mix(in srgb, var(--accent) 55%, transparent);
  }

  &:active {
    transform: scale(0.97);
  }

  svg {
    transition: transform 0.15s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;
