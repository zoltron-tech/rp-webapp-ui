import styled from "styled-components";
import {
  BORDER_RADIUS,
  FOCUS_RING,
  MATERIAL_CARD,
  MEDIA_CHIP,
  Z_INDEX,
} from "@/theme";
import { AvatarNew } from "../common/avatar-new";

const DISPLAY_SERIF = `"PlayfairDisplaySC", "BodoniModaSC", Georgia, serif`;

/* A material pane, like every card in the feed. On phones it stays a card —
   inset from the edges with its hairline — rather than going edge to edge,
   so an activity and a prompt read as the same kind of object. */
export const ParentContainer = styled.article`
  ${MATERIAL_CARD}
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  margin-block: 10px;
  border-radius: 20px;
  overflow: hidden;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  @media screen and (max-width: 600px) {
    width: calc(100% - 16px);
    margin-block: 6px;
    border-radius: 16px;
  }
`;

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 12px;

  @media screen and (max-width: 400px) {
    gap: 8px;
    padding: 12px 12px 10px;
  }
`;

export const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

export const Avatar = styled(AvatarNew)`
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  cursor: pointer;
  box-shadow:
    0 0 0 2px var(--bg-2),
    0 0 0 3.5px var(--accent-a8, var(--accent));

  @media screen and (max-width: 430px) {
    width: 36px;
    height: 36px;
  }

  @media screen and (max-width: 400px) {
    width: 32px;
    height: 32px;
    box-shadow:
      0 0 0 1.5px var(--bg-2),
      0 0 0 2.5px var(--accent-a8, var(--accent));
  }
`;

/** Wraps SourceName + meta line in a vertical stack beside the avatar. */
export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
`;

export const SourceName = styled.h2`
  all: unset;
  display: block;
  width: 100%;
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media screen and (max-width: 600px) {
    font-size: var(--font-size-input);
  }

  @media screen and (max-width: 400px) {
    font-size: var(--font-size-small);
  }
`;

/** Verb + date, e.g. "posted a prompt · Jul 19, 2026". */
export const MetaLine = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 6px;
  margin-top: 2px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  @media screen and (max-width: 400px) {
    font-size: 11px;
  }
`;

export const MetaVerb = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MetaDot = styled.span`
  flex-shrink: 0;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-secondary);
  opacity: 0.6;
`;

export const MetaDate = styled.time`
  flex-shrink: 0;
  opacity: 0.75;
`;

/** Kind badge, e.g. "Prompt" / "Character" — replaces the plain corner date. */
export const KindBadge = styled.span`
  margin-left: auto;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  /* Neutral chip, accent only on the glyph: a feed of these was a column of
     tinted pills competing with each card's one real action. */
  background: var(--fill-hover);
  color: var(--text-secondary);
  border: 1px solid var(--material-edge);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;

  svg {
    width: 12px;
    height: 12px;
    color: var(--accent-11, var(--accent));
  }

  @media screen and (max-width: 430px) {
    span {
      display: none;
    }
  }

  @media screen and (max-width: 400px) {
    padding: 5px 8px;
    gap: 0;
  }
`;

/** Main content area between header and action row. */
export const Body = styled.div`
  padding: 2px 18px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
`;

/** Editorial treatment for prompt/comment/reply text: roomier line-height
    and a small quote glyph, standing in for a literal drop-cap since the
    body is arbitrary rich HTML (mentions, embeds) we don't control char-by-char. */
export const PromptBody = styled.div`
  align-self: stretch;
  position: relative;
  padding-left: 22px;

  &::before {
    content: "❛";
    position: absolute;
    left: -4px;
    top: -6px;
    font-family: ${DISPLAY_SERIF};
    font-size: 40px;
    line-height: 1;
    color: var(--accent-11, var(--accent));
    opacity: 0.55;
  }
`;

/** Action row: heart (left), contextual primary button (center), share (right). */
export const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 14px;
  margin-top: 6px;
  border-top: 1px solid var(--material-edge);

  @media screen and (max-width: 600px) {
    gap: 4px;
    padding: 10px 10px 12px;
  }
`;

export const PrimaryAction = styled.button`
  all: unset;
  box-sizing: border-box;
  grid-column: 2;
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 15px;
  border-radius: 999px;
  background: var(--fill-hover);
  border: 1px solid var(--material-edge);
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, transform 0.08s ease;

  svg {
    width: 15px;
    height: 15px;
    color: var(--accent-11, var(--accent));
  }

  &:active {
    transform: scale(0.97);
  }

  @media (hover: hover) {
    &:hover {
      background: var(--fill-pressed);
    }
  }

  ${FOCUS_RING}

  @media screen and (max-width: 600px) {
    gap: 6px;
    padding: 7px 12px;
    font-size: var(--font-size-small);

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export const ShareButton = styled.button`
  all: unset;
  box-sizing: border-box;
  grid-column: 3;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
  ${FOCUS_RING}

  svg {
    width: 17px;
    height: 17px;
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--accent-11, var(--accent));
      background-color: var(--fill-hover);
    }
  }

  /* Was 28px on phones; 36 is the floor this redesign holds for hit targets. */
  @media screen and (max-width: 600px) {
    width: 36px;
    height: 36px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

type CardProps = {
  /** Transient: `banner` is not an HTML attribute, so left un-prefixed
   *  styled-components forwards it to the DOM and React errors on it. */
  $banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: url('${(props): string => props.$banner}');
  background-size: cover;
  transition-timing-function: ease-out;
  transition-duration: 300ms;
  transition-property: scale;
  background-repeat: no-repeat;
  background-position: center center;
`;

export const Title = styled.div`
  font-family: ${DISPLAY_SERIF};
  font-size: 27px;
  line-height: 1.1;
  font-weight: 700;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 92%;
  color: white;
  text-align: left;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);

  @container muse-card (max-width: 400px) {
    font-size: 20px;
  }

  @container muse-card (max-width: 280px) {
    font-size: 15px;
  }
`;

export const CardWrapper = styled.div`
  position: relative;
  width: min(480px, 100%);
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  border: 1px solid var(--material-edge);
  box-shadow:
    inset 0 1px 0 var(--material-highlight),
    0 20px 44px -30px rgb(0 0 0 / 0.8);

  transition: transform 0.25s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: muse-card;
  container-type: size;

  @media screen and (max-width: 520px) {
    width: 100%;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);

      & ${CardBackground} {
        scale: 1.03;
      }
    }
  }
`;

export const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 16px;
  overflow: hidden;
`;

export const FallbackImageIcon = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.18);
  pointer-events: none;
`;

export const NSFWOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  color: #fff;
  text-align: center;
  font-size: var(--font-size-xsmall);
  border-radius: 16px;
  pointer-events: none;
`;

export const NSFWLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;

  @container muse-card (max-width: 320px) {
    font-size: 11px;
  }
`;

export const NSFWRevealButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 14px);
  z-index: 3;
  margin-top: 0;
  padding: 4px 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  background: transparent;
  color: #fff;
  font-size: var(--font-size-xsmall);
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: translate(-50%, 14px) scale(0.96);
  }

  @container muse-card (max-width: 320px) {
    font-size: 11px;
    padding: 3px 9px;
    transform: translate(-50%, -48px);

    &:active {
      transform: translate(-50%, -48px) scale(0.96);
    }
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  position: relative;
  height: 100%;
  z-index: 2;
  contain: paint;
  background: linear-gradient(
    to top,
    rgba(8, 8, 12, 0.9) 4%,
    rgba(8, 8, 12, 0.15) 46%,
    transparent 70%
  );
  cursor: pointer;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  padding: 16px 18px;
`;

export const ActivityInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

export const Video = styled.video`
  width: 100%;
  height: 100%;
  border-radius: ${BORDER_RADIUS};
  object-fit: contain;
  background-color: black;
`;

export const Audio = styled.audio`
  width: 100%;
  height: 100%;
  border-radius: ${BORDER_RADIUS};
  object-fit: contain;
  background-color: black;
`;

// ── MEDIA activities: full-bleed media rendered at its natural aspect ratio
// (no muse-card). Clicking opens the fullscreen viewer, never navigates —
// the zoom-in cursor and expand badge make that affordance explicit.

export const MediaFigure = styled.figure`
  margin: 4px 0 2px;
  width: 100%;
  min-width: 0;
`;

export const MediaImageButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: block;
  width: 100%;
  cursor: zoom-in;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--material-edge);
  background: var(--bg-1);
  line-height: 0;
  ${FOCUS_RING}

  @media (hover: hover) {
    &:hover img {
      opacity: 0.92;
    }
  }
`;

export const MediaImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
  transition: opacity 0.15s ease;
`;

/** Small pill overlay telling the user the media expands in a viewer. */
export const MediaExpandBadge = styled.span`
  position: absolute;
  top: 11px;
  right: 11px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 999px;
  ${MEDIA_CHIP}
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
`;

export const MediaVideoWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--material-edge);
  background: var(--material-fill);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const MediaVideoViewport = styled.div`
  width: 100%;
  background: black;
  line-height: 0;
  cursor: pointer;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
`;

export const MediaVideo = styled.video`
  display: block;
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
`;

/** Round expand button over videos — inline controls stay usable. */
export const MediaExpandButton = styled.button`
  all: unset;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  ${MEDIA_CHIP}
  cursor: pointer;
  transition: background 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: rgb(0 0 0 / 0.78);
    }
  }

  ${FOCUS_RING}
`;

export const MediaFallback = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--fill-hover);
  color: var(--text-secondary);
  opacity: 0.5;
`;

/** Read-only media description shown under the media in the feed card. */
export const MediaDescription = styled.p`
  margin: 0;
  width: 100%;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
`;

/** Wraps the heart tap-target and the count tap-target as separate controls
    that happen to sit together — they must not nest (a <button> inside a
    <button> breaks a11y and the count's own click target). */
export const ReactionGroup = styled.div`
  grid-column: 1;
  justify-self: start;
  display: inline-flex;
  align-items: center;
`;

export const HeartButton = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 999px;
  cursor: pointer;
  color: ${({ $active }): string =>
    $active ? "var(--tomato-9)" : "var(--text-secondary)"};
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  &:active {
    transform: scale(0.92);
  }

  @media (hover: hover) {
    &:hover {
      color: var(--tomato-9);
      background-color: var(--fill-hover);
    }
  }
`;

export const ReactionCount = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 8px 10px 8px 2px;
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  .count-short {
    display: none;
  }
  .label-full {
    display: inline;
  }

  @media screen and (max-width: 400px) {
    font-size: 11px;
  }

  &:hover {
    text-decoration: underline;
    color: var(--text);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }
`;
