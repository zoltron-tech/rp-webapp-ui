"use client";

import styled from "styled-components";

/** The stage's width in CSS pixels. `promo-gif/config.mjs` sizes the capture
 *  viewport around this — keep the two in step. */
export const STAGE_WIDTH = 1180;
/** Reserved for the workspace so the frame does not resize under the views:
 *  the relationship mesh is the tallest of them. */
export const WORKSPACE_MIN_HEIGHT = 700;

/**
 * The capture surface.
 *
 * Transparent, and it holds no chrome of its own: everything in a frame is a
 * real storyboard component painting its own background, so the GIF's alpha
 * falls exactly around the storyboard's own edges.
 */
export const Root = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 60px 70px;
  background: transparent;

  /* The chapter cards size themselves against this, exactly as they do inside
     the app's ContentContainer. */
  container-name: content-container;
  container-type: inline-size;
`;

/**
 * What flies in.
 *
 * `will-change` keeps the tilted arrival on its own composited layer, so the
 * text inside stays crisply rasterised through the sub-pixel transforms of the
 * entry rather than being resampled from a flat bitmap.
 */
export const Stage = styled.div`
  width: ${STAGE_WIDTH}px;
  max-width: 100%;
  transform-origin: 50% 100%;
  will-change: transform, opacity;
`;

/**
 * The storyboard page's own header, laid out from the real page's styles.
 *
 * Two things differ from `app/rp/story/[slug]`, both because this frame has no
 * page around it: the hero row is not indented for a banner that is not there,
 * and the cover is sized down from the 250x336 the full page gives it, so the
 * header leaves the workspace the room the animation is actually about.
 */
export const PageHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  > *:first-child {
    width: 100%;
    margin-left: 0;
  }

  .promo-cover {
    width: 148px;
    height: 222px;
  }
`;

/**
 * The prompt scene's stage.
 *
 * Narrower than the storyboard's: `PromptRoot` caps itself at 800px, and a
 * wider stage would only add transparent margin either side of a card that
 * cannot use it.
 */
export const PromptStage = styled.div`
  width: 840px;
  max-width: 100%;
  transform-origin: 50% 100%;
  will-change: transform, opacity;
`;

// ── The muse scene ─────────────────────────────────────────────────────────

/**
 * The muse profile is designed as translucent panels over its character's own
 * blurred wallpaper, so unlike the other scenes it cannot be composited onto
 * nothing — strip the wallpaper and the panels have nothing to sit against.
 * This scene is therefore a rounded *screen*: opaque inside, alpha around the
 * corners and edges, which still drops cleanly onto footage.
 */
export const MuseRoot = styled(Root)`
  /* The muse stage is a screen, not a floating panel — it wants the frame,
     and the capture viewport has to stay under the 1024px breakpoint above
     which the profile switches to its 422px card (see MuseStage). */
  padding: 12px;
`;

export const MuseStage = styled.div`
  position: relative;
  width: 986px;
  height: 876px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 22px;
  background: var(--bg-1);
  transform-origin: 50% 100%;
  will-change: transform, opacity;

  /* The page's wallpaper is fixed to the viewport; inside the stage it has to
     be the stage that bounds it. */
  > * > [data-promo="muse-banner"] {
    position: absolute;
  }

  /* The prev/next peek cards are sized for a full-width desktop, where there is
     always room beside the profile. Narrowed here so the section rail clears
     them once the panel is open — they still read as the cards they are. */
  [data-promo="nav-prev"],
  [data-promo="nav-next"] {
    width: 78px;
  }

`;

/** The character list, stacked with the profile and crossfaded by the
 *  timeline rather than routed between. */
export const MuseListLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  padding: 24px 28px 0;

  /* Six 240x420 cards are two rows taller than the stage. Scaled rather than
     re-laid-out, so the grid stays the grid. */
  [data-promo="muse-grid"] {
    transform: scale(0.8);
    transform-origin: top center;
  }
`;

/** The profile. Its section panel scrolls under the timeline's control — the
 *  back story is taller than the shot. */
export const MuseProfileLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  gap: 10px;
  /* Clears the prev/next peek cards docked at the stage's edges, so the card,
     the panel and the rail never run under them. */
  padding: 14px 96px 20px;
`;

/** Wraps the character card so a verse switch can turn it over. */
export const MuseCardFlip = styled.div`
  perspective: 1400px;
  transform-style: preserve-3d;
  will-change: transform;
`;

/**
 * Holds whichever section is open.
 *
 * Deliberately sizeless: every section renders inside `CardExpandedWrapper`,
 * which is the same 326px 9/16 box as the character card, and scrolls its own
 * content internally. Constraining this wrapper is what made the panel and the
 * card different sizes — so it only carries the opacity and the collapse the
 * timeline animates, and lets the section be its own size.
 */
export const MuseSectionSlot = styled.div`
  flex: 0 0 auto;
  overflow: hidden;
`;

/** Holds the workspace at a constant height across all three views. */
export const WorkspaceSlot = styled.div`
  min-height: ${WORKSPACE_MIN_HEIGHT}px;
`;
