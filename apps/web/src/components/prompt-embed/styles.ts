import styled, { css, keyframes } from "styled-components";
import { FOCUS_RING, MATERIAL_CARD } from "@/theme";

/**
 * A prompt, unfurled from its link.
 *
 * A post is words first, so unlike the muse card this one leads with the
 * excerpt: who wrote it across the top, the opening lines in the middle, a
 * thumbnail beside them when the post has a picture, and the thread's counts
 * along the bottom. Same frame and floor widths as the muse card so the two
 * read as one family in a feed.
 */

export const Frame = styled.a<{ $accent: string | null }>`
  --embed-accent: ${(p) => p.$accent ?? "var(--accent)"};
  position: relative;
  display: block;
  width: 100%;
  max-width: 380px;
  /* Same floor as the muse card; see its note on shrink-to-fit parents. */
  min-width: 280px;
  margin: 8px 0;
  padding: 2px;
  border-radius: 18px;
  text-decoration: none;
  color: var(--text);
  background: linear-gradient(
    135deg,
    var(--embed-accent),
    color-mix(in srgb, var(--embed-accent) 45%, white)
  );
  box-shadow: 0 18px 36px -26px rgb(0 0 0 / 0.8);
  cursor: pointer;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  container-name: prompt-embed;
  container-type: inline-size;
  ${FOCUS_RING}

  && {
    text-decoration: none;
  }

  @media (max-width: 400px) {
    min-width: 250px;
  }

  @media (min-width: 801px) {
    min-width: 340px;
  }

  @media (hover: hover) {
    &:hover {
      box-shadow: 0 24px 44px -24px rgb(0 0 0 / 0.85);
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: scale(0.99);
  }
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px 10px;
  border-radius: 16px;
  overflow: hidden;
  ${MATERIAL_CARD}
  background-color: var(--bg-2);

  /* A faint wash of the author's accent behind the header, so the card
     carries their colour without painting the whole thing. */
  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 64px;
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--embed-accent) 16%, transparent),
      transparent
    );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.18),
      inset 0 0 0 1px rgb(255 255 255 / 0.05);
  }

  @container prompt-embed (max-width: 300px) {
    gap: 8px;
    padding: 10px 10px 8px;
  }
`;

export const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  /* The shared avatar draws at its default size; this card wants it small. */
  > span.avatar:first-child {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

export const Author = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const AuthorName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 13.5px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;

  > span:first-child {
    min-width: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
`;

export const RoleTag = styled.span<{ $muse: boolean }>`
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--embed-accent);
  background: color-mix(in srgb, var(--embed-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--embed-accent) 28%, transparent);
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  font-size: 11px;
  color: var(--text-secondary, var(--text));
  white-space: nowrap;
  overflow: hidden;

  svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
  }

  .privacy-icon {
    width: 11px;
    height: 11px;
  }
`;

export const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
`;

export const Kind = styled.span`
  flex-shrink: 0;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--embed-accent);
  opacity: 0.9;

  svg {
    width: 11px;
    height: 11px;
  }

  /* In a phone-width bubble the name needs the room more than the label. */
  @container prompt-embed (max-width: 300px) {
    display: none;
  }
`;

/**
 * The thread card's one extra: the prompt a comment answers, as a line above
 * the excerpt — a small face, "on <author>'s prompt", a few of its words.
 */
export const Context = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 10px;
  font-size: 11.5px;
  color: var(--text-secondary, var(--text));
  background: color-mix(in srgb, var(--embed-accent) 8%, transparent);
  border-left: 2px solid color-mix(in srgb, var(--embed-accent) 55%, transparent);

  > span.avatar:first-child {
    width: 18px;
    height: 18px;
    font-size: 9px;
  }

  svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    color: var(--embed-accent);
  }
`;

export const ContextText = styled.span`
  min-width: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }
`;

export const Concluded = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary, var(--text));
  background: color-mix(in srgb, var(--text) 8%, transparent);

  svg {
    width: 11px;
    height: 11px;
  }
`;

export const BodyRow = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`;

export const Excerpt = styled.p<{ $lines: number }>`
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-family: var(--font);
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: ${(p) => p.$lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  white-space: pre-line;
`;

export const Empty = styled.span`
  font-style: italic;
  color: var(--text-secondary, var(--text));
`;

export const Thumb = styled.div<{ $src: string }>`
  flex-shrink: 0;
  width: 84px;
  height: 84px;
  border-radius: 12px;
  background-color: var(--bg-4);
  background-image: url("${(p) => p.$src}");
  background-size: cover;
  background-position: center;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.08),
    0 6px 16px rgb(0 0 0 / 0.35);

  @container prompt-embed (max-width: 300px) {
    width: 64px;
    height: 64px;
  }
`;

export const VideoBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  color: #fff;
  background: rgb(0 0 0 / 0.35);

  svg {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.6));
  }
`;

export const Footer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--embed-accent) 18%, var(--material-edge));
  font-size: 12px;
  color: var(--text-secondary, var(--text));
`;

export const Stat = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${(p) => (p.$active ? "var(--embed-accent)" : "inherit")};

  svg {
    width: 13px;
    height: 13px;
  }
`;

export const Open = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: var(--font-weight-semi-bold);
  color: var(--embed-accent);
  transition: transform 0.18s ease;

  svg {
    width: 13px;
    height: 13px;
  }

  ${Frame}:hover & {
    transform: translateX(2px);
  }
`;

/* ─── Loading ─────────────────────────────────────────────────────────── */

const shimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const shimmerBlock = css`
  position: relative;
  overflow: hidden;
  background: rgb(127 127 127 / 0.12);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgb(255 255 255 / 0.08) 40%,
      rgb(255 255 255 / 0.16) 50%,
      rgb(255 255 255 / 0.08) 60%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

export const SkeletonAvatar = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  ${shimmerBlock}
`;

export const SkeletonLine = styled.div<{ $width: string; $height?: string }>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height ?? "12px"};
  border-radius: 6px;
  ${shimmerBlock}
`;

/* ─── Unavailable ─────────────────────────────────────────────────────── */

export const Unavailable = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 380px;
  min-width: 0;
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--text);
  ${MATERIAL_CARD}
  ${FOCUS_RING}

  && {
    text-decoration: none;
  }

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--material-edge));
  }
`;

export const UnavailableIcon = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
`;

export const UnavailableText = styled.span`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 13px;
    font-weight: var(--font-weight-semi-bold);
  }

  span {
    font-size: 11px;
    color: var(--text-secondary, var(--text));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
