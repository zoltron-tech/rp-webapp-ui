import styled, { css, keyframes } from "styled-components";
import { FOCUS_RING } from "@/theme";

/**
 * The Headcanons section, drawn on two kinds of ground:
 *
 * - `card`: inside the muse profile's dark character card (white type over
 *   art and a gradient to black), like every other section there.
 * - `page`: the Edit muse page, which follows the app theme.
 *
 * Everything below reads the `--hc-*` tokens [Tone] sets, so one set of
 * components serves both.
 */

export type ToneName = "card" | "page";

export const Tone = styled.div<{ $tone: ToneName; $accent?: string | null }>`
  --hc-accent: ${(p) => (p.$accent?.trim() ? p.$accent : "var(--accent)")};
  ${(p) =>
    p.$tone === "card"
      ? css`
          --hc-text: rgba(255, 255, 255, 0.95);
          --hc-muted: rgba(255, 255, 255, 0.66);
          --hc-faint: rgba(255, 255, 255, 0.45);
          --hc-fill: rgba(255, 255, 255, 0.07);
          --hc-fill-strong: rgba(255, 255, 255, 0.13);
          --hc-edge: rgba(255, 255, 255, 0.14);
          --hc-surface: rgba(0, 0, 0, 0.32);
        `
      : css`
          --hc-text: var(--text);
          --hc-muted: var(--text-secondary);
          --hc-faint: var(--text-secondary);
          --hc-fill: var(--material-fill, var(--bg-3));
          --hc-fill-strong: var(--fill-hover, var(--bg-4));
          --hc-edge: var(--material-edge, var(--bg-6));
          --hc-surface: var(--material-fill, var(--bg-2));
        `}
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
  color: var(--hc-text);
`;

export const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const BlockHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 26px;
`;

export const BlockLabel = styled.h3`
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hc-faint);

  span {
    margin-left: 6px;
    letter-spacing: 0;
    font-weight: 600;
  }
`;

export const SmallButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  min-height: 28px;
  padding: 3px 11px;
  border-radius: 999px;
  border: 1px solid var(--hc-edge);
  background: var(--hc-fill);
  color: var(--hc-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  ${FOCUS_RING}

  &:hover:not(:disabled) {
    background: var(--hc-fill-strong);
    color: var(--hc-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const PrimaryButton = styled(SmallButton)`
  border-color: var(--hc-accent);
  background: var(--hc-accent);
  color: #fff;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--hc-accent) 85%, white);
    color: #fff;
  }
`;

export const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--hc-muted);
`;

export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 12px;
  border: 1.5px dashed var(--hc-edge);
  text-align: center;
  color: var(--hc-muted);
  font-size: 13px;

  strong {
    color: var(--hc-text);
    font-size: 14px;
  }
`;

/**
 * Someone else's character with nothing to read, on the profile card: the
 * drawing and one line, the muse page's `SectionEmptyWrap` + `SectionEmpty`
 * so Canon's empty state sits exactly where Info's and Story's do.
 */
export const SceneEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 10px;
  width: 100%;
  padding-block: 24px;

  > span {
    width: 100%;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.82rem;
    font-style: italic;
    padding: 24px 0 8px;
  }
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

// ── Chips ──────────────────────────────────────────────────────────────────

export const Chip = styled.button<{ $on?: boolean; $soft?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  min-height: 28px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  border: 1px solid var(--hc-edge);
  background: var(--hc-fill);
  color: var(--hc-text);
  ${FOCUS_RING}

  &:is(button) {
    cursor: pointer;
  }

  ${(p) =>
    p.$soft &&
    css`
      border-color: color-mix(in srgb, var(--hc-accent) 40%, transparent);
      background: color-mix(in srgb, var(--hc-accent) 18%, transparent);
    `}

  ${(p) =>
    p.$on &&
    css`
      border-color: var(--hc-accent);
      background: var(--hc-accent);
      color: #fff;
    `}

  &:disabled {
    cursor: not-allowed;
    color: var(--hc-faint);
    border-style: dashed;
    background: transparent;
  }

  > .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// ── Trait chips ────────────────────────────────────────────────────────────

/**
 * Each trait group has its own hue, so a muse's chips read as a little
 * spread of colours rather than five identical pills. Mixed into whatever
 * ground the chip sits on, so they hold up on the dark character card, the
 * themed edit page and the picker sheet alike.
 */
const GROUP_HUE: Record<string, string> = {
  DARK: "#a78bfa",
  EMOTIONAL: "#f472b6",
  LIFESTYLE: "#34d399",
  MIND: "#38bdf8",
  SOCIAL: "#fbbf24",
};

export const traitHue = (group?: string | null) =>
  (group && GROUP_HUE[group]) || "var(--accent)";

export const TraitChip = styled.button<{ $hue: string; $on?: boolean }>`
  --trait-hue: ${(p) => p.$hue};
  --trait-soft: color-mix(in srgb, var(--trait-hue) 40%, transparent);
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  min-height: 34px;
  padding: 3px 12px 3px 4px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.2;
  /* Picked = filled solid in the group colour with dark type, a ring round
     it and a check at the end — unmistakable next to the tinted ones. */
  color: ${(p) => (p.$on ? "#1d1426" : "var(--hc-text, var(--text))")};
  background: ${(p) =>
    p.$on
      ? "var(--trait-hue)"
      : "color-mix(in srgb, var(--trait-hue) 12%, var(--hc-surface, var(--bg-3)))"};
  border: 1px solid
    ${(p) =>
      p.$on
        ? "var(--trait-hue)"
        : "color-mix(in srgb, var(--trait-hue) 40%, transparent)"};
  box-shadow: ${(p) =>
    p.$on
      ? "0 0 0 3px color-mix(in srgb, var(--trait-hue) 30%, transparent), 0 6px 16px -8px var(--trait-hue)"
      : "inset 0 1px 0 rgb(255 255 255 / 0.08)"};
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background-color 0.16s ease;
  ${FOCUS_RING}

  &:is(button) {
    cursor: pointer;
  }

  .bubble {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    /* A quiet, light well so the drawing's own colours carry the chip. */
    background: ${(p) =>
      p.$on
        ? "rgb(255 255 255 / 0.9)"
        : "color-mix(in srgb, var(--trait-hue) 16%, rgb(255 255 255 / 0.12))"};
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--trait-hue) 35%, transparent);
  }

  /* The check on a picked chip, or the × on a removable one. */
  .mark {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-left: 1px;
    margin-right: -5px;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.18);
    color: inherit;
  }

  .label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-left: -2px;
    border-radius: 50%;
    background: var(--trait-hue);
  }

  &:is(button):hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--trait-hue) 70%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: grayscale(0.7);
    border-style: dashed;
    background: transparent;
  }

  &[data-clash="true"] .label {
    text-decoration: line-through;
  }

  /* Phones: the character card is ~220px wide, so two chips should still
     share a row. */
  @media (max-width: 420px) {
    gap: 5px;
    min-height: 30px;
    padding: 2px 10px 2px 3px;
    font-size: 12px;

    .bubble {
      width: 22px;
      height: 22px;
    }

    .bubble svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:is(button):hover:not(:disabled) {
      transform: none;
    }
  }
`;

// ── Quick facts ────────────────────────────────────────────────────────────

export const FactGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const FactName = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--hc-muted);
`;

export const FactItem = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 26px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--hc-edge);
  background: var(--hc-fill);
  font-size: 12px;
  line-height: 1.25;
  overflow-wrap: anywhere;
`;

export const FactColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

// ── Cards ──────────────────────────────────────────────────────────────────

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CardRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 6px;
  min-width: 0;
`;

export const Card = styled.article<{ $pinned?: boolean }>`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid
    ${(p) =>
      p.$pinned
        ? "color-mix(in srgb, var(--hc-accent) 55%, transparent)"
        : "var(--hc-edge)"};
  background: ${(p) =>
    p.$pinned
      ? "color-mix(in srgb, var(--hc-accent) 12%, var(--hc-surface))"
      : "var(--hc-surface)"};
  cursor: pointer;
  overflow: hidden;
  text-align: left;
  ${FOCUS_RING}

  &:hover {
    border-color: color-mix(in srgb, var(--hc-accent) 60%, var(--hc-edge));
  }
`;

export const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`;

export const CardTitle = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

export const CardIcons = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  color: var(--hc-muted);

  .pinned {
    color: var(--hc-accent);
  }
`;

export const CardExcerpt = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--hc-muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

export const CardFoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

export const Tag = styled.span<{ $accent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid var(--hc-edge);
  color: var(--hc-muted);
  ${(p) =>
    p.$accent &&
    css`
      border-color: transparent;
      background: color-mix(in srgb, var(--hc-accent) 20%, transparent);
      color: var(--hc-text);
    `}
`;

export const HeartCount = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--hc-muted);
`;

export const SpoilerVeil = styled.div`
  position: relative;
  min-height: 40px;

  > p {
    filter: blur(5px);
    user-select: none;
  }

  > span {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--hc-text);
  }
`;

export const CardTools = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
`;

export const IconButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--hc-edge);
  background: var(--hc-fill);
  color: var(--hc-muted);
  cursor: pointer;
  ${FOCUS_RING}

  &:hover:not(:disabled) {
    color: var(--hc-text);
    background: var(--hc-fill-strong);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

export const Locked = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed var(--hc-edge);
  font-size: 12.5px;
  color: var(--hc-muted);

  > span {
    flex: 1;
    min-width: 0;
  }
`;

export const Filters = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    flex-shrink: 0;
  }
`;

// ── Loading ────────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

export const Skeleton = styled.div<{ $height: number }>`
  height: ${(p) => p.$height}px;
  border-radius: 12px;
  background: var(--hc-fill);
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// ── Sheets (inside ResponsiveSheet, always app-themed) ─────────────────────

export const GroupLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

/** The picker's pinned "Picked" strip: always in reach, one tap to remove. */
export const PickedHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PickedRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 6px;
  /* Room for up to five chips on two rows, so the strip never resizes. */
  min-height: 76px;
`;

export const PickedEmpty = styled.span`
  align-self: center;
  font-size: var(--font-size-small);
  font-style: italic;
  color: var(--text-secondary);
`;

/** Footer line: a hint on the left, the sheet's own verb on the right. */
export const FootRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  > p {
    flex: 1;
    min-width: 0;
  }

  > button {
    align-self: center;
    flex-shrink: 0;
  }
`;

/** A big rendition of one trait, heading its note sheet. */
export const TraitHero = styled.div<{ $hue: string }>`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  --trait-hue: ${(p) => p.$hue};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 12px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--trait-hue) 14%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--trait-hue) 40%, transparent);

  .art {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--trait-hue) 22%, rgb(255 255 255 / 0.14));
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--trait-hue) 18%, transparent);
  }

  strong {
    font-size: 17px;
    color: var(--text);
  }
`;

export const CharCount = styled.span`
  align-self: flex-end;
  font-size: var(--font-size-small);
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
`;

export const SheetFoot = styled.p`
  margin: 0;
  min-height: 1.4em;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const Count = styled.span`
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  font-weight: 700;
`;

export const ListItem = styled.div`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 6px 6px 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  font-size: var(--font-size-small);

  > span {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

export const MiniIconButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  ${FOCUS_RING}

  &:hover:not(:disabled) {
    color: var(--text);
    background: var(--bg-5);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

export const AddRow = styled.form`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  display: flex;
  gap: 6px;

  input {
    flex: 1;
    min-width: 0;
  }
`;

export const BlockToggle = styled.button<{ $on?: boolean }>`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$on ? "var(--accent)" : "var(--bg-6)")};
  background: ${(p) =>
    p.$on
      ? "color-mix(in srgb, var(--accent) 12%, var(--bg-3))"
      : "var(--bg-3)"};
  ${FOCUS_RING}

  .box {
    width: 16px;
    height: 16px;
    margin-top: 1px;
    border-radius: 4px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid ${(p) => (p.$on ? "var(--accent)" : "var(--bg-8)")};
    background: ${(p) => (p.$on ? "var(--accent)" : "transparent")};
    color: #fff;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    font-size: var(--font-size-small);
    color: var(--text-secondary);
  }

  .text b {
    color: var(--text);
    font-size: 13px;
  }
`;

export const PairRow = styled.fieldset`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--bg-6);
  border-radius: 999px;
  overflow: hidden;

  button {
    all: unset;
    box-sizing: border-box;
    min-height: 36px;
    padding: 6px 8px;
    text-align: center;
    font-size: var(--font-size-small);
    font-weight: 600;
    cursor: pointer;
    background: var(--bg-3);
    color: var(--text);
  }

  button + button {
    border-left: 1px solid var(--bg-6);
  }

  button[aria-pressed="true"] {
    background: var(--accent);
    color: #fff;
  }

  button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -3px;
  }
`;

export const PromptStrip = styled.div`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 14%, var(--bg-3));
  color: var(--text);
  font-size: var(--font-size-small);
  line-height: 1.4;

  > span {
    flex: 1;
    min-width: 0;
  }

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--accent);
  }
`;

export const LinkButton = styled.button`
  all: unset;
  flex-shrink: 0;
  font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  ${FOCUS_RING}

  &:hover {
    text-decoration: underline;
  }
`;

export const EditorArea = styled.div`
  /* Rows in a scrolling sheet body must keep their height. */
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  min-height: 140px;
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--tomato-9, #e5484d);
`;

// ── Detail ─────────────────────────────────────────────────────────────────

export const DetailMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const DetailTag = styled.span<{ $accent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid var(--bg-6);
  ${(p) =>
    p.$accent &&
    css`
      border-color: transparent;
      background: color-mix(in srgb, var(--accent) 18%, transparent);
    `}
`;

export const DetailTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

/** The detail sheet's pinned footer: the heart left, the verbs right. */
export const DetailFoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

export const DetailActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const ActionPill = styled.button<{ $primary?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: var(--font-size-small);
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$primary ? "var(--accent)" : "var(--bg-6)")};
  background: ${(p) => (p.$primary ? "var(--accent)" : "var(--bg-3)")};
  color: ${(p) => (p.$primary ? "#fff" : "var(--text)")};
  ${FOCUS_RING}

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;
