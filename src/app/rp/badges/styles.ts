import { styled } from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 860px;
  margin-inline: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ─── Header ──────────────────────────────────────────────────────────────────

export const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 16%, var(--bg-2)) 0%,
    var(--bg-2) 68%
  );
  border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--bg-5));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  @media screen and (max-width: 600px) {
    padding: 14px;
    gap: 10px;
  }
`;

export const HeroIcon = styled.span`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 20%, var(--bg-3));
  color: var(--accent);
  font-size: 19px;

  @media screen and (max-width: 600px) {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }
`;

export const HeroText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: 1.05rem;
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const HeroSubtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
`;

export const SectionHeading = styled.h2`
  margin: 6px 0 0;
  font-size: var(--font-size-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

// ─── Grid ────────────────────────────────────────────────────────────────────

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;

  /* One per row on the 375px baseline: these cards carry a full sentence of
     "how to earn it", and two columns of that is unreadable. */
  @media screen and (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-2);
  border: 1px solid var(--bg-4);

  @media screen and (max-width: 600px) {
    padding: 13px;
    gap: 12px;
  }
`;

export const CardArt = styled.div`
  flex-shrink: 0;
  display: flex;
  padding-top: 2px;
`;

export const CardText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const CardTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow-wrap: anywhere;
`;

export const CardDescription = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const HowTo = styled.span`
  margin-top: 4px;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  line-height: 1.5;
  overflow-wrap: anywhere;

  b {
    color: var(--text);
    font-weight: 700;
  }
`;

const chip = `
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const RarityChip = styled.span<{ $rare: boolean }>`
  ${chip}
  background: ${(p) =>
    p.$rare
      ? "color-mix(in srgb, var(--accent) 18%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$rare ? "transparent" : "var(--bg-5)")};
  color: ${(p) => (p.$rare ? "var(--accent)" : "var(--text-secondary)")};
`;

// ─── Still to come ───────────────────────────────────────────────────────────

export const ComingSoon = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
`;

export const ComingSoonLabel = styled.h2`
  margin: 0;
  font-size: var(--font-size-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;

  /* A rule running off to the right of the words, so the section reads as the
     shelf continuing rather than as a second, separate list. */
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(
      to right,
      var(--bg-5),
      color-mix(in srgb, var(--bg-5) 0%, transparent)
    );
  }
`;

/**
 * The blanks underneath, fading out as they go down the page.
 *
 * A mask rather than a stack of hand-tuned opacities: the point is that the
 * list carries on past the bottom of what is drawn, and a mask keeps that true
 * however many blanks are rendered and however they wrap.
 */
export const GhostFade = styled.div`
  --ghost-fade: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.34) 46%,
    rgba(0, 0, 0, 0) 96%
  );

  -webkit-mask-image: var(--ghost-fade);
  mask-image: var(--ghost-fade);
  pointer-events: none;
  user-select: none;
`;

export const GhostCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-2);
  border: 1px dashed var(--bg-5);

  @media screen and (max-width: 600px) {
    padding: 13px;
    gap: 12px;
  }
`;

export const GhostArt = styled.span`
  flex-shrink: 0;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border: 2px dashed var(--bg-5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bg-5);
`;

export const GhostLine = styled.span<{ $w: string }>`
  height: 9px;
  width: ${(p) => p.$w};
  border-radius: 999px;
  background: var(--bg-4);

  /* The first line is the title, so it sits a little heavier than the rest. */
  &:first-child {
    height: 11px;
    background: var(--bg-5);
  }

  & + & {
    margin-top: 4px;
  }
`;
