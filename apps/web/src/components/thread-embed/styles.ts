import styled, { css } from "styled-components";
import { FOCUS_RING, MATERIAL_CARD } from "@/theme";

/**
 * A thread, unfurled from its link, drawn as the exchange it is.
 *
 * A thread is two voices before it is anything else: the prompt someone put
 * out, and the reply that picked it up. So the card is built like a page of
 * dialogue — the two faces paired at the top, the prompt's opening as one
 * turn, the thread's first reply answering it as the next, the newest reply
 * as a faint third line, and everyone who has joined along the bottom.
 *
 * Two accents, not one: the frame runs from the prompt author's colour to
 * the thread opener's, and each turn is tinted with its speaker's.
 */

const AVATAR = 44;

export const Frame = styled.a<{ $toneA: string | null; $toneB: string | null }>`
  --tone-a: ${(p) => p.$toneA ?? "var(--accent)"};
  --tone-b: ${(p) => p.$toneB ?? "var(--accent)"};
  position: relative;
  display: block;
  width: 100%;
  max-width: 380px;
  /* Same floor as the other cards; see muse-embed on shrink-to-fit parents. */
  min-width: 280px;
  margin: 8px 0;
  padding: 2px;
  border-radius: 18px;
  text-decoration: none;
  color: var(--text);
  background: linear-gradient(
    135deg,
    var(--tone-a) 0%,
    color-mix(in srgb, var(--tone-a) 55%, white) 42%,
    color-mix(in srgb, var(--tone-b) 55%, white) 58%,
    var(--tone-b) 100%
  );
  box-shadow: 0 18px 36px -26px rgb(0 0 0 / 0.8);
  cursor: pointer;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  container-name: thread-embed;
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

export const Card = styled.div<{ $concluded: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px 10px;
  border-radius: 16px;
  overflow: hidden;
  ${MATERIAL_CARD}
  background-color: var(--bg-2);

  /* The two accents meet behind the header, like stage light from both
     wings. Dimmed when the thread is closed. */
  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 110px;
    background:
      radial-gradient(
        120% 100% at 0% 0%,
        color-mix(in srgb, var(--tone-a) 22%, transparent),
        transparent 60%
      ),
      radial-gradient(
        120% 100% at 100% 0%,
        color-mix(in srgb, var(--tone-b) 22%, transparent),
        transparent 60%
      );
    opacity: ${(p) => (p.$concluded ? 0.55 : 1)};
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

  @container thread-embed (max-width: 300px) {
    gap: 8px;
    padding: 8px 10px 8px;
  }
`;

/* ─── Top band ────────────────────────────────────────────────────────── */

export const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
`;

export const Band = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-secondary, var(--text));

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  @container thread-embed (max-width: 300px) {
    ${Dot} {
      display: none;
    }
  }
`;

export const BandKind = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--tone-b);
`;

export const BandTime = styled.span`
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: none;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* The time is repeated by the turns; in a phone bubble the status pill
     needs the room more. */
  @container thread-embed (max-width: 300px) {
    display: none;
  }
`;

export const Status = styled.span<{ $concluded: boolean }>`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.06em;
  ${(p) =>
    p.$concluded
      ? css`
          color: var(--text-secondary, var(--text));
          background: color-mix(in srgb, var(--text) 9%, transparent);
          border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
        `
      : css`
          color: #3ddc97;
          background: rgb(61 220 151 / 0.12);
          border: 1px solid rgb(61 220 151 / 0.3);

          &::before {
            content: "";
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: currentColor;
            box-shadow: 0 0 6px currentColor;
          }
        `}

  svg {
    width: 11px;
    height: 11px;
  }
`;

/* ─── The pair ────────────────────────────────────────────────────────── */

export const Pair = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

/** Two faces, the opener in front, offset like a duet poster. */
export const Duo = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${AVATAR + 30}px;
  height: ${AVATAR}px;

  > span.avatar {
    position: absolute;
    top: 0;
    width: ${AVATAR}px;
    height: ${AVATAR}px;
    font-size: 17px;
    border: 2.5px solid var(--bg-2);
    box-sizing: content-box;
  }

  > span.avatar:first-child {
    left: 0;
    z-index: 1;
    box-shadow: 0 0 0 1.5px var(--tone-a);
  }

  > span.avatar:last-child {
    left: 30px;
    z-index: 2;
    box-shadow:
      0 0 0 1.5px var(--tone-b),
      0 6px 14px rgb(0 0 0 / 0.45);
  }

  @container thread-embed (max-width: 300px) {
    width: ${36 + 26}px;
    height: 36px;

    > span.avatar {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }

    > span.avatar:last-child {
      left: 26px;
    }
  }
`;

export const PairText = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Names = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 6px;
  min-width: 0;
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;

  > span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > svg {
    flex-shrink: 0;
    align-self: center;
    width: 13px;
    height: 13px;
    color: var(--text-secondary, var(--text));
    opacity: 0.7;
  }
`;

export const NameA = styled.span`
  color: var(--text);
`;

export const NameB = styled.span`
  color: var(--text);
`;

export const Story = styled.div`
  font-size: 11.5px;
  line-height: 1.3;
  color: var(--text-secondary, var(--text));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @container thread-embed (max-width: 300px) {
    -webkit-line-clamp: 3;
  }

  strong {
    font-weight: var(--font-weight-semi-bold);
  }

  .tone-a {
    color: var(--tone-a);
  }

  .tone-b {
    color: var(--tone-b);
  }

  .role {
    display: inline-block;
    margin-left: 3px;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    vertical-align: 1px;
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }
`;

/* ─── The exchange ────────────────────────────────────────────────────── */

export const Exchange = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

/**
 * One turn of the exchange, drawn as a speech bubble leaning toward its
 * speaker: the prompt from the left in the prompt author's tone, the reply
 * from the right in the opener's.
 */
export const Turn = styled.div<{ $side: "a" | "b" }>`
  --tone: ${(p) => (p.$side === "a" ? "var(--tone-a)" : "var(--tone-b)")};
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 92%;
  min-width: 0;
  padding: 7px 9px 8px;
  border-radius: ${(p) =>
    p.$side === "a" ? "4px 12px 12px 12px" : "12px 4px 12px 12px"};
  background: color-mix(in srgb, var(--tone) 10%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--tone) 22%, transparent);
  align-self: ${(p) => (p.$side === "a" ? "flex-start" : "flex-end")};
  flex-direction: ${(p) => (p.$side === "a" ? "row" : "row-reverse")};

  @container thread-embed (max-width: 300px) {
    width: 100%;
  }
`;

export const TurnAvatar = styled.div`
  flex-shrink: 0;
  padding-top: 1px;

  > span.avatar {
    width: 20px;
    height: 20px;
    font-size: 9px;
    box-shadow: 0 0 0 1.5px var(--tone);
  }
`;

export const TurnBody = styled.div<{ $side: "a" | "b" }>`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: ${(p) => (p.$side === "a" ? "left" : "right")};
`;

export const TurnWho = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  font-size: 10.5px;
  font-weight: var(--font-weight-semi-bold);
  letter-spacing: 0.02em;
  color: var(--tone);

  > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > em {
    font-style: normal;
    font-weight: 500;
    color: var(--text-secondary, var(--text));
    opacity: 0.85;
    white-space: nowrap;
  }

  ${TurnBody}[data-side="b"] & {
    justify-content: flex-end;
  }
`;

export const TurnText = styled.p<{ $lines: number }>`
  margin: 0;
  font-family: var(--font);
  font-size: 13px;
  line-height: 1.42;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: ${(p) => p.$lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  white-space: pre-line;
`;

export const TurnEmpty = styled.span`
  font-style: italic;
  color: var(--text-secondary, var(--text));
`;

export const TurnThumb = styled.div<{ $src: string }>`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-color: var(--bg-4);
  background-image: url("${(p) => p.$src}");
  background-size: cover;
  background-position: center;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.08),
    0 4px 12px rgb(0 0 0 / 0.35);
`;

/** The newest reply, as a faint third line: the thread is still going. */
export const Latest = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 2px 4px 0;
  font-size: 11.5px;
  color: var(--text-secondary, var(--text));

  svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }

  > span:nth-child(2) {
    flex-shrink: 0;

    > span.avatar {
      width: 16px;
      height: 16px;
      font-size: 8px;
    }
  }
`;

export const LatestText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    font-weight: var(--font-weight-semi-bold);
    color: var(--text);
  }
`;

/* ─── Footer ──────────────────────────────────────────────────────────── */

export const Footer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid
    color-mix(in srgb, var(--tone-b) 18%, var(--material-edge));
  font-size: 12px;
  color: var(--text-secondary, var(--text));
`;

/** Who has joined: a stack of the newest repliers' faces. */
export const Cast = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  > span.avatar {
    width: 22px;
    height: 22px;
    font-size: 9px;
    border: 2px solid var(--bg-2);
    box-sizing: content-box;
    margin-left: -8px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export const Stat = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  color: ${(p) => (p.$active ? "var(--tone-b)" : "inherit")};

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
  white-space: nowrap;
  color: var(--tone-b);
  transition: transform 0.18s ease;

  svg {
    width: 13px;
    height: 13px;
  }

  ${Frame}:hover & {
    transform: translateX(2px);
  }
`;
