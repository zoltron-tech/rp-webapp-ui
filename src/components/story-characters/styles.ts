import styled from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";

/** The card chrome is shared with the co-authors strip it sits under. */
export * from "@/components/common/people-card/styles";

/**
 * Which pool a character came from, shown on its row and in its mini profile.
 *
 * The distinction is not cosmetic: a muse belongs to a novelist and travels
 * between stories, so only its owner may edit it; a story character belongs to
 * this storyboard and every co-author writes it. The badge is what makes the
 * different button at the bottom of the mini profile make sense.
 */
export const PoolBadge = styled.span<{ $muse?: boolean }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid
    ${(p) => (p.$muse ? "var(--accent)" : "var(--text-secondary)")};
  color: ${(p) => (p.$muse ? "var(--accent)" : "var(--text-secondary)")};
  background: ${(p) =>
    p.$muse
      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
      : "color-mix(in srgb, var(--text-secondary) 10%, transparent)"};
`;

// ── Mini profile ───────────────────────────────────────────────────────────

export const ProfileHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const ProfileAvatar = styled(AvatarNew)`
  box-sizing: border-box;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const ProfileNameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`;

export const ProfileName = styled.span`
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.2;
  word-break: break-word;
`;

export const ProfileBadgeRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

/** The authors' own fields, plus gender and nicknames, as a compact table. */
export const FactList = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  align-items: baseline;
  gap: 5px 12px;
  margin: 0;

  dt {
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  dd {
    margin: 0;
    min-width: 0;
    font-size: var(--font-size-small);
    color: var(--text);
    word-break: break-word;
  }
`;

/** The rich-text "about", kept to a readable block inside a mini profile. */
export const About = styled.div`
  max-height: 220px;
  overflow-y: auto;
  font-size: var(--font-size-small);
  line-height: 1.55;
  color: var(--text-secondary);
`;

export const ProfileAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  transition: opacity 0.15s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    opacity: 0.9;
  }
`;
